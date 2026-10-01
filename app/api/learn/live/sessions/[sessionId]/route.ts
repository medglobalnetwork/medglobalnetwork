// app/api/learn/live/sessions/[sessionId]/route.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { LiveClassroomRepository } from "@/modules/learn/lib/live-classroom-db";

export async function GET(
  request: Request,
  props: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await props.params;
  const session = await auth.api.getSession({ headers: await headers() });

  try {
    const liveSession = await LiveClassroomRepository.getSessionById(sessionId, session?.user?.id);
    if (!liveSession) {
      return Response.json({ error: "Live session not found" }, { status: 404 });
    }

    return Response.json({ session: liveSession });
  } catch (err: any) {
    console.error(`GET /api/learn/live/sessions/${sessionId} error:`, err);
    return Response.json({ error: "Failed to fetch live session" }, { status: 500 });
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
      return Response.json({ error: "Forbidden: Only hosts can modify session details" }, { status: 403 });
    }

    const body = await request.json();
    if (body.settings) {
      await LiveClassroomRepository.updateSettings(sessionId, body.settings);
    }

    return Response.json({ success: true, message: "Live session updated" });
  } catch (err: any) {
    console.error(`PATCH /api/learn/live/sessions/${sessionId} error:`, err);
    return Response.json({ error: "Failed to update live session" }, { status: 500 });
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
    const liveSession = await LiveClassroomRepository.getSessionById(sessionId, session.user.id);
    if (!liveSession) {
      return Response.json({ error: "Live session not found" }, { status: 404 });
    }

    if (liveSession.instructor_id !== session.user.id) {
      return Response.json({ error: "Forbidden: Only instructor can cancel session" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const reason = searchParams.get("reason") || "Cancelled by instructor";
    await LiveClassroomRepository.updateSessionStatus(sessionId, "cancelled", reason);

    return Response.json({ success: true, message: "Session cancelled" });
  } catch (err: any) {
    console.error(`DELETE /api/learn/live/sessions/${sessionId} error:`, err);
    return Response.json({ error: "Failed to cancel live session" }, { status: 500 });
  }
}
