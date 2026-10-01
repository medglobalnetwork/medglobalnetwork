-- ============================================================
-- MGN Push Notifications (FCM) — Database Migration
-- Run this ONCE in your Supabase SQL editor.
-- Stores per-device FCM registration tokens for native push.
-- ============================================================

CREATE TABLE IF NOT EXISTS push_devices (
  id            TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id       TEXT        NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  token         TEXT        NOT NULL UNIQUE,
  platform      TEXT        NOT NULL DEFAULT 'android',
  app_version   TEXT,
  last_seen_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_push_devices_user   ON push_devices(user_id);
CREATE INDEX IF NOT EXISTS idx_push_devices_seen   ON push_devices(last_seen_at DESC);

-- Optional: per-user notification preferences (all flags default ON)
CREATE TABLE IF NOT EXISTS push_preferences (
  user_id       TEXT        PRIMARY KEY REFERENCES "user"(id) ON DELETE CASCADE,
  pings         BOOLEAN     NOT NULL DEFAULT TRUE,
  announcements BOOLEAN     NOT NULL DEFAULT TRUE,
  calls         BOOLEAN     NOT NULL DEFAULT TRUE,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Optional: per-announcement read tracking (global broadcasts)
CREATE TABLE IF NOT EXISTS announcement_reads (
  user_id         TEXT        NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  announcement_id TEXT        NOT NULL,
  read_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, announcement_id)
);