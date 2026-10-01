// app/api/learn/live/sessions/[sessionId]/qa/[questionId]/vote/route.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { LiveClassroomRepository } from "@/modules/learn/lib/live-classroom-db";

export async function POST(
  request: Request,
  props: { params: Promise<{ sessionId: string; questionId: string }> }
) {
  const { questionId } = await props.params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required to upvote" }, { status: 401 });
  }

  try {
    const result = await LiveClassroomRepository.voteQuestion(questionId, session.user.id);
    return Response.json({ success: true, ...result });
  } catch (err: any) {
    console.error(`POST /api/learn/live/sessions/qa/${questionId}/vote error:`, err);
    return Response.json({ error: "Failed to vote on question" }, { status: 500 });
  }
}
