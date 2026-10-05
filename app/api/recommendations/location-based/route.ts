// ============================================================
// MGN Recommendation Engine — Location-Based People Recommendations API
// app/api/recommendations/location-based/route.ts
// ============================================================

import { auth } from "@/lib/auth";
import { headers, cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { getPersonalizedRecommendations } from "@/modules/recommendations/lib/engine";
import { getLatestUserLocation } from "@/lib/location-tracking";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    const { searchParams } = new URL(request.url);

    const limit = Math.min(parseInt(searchParams.get("limit") ?? "10", 10), 30);
    const offset = Math.max(parseInt(searchParams.get("offset") ?? "0", 10), 0);

    const result = await getPersonalizedRecommendations({
      userId: session?.user?.id,
      category: "location-based",
      limit,
      offset,
      source: "api",
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("GET /api/recommendations/location-based error:", err);
    return NextResponse.json(
      { data: [], total: 0, hasMore: false, error: "Failed to fetch location recommendations" },
      { status: 500 }
    );
  }
}

