// ============================================================
// MGN Recommendation Engine — Network Feed Recommendations API
// app/api/recommendations/network/route.ts
// ============================================================

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getPersonalizedRecommendations } from "@/modules/recommendations/lib/engine";
import type { RecommendationCategory } from "@/modules/recommendations/types";

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    const { searchParams } = new URL(request.url);

    const category = (searchParams.get("category") as RecommendationCategory) || "people-you-may-know";
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "10", 10), 30);
    const offset = Math.max(parseInt(searchParams.get("offset") ?? "0", 10), 0);

    const result = await getPersonalizedRecommendations({
      userId: session?.user?.id,
      category,
      limit,
      offset,
      source: "network_page",
    });

    return Response.json(result);
  } catch (err) {
    console.error("GET /api/recommendations/network error:", err);
    return Response.json(
      { data: [], total: 0, hasMore: false, error: "Failed to fetch network recommendations" },
      { status: 500 }
    );
  }
}
