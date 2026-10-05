// ============================================================
// MGN Recommendation Engine — Analytics & Quality Metrics
// modules/recommendations/lib/analytics.ts
// ============================================================

import { recDb, ensureRecommendationTables } from "./recommendations-db";
import { sql } from "kysely";
import type { RecommendationAnalyticsMetrics } from "../types";

export async function getRecommendationAnalytics(
  days = 30
): Promise<RecommendationAnalyticsMetrics> {
  await ensureRecommendationTables();

  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  try {
    const [
      impressionStats,
      feedbackStats,
      categoryStats,
      sourceStats,
      categoryFeedbackStats,
      coldStartImpStats,
      coldStartFbStats,
    ] = await Promise.all([
      // 1. Total Impressions
      recDb
        .selectFrom("recommendation_impressions")
        .select(sql<string>`count(*)`.as("count"))
        .where("created_at", ">=", since)
        .executeTakeFirst(),

      // 2. Feedback breakdown
      recDb
        .selectFrom("recommendation_feedback")
        .select(["feedback_type", sql<string>`count(*)`.as("count")])
        .where("created_at", ">=", since)
        .groupBy("feedback_type")
        .execute(),

      // 3. Category breakdown
      recDb
        .selectFrom("recommendation_impressions")
        .select(["recommendation_type", sql<string>`count(*)`.as("count")])
        .where("created_at", ">=", since)
        .groupBy("recommendation_type")
        .execute(),

      // 4. Source breakdown
      recDb
        .selectFrom("recommendation_impressions")
        .select(["source", sql<string>`count(*)`.as("count")])
        .where("created_at", ">=", since)
        .groupBy("source")
        .execute(),

      // 5. Positive feedback by category
      recDb
        .selectFrom("recommendation_feedback")
        .select(["category", sql<string>`count(*)`.as("count")])
        .where("created_at", ">=", since)
        .where("feedback_type", "in", ["profile_open", "connect_request", "connect_accept", "follow"])
        .groupBy("category")
        .execute(),

      // 6. Cold start impressions
      recDb
        .selectFrom("recommendation_impressions")
        .select(sql<string>`count(*)`.as("count"))
        .where("created_at", ">=", since)
        .where(sql<boolean>`reasons::text ILIKE '%cold_start%'`)
        .executeTakeFirst(),

      // 7. Cold start positive feedback
      recDb
        .selectFrom("recommendation_feedback")
        .select(sql<string>`count(*)`.as("count"))
        .where("created_at", ">=", since)
        .where("reason", "=", "cold_start")
        .executeTakeFirst(),
    ]);

    const totalImpressions = parseInt(impressionStats?.count || "0", 10);

    const feedbackMap = new Map<string, number>();
    for (const f of feedbackStats) {
      feedbackMap.set(f.feedback_type, parseInt(f.count, 10) || 0);
    }

    const categoryConvMap = new Map<string, number>();
    for (const cf of categoryFeedbackStats) {
      if (cf.category) {
        categoryConvMap.set(cf.category, parseInt(cf.count, 10) || 0);
      }
    }

    const totalProfileOpens = feedbackMap.get("profile_open") ?? 0;
    const totalConnectRequests = feedbackMap.get("connect_request") ?? 0;
    const totalConnectAccepts = feedbackMap.get("connect_accept") ?? 0;
    const totalFollows = feedbackMap.get("follow") ?? 0;
    const totalDismissals = feedbackMap.get("dismiss") ?? 0;
    const totalNotInterested = feedbackMap.get("not_interested") ?? 0;

    const categoryBreakdown: Record<string, { impressions: number; conversions: number; rate: number }> = {};
    for (const c of categoryStats) {
      const imp = parseInt(c.count, 10) || 0;
      const conv = categoryConvMap.get(c.recommendation_type) ?? 0;
      categoryBreakdown[c.recommendation_type] = {
        impressions: imp,
        conversions: conv,
        rate: imp > 0 ? Math.round((conv / imp) * 1000) / 10 : 0,
      };
    }

    const totalConversions = totalProfileOpens + totalConnectRequests + totalFollows;
    const sourceBreakdown: Record<string, { impressions: number; conversions: number; rate: number }> = {};
    for (const s of sourceStats) {
      const imp = parseInt(s.count, 10) || 0;
      // Proportional conversion allocation if source feedback is not directly tagged with source column
      const conv = totalImpressions > 0 ? Math.round((imp / totalImpressions) * totalConversions) : 0;
      sourceBreakdown[s.source] = {
        impressions: imp,
        conversions: conv,
        rate: imp > 0 ? Math.round((conv / imp) * 1000) / 10 : 0,
      };
    }

    const coldStartImpressions = parseInt(coldStartImpStats?.count || "0", 10);
    const coldStartConversions = parseInt(coldStartFbStats?.count || "0", 10);

    return {
      totalImpressions,
      totalProfileOpens,
      totalConnectRequests,
      totalConnectAccepts,
      totalFollows,
      totalDismissals,
      totalNotInterested,
      ctr: totalImpressions > 0 ? Math.round((totalProfileOpens / totalImpressions) * 1000) / 10 : 0,
      connectRequestRate: totalImpressions > 0 ? Math.round((totalConnectRequests / totalImpressions) * 1000) / 10 : 0,
      connectAcceptRate: totalConnectRequests > 0 ? Math.round((totalConnectAccepts / totalConnectRequests) * 1000) / 10 : 0,
      followRate: totalImpressions > 0 ? Math.round((totalFollows / totalImpressions) * 1000) / 10 : 0,
      dismissRate: totalImpressions > 0 ? Math.round((totalDismissals / totalImpressions) * 1000) / 10 : 0,
      notInterestedRate: totalImpressions > 0 ? Math.round((totalNotInterested / totalImpressions) * 1000) / 10 : 0,
      categoryBreakdown,
      sourceBreakdown,
      coldStartMetrics: {
        impressions: coldStartImpressions,
        conversions: coldStartConversions,
        rate: coldStartImpressions > 0 ? Math.round((coldStartConversions / coldStartImpressions) * 1000) / 10 : 0,
      },
    };
  } catch (err) {
    console.error("Failed to calculate recommendation analytics:", err);
    return {
      totalImpressions: 0,
      totalProfileOpens: 0,
      totalConnectRequests: 0,
      totalConnectAccepts: 0,
      totalFollows: 0,
      totalDismissals: 0,
      totalNotInterested: 0,
      ctr: 0,
      connectRequestRate: 0,
      connectAcceptRate: 0,
      followRate: 0,
      dismissRate: 0,
      notInterestedRate: 0,
      categoryBreakdown: {},
      sourceBreakdown: {},
      coldStartMetrics: { impressions: 0, conversions: 0, rate: 0 },
    };
  }
}
