// ============================================================
// MGN Recommendation Engine — "Not Interested" API
// app/api/recommendations/not-interested/route.ts
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
      feedbackType: "not_interested",
      reason: reason || "User clicked not interested",
      category,
    });

    return Response.json({ success: true, message: "Recommendation removed and future ranking updated" });
  } catch (err) {
    console.error("POST /api/recommendations/not-interested error:", err);
    return Response.json({ error: "Failed to process request" }, { status: 500 });
  }
}
