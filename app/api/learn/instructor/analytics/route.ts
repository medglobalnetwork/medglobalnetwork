// app/api/learn/instructor/analytics/route.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getVideoAnalyticsForLesson } from "@/modules/learn/lib/video-service";

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const lessonId = searchParams.get("lessonId");

  if (!lessonId) {
    return Response.json({ error: "lessonId parameter is required" }, { status: 400 });
  }

  try {
    const analytics = await getVideoAnalyticsForLesson(lessonId);
    return Response.json({ analytics });
  } catch (err: any) {
    console.error("GET /api/learn/instructor/analytics error:", err);
    return Response.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
