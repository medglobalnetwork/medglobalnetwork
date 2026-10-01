// app/api/learn/live/sessions/[sessionId]/lifecycle/route.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { LiveClassroomRepository, LiveSessionLifecycle } from "@/modules/learn/lib/live-classroom-db";

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
      return Response.json({ error: "Forbidden: Only instructor/co-host can advance lifecycle" }, { status: 403 });
    }

    const body = await request.json();
    const { status, cancellationReason } = body;

    const validStatuses: LiveSessionLifecycle[] = [
      "draft",
      "scheduled",
      "registration_open",
      "live",
      "ended",
      "processing_recording",
      "recording_ready",
      "completed",
      "cancelled",
    ];

    if (!validStatuses.includes(status)) {
      return Response.json({ error: `Invalid status: ${status}` }, { status: 400 });
    }

    await LiveClassroomRepository.updateSessionStatus(sessionId, status, cancellationReason);
    return Response.json({ success: true, status, message: `Session transitioned to ${status}` });
  } catch (err: any) {
    console.error(`POST /api/learn/live/sessions/${sessionId}/lifecycle error:`, err);
    return Response.json({ error: "Failed to update lifecycle status" }, { status: 500 });
  }
}
