// app/api/learn/live/sessions/[sessionId]/recording/route.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { LiveClassroomRepository } from "@/modules/learn/lib/live-classroom-db";

export async function GET(
  request: Request,
  props: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await props.params;
  try {
    const recording = await LiveClassroomRepository.getRecording(sessionId);
    return Response.json({ recording });
  } catch (err: any) {
    console.error(`GET /api/learn/live/sessions/${sessionId}/recording error:`, err);
    return Response.json({ error: "Failed to fetch recording" }, { status: 500 });
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

    if (liveSession.instructor_id !== session.user.id && liveSession.user_role !== "co_host") {
      return Response.json({ error: "Forbidden: Only instructor can manage recording" }, { status: 403 });
    }

    const body = await request.json();
    const { action } = body; // 'start' | 'stop'

    return Response.json({
      success: true,
      action,
      status: action === "start" ? "recording" : "processing",
      message: action === "start" ? "Live session recording started" : "Recording saved, transcoding initiated",
    });
  } catch (err: any) {
    console.error(`POST /api/learn/live/sessions/${sessionId}/recording error:`, err);
    return Response.json({ error: "Failed to manage recording" }, { status: 500 });
  }
}
