// app/api/learn/quizzes/[quizId]/attempt/route.ts
import { auth } from "@/lib/auth";
import { evaluateQuizAttempt, learnDb } from "@/modules/learn/lib/learn-db";
import { checkAndProcessCourseCompletion } from "@/modules/learn/lib/learn-completion-service";
import { SubmitQuizAnswerInput } from "@/modules/learn/types";
import { headers } from "next/headers";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ quizId: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  const { quizId } = await params;
  try {
    const { answers = [] } = (await request.json()) as { answers: SubmitQuizAnswerInput[] };

    const attempt = await evaluateQuizAttempt({
      quizId,
      userId: session.user.id,
      answers,
    });

    // If passed, check if course is completed
    let completionResult = { isCompleted: false, certificateId: undefined, verificationCode: undefined };
    if (attempt.passed) {
      const quiz = await learnDb
        .selectFrom("quizzes")
        .select(["course_id"])
        .where("id", "=", quizId)
        .executeTakeFirst();

      if (quiz) {
        completionResult = await checkAndProcessCourseCompletion({
          userId: session.user.id,
          courseId: quiz.course_id,
        }) as any;
      }
    }

    return Response.json({
      success: true,
      attempt,
      courseCompleted: completionResult.isCompleted,
      certificateId: completionResult.certificateId,
      verificationCode: completionResult.verificationCode,
    });
  } catch (err: any) {
    console.error("POST /api/learn/quizzes/[quizId]/attempt error:", err);
    return Response.json({ error: err.message || "Failed to evaluate quiz attempt" }, { status: 500 });
  }
}
