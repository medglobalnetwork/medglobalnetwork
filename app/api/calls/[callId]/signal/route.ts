// app/api/calls/[callId]/signal/route.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { CallService, SignalKind } from "@/modules/communication/lib/call-service";
import { checkRateLimit, getClientIp } from "@/lib/security";

export const dynamic = "force-dynamic";

const KINDS: SignalKind[] = ["offer", "answer", "ice", "hangup", "mute", "video"];

async function requireParticipant(callId: string, userId: string) {
  return CallService.isParticipant(callId, userId);
}

/**
 * GET — drains this user's pending signals.
 * `?after=<lastId>` is the cursor from the previous poll; without it the
 * caller gets the full backlog so a reconnect never loses the offer.
 */
export async function GET(
  req: NextRequest,
  props: { params: Promise<{ callId: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { callId } = await props.params;
    const userId = session.user.id;
    if (!(await requireParticipant(callId, userId))) {
      return NextResponse.json({ error: "Call not found" }, { status: 404 });
    }

    const afterParam = req.nextUrl.searchParams.get("after");
    const after =
      afterParam !== null && /^\d+$/.test(afterParam)
        ? parseInt(afterParam, 10)
        : await CallService.latestSignalId(callId);

    const signals = await CallService.drainSignals(callId, userId, after);
    const call = await CallService.getCall(callId);

    return NextResponse.json({
      signals: signals.map((s) => ({
        id: s.id,
        kind: s.kind,
        payload: s.payload,
      })),
      status: call?.status ?? null,
    });
  } catch (error) {
    console.error("GET /api/calls/[callId]/signal error:", error);
    return NextResponse.json({ error: "Signaling poll failed" }, { status: 500 });
  }
}

/**
 * POST — queues a signal for the peer.
 * Body: { kind, payload }
 */
export async function POST(
  req: NextRequest,
  props: { params: Promise<{ callId: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { callId } = await props.params;
    const userId = session.user.id;
    if (!(await requireParticipant(callId, userId))) {
      return NextResponse.json({ error: "Call not found" }, { status: 404 });
    }

    const clientIp = getClientIp(await headers());
    // ICE candidates arrive in bursts; the cap only has to stop abuse.
    const limit = checkRateLimit(`call:signal:${callId}:${clientIp}`, 240, 60000);
    if (!limit.allowed) {
      return NextResponse.json({ error: "Too many signals" }, { status: 429 });
    }

    const { kind, payload } = (await req.json().catch(() => ({}))) ?? {};
    if (!KINDS.includes(kind)) {
      return NextResponse.json({ error: "Unknown signal kind" }, { status: 400 });
    }

    const call = await CallService.getCall(callId);
    if (!call) {
      return NextResponse.json({ error: "Call not found" }, { status: 404 });
    }

    const peerId =
      call.caller_id === userId ? call.callee_id : call.caller_id;

    await CallService.signal(callId, userId, peerId, kind, payload ?? {});

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/calls/[callId]/signal error:", error);
    return NextResponse.json({ error: "Failed to send signal" }, { status: 500 });
  }
}