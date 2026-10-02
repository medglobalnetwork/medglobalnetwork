import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { QuestionBankService } from "@/modules/learn/lib/student-db";

export async function GET(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const subject = searchParams.get("subject") || undefined;
    const search = searchParams.get("search") || undefined;

    const questionBanks = await QuestionBankService.getQuestionBanks({ subject, search });
    return Response.json({ questionBanks });
  } catch (err: any) {
    console.error("GET /api/learn/question-banks error:", err);
    return Response.json({ error: "Failed to fetch question banks" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const body = await req.json();
    // Custom test generator from question bank criteria
    const questions = await QuestionBankService.buildCustomTest(session.user.id, body);
    return Response.json({ questions });
  } catch (err: any) {
    console.error("POST /api/learn/question-banks error:", err);
    return Response.json({ error: "Failed to build custom test" }, { status: 500 });
  }
}
