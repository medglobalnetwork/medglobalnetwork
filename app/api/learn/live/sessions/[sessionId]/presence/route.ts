// app/api/learn/live/sessions/[sessionId]/presence/route.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { LiveClassroomRepository, LiveParticipantRole } from "@/modules/learn/lib/live-classroom-db";

export async function GET(
  request: Request,
  props: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await props.params;
  try {
    const presence = await LiveClassroomRepository.getActivePresence(sessionId);
    return Response.json({ presence, count: presence.length });
  } catch (err: any) {
    console.error(`GET /api/learn/live/sessions/${sessionId}/presence error:`, err);
    return Response.json({ error: "Failed to fetch presence" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  props: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await props.params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const h = await headers();
    const clientIp = h.get("x-forwarded-for")?.split(",")[0] || h.get("x-real-ip") || undefined;
    const userAgent = h.get("user-agent") || undefined;

    const liveSession = await LiveClassroomRepository.getSessionById(sessionId, session.user.id);
    let role: LiveParticipantRole = "attendee";
    if (liveSession?.instructor_id === session.user.id) {
      role = "host";
    } else if (liveSession?.user_role) {
      role = liveSession.user_role;
    }

    await LiveClassroomRepository.updatePresenceHeartbeat({
      session_id: sessionId,
      user_id: session.user.id,
      user_name: session.user.name || "Learner",
      user_image: session.user.image,
      role,
      client_ip: clientIp,
      user_agent: userAgent,
    });

    return Response.json({ success: true, timestamp: Date.now() });
  } catch (err: any) {
    console.error(`POST /api/learn/live/sessions/${sessionId}/presence error:`, err);
    return Response.json({ error: "Failed to record heartbeat" }, { status: 500 });
  }
}
