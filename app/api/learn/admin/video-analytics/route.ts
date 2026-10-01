// app/api/learn/admin/video-analytics/route.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getAdminVideoOperationsSummary } from "@/modules/learn/lib/video-service";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const summary = await getAdminVideoOperationsSummary();
    return Response.json({ summary });
  } catch (err: any) {
    console.error("GET /api/learn/admin/video-analytics error:", err);
    return Response.json({ error: "Failed to fetch admin operations summary" }, { status: 500 });
  }
}
