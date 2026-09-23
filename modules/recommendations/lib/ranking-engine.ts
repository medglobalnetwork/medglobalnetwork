// ============================================================
// MGN Recommendation Engine — Ranking Model & ML-Ready Abstraction
// modules/recommendations/lib/ranking-engine.ts
// ============================================================

import type {
  RecommendationCandidate,
  RecommendationFeatureVector,
  RecommendationFeatureWeights,
} from "../types";

/**
 * Standard interface for ranking models.
 * Can be implemented by RuleBasedRanker, LogisticRanker, GradientBoostedRanker, or TwoTowerRanker.
 */
export interface IRankingModel {
  name: string;
  version: string;
  rankCandidates(
    candidates: Array<{ candidate: RecommendationCandidate; features: RecommendationFeatureVector }>,
    weights: RecommendationFeatureWeights
  ): Array<{ candidate: RecommendationCandidate; features: RecommendationFeatureVector; score: number }>;
}

/**
 * Production Configurable Rule-Based Weighted Linear Ranker.
 */
export class ConfigurableWeightedRanker implements IRankingModel {
  name = "configurable_weighted_ranker";
  version = "1.0.0";

  rankCandidates(
    items: Array<{ candidate: RecommendationCandidate; features: RecommendationFeatureVector }>,
    weights: RecommendationFeatureWeights
  ): Array<{ candidate: RecommendationCandidate; features: RecommendationFeatureVector; score: number }> {
    return items.map(({ candidate, features }) => {
      let score = 0;

      // Positive feature weighted contributions
      score += (features.same_profession || 0) * (weights.same_profession ?? 25);
      score += (features.same_specialization || 0) * (weights.same_specialization ?? 30);
      score += (features.shared_skills || 0) * (weights.shared_skills ?? 15);
      score += (features.same_organization || 0) * (weights.same_organization ?? 25);
      score += (features.same_education || 0) * (weights.same_education ?? 18);
      score += (features.mutual_connections || 0) * (weights.mutual_connections ?? 12);
      score += (features.shared_community || 0) * (weights.shared_community ?? 15);
      score += (features.research_similarity || 0) * (weights.research_similarity ?? 25);
      score += (features.shared_event || 0) * (weights.shared_event ?? 12);
      score += (features.learning_similarity || 0) * (weights.learning_similarity ?? 10);
      score += (features.location_relevance || 0) * (weights.location_relevance ?? 8);
      score += (features.behavioral_similarity || 0) * (weights.behavioral_similarity ?? 15);
      score += (features.profile_interaction || 0) * (weights.profile_interaction ?? 15);
      score += (features.follow_relationship || 0) * (weights.follow_relationship ?? 20);
      score += (features.verification_signal || 0) * (weights.verification_signal ?? 5);
      score += (features.profile_quality || 0) * (weights.profile_quality ?? 10);

      // Negative penalties (already_seen: -15, not_interested: -60)
      if (features.already_seen > 0) {
        score += features.already_seen * (weights.already_seen ?? -15);
      }
      if (features.not_interested > 0) {
        score += features.not_interested * (weights.not_interested ?? -60);
      }

      // Base boost for founding members or high-engagement
      if (candidate.is_founding_member) {
        score += 3;
      }

      const roundedScore = Math.round(score * 100) / 100;
      return {
        candidate: { ...candidate, score: roundedScore, features },
        features,
        score: roundedScore,
      };
    }).sort((a, b) => b.score - a.score);
  }
}

export const defaultRankingModel = new ConfigurableWeightedRanker();
