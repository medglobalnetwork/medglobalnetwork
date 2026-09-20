// app/api/learn/courses/[courseId]/route.ts
import { auth } from "@/lib/auth";
import { getCourseDetails, learnDb } from "@/modules/learn/lib/learn-db";
import { headers } from "next/headers";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  const currentUserId = session?.user?.id;
  const { courseId } = await params;

  try {
    const course = await getCourseDetails(courseId, currentUserId);
    if (!course) {
      return Response.json({ error: "Course not found" }, { status: 404 });
    }
    return Response.json({ course });
  } catch (err) {
    console.error("GET /api/learn/courses/[courseId] error:", err);
    return Response.json({ error: "Failed to fetch course details" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  const { courseId } = await params;
  try {
    const body = await request.json();

    // Check ownership
    const course = await learnDb
      .selectFrom("courses")
      .select(["instructor_id"])
      .where("id", "=", courseId)
      .executeTakeFirst();

    if (!course || course.instructor_id !== session.user.id) {
      return Response.json({ error: "Unauthorized or course not found" }, { status: 403 });
    }

    const updateData: any = { updated_at: new Date() };
    if (body.title) updateData.title = body.title.trim();
    if (body.short_description !== undefined) updateData.short_description = body.short_description;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.thumbnail !== undefined) updateData.thumbnail = body.thumbnail;
    if (body.category) updateData.category = body.category;
    if (body.profession !== undefined) updateData.profession = body.profession;
    if (body.specialization !== undefined) updateData.specialization = body.specialization;
    if (body.level) updateData.level = body.level;
    if (body.status) {
      updateData.status = body.status;
      if (body.status === "published") {
        updateData.published_at = new Date();
      }
    }
    if (body.is_free !== undefined) updateData.is_free = body.is_free;
    if (body.certificate_enabled !== undefined) updateData.certificate_enabled = body.certificate_enabled;

    await learnDb
      .updateTable("courses")
      .set(updateData)
      .where("id", "=", courseId)
      .execute();

    return Response.json({ success: true });
  } catch (err) {
    console.error("PATCH /api/learn/courses/[courseId] error:", err);
    return Response.json({ error: "Failed to update course" }, { status: 500 });
  }
}
