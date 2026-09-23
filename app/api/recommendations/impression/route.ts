// ============================================================
// MGN Recommendation Engine — Impression Tracking API
// app/api/recommendations/impression/route.ts
// ============================================================

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { trackRecommendationImpressions } from "@/modules/recommendations/lib/event-pipeline";

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return Response.json({ success: false, message: "Anonymous impression not persisted" }, { status: 200 });
    }

    const body = await request.json();
    const impressions = Array.isArray(body.impressions)
      ? body.impressions
      : body.candidateId
      ? [{
          candidateId: body.candidateId,
          recommendationType: body.recommendationType || "people-you-may-know",
          source: body.source || "feed",
          score: body.score || 0,
          reasons: body.reasons,
          position: body.position || 1,
          experimentId: body.experimentId,
          variant: body.variant,
        }]
      : [];

    if (impressions.length > 0) {
      await trackRecommendationImpressions(session.user.id, impressions);
    }

    return Response.json({ success: true, count: impressions.length });
  } catch (err) {
    console.error("POST /api/recommendations/impression error:", err);
    return Response.json({ error: "Failed to record impression" }, { status: 500 });
  }
}
