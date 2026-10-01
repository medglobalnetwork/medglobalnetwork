// app/api/learn/instructor/quizzes/[quizId]/route.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { OrganizerEligibilityService } from "@/modules/shared/permissions/organizer-eligibility-service";
import { getQuizWithFullQuestions, updateQuizWithQuestions, deleteQuiz } from "@/modules/learn/lib/instructor-db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ quizId: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  const eligibility = await OrganizerEligibilityService.canAccessInstructorStudio(session.user.id);
  if (!eligibility.eligible) {
    return Response.json({ error: "Forbidden: Instructor authorization required" }, { status: 403 });
  }

  const { quizId } = await params;
  try {
    const quiz = await getQuizWithFullQuestions(quizId, session.user.id);
    if (!quiz) {
      return Response.json({ error: "Quiz not found" }, { status: 404 });
    }
    return Response.json({ quiz });
  } catch (err: any) {
    console.error("GET /api/learn/instructor/quizzes/[quizId] error:", err);
    return Response.json({ error: err.message || "Failed to fetch quiz" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ quizId: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  const eligibility = await OrganizerEligibilityService.canAccessInstructorStudio(session.user.id);
  if (!eligibility.eligible) {
    return Response.json({ error: "Forbidden: Instructor authorization required" }, { status: 403 });
  }

  const { quizId } = await params;
  try {
    const body = await request.json();
    await updateQuizWithQuestions(quizId, session.user.id, body);
    return Response.json({ success: true });
  } catch (err: any) {
    console.error("PUT /api/learn/instructor/quizzes/[quizId] error:", err);
    return Response.json({ error: err.message || "Failed to update quiz" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ quizId: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  const eligibility = await OrganizerEligibilityService.canAccessInstructorStudio(session.user.id);
  if (!eligibility.eligible) {
    return Response.json({ error: "Forbidden: Instructor authorization required" }, { status: 403 });
  }

  const { quizId } = await params;
  try {
    await deleteQuiz(quizId, session.user.id);
    return Response.json({ success: true });
  } catch (err: any) {
    console.error("DELETE /api/learn/instructor/quizzes/[quizId] error:", err);
    return Response.json({ error: err.message || "Failed to delete quiz" }, { status: 500 });
  }
}
