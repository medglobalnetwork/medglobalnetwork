// app/api/learn/instructor/submissions/[attemptId]/evaluate/route.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { OrganizerEligibilityService } from "@/modules/shared/permissions/organizer-eligibility-service";
import { evaluateSubjectiveSubmission, getSubmissionDetail } from "@/modules/learn/lib/instructor-db";

export async function POST(
  request: Request,
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
    const body = await request.json();
    await evaluateSubjectiveSubmission(attemptId, session.user.id, body);
    const updated = await getSubmissionDetail(attemptId, session.user.id);
    return Response.json({ success: true, submission: updated });
  } catch (err: any) {
    console.error("POST /api/learn/instructor/submissions/[attemptId]/evaluate error:", err);
    return Response.json({ error: err.message || "Failed to evaluate submission" }, { status: 500 });
  }
}
