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

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  const { courseId } = await params;
  try {
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

    if (body.type === "module" && body.moduleId) {
      const updates: any = { updated_at: now };
      if (body.title !== undefined) updates.title = body.title.trim();
      if (body.description !== undefined) updates.description = body.description || null;
      if (body.orderIndex !== undefined) updates.order_index = Number(body.orderIndex);

      await learnDb
        .updateTable("course_modules")
        .set(updates)
        .where("id", "=", body.moduleId)
        .where("course_id", "=", courseId)
        .execute();

      return Response.json({ success: true });
    }

    if (body.type === "lesson" && body.lessonId) {
      const updates: any = { updated_at: now };
      if (body.title !== undefined) updates.title = body.title.trim();
      if (body.description !== undefined) updates.description = body.description || null;
      if (body.lessonType !== undefined) updates.lesson_type = body.lessonType;
      if (body.content !== undefined) updates.content = body.content || null;
      if (body.mediaUrl !== undefined) updates.media_url = body.mediaUrl || null;
      if (body.durationSeconds !== undefined) updates.duration_seconds = Number(body.durationSeconds);
      if (body.orderIndex !== undefined) updates.order_index = Number(body.orderIndex);
      if (body.isPreview !== undefined) updates.is_preview = Boolean(body.isPreview);
      if (body.moduleId !== undefined) updates.module_id = body.moduleId;

      await learnDb
        .updateTable("course_lessons")
        .set(updates)
        .where("id", "=", body.lessonId)
        .where("course_id", "=", courseId)
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

      return Response.json({ success: true });
    }

    return Response.json({ error: "Invalid item update type" }, { status: 400 });
  } catch (err) {
    console.error("PUT /api/learn/courses/[courseId]/curriculum error:", err);
    return Response.json({ error: "Failed to update curriculum item" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  const { courseId } = await params;
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type"); // "module" | "lesson"
  const id = searchParams.get("id");

  if (!type || !id) {
    return Response.json({ error: "type and id parameters are required" }, { status: 400 });
  }

  try {
    const course = await learnDb
      .selectFrom("courses")
      .select(["instructor_id"])
      .where("id", "=", courseId)
      .executeTakeFirst();

    if (!course || course.instructor_id !== session.user.id) {
      return Response.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (type === "module") {
      const lessonsInModule = await learnDb
        .selectFrom("course_lessons")
        .select(["id"])
        .where("module_id", "=", id)
        .execute();

      const lessonIds = lessonsInModule.map((l) => l.id);
      if (lessonIds.length > 0) {
        await learnDb.deleteFrom("course_resources").where("lesson_id", "in", lessonIds).execute();
      }
      await learnDb.deleteFrom("course_lessons").where("module_id", "=", id).execute();
      await learnDb.deleteFrom("course_modules").where("id", "=", id).where("course_id", "=", courseId).execute();

      // Recalculate course duration
      const totalSecondsRes = await learnDb
        .selectFrom("course_lessons")
        .select((eb) => eb.fn.sum<number>("duration_seconds").as("total"))
        .where("course_id", "=", courseId)
        .executeTakeFirst();

      const totalMinutes = Math.round(Number(totalSecondsRes?.total || 0) / 60);
      await learnDb
        .updateTable("courses")
        .set({ duration_minutes: totalMinutes, updated_at: new Date() })
        .where("id", "=", courseId)
        .execute();

      return Response.json({ success: true });
    }

    if (type === "lesson") {
      await learnDb.deleteFrom("course_resources").where("lesson_id", "=", id).execute();
      await learnDb.deleteFrom("course_lessons").where("id", "=", id).where("course_id", "=", courseId).execute();

      // Recalculate duration
      const totalSecondsRes = await learnDb
        .selectFrom("course_lessons")
        .select((eb) => eb.fn.sum<number>("duration_seconds").as("total"))
        .where("course_id", "=", courseId)
        .executeTakeFirst();

      const totalMinutes = Math.round(Number(totalSecondsRes?.total || 0) / 60);
      await learnDb
        .updateTable("courses")
        .set({ duration_minutes: totalMinutes, updated_at: new Date() })
        .where("id", "=", courseId)
        .execute();

      return Response.json({ success: true });
    }

    return Response.json({ error: "Invalid delete type" }, { status: 400 });
  } catch (err) {
    console.error("DELETE /api/learn/courses/[courseId]/curriculum error:", err);
    return Response.json({ error: "Failed to delete curriculum item" }, { status: 500 });
  }
}

