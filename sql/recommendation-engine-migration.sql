-- ============================================================
-- MGN.life Section 7: Advanced Recommendation Engine Tables
-- File: sql/recommendation-engine-migration.sql
-- ============================================================

-- 7.1 User Dynamic Interest Profiles
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

CREATE INDEX IF NOT EXISTS idx_uip_user_id ON user_interest_profiles(user_id);

-- 7.2 User Behavioral Event Stream
CREATE TABLE IF NOT EXISTS user_behavior_events (
  id                    TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id               TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  event_type            TEXT NOT NULL,
  target_id             TEXT,
  target_type           TEXT,
  metadata              JSONB,
  created_at            TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ube_user_type ON user_behavior_events(user_id, event_type);
CREATE INDEX IF NOT EXISTS idx_ube_created ON user_behavior_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ube_target ON user_behavior_events(target_type, target_id);

-- 7.3 Recommendation Impressions Log
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

CREATE INDEX IF NOT EXISTS idx_rec_imp_user ON recommendation_impressions(user_id);
CREATE INDEX IF NOT EXISTS idx_rec_imp_candidate ON recommendation_impressions(candidate_id);
CREATE INDEX IF NOT EXISTS idx_rec_imp_created ON recommendation_impressions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rec_imp_type ON recommendation_impressions(recommendation_type);

-- 7.4 Recommendation Feedback & Negative Signals
CREATE TABLE IF NOT EXISTS recommendation_feedback (
  id                    TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id               TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  candidate_id          TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  feedback_type         TEXT NOT NULL,
  reason                TEXT,
  category              TEXT,
  created_at            TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rec_fb_user ON recommendation_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_rec_fb_candidate ON recommendation_feedback(candidate_id);
CREATE INDEX IF NOT EXISTS idx_rec_fb_type ON recommendation_feedback(user_id, candidate_id, feedback_type);

-- 7.5 Recommendation Rules & Weights Configuration
CREATE TABLE IF NOT EXISTS recommendation_rules (
  id                    TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  rule_key              TEXT NOT NULL UNIQUE,
  config_value          JSONB NOT NULL,
  description           TEXT,
  updated_by            TEXT,
  updated_at            TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_rec_rules_key ON recommendation_rules(rule_key);

-- 7.6 Recommendation Experiments (A/B Testing Framework)
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

-- 7.7 User Mutual Blocks Table (Safety & Privacy)
CREATE TABLE IF NOT EXISTS user_blocks (
  id                    TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  blocker_id            TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  blocked_id            TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  reason                TEXT,
  created_at            TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT uq_user_block UNIQUE (blocker_id, blocked_id)
);

CREATE INDEX IF NOT EXISTS idx_user_blocks_blocker ON user_blocks(blocker_id);
CREATE INDEX IF NOT EXISTS idx_user_blocks_blocked ON user_blocks(blocked_id);
