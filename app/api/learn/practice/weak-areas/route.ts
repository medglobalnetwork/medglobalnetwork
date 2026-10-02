import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { AdaptiveMCQService } from "@/modules/learn/lib/student-db";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const weakTopics = await AdaptiveMCQService.getWeakTopics(session.user.id);
    return Response.json({ weakTopics });
  } catch (err: any) {
    console.error("GET /api/learn/practice/weak-areas error:", err);
    return Response.json({ error: "Failed to fetch weak areas" }, { status: 500 });
  }
}
