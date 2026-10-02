import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { StudentRecommendationService } from "@/modules/learn/lib/student-db";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const recommendations = await StudentRecommendationService.getStudentRecommendations(session.user.id);
    return Response.json({ recommendations });
  } catch (err: any) {
    console.error("GET /api/learn/recommendations error:", err);
    return Response.json({ error: "Failed to fetch recommendations" }, { status: 500 });
  }
}
