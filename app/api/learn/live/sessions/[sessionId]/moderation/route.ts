// app/api/learn/live/sessions/[sessionId]/moderation/route.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { LiveClassroomRepository } from "@/modules/learn/lib/live-classroom-db";

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
    const liveSession = await LiveClassroomRepository.getSessionById(sessionId, session.user.id);
    if (!liveSession) {
      return Response.json({ error: "Live session not found" }, { status: 404 });
    }

    const isModerator =
      liveSession.instructor_id === session.user.id ||
      liveSession.user_role === "host" ||
      liveSession.user_role === "co_host" ||
      liveSession.user_role === "moderator";

    if (!isModerator) {
      return Response.json({ error: "Forbidden: Only moderators can perform this action" }, { status: 403 });
    }

    const body = await request.json();
    const { action_type, target_user_id, reason, duration_seconds } = body;

    if (action_type === "mute_chat") {
      await LiveClassroomRepository.updateSettings(sessionId, { is_chat_muted: true });
    } else if (action_type === "unmute_chat") {
      await LiveClassroomRepository.updateSettings(sessionId, { is_chat_muted: false });
    } else if (action_type === "slow_mode") {
      await LiveClassroomRepository.updateSettings(sessionId, { slow_mode_seconds: duration_seconds || 10 });
    } else if (action_type === "kick_user" && target_user_id) {
      await LiveClassroomRepository.removeSpeaker(sessionId, target_user_id);
    }

    return Response.json({ success: true, message: `Action '${action_type}' executed successfully` });
  } catch (err: any) {
    console.error(`POST /api/learn/live/sessions/${sessionId}/moderation error:`, err);
    return Response.json({ error: "Failed to execute moderation action" }, { status: 500 });
  }
}
