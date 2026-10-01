// app/api/learn/instructor/submissions/[attemptId]/route.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { OrganizerEligibilityService } from "@/modules/shared/permissions/organizer-eligibility-service";
import { getSubmissionDetail } from "@/modules/learn/lib/instructor-db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  const eligibility = await OrganizerEligibilityService.canAccessInstructorStudio(session.user.id);
  if (!eligibility.eligible) {
    return Response.json({ error: "Forbidden: Instructor authorization required" }, { status: 403 });
  }

  const { attemptId } = await params;
  try {
    const submission = await getSubmissionDetail(attemptId, session.user.id);
    if (!submission) {
      return Response.json({ error: "Submission not found" }, { status: 404 });
    }
    return Response.json({ submission });
  } catch (err: any) {
    console.error("GET /api/learn/instructor/submissions/[attemptId] error:", err);
    return Response.json({ error: err.message || "Failed to fetch submission details" }, { status: 500 });
  }
}
