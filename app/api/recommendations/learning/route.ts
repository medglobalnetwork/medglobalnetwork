// ============================================================
// MGN Recommendation Engine — Learning Connections API
// app/api/recommendations/learning/route.ts
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
      category: "learning-connections",
      limit,
      offset,
      source: "learn_page",
    });

    return Response.json(result);
  } catch (err) {
    console.error("GET /api/recommendations/learning error:", err);
    return Response.json(
      { data: [], total: 0, hasMore: false, error: "Failed to fetch learning recommendations" },
      { status: 500 }
    );
  }
}
