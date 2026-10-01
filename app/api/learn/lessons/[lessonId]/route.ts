// app/api/learn/lessons/[lessonId]/route.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { learnDb, getCourseCurriculum, getCourseDetails } from "@/modules/learn/lib/learn-db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  const { lessonId } = await params;
  if (!lessonId) {
    return Response.json({ error: "lessonId is required" }, { status: 400 });
  }

  const session = await auth.api.getSession({ headers: await headers() });

  try {
    const rawLesson = await learnDb
      .selectFrom("course_lessons as l")
      .innerJoin("courses as c", "c.id", "l.course_id")
      .selectAll("l")
      .select(["c.title as course_title", "c.id as course_id"])
      .where("l.id", "=", lessonId)
      .executeTakeFirst();

    if (!rawLesson) {
      return Response.json({ error: "Lesson not found" }, { status: 404 });
    }

    const curriculum = await getCourseCurriculum(rawLesson.course_id, session?.user?.id);

    return Response.json({
      lesson: {
        id: rawLesson.id,
        module_id: rawLesson.module_id,
        course_id: rawLesson.course_id,
        title: rawLesson.title,
        description: rawLesson.description,
        lesson_type: rawLesson.lesson_type,
        content: rawLesson.content,
        media_url: rawLesson.media_url,
        duration_seconds: rawLesson.duration_seconds || 0,
        order_index: rawLesson.order_index,
        is_preview: rawLesson.is_preview,
        created_at: rawLesson.created_at.toISOString(),
        updated_at: rawLesson.updated_at.toISOString(),
      },
      courseId: rawLesson.course_id,
      courseTitle: rawLesson.course_title,
      curriculum,
    });
  } catch (err: any) {
    console.error("GET /api/learn/lessons/[lessonId] error:", err);
    return Response.json({ error: "Failed to fetch lesson" }, { status: 500 });
  }
}
