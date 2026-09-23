// ============================================================
// MGN Recommendation Engine — Similar Professionals API
// app/api/recommendations/similar/route.ts
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
      category: "similar-professionals",
      limit,
      offset,
      source: "profile_page",
    });

    return Response.json(result);
  } catch (err) {
    console.error("GET /api/recommendations/similar error:", err);
    return Response.json(
      { data: [], total: 0, hasMore: false, error: "Failed to fetch similar professionals" },
      { status: 500 }
    );
  }
}
