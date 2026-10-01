// app/api/learn/instructor/quizzes/route.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { OrganizerEligibilityService } from "@/modules/shared/permissions/organizer-eligibility-service";
import { getInstructorQuizzes, createQuizWithQuestions } from "@/modules/learn/lib/instructor-db";

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

  try {
    const quizzes = await getInstructorQuizzes(session.user.id, courseId);
    return Response.json({ quizzes });
  } catch (err: any) {
    console.error("GET /api/learn/instructor/quizzes error:", err);
    return Response.json({ error: err.message || "Failed to fetch quizzes" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  const eligibility = await OrganizerEligibilityService.canAccessInstructorStudio(session.user.id);
  if (!eligibility.eligible) {
    return Response.json({ error: "Forbidden: Instructor authorization required" }, { status: 403 });
  }

  try {
    const body = await request.json();
    if (!body.courseId || !body.title?.trim() || !Array.isArray(body.questions) || body.questions.length === 0) {
      return Response.json(
        { error: "Course ID, Test Title, and at least 1 Question are required." },
        { status: 400 }
      );
    }

    const quizId = await createQuizWithQuestions(session.user.id, body);
    return Response.json({ success: true, quizId });
  } catch (err: any) {
    console.error("POST /api/learn/instructor/quizzes error:", err);
    return Response.json({ error: err.message || "Failed to create quiz/test" }, { status: 500 });
  }
}
