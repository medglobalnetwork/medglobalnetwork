// ============================================================
// MGN Recommendation Engine — Unified People Recommendation API
// app/api/recommendations/people/route.ts
// ============================================================

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getPersonalizedRecommendations } from "@/modules/recommendations/lib/engine";
import type { RecommendationCategory, RecommendationSource } from "@/modules/recommendations/types";

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    const { searchParams } = new URL(request.url);

    const category = (searchParams.get("category") as RecommendationCategory) || "people-you-may-know";
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "10", 10), 50);
    const offset = Math.max(parseInt(searchParams.get("offset") ?? "0", 10), 0);
    const source = (searchParams.get("source") as RecommendationSource) || "network_page";
    const experimentId = searchParams.get("experimentId") || undefined;
    const excludeIds = searchParams.get("exclude") ? searchParams.get("exclude")!.split(",") : undefined;

    const result = await getPersonalizedRecommendations({
      userId: session?.user?.id,
      category,
      limit,
      offset,
      source,
      experimentId,
      excludeUserIds: excludeIds,
    });

    return Response.json(result);
  } catch (err) {
    console.error("GET /api/recommendations/people error:", err);
    return Response.json(
      {
        data: [],
        total: 0,
        hasMore: false,
        category: "people-you-may-know",
        error: "Failed to generate professional recommendations",
      },
      { status: 200 }
    );
  }
}
