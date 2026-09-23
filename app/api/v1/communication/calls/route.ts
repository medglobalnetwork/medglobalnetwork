// ============================================================
// MGN Communication Engine — Calls Session API
// app/api/v1/communication/calls/route.ts
// ============================================================

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { CommunicationService } from "@/modules/communication/lib/communication-service";

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const { conversationId, callType, participantIds } = await request.json();
    if (!conversationId) {
      return Response.json({ error: "conversationId is required" }, { status: 400 });
    }

    const callId = await CommunicationService.logCallSession(session.user.id, {
      conversationId,
      callType: callType || "VOICE",
      participantIds: participantIds || [],
    });

    return Response.json({ success: true, callId });
  } catch (err: any) {
    console.error("POST call session error:", err);
    return Response.json({ error: err.message || "Failed to initiate call" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const { callId, durationSeconds } = await request.json();
    if (!callId) {
      return Response.json({ error: "callId is required" }, { status: 400 });
    }

    await CommunicationService.endCallSession(callId, durationSeconds || 0);
    return Response.json({ success: true, message: "Call session ended" });
  } catch (err: any) {
    console.error("PATCH end call session error:", err);
    return Response.json({ error: err.message || "Failed to end call" }, { status: 500 });
  }
}
