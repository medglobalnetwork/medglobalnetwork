// app/api/learn/instructor/courses/[courseId]/students/route.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getCourseStudentsAndCertificates } from "@/modules/learn/lib/learn-db";
import { OrganizerEligibilityService } from "@/modules/shared/permissions/organizer-eligibility-service";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  // Verify instructor eligibility
  const eligibility = await OrganizerEligibilityService.canAccessInstructorStudio(session.user.id);
  if (!eligibility.eligible) {
    return Response.json(
      { error: "Forbidden: Instructor authorization required", reason: eligibility.reason },
      { status: 403 }
    );
  }

  const { courseId } = await params;
  if (!courseId) {
    return Response.json({ error: "courseId is required" }, { status: 400 });
  }

  try {
    const data = await getCourseStudentsAndCertificates(courseId, session.user.id);
    return Response.json(data);
  } catch (err: any) {
    console.error(`GET /api/learn/instructor/courses/${courseId}/students error:`, err);
    return Response.json(
      { error: err.message || "Failed to fetch course learners and certificates" },
      { status: 500 }
    );
  }
}
