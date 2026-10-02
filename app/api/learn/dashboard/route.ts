import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { StudentDashboardService } from "@/modules/learn/lib/student-db";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const data = await StudentDashboardService.getDashboardData(session.user.id);
    return Response.json(data);
  } catch (err: any) {
    console.error("GET /api/learn/dashboard error:", err);
    return Response.json({ error: "Failed to fetch student dashboard" }, { status: 500 });
  }
}
