// app/api/learn/quizzes/[quizId]/route.ts
import { auth } from "@/lib/auth";
import { getQuizForStudent } from "@/modules/learn/lib/learn-db";
import { headers } from "next/headers";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ quizId: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  const currentUserId = session?.user?.id;
  const { quizId } = await params;

  try {
    const quiz = await getQuizForStudent(quizId, currentUserId);
    if (!quiz) {
      return Response.json({ error: "Quiz not found" }, { status: 404 });
    }
    return Response.json({ quiz });
  } catch (err) {
    console.error("GET /api/learn/quizzes/[quizId] error:", err);
    return Response.json({ error: "Failed to fetch quiz" }, { status: 500 });
  }
}
