// app/api/calls/route.ts
import { auth, pool } from "@/lib/auth";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { CallService, CallType } from "@/modules/communication/lib/call-service";
import { checkRateLimit, getClientIp } from "@/lib/security";
import { getUserAvatarUrl } from "@/lib/avatar";

export const dynamic = "force-dynamic";

/**
 * GET — the caller's live call plus any call currently ringing this user.
 * The client polls this on app resume and every few seconds while idle.
 */
export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const userId = session.user.id;

    // Cheap and idempotent: closes calls nobody picked up.
    void CallService.sweepMissed().catch((err) =>
      console.error("POST /api/calls sweep failed:", err)
    );

    const [outgoing, incoming] = await Promise.all([
      CallService.findActiveForCaller(userId),
      CallService.findIncoming(userId),
    ]);

    // Peer names/images come from GET /api/calls/[callId] — this endpoint
    // only answers "is anything happening right now".
    return NextResponse.json({
      outgoing: outgoing ?? null,
      incoming: incoming ?? null,
    });
  } catch (error) {
    console.warn("GET /api/calls error (returning empty fallback):", error);
    return NextResponse.json({ outgoing: null, incoming: null });
  }
}

/** POST — places a call to another user. */
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const clientIp = getClientIp(await headers());
    const limit = checkRateLimit(`call:initiate:${clientIp}`, 20, 60000);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Too many call attempts. Wait a moment and try again." },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { calleeId, callType, conversationId } = body ?? {};

    if (typeof calleeId !== "string" || !calleeId) {
      return NextResponse.json({ error: "calleeId is required" }, { status: 400 });
    }
    if (calleeId === session.user.id) {
      return NextResponse.json(
        { error: "You cannot call yourself" },
        { status: 400 }
      );
    }

    const resolvedType: CallType = callType === "VIDEO" ? "VIDEO" : "VOICE";

    const callee = await pool.query<{ id: string; name: string | null; image: string | null }>(
      `SELECT id, name, image FROM "user" WHERE id = $1 LIMIT 1`,
      [calleeId]
    );
    if (callee.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const callerName =
      session.user.name || callee.rows[0].name || "A healthcare professional";

    const call = await CallService.initiate({
      callerId: session.user.id,
      calleeId,
      callType: resolvedType,
      conversationId: conversationId ?? null,
      callerName,
    });

    return NextResponse.json({
      success: true,
      call: {
        ...call,
        callee_name: callee.rows[0].name,
        callee_image: getUserAvatarUrl(calleeId, callee.rows[0].image),
      },
    });
  } catch (error) {
    console.error("POST /api/calls error:", error);
    return NextResponse.json({ error: "Failed to place call" }, { status: 500 });
  }
}