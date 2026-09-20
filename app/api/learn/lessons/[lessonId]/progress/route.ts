// app/api/learn/lessons/[lessonId]/progress/route.ts
import { auth } from "@/lib/auth";
import { updateLessonProgress, learnDb } from "@/modules/learn/lib/learn-db";
import { checkAndProcessCourseCompletion } from "@/modules/learn/lib/learn-completion-service";
import { headers } from "next/headers";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  const { lessonId } = await params;
  try {
    const { progressPercentage = 100, lastPositionSeconds = 0, completed = true } =
      await request.json();

    // Get course_id for this lesson
    const lesson = await learnDb
      .selectFrom("course_lessons")
      .select(["course_id"])
      .where("id", "=", lessonId)
      .executeTakeFirst();

    if (!lesson) {
      return Response.json({ error: "Lesson not found" }, { status: 404 });
    }

    await updateLessonProgress({
      userId: session.user.id,
      lessonId,
      courseId: lesson.course_id,
      progressPercentage: Number(progressPercentage),
      lastPositionSeconds: Number(lastPositionSeconds),
      completed: Boolean(completed),
    });

    // Check if course is now fully completed
    const completionResult = await checkAndProcessCourseCompletion({
      userId: session.user.id,
      courseId: lesson.course_id,
    });

    return Response.json({
      success: true,
      courseCompleted: completionResult.isCompleted,
      certificateId: completionResult.certificateId,
      verificationCode: completionResult.verificationCode,
    });
  } catch (err) {
    console.error("POST /api/learn/lessons/[lessonId]/progress error:", err);
    return Response.json({ error: "Failed to update lesson progress" }, { status: 500 });
  }
}
