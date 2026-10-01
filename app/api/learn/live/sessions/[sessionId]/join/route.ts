// app/api/learn/live/sessions/[sessionId]/join/route.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { LiveClassroomRepository, LiveParticipantRole } from "@/modules/learn/lib/live-classroom-db";
import crypto from "crypto";

export async function POST(
  request: Request,
  props: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await props.params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required to join live classroom" }, { status: 401 });
  }

  try {
    const liveSession = await LiveClassroomRepository.getSessionById(sessionId, session.user.id);
    if (!liveSession) {
      return Response.json({ error: "Live session not found" }, { status: 404 });
    }

    if (liveSession.status === "cancelled") {
      return Response.json({ error: "This live session has been cancelled" }, { status: 400 });
    }

    let role: LiveParticipantRole = "attendee";
    if (session.user.id === liveSession.instructor_id) {
      role = "host";
    } else if (liveSession.user_role) {
      role = liveSession.user_role;
    }

    // Auto-register if not registered
    if (!liveSession.user_registered) {
      await LiveClassroomRepository.registerUser(sessionId, session.user.id, role);
    }

    // Generate Live Session Room Token
    const payload = `${sessionId}:${session.user.id}:${role}:${Date.now()}`;
    const token = crypto.createHash("sha256").update(payload).digest("hex");

    // WebRTC SFU / Mesh ICE configuration
    const rtcConfig = {
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:19302" },
      ],
      sfuRoomId: liveSession.sfu_room_id || `mgn-room-${sessionId}`,
    };

    return Response.json({
      success: true,
      token,
      role,
      session: liveSession,
      rtcConfig,
    });
  } catch (err: any) {
    console.error(`POST /api/learn/live/sessions/${sessionId}/join error:`, err);
    return Response.json({ error: "Failed to join live session" }, { status: 500 });
  }
}
