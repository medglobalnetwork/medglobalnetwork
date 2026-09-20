// app/api/learn/courses/[courseId]/curriculum/route.ts
import { auth } from "@/lib/auth";
import { getCourseCurriculum, learnDb } from "@/modules/learn/lib/learn-db";
import { generateId } from "@/modules/network/lib/network-db";
import { headers } from "next/headers";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  const currentUserId = session?.user?.id;
  const { courseId } = await params;

  try {
    const modules = await getCourseCurriculum(courseId, currentUserId);
    return Response.json({ modules });
  } catch (err) {
    console.error("GET /api/learn/courses/[courseId]/curriculum error:", err);
    return Response.json({ error: "Failed to fetch curriculum", modules: [] }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  const { courseId } = await params;
  try {
    // Verify course ownership
    const course = await learnDb
      .selectFrom("courses")
      .select(["instructor_id"])
      .where("id", "=", courseId)
      .executeTakeFirst();

    if (!course || course.instructor_id !== session.user.id) {
      return Response.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const now = new Date();

    if (body.type === "module") {
      const moduleId = generateId();
      await learnDb
        .insertInto("course_modules")
        .values({
          id: moduleId,
          course_id: courseId,
          title: body.title.trim(),
          description: body.description || null,
          order_index: Number(body.orderIndex) || 0,
          created_at: now,
          updated_at: now,
        })
        .execute();

      return Response.json({ success: true, moduleId });
    }

    if (body.type === "lesson") {
      if (!body.moduleId) {
        return Response.json({ error: "moduleId is required" }, { status: 400 });
      }

      const lessonId = generateId();
      await learnDb
        .insertInto("course_lessons")
        .values({
          id: lessonId,
          module_id: body.moduleId,
          course_id: courseId,
          title: body.title.trim(),
          description: body.description || null,
          lesson_type: body.lessonType || "video",
          content: body.content || null,
          media_url: body.mediaUrl || null,
          duration_seconds: Number(body.durationSeconds) || 0,
          order_index: Number(body.orderIndex) || 0,
          is_preview: Boolean(body.isPreview),
          created_at: now,
          updated_at: now,
        })
        .execute();

      // Recalculate course duration
      const totalSecondsRes = await learnDb
        .selectFrom("course_lessons")
        .select((eb) => eb.fn.sum<number>("duration_seconds").as("total"))
        .where("course_id", "=", courseId)
        .executeTakeFirst();

      const totalMinutes = Math.round(Number(totalSecondsRes?.total || 0) / 60);
      await learnDb
        .updateTable("courses")
        .set({ duration_minutes: totalMinutes, updated_at: now })
        .where("id", "=", courseId)
        .execute();

      return Response.json({ success: true, lessonId });
    }

    return Response.json({ error: "Invalid item type" }, { status: 400 });
  } catch (err) {
    console.error("POST /api/learn/courses/[courseId]/curriculum error:", err);
    return Response.json({ error: "Failed to add curriculum item" }, { status: 500 });
  }
}
