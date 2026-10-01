// app/api/learn/live/sessions/[sessionId]/qa/route.ts
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
    const questions = await LiveClassroomRepository.getQuestions(sessionId, session?.user?.id);
    return Response.json({ questions });
  } catch (err: any) {
    console.error(`GET /api/learn/live/sessions/${sessionId}/qa error:`, err);
    return Response.json({ error: "Failed to fetch Q&A questions" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  props: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await props.params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required to ask a question" }, { status: 401 });
  }

  try {
    const liveSession = await LiveClassroomRepository.getSessionById(sessionId, session.user.id);
    if (!liveSession) {
      return Response.json({ error: "Live session not found" }, { status: 404 });
    }

    if (liveSession.settings && !liveSession.settings.enable_qa) {
      return Response.json({ error: "Q&A is currently disabled by instructor" }, { status: 403 });
    }

    const body = await request.json();
    const { question } = body;

    if (!question || !question.trim()) {
      return Response.json({ error: "Question cannot be empty" }, { status: 400 });
    }

    const created = await LiveClassroomRepository.createQuestion({
      session_id: sessionId,
      user_id: session.user.id,
      user_name: session.user.name || "Student",
      user_image: session.user.image,
      question,
    });

    return Response.json({ success: true, question: created });
  } catch (err: any) {
    console.error(`POST /api/learn/live/sessions/${sessionId}/qa error:`, err);
    return Response.json({ error: "Failed to post question" }, { status: 500 });
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
    const { questionId, answerText } = body;

    if (!questionId || !answerText) {
      return Response.json({ error: "questionId and answerText are required" }, { status: 400 });
    }

    await LiveClassroomRepository.answerQuestion(
      questionId,
      sessionId,
      answerText,
      session.user.name || "Instructor"
    );

    return Response.json({ success: true, message: "Answer submitted successfully" });
  } catch (err: any) {
    console.error(`PATCH /api/learn/live/sessions/${sessionId}/qa error:`, err);
    return Response.json({ error: "Failed to answer question" }, { status: 500 });
  }
}
