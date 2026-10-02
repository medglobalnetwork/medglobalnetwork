// app/api/calls/[callId]/route.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { CallService } from "@/modules/communication/lib/call-service";

export const dynamic = "force-dynamic";

async function requireParticipant(callId: string, userId: string) {
  return CallService.isParticipant(callId, userId);
}

/** Call detail with both peers resolved. */
export async function GET(
  _req: NextRequest,
  props: { params: Promise<{ callId: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { callId } = await props.params;
    if (!(await requireParticipant(callId, session.user.id))) {
      return NextResponse.json({ error: "Call not found" }, { status: 404 });
    }

    const call = await CallService.getCall(callId);
    if (!call) {
      return NextResponse.json({ error: "Call not found" }, { status: 404 });
    }

    return NextResponse.json({ call });
  } catch (error) {
    console.error("GET /api/calls/[callId] error:", error);
    return NextResponse.json({ error: "Failed to load call" }, { status: 500 });
  }
}

/**
 * PATCH — callee accepts, either party declines or hangs up.
 *   { action: "accept" | "decline" | "hangup" }
 */
export async function PATCH(
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

    const { action } = (await req.json().catch(() => ({}))) ?? {};

    if (action === "accept") {
      const accepted = await CallService.accept(callId, userId);
      if (!accepted) {
        // Already declined, already connected, or the ring timed out.
        return NextResponse.json(
          { error: "Call is no longer ringing" },
          { status: 409 }
        );
      }
      return NextResponse.json({ success: true, status: "accepted" });
    }

    if (action === "decline" || action === "hangup") {
      const ended = await CallService.end(
        callId,
        userId,
        action === "decline" ? "declined" : "hangup"
      );
      // Idempotent: a peer that already closed the call gets a 200, not an error.
      return NextResponse.json({ success: ended, action });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("PATCH /api/calls/[callId] error:", error);
    return NextResponse.json({ error: "Call action failed" }, { status: 500 });
  }
}