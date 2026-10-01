// app/api/learn/instructor/courses/[courseId]/route.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { OrganizerEligibilityService } from "@/modules/shared/permissions/organizer-eligibility-service";
import { updateCourseFull, deleteCourseFull } from "@/modules/learn/lib/instructor-db";
import { getCourseDetails } from "@/modules/learn/lib/learn-db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  const eligibility = await OrganizerEligibilityService.canAccessInstructorStudio(session.user.id);
  if (!eligibility.eligible) {
    return Response.json({ error: "Forbidden: Instructor authorization required" }, { status: 403 });
  }

  const { courseId } = await params;
  try {
    const course = await getCourseDetails(courseId, session.user.id);
    if (!course) {
      return Response.json({ error: "Course not found" }, { status: 404 });
    }
    return Response.json({ course });
  } catch (err: any) {
    console.error("GET /api/learn/instructor/courses/[courseId] error:", err);
    return Response.json({ error: err.message || "Failed to fetch course" }, { status: 500 });
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

  const eligibility = await OrganizerEligibilityService.canAccessInstructorStudio(session.user.id);
  if (!eligibility.eligible) {
    return Response.json({ error: "Forbidden: Instructor authorization required" }, { status: 403 });
  }

  const { courseId } = await params;
  try {
    const body = await request.json();
    await updateCourseFull(courseId, session.user.id, body);
    const updated = await getCourseDetails(courseId, session.user.id);
    return Response.json({ success: true, course: updated });
  } catch (err: any) {
    console.error("PATCH /api/learn/instructor/courses/[courseId] error:", err);
    return Response.json({ error: err.message || "Failed to update course" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  const eligibility = await OrganizerEligibilityService.canAccessInstructorStudio(session.user.id);
  if (!eligibility.eligible) {
    return Response.json({ error: "Forbidden: Instructor authorization required" }, { status: 403 });
  }

  const { courseId } = await params;
  try {
    await deleteCourseFull(courseId, session.user.id);
    return Response.json({ success: true });
  } catch (err: any) {
    console.error("DELETE /api/learn/instructor/courses/[courseId] error:", err);
    return Response.json({ error: err.message || "Failed to delete course" }, { status: 500 });
  }
}
