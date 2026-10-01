// app/api/learn/live/sessions/[sessionId]/hand-raise/route.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { LiveClassroomRepository, HandRaiseStatus } from "@/modules/learn/lib/live-classroom-db";

export async function GET(
  request: Request,
  props: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await props.params;
  try {
    const handRaises = await LiveClassroomRepository.getHandRaises(sessionId);
    return Response.json({ handRaises });
  } catch (err: any) {
    console.error(`GET /api/learn/live/sessions/${sessionId}/hand-raise error:`, err);
    return Response.json({ error: "Failed to fetch hand raises" }, { status: 500 });
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

    if (liveSession.settings && !liveSession.settings.enable_raise_hand) {
      return Response.json({ error: "Raise hand is currently disabled by instructor" }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const action = body.action || "raise"; // 'raise' | 'lower'

    if (action === "lower") {
      await LiveClassroomRepository.lowerHand(sessionId, session.user.id);
      return Response.json({ success: true, action: "lowered" });
    }

    const handRaise = await LiveClassroomRepository.raiseHand(
      sessionId,
      session.user.id,
      session.user.name || "Student",
      session.user.image
    );

    return Response.json({ success: true, handRaise });
  } catch (err: any) {
    console.error(`POST /api/learn/live/sessions/${sessionId}/hand-raise error:`, err);
    return Response.json({ error: "Failed to update hand raise" }, { status: 500 });
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
      return Response.json({ error: "Forbidden: Only instructor/co-host can manage hand raises" }, { status: 403 });
    }

    const body = await request.json();
    const { handRaiseId, status } = body as { handRaiseId: string; status: HandRaiseStatus };

    if (!handRaiseId || !status) {
      return Response.json({ error: "handRaiseId and status are required" }, { status: 400 });
    }

    await LiveClassroomRepository.updateHandRaiseStatus(handRaiseId, sessionId, status, session.user.id);
    return Response.json({ success: true, message: `Hand raise updated to ${status}` });
  } catch (err: any) {
    console.error(`PATCH /api/learn/live/sessions/${sessionId}/hand-raise error:`, err);
    return Response.json({ error: "Failed to update hand raise status" }, { status: 500 });
  }
}
