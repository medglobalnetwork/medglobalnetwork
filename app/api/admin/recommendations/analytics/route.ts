// ============================================================
// MGN Admin API — Recommendation Analytics
// app/api/admin/recommendations/analytics/route.ts
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/modules/admin/lib/rbac";
import { getRecommendationAnalytics } from "@/modules/recommendations/lib/analytics";

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminSession(req.headers);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized. Admin session required." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get("days") || "30", 10);

    const metrics = await getRecommendationAnalytics(days);
    return NextResponse.json({ metrics });
  } catch (err: any) {
    console.error("GET /api/admin/recommendations/analytics error:", err);
    return NextResponse.json({ error: err.message || "Failed to load analytics" }, { status: 500 });
  }
}
