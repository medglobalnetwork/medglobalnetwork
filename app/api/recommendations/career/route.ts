// ============================================================
// MGN Recommendation Engine — Career Connections API
// app/api/recommendations/career/route.ts
// ============================================================

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getPersonalizedRecommendations } from "@/modules/recommendations/lib/engine";

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    const { searchParams } = new URL(request.url);

    const limit = Math.min(parseInt(searchParams.get("limit") ?? "10", 10), 30);
    const offset = Math.max(parseInt(searchParams.get("offset") ?? "0", 10), 0);

    const result = await getPersonalizedRecommendations({
      userId: session?.user?.id,
      category: "career-connections",
      limit,
      offset,
      source: "jobs_page",
    });

    return Response.json(result);
  } catch (err) {
    console.error("GET /api/recommendations/career error:", err);
    return Response.json(
      { data: [], total: 0, hasMore: false, error: "Failed to fetch career recommendations" },
      { status: 500 }
    );
  }
}
