// ============================================================
// MGN Recommendation Engine — Central Event Pipeline & Feedback Loop
// modules/recommendations/lib/event-pipeline.ts
// ============================================================

import {
  recDb,
  ensureRecommendationTables,
  generateRecId,
} from "./recommendations-db";
import { refreshUserInterestProfile } from "./interest-profile";
import type {
  RecommendationEventInput,
  RecommendationFeedbackInput,
} from "../types";

/**
 * Ingests user behavioral & interaction events centrally.
 * Triggers asynchronous background interest profile updates when significant actions occur.
 */
export async function trackRecommendationEvent(
  event: RecommendationEventInput
): Promise<void> {
  try {
    await ensureRecommendationTables();

    await recDb
      .insertInto("user_behavior_events")
      .values({
        id: generateRecId(),
        user_id: event.userId,
        event_type: event.eventType,
        target_id: event.targetId ?? null,
        target_type: event.targetType ?? null,
        metadata: event.metadata ? JSON.stringify(event.metadata) : null,
        created_at: new Date(),
      })
      .execute();

    // Significant events trigger asynchronous interest refresh
    const significantEvents = new Set([
      "search",
      "follow",
      "connect_request",
      "connect_accept",
      "course_enroll",
      "community_join",
      "job_apply",
    ]);

    if (significantEvents.has(event.eventType)) {
      // Non-blocking asynchronous refresh
      refreshUserInterestProfile(event.userId).catch((err) =>
        console.warn("Async interest refresh error:", err)
      );
    }
  } catch (err) {
    console.error("Failed to trackRecommendationEvent:", err);
  }
}

/**
 * Records recommendation impressions in batch for efficient tracking.
 */
export async function trackRecommendationImpressions(
  userId: string,
  candidates: Array<{
    candidateId: string;
    recommendationType: string;
    source: string;
    score: number;
    reasons?: any;
    position: number;
    experimentId?: string;
    variant?: string;
  }>
): Promise<void> {
  if (!candidates || candidates.length === 0) return;

  try {
    await ensureRecommendationTables();
    const now = new Date();

    const rows = candidates.map((c) => ({
      id: generateRecId(),
      user_id: userId,
      candidate_id: c.candidateId,
      recommendation_type: c.recommendationType,
      source: c.source || "network_page",
      score: c.score || 0,
      reasons: c.reasons ? JSON.stringify(c.reasons) : null,
      position: c.position || 0,
      experiment_id: c.experimentId ?? null,
      variant: c.variant ?? null,
      created_at: now,
    }));

    await recDb
      .insertInto("recommendation_impressions")
      .values(rows)
      .execute();
  } catch (err) {
    console.error("Failed to trackRecommendationImpressions:", err);
  }
}

/**
 * Records negative and explicit user feedback ("not interested", "dismiss", "dont_suggest", "report", "block").
 */
export async function recordRecommendationFeedback(
  feedback: RecommendationFeedbackInput
): Promise<void> {
  try {
    await ensureRecommendationTables();
    const now = new Date();

    await recDb
      .insertInto("recommendation_feedback")
      .values({
        id: generateRecId(),
        user_id: feedback.userId,
        candidate_id: feedback.candidateId,
        feedback_type: feedback.feedbackType,
        reason: feedback.reason ?? null,
        category: feedback.category ?? null,
        created_at: now,
      })
      .execute();

    // Also record as a behavior event for feedback loop analytics
    await recDb
      .insertInto("user_behavior_events")
      .values({
        id: generateRecId(),
        user_id: feedback.userId,
        event_type: `feedback_${feedback.feedbackType}`,
        target_id: feedback.candidateId,
        target_type: "user",
        metadata: JSON.stringify({
          category: feedback.category,
          reason: feedback.reason,
        }),
        created_at: now,
      })
      .execute();

    // If feedback is 'block', register in user_blocks table immediately
    if (feedback.feedbackType === "block") {
      await recDb
        .insertInto("user_blocks")
        .values({
          id: generateRecId(),
          blocker_id: feedback.userId,
          blocked_id: feedback.candidateId,
          reason: feedback.reason ?? "Blocked from recommendation menu",
          created_at: now,
        })
        .onConflict((oc) =>
          oc.columns(["blocker_id", "blocked_id"]).doNothing()
        )
        .execute();
    }
  } catch (err) {
    console.error("Failed to recordRecommendationFeedback:", err);
  }
}
