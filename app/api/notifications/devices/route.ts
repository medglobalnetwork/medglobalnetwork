// app/api/notifications/devices/route.ts
import { auth, pool } from "@/lib/auth";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/security";

export const dynamic = "force-dynamic";

async function requireUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user ?? null;
}

/** Registers (or re-claims) an FCM token for the signed-in user. */
export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const clientIp = getClientIp(await headers());
    const limit = checkRateLimit(`push:register:${clientIp}`, 30, 60000);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Too many registration attempts" },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { token, platform, appVersion } = body ?? {};

    if (!token || typeof token !== "string" || token.length < 20) {
      return NextResponse.json({ error: "Invalid push token" }, { status: 400 });
    }

    // Upsert on token: a device handed to a different account re-points here,
    // so the previous user never receives pushes meant for the new one.
    await pool.query(
      `INSERT INTO push_devices (user_id, token, platform, app_version, last_seen_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (token) DO UPDATE
         SET user_id = EXCLUDED.user_id,
             platform = EXCLUDED.platform,
             app_version = EXCLUDED.app_version,
             last_seen_at = NOW()`,
      [user.id, token, platform === "ios" ? "ios" : "android", appVersion ?? null]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/notifications/devices error:", error);
    return NextResponse.json({ error: "Failed to register device" }, { status: 500 });
  }
}

/** Removes a token — called on sign-out so the next user does not inherit it. */
export async function DELETE(req: NextRequest) {
  try {
    const user = await requireUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { token } = (await req.json().catch(() => ({}))) ?? {};
    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "Invalid push token" }, { status: 400 });
    }

    await pool.query(`DELETE FROM push_devices WHERE token = $1 AND user_id = $2`, [
      token,
      user.id,
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/notifications/devices error:", error);
    return NextResponse.json({ error: "Failed to unregister device" }, { status: 500 });
  }
}

/** Reports whether this device currently has a registered token. */
export async function GET() {
  try {
    const user = await requireUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const res = await pool.query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM push_devices WHERE user_id = $1`,
      [user.id]
    );

    return NextResponse.json({ deviceCount: parseInt(res.rows[0]?.count ?? "0", 10) });
  } catch (error) {
    console.error("GET /api/notifications/devices error:", error);
    return NextResponse.json({ error: "Failed to read devices" }, { status: 500 });
  }
}