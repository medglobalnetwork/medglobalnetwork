// app/api/learn/live/sessions/[sessionId]/settings/route.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { LiveClassroomRepository } from "@/modules/learn/lib/live-classroom-db";

export async function GET(
  request: Request,
  props: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await props.params;
  try {
    const liveSession = await LiveClassroomRepository.getSessionById(sessionId);
    if (!liveSession) {
      return Response.json({ error: "Live session not found" }, { status: 404 });
    }
    return Response.json({ settings: liveSession.settings });
  } catch (err: any) {
    console.error(`GET /api/learn/live/sessions/${sessionId}/settings error:`, err);
    return Response.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PATCH(
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
      return Response.json({ error: "Forbidden: Only hosts can modify classroom settings" }, { status: 403 });
    }

    const body = await request.json();
    await LiveClassroomRepository.updateSettings(sessionId, body);

    return Response.json({ success: true, message: "Classroom settings updated" });
  } catch (err: any) {
    console.error(`PATCH /api/learn/live/sessions/${sessionId}/settings error:`, err);
    return Response.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
