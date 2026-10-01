// app/api/learn/live/sessions/[sessionId]/polls/[pollId]/vote/route.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { LiveClassroomRepository } from "@/modules/learn/lib/live-classroom-db";

export async function POST(
  request: Request,
  props: { params: Promise<{ sessionId: string; pollId: string }> }
) {
  const { pollId } = await props.params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required to vote" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { optionId } = body;

    if (!optionId) {
      return Response.json({ error: "optionId is required" }, { status: 400 });
    }

    await LiveClassroomRepository.votePoll(pollId, optionId, session.user.id);
    return Response.json({ success: true, message: "Vote registered" });
  } catch (err: any) {
    console.error(`POST /api/learn/live/sessions/polls/${pollId}/vote error:`, err);
    return Response.json({ error: "Failed to vote in poll" }, { status: 500 });
  }
}
