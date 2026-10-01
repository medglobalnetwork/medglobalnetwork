// app/api/learn/live/sessions/[sessionId]/whiteboard/route.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { LiveClassroomRepository } from "@/modules/learn/lib/live-classroom-db";

export async function GET(
  request: Request,
  props: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await props.params;
  try {
    const whiteboard = await LiveClassroomRepository.getWhiteboardState(sessionId);
    return Response.json({ whiteboard });
  } catch (err: any) {
    console.error(`GET /api/learn/live/sessions/${sessionId}/whiteboard error:`, err);
    return Response.json({ error: "Failed to fetch whiteboard state" }, { status: 500 });
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
    const liveSession = await LiveClassroomRepository.getSessionById(sessionId, session.user.id);
    if (!liveSession) {
      return Response.json({ error: "Live session not found" }, { status: 404 });
    }

    const canEdit =
      liveSession.instructor_id === session.user.id ||
      liveSession.user_role === "host" ||
      liveSession.user_role === "co_host" ||
      liveSession.user_role === "speaker";

    if (!canEdit) {
      return Response.json({ error: "Forbidden: Only presenters can draw on whiteboard" }, { status: 403 });
    }

    const body = await request.json();
    const { data_json, current_tool, slide_index } = body;

    await LiveClassroomRepository.updateWhiteboardState({
      session_id: sessionId,
      data_json,
      current_tool,
      slide_index,
      updated_by: session.user.id,
    });

    return Response.json({ success: true, message: "Whiteboard state synced" });
  } catch (err: any) {
    console.error(`POST /api/learn/live/sessions/${sessionId}/whiteboard error:`, err);
    return Response.json({ error: "Failed to update whiteboard state" }, { status: 500 });
  }
}
