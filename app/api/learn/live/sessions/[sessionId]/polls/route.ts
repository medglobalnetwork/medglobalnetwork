// app/api/learn/live/sessions/[sessionId]/polls/route.ts
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
    const polls = await LiveClassroomRepository.getPolls(sessionId, session?.user?.id);
    return Response.json({ polls });
  } catch (err: any) {
    console.error(`GET /api/learn/live/sessions/${sessionId}/polls error:`, err);
    return Response.json({ error: "Failed to fetch polls" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  props: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await props.params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required to create poll" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { question, options } = body;

    if (!question || !Array.isArray(options) || options.length < 2) {
      return Response.json({ error: "Question and at least 2 options are required" }, { status: 400 });
    }

    const poll = await LiveClassroomRepository.createPoll({
      session_id: sessionId,
      creator_id: session.user.id,
      question,
      options,
    });

    return Response.json({ success: true, poll });
  } catch (err: any) {
    console.error(`POST /api/learn/live/sessions/${sessionId}/polls error:`, err);
    return Response.json({ error: "Failed to create poll" }, { status: 500 });
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
    const body = await request.json();
    const { pollId } = body;

    if (!pollId) {
      return Response.json({ error: "pollId is required" }, { status: 400 });
    }

    await LiveClassroomRepository.closePoll(pollId, sessionId);
    return Response.json({ success: true, message: "Poll closed" });
  } catch (err: any) {
    console.error(`PATCH /api/learn/live/sessions/${sessionId}/polls error:`, err);
    return Response.json({ error: "Failed to close poll" }, { status: 500 });
  }
}
