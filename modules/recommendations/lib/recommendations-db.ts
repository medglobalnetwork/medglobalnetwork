// ============================================================
// MGN Recommendation Engine — Database Schema & Kysely Setup
// modules/recommendations/lib/recommendations-db.ts
// ============================================================

import { database } from "@/lib/auth";
import { Kysely, sql } from "kysely";
import type {
  RecommendationFeatureWeights,
  DiversityConfig,
  ExplorationConfig,
  TimeDecayConfig,
  CandidateSourceConfig,
  RecommendationRuleConfig,
} from "../types";

// ─────────────────────────────────────────────
// DEFAULT CONFIGURATION SEEDS
// ─────────────────────────────────────────────

export const DEFAULT_FEATURE_WEIGHTS: RecommendationFeatureWeights = {
  same_profession: 25,
  same_specialization: 30,
  shared_skills: 15,
  same_organization: 25,
  same_education: 18,
  mutual_connections: 12,
  shared_community: 15,
  research_similarity: 25,
  shared_event: 12,
  learning_similarity: 10,
  location_relevance: 8,
  behavioral_similarity: 15,
  profile_interaction: 15,
  follow_relationship: 20,
  verification_signal: 5,
  profile_quality: 10,
  already_seen: -15,
  not_interested: -60,
};

export const DEFAULT_DIVERSITY_CONFIG: DiversityConfig = {
  max_consecutive_specialization: 2,
  max_consecutive_organization: 2,
  max_same_profession_ratio: 0.65,
};

export const DEFAULT_EXPLORATION_CONFIG: ExplorationConfig = {
  exploration_ratio: 0.20, // 80% familiar relevance, 20% discovery
  discovery_temperature: 1.0,
};

export const DEFAULT_TIME_DECAY_CONFIG: TimeDecayConfig = {
  half_life_days: 14,
};

export const DEFAULT_CANDIDATE_SOURCES: CandidateSourceConfig = {
  enable_mutual_connections: true,
  enable_same_organization: true,
  enable_same_university: true,
  enable_same_specialization: true,
  enable_shared_communities: true,
  enable_shared_learning: true,
  enable_shared_research: true,
  enable_location: true,
  enable_behavioral: true,
  enable_cold_start: true,
};

export const DEFAULT_RECOMMENDATION_RULE_CONFIG: RecommendationRuleConfig = {
  feature_weights: DEFAULT_FEATURE_WEIGHTS,
  diversity: DEFAULT_DIVERSITY_CONFIG,
  exploration: DEFAULT_EXPLORATION_CONFIG,
  time_decay: DEFAULT_TIME_DECAY_CONFIG,
  candidate_sources: DEFAULT_CANDIDATE_SOURCES,
};

// ─────────────────────────────────────────────
// TABLE INTERFACES
// ─────────────────────────────────────────────

export interface UserInterestProfileTable {
  id: string;
  user_id: string;
  interests: any; // jsonb Record<string, number>
  top_specializations: string[] | null;
  top_skills: string[] | null;
  last_active_at: Date;
  created_at: Date;
  updated_at: Date;
}

export interface UserBehaviorEventTable {
  id: string;
  user_id: string;
  event_type: string;
  target_id: string | null;
  target_type: string | null;
  metadata: any | null; // jsonb
  created_at: Date;
}

export interface RecommendationImpressionTable {
  id: string;
  user_id: string;
  candidate_id: string;
  recommendation_type: string;
  source: string;
  score: number;
  reasons: any | null; // jsonb
  position: number;
  experiment_id: string | null;
  variant: string | null;
  created_at: Date;
}

export interface RecommendationFeedbackTable {
  id: string;
  user_id: string;
  candidate_id: string;
  feedback_type: string;
  reason: string | null;
  category: string | null;
  created_at: Date;
}

export interface RecommendationRuleTable {
  id: string;
  rule_key: string;
  config_value: any; // jsonb
  description: string | null;
  updated_by: string | null;
  updated_at: Date;
}

