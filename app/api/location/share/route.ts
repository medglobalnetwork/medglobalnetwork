// app/api/location/share/route.ts
import { auth, pool } from "@/lib/auth";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { isValidLatLng } from "@/lib/geo";
import { checkRateLimit, getClientIp } from "@/lib/security";

export const dynamic = "force-dynamic";

const MAX_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours
const DEFAULT_TTL_MS = 15 * 60 * 1000; // 15 minutes

/** Is the caller a member of this conversation? */
async function isConversationMember(conversationId: string, userId: string) {
  const res = await pool.query(
    `SELECT 1 FROM conversation_members
      WHERE conversation_id = $1 AND user_id = $2
      LIMIT 1`,
    [conversationId, userId]
  );
  return res.rows.length > 0;
}

/**
 * GET — live location shares visible to the caller: their own share, any
 * share addressed to them directly, and any share in a conversation they
 * are a member of.
 */
export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    const userId = session.user.id;

    // Drop anything that timed out while we were away.
    await pool.query(`DELETE FROM location_shares WHERE expires_at < NOW()`);

    const res = await pool.query(
      `SELECT s.*, u.name AS user_name, u.image AS user_image
         FROM location_shares s
         JOIN "user" u ON u.id = s.user_id
        WHERE s.expires_at > NOW()
          AND (
            s.user_id = $1
            OR s.user_id = ANY(s.sharing_with)
            OR s.conversation_id IN (
              SELECT conversation_id FROM conversation_members WHERE user_id = $1
            )
          )
        ORDER BY s.created_at DESC`,
      [userId]
    );

    return NextResponse.json({ shares: res.rows });
  } catch (error) {
    console.error("GET /api/location/share error:", error);
    return NextResponse.json({ error: "Failed to load shared locations" }, { status: 500 });
  }
}

/**
 * POST — start (or refresh) a live location share.
 * Body: { lat, lng, accuracy?, label?, ttlMinutes?, conversationId?, withUserIds? }
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    const userId = session.user.id;

    const clientIp = getClientIp(await headers());
    if (!checkRateLimit(`location:share:${clientIp}`, 120, 60000).allowed) {
      return NextResponse.json({ error: "Too many updates" }, { status: 429 });
    }

    const body = (await req.json().catch(() => ({}))) ?? {};
    const point = { lat: body.lat, lng: body.lng };

    if (!isValidLatLng(point)) {
      return NextResponse.json({ error: "Valid lat and lng are required" }, { status: 400 });
    }

    const ttlMs = Math.min(
      MAX_TTL_MS,
      Math.max(60_000, (Number(body.ttlMinutes) || DEFAULT_TTL_MS / 60000) * 60000)
    );

    const withUserIds: string[] = Array.isArray(body.withUserIds)
      ? body.withUserIds.filter((id: unknown): id is string => typeof id === "string")
      : [];
    if (withUserIds.includes(userId)) {
      return NextResponse.json(
        { error: "You cannot share your location with yourself" },
        { status: 400 }
      );
    }

    // A conversation share is visible to that conversation's members; a
    // direct share is visible to the listed users only.
    const conversationId =
      typeof body.conversationId === "string" ? body.conversationId : null;

    if (conversationId && !(await isConversationMember(conversationId, userId))) {
      // Deliberately 404, not 403: a non-member should not learn that the
      // conversation exists.
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    const expiresAt = new Date(Date.now() + ttlMs);

    // One active share per conversation scope — refreshing replaces it.
    await pool.query(
      `DELETE FROM location_shares
        WHERE user_id = $1
          AND COALESCE(conversation_id, '') = COALESCE($2, '')`,
      [userId, conversationId]
    );

    const res = await pool.query(
      `INSERT INTO location_shares
         (id, user_id, conversation_id, latitude, longitude, accuracy_meters, label, sharing_with, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        `loc_${crypto.randomBytes(8).toString("hex")}`,
        userId,
        conversationId,
        point.lat,
        point.lng,
        typeof body.accuracy === "number" ? body.accuracy : null,
        typeof body.label === "string" ? body.label.slice(0, 120) : null,
        withUserIds,
        expiresAt,
      ]
    );

    return NextResponse.json({ share: res.rows[0] });
  } catch (error) {
    console.error("POST /api/location/share error:", error);
    return NextResponse.json({ error: "Failed to share location" }, { status: 500 });
  }
}

/** DELETE — stop sharing. Optional ?conversationId= narrows the scope. */
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    const userId = session.user.id;

    const conversationId = req.nextUrl.searchParams.get("conversationId");

    const res = await pool.query(
      conversationId
        ? `DELETE FROM location_shares WHERE user_id = $1 AND conversation_id = $2 RETURNING id`
        : `DELETE FROM location_shares WHERE user_id = $1 RETURNING id`,
      conversationId ? [userId, conversationId] : [userId]
    );

    return NextResponse.json({ success: true, removed: res.rowCount ?? 0 });
  } catch (error) {
    console.error("DELETE /api/location/share error:", error);
    return NextResponse.json({ error: "Failed to stop sharing" }, { status: 500 });
  }
}