// app/api/learn/instructor/submissions/route.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { OrganizerEligibilityService } from "@/modules/shared/permissions/organizer-eligibility-service";
import { getInstructorSubmissions } from "@/modules/learn/lib/instructor-db";

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  const eligibility = await OrganizerEligibilityService.canAccessInstructorStudio(session.user.id);
  if (!eligibility.eligible) {
    return Response.json({ error: "Forbidden: Instructor authorization required" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const courseId = searchParams.get("courseId") || undefined;
  const quizId = searchParams.get("quizId") || undefined;
  const status = searchParams.get("status") || undefined;
  const search = searchParams.get("search") || undefined;

  try {
    const submissions = await getInstructorSubmissions(session.user.id, {
      courseId,
      quizId,
      status,
      search,
    });
    return Response.json({ submissions });
  } catch (err: any) {
    console.error("GET /api/learn/instructor/submissions error:", err);
    return Response.json({ error: err.message || "Failed to fetch submissions" }, { status: 500 });
  }
}