export interface RecommendationExperimentTable {
  id: string;
  name: string;
  description: string | null;
  status: string; // 'active' | 'paused' | 'completed'
  variant_a_config: any; // jsonb
  variant_b_config: any; // jsonb
  traffic_split: number; // 0..100
  created_at: Date;
  updated_at: Date;
}

export interface UserBlockTable {
  id: string;
  blocker_id: string;
  blocked_id: string;
  reason: string | null;
  created_at: Date;
}

export interface RecommendationDatabase {
  user_interest_profiles: UserInterestProfileTable;
  user_behavior_events: UserBehaviorEventTable;
  recommendation_impressions: RecommendationImpressionTable;
  recommendation_feedback: RecommendationFeedbackTable;
  recommendation_rules: RecommendationRuleTable;
  recommendation_experiments: RecommendationExperimentTable;
  user_blocks: UserBlockTable;
}

export const recDb = database as unknown as Kysely<RecommendationDatabase>;

export function generateRecId(): string {
  return crypto.randomUUID();
}

// ─────────────────────────────────────────────
// SELF-HEALING DATABASE INITIALIZATION
// ─────────────────────────────────────────────

let tablesInitialized = false;

export async function ensureRecommendationTables(): Promise<void> {
  if (tablesInitialized) return;

  try {
    // 1. User Interest Profiles
    await sql`
      CREATE TABLE IF NOT EXISTS user_interest_profiles (
        id                    TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
        user_id               TEXT NOT NULL UNIQUE REFERENCES "user"(id) ON DELETE CASCADE,
        interests             JSONB NOT NULL DEFAULT '{}'::jsonb,
        top_specializations   TEXT[],
        top_skills            TEXT[],
        last_active_at        TIMESTAMPTZ DEFAULT now(),
        created_at            TIMESTAMPTZ DEFAULT now(),
        updated_at            TIMESTAMPTZ DEFAULT now()
      );
    `.execute(recDb);
    await sql`CREATE INDEX IF NOT EXISTS idx_uip_user_id ON user_interest_profiles(user_id);`.execute(recDb);

    // 2. User Behavior Events
    await sql`
      CREATE TABLE IF NOT EXISTS user_behavior_events (
        id                    TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
        user_id               TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
        event_type            TEXT NOT NULL,
        target_id             TEXT,
        target_type           TEXT,
        metadata              JSONB,
        created_at            TIMESTAMPTZ DEFAULT now()
      );
    `.execute(recDb);
    await sql`CREATE INDEX IF NOT EXISTS idx_ube_user_type ON user_behavior_events(user_id, event_type);`.execute(recDb);
    await sql`CREATE INDEX IF NOT EXISTS idx_ube_created ON user_behavior_events(created_at DESC);`.execute(recDb);
    await sql`CREATE INDEX IF NOT EXISTS idx_ube_target ON user_behavior_events(target_type, target_id);`.execute(recDb);

    // 3. Recommendation Impressions
    await sql`
      CREATE TABLE IF NOT EXISTS recommendation_impressions (
        id                    TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
        user_id               TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
        candidate_id          TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
        recommendation_type   TEXT NOT NULL,
        source                TEXT NOT NULL DEFAULT 'feed',
        score                 NUMERIC(8, 2) DEFAULT 0,
        reasons               JSONB,
        position              INTEGER DEFAULT 0,
        experiment_id         TEXT,
        variant               TEXT,
        created_at            TIMESTAMPTZ DEFAULT now()
      );
    `.execute(recDb);
    await sql`CREATE INDEX IF NOT EXISTS idx_rec_imp_user ON recommendation_impressions(user_id);`.execute(recDb);
    await sql`CREATE INDEX IF NOT EXISTS idx_rec_imp_candidate ON recommendation_impressions(candidate_id);`.execute(recDb);
    await sql`CREATE INDEX IF NOT EXISTS idx_rec_imp_created ON recommendation_impressions(created_at DESC);`.execute(recDb);
    await sql`CREATE INDEX IF NOT EXISTS idx_rec_imp_type ON recommendation_impressions(recommendation_type);`.execute(recDb);

    // 4. Recommendation Feedback
    await sql`
      CREATE TABLE IF NOT EXISTS recommendation_feedback (
        id                    TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
        user_id               TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
        candidate_id          TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
        feedback_type         TEXT NOT NULL,
        reason                TEXT,
        category              TEXT,
        created_at            TIMESTAMPTZ DEFAULT now()
      );
    `.execute(recDb);
    await sql`CREATE INDEX IF NOT EXISTS idx_rec_fb_user ON recommendation_feedback(user_id);`.execute(recDb);
    await sql`CREATE INDEX IF NOT EXISTS idx_rec_fb_candidate ON recommendation_feedback(candidate_id);`.execute(recDb);
    await sql`CREATE INDEX IF NOT EXISTS idx_rec_fb_type ON recommendation_feedback(user_id, candidate_id, feedback_type);`.execute(recDb);

    // 5. Recommendation Rules & Weights
    await sql`
      CREATE TABLE IF NOT EXISTS recommendation_rules (
        id                    TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
        rule_key              TEXT NOT NULL UNIQUE,
        config_value          JSONB NOT NULL,
        description           TEXT,
        updated_by            TEXT,
        updated_at            TIMESTAMPTZ DEFAULT now()
      );
    `.execute(recDb);
    await sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_rec_rules_key ON recommendation_rules(rule_key);`.execute(recDb);

    // 6. Recommendation Experiments (A/B Testing)
    await sql`
      CREATE TABLE IF NOT EXISTS recommendation_experiments (
        id                    TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
        name                  TEXT NOT NULL UNIQUE,
        description           TEXT,
        status                TEXT NOT NULL DEFAULT 'active',
        variant_a_config      JSONB NOT NULL,
        variant_b_config      JSONB NOT NULL,
        traffic_split         INTEGER NOT NULL DEFAULT 50,
        created_at            TIMESTAMPTZ DEFAULT now(),
        updated_at            TIMESTAMPTZ DEFAULT now()
      );
    `.execute(recDb);

    // 7. User Blocks Table (Safety & Privacy)
    await sql`
      CREATE TABLE IF NOT EXISTS user_blocks (
        id                    TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
        blocker_id            TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
        blocked_id            TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
        reason                TEXT,
        created_at            TIMESTAMPTZ DEFAULT now(),
        CONSTRAINT uq_user_block UNIQUE (blocker_id, blocked_id)
      );
    `.execute(recDb);
    await sql`CREATE INDEX IF NOT EXISTS idx_user_blocks_blocker ON user_blocks(blocker_id);`.execute(recDb);
    await sql`CREATE INDEX IF NOT EXISTS idx_user_blocks_blocked ON user_blocks(blocked_id);`.execute(recDb);

    // 8. Seed Default Config Rules if absent
    try {
      const existingRule = await recDb
        .selectFrom("recommendation_rules")
        .select("id")
        .where("rule_key", "=", "master_config")
        .executeTakeFirst();

      if (!existingRule) {
        await recDb
          .insertInto("recommendation_rules")
          .values({
            id: generateRecId(),
            rule_key: "master_config",
            config_value: JSON.stringify(DEFAULT_RECOMMENDATION_RULE_CONFIG),
            description: "Global production configuration for MGN recommendation engine",
            updated_by: "system",
            updated_at: new Date(),
          })
          .execute();
      }
    } catch (seedErr) {
      console.warn("Seeding recommendation_rules warning:", seedErr);
    }

    tablesInitialized = true;
  } catch (err) {
    console.warn("ensureRecommendationTables warning:", err);
  }
}
