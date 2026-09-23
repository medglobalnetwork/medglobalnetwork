// ============================================================
// MGN Recommendation Engine — Admin Configuration & Caching
// modules/recommendations/lib/admin-config.ts
// ============================================================

import {
  recDb,
  ensureRecommendationTables,
  generateRecId,
  DEFAULT_RECOMMENDATION_RULE_CONFIG,
} from "./recommendations-db";
import type { RecommendationRuleConfig, RecommendationFeatureWeights } from "../types";

// In-memory cache with 60s TTL
let cachedConfig: RecommendationRuleConfig | null = null;
let cacheExpiresAt = 0;

export async function getRecommendationConfig(): Promise<RecommendationRuleConfig> {
  const now = Date.now();
  if (cachedConfig && now < cacheExpiresAt) {
    return cachedConfig;
  }

  await ensureRecommendationTables();

  try {
    const row = await recDb
      .selectFrom("recommendation_rules")
      .select(["config_value"])
      .where("rule_key", "=", "master_config")
      .executeTakeFirst();

    if (row?.config_value) {
      const parsed = typeof row.config_value === "string"
        ? JSON.parse(row.config_value)
        : row.config_value;

      // Merge with defaults to ensure complete structure
      cachedConfig = {
        feature_weights: {
          ...DEFAULT_RECOMMENDATION_RULE_CONFIG.feature_weights,
          ...(parsed.feature_weights || {}),
        },
        diversity: {
          ...DEFAULT_RECOMMENDATION_RULE_CONFIG.diversity,
          ...(parsed.diversity || {}),
        },
        exploration: {
          ...DEFAULT_RECOMMENDATION_RULE_CONFIG.exploration,
          ...(parsed.exploration || {}),
        },
        time_decay: {
          ...DEFAULT_RECOMMENDATION_RULE_CONFIG.time_decay,
          ...(parsed.time_decay || {}),
        },
        candidate_sources: {
          ...DEFAULT_RECOMMENDATION_RULE_CONFIG.candidate_sources,
          ...(parsed.candidate_sources || {}),
        },
      };
    } else {
      cachedConfig = DEFAULT_RECOMMENDATION_RULE_CONFIG;
    }
  } catch (err) {
    console.warn("Failed to read recommendation_rules, using defaults:", err);
    cachedConfig = DEFAULT_RECOMMENDATION_RULE_CONFIG;
  }

  cacheExpiresAt = now + 60 * 1000; // 60s TTL
  return cachedConfig;
}

export async function updateRecommendationConfig(
  newConfig: Partial<RecommendationRuleConfig>,
  adminUserId?: string
): Promise<RecommendationRuleConfig> {
  await ensureRecommendationTables();

  const current = await getRecommendationConfig();
  const updated: RecommendationRuleConfig = {
    feature_weights: {
      ...current.feature_weights,
      ...(newConfig.feature_weights || {}),
    },
    diversity: {
      ...current.diversity,
      ...(newConfig.diversity || {}),
    },
    exploration: {
      ...current.exploration,
      ...(newConfig.exploration || {}),
    },
    time_decay: {
      ...current.time_decay,
      ...(newConfig.time_decay || {}),
    },
    candidate_sources: {
      ...current.candidate_sources,
      ...(newConfig.candidate_sources || {}),
    },
  };

  const existing = await recDb
    .selectFrom("recommendation_rules")
    .select("id")
    .where("rule_key", "=", "master_config")
    .executeTakeFirst();

  if (existing) {
    await recDb
      .updateTable("recommendation_rules")
      .set({
        config_value: JSON.stringify(updated),
        updated_by: adminUserId || "admin",
        updated_at: new Date(),
      })
      .where("rule_key", "=", "master_config")
      .execute();
  } else {
    await recDb
      .insertInto("recommendation_rules")
      .values({
        id: generateRecId(),
        rule_key: "master_config",
        config_value: JSON.stringify(updated),
        description: "Global production configuration for MGN recommendation engine",
        updated_by: adminUserId || "admin",
        updated_at: new Date(),
      })
      .execute();
  }

  // Invalidate cache immediately
  cachedConfig = updated;
  cacheExpiresAt = Date.now() + 60 * 1000;

  return updated;
}

export function invalidateConfigCache(): void {
  cachedConfig = null;
  cacheExpiresAt = 0;
}
