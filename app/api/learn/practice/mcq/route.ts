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
    const subject = searchParams.get("subject") || undefined;
    const topic = searchParams.get("topic") || undefined;
    const difficulty = searchParams.get("difficulty") || undefined;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 20;

    const questions = await MCQPracticeService.getQuestions({
      subject,
      topic,
      difficulty,
      limit,
      stripAnswers: true,
    });

    return Response.json({ questions });
  } catch (err: any) {
    console.error("GET /api/learn/practice/mcq error:", err);
    return Response.json({ error: "Failed to fetch practice questions" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const result = await MCQPracticeService.submitAttempt(session.user.id, body);
    return Response.json(result);
  } catch (err: any) {
    console.error("POST /api/learn/practice/mcq error:", err);
    return Response.json({ error: "Failed to submit practice attempt" }, { status: 500 });
  }
}
