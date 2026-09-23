// ============================================================
// MGN Recommendation Engine — "Hide / Dismiss" API
// app/api/recommendations/hide/route.ts
// ============================================================

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { recordRecommendationFeedback } from "@/modules/recommendations/lib/event-pipeline";

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return Response.json({ error: "Authentication required" }, { status: 401 });
    }

    const body = await request.json();
    const { candidateId, reason, category } = body;

    if (!candidateId) {
      return Response.json({ error: "candidateId is required" }, { status: 400 });
    }

    await recordRecommendationFeedback({
      userId: session.user.id,
      candidateId,
      feedbackType: "dismiss",
      reason: reason || "User dismissed suggestion",
      category,
    });

    return Response.json({ success: true, message: "Suggestion dismissed" });
  } catch (err) {
    console.error("POST /api/recommendations/hide error:", err);
    return Response.json({ error: "Failed to dismiss suggestion" }, { status: 500 });
  }
}
