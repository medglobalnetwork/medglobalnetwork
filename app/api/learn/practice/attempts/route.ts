import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { MCQPracticeService } from "@/modules/learn/lib/student-db";

export async function GET(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const attemptId = searchParams.get("id");

    if (attemptId) {
      const attempt = await MCQPracticeService.getAttemptDetail(attemptId, session.user.id);
      if (!attempt) {
        return Response.json({ error: "Attempt not found" }, { status: 404 });
      }
      return Response.json({ attempt });
    }

    const attempts = await MCQPracticeService.getUserAttempts(session.user.id);
    return Response.json({ attempts });
  } catch (err: any) {
    console.error("GET /api/learn/practice/attempts error:", err);
    return Response.json({ error: "Failed to fetch practice attempts" }, { status: 500 });
  }
}
