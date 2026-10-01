// app/api/learn/live/sessions/[sessionId]/chat/route.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { LiveClassroomRepository, LiveParticipantRole } from "@/modules/learn/lib/live-classroom-db";

export async function GET(
  request: Request,
  props: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await props.params;
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "50", 10);
  const before = searchParams.get("before") || undefined;

  try {
    const messages = await LiveClassroomRepository.getChatMessages(sessionId, limit, before);
    return Response.json({ messages });
  } catch (err: any) {
    console.error(`GET /api/learn/live/sessions/${sessionId}/chat error:`, err);
    return Response.json({ error: "Failed to fetch chat messages" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  props: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await props.params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required to chat" }, { status: 401 });
  }

  try {
    const liveSession = await LiveClassroomRepository.getSessionById(sessionId, session.user.id);
    if (!liveSession) {
      return Response.json({ error: "Live session not found" }, { status: 404 });
    }

    const settings = liveSession.settings;
    if (settings && !settings.enable_chat && liveSession.user_role !== "host" && liveSession.user_role !== "co_host") {
      return Response.json({ error: "Chat is currently disabled by instructor" }, { status: 403 });
    }

    if (settings?.is_chat_muted && liveSession.user_role !== "host" && liveSession.user_role !== "co_host") {
      return Response.json({ error: "Chat is currently muted by instructor" }, { status: 403 });
    }

    const body = await request.json();
    const { message, reply_to_id, reply_to_text, is_pinned, is_announcement } = body;

    if (!message || !message.trim()) {
      return Response.json({ error: "Message content cannot be empty" }, { status: 400 });
    }

    let role: LiveParticipantRole = liveSession.user_role || "attendee";
    if (session.user.id === liveSession.instructor_id) {
      role = "host";
    }

    const canPinOrAnnounce = role === "host" || role === "co_host" || role === "moderator";

    const chatMsg = await LiveClassroomRepository.sendChatMessage({
      session_id: sessionId,
      user_id: session.user.id,
      user_name: session.user.name || "Healthcare Learner",
      user_image: session.user.image,
      user_role: role,
      message,
      reply_to_id,
      reply_to_text,
      is_pinned: canPinOrAnnounce ? is_pinned : false,
      is_announcement: canPinOrAnnounce ? is_announcement : false,
    });

    return Response.json({ success: true, message: chatMsg });
  } catch (err: any) {
    console.error(`POST /api/learn/live/sessions/${sessionId}/chat error:`, err);
    return Response.json({ error: "Failed to send chat message" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await props.params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const messageId = searchParams.get("messageId");
    if (!messageId) {
      return Response.json({ error: "messageId parameter is required" }, { status: 400 });
    }

    await LiveClassroomRepository.deleteChatMessage(messageId, sessionId);
    return Response.json({ success: true, message: "Chat message deleted" });
  } catch (err: any) {
    console.error(`DELETE /api/learn/live/sessions/${sessionId}/chat error:`, err);
    return Response.json({ error: "Failed to delete chat message" }, { status: 500 });
  }
}
