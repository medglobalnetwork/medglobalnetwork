// ============================================================
// MGN Recommendation Engine — Feedback API
// app/api/recommendations/feedback/route.ts
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
    const { candidateId, feedbackType, reason, category } = body;

    if (!candidateId || !feedbackType) {
      return Response.json({ error: "candidateId and feedbackType are required" }, { status: 400 });
    }

    await recordRecommendationFeedback({
      userId: session.user.id,
      candidateId,
      feedbackType,
      reason,
      category,
    });

    return Response.json({ success: true, feedbackType, candidateId });
  } catch (err) {
    console.error("POST /api/recommendations/feedback error:", err);
    return Response.json({ error: "Failed to record feedback" }, { status: 500 });
  }
}
