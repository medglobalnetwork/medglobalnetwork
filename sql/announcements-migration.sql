-- ============================================================
-- MGN Announcements — Database Migration
-- Run this ONCE in your Supabase SQL editor.
-- Covers admin global broadcasts and scoped camp/event announcements.
-- ============================================================

CREATE TABLE IF NOT EXISTS announcements (
  id          TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  scope       VARCHAR(32) NOT NULL DEFAULT 'global',  -- global | camp | event
  scope_id    VARCHAR(64),                             -- required when scope != global
  created_by  TEXT        NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  title       VARCHAR(255) NOT NULL,
  body        TEXT        NOT NULL,
  priority    VARCHAR(16) NOT NULL DEFAULT 'normal',  -- normal | high | urgent
  expires_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_announcement_scope CHECK (scope IN ('global', 'camp', 'event')),
  CONSTRAINT chk_announcement_priority CHECK (priority IN ('normal', 'high', 'urgent')),
  CONSTRAINT chk_announcement_scope_id CHECK (
    (scope = 'global' AND scope_id IS NULL) OR (scope <> 'global' AND scope_id IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_announcements_scope    ON announcements(scope, scope_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_announcements_created  ON announcements(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_announcements_expires  ON announcements(expires_at);

-- Read receipts. Rows are only written for announcements a user actually opens.
CREATE TABLE IF NOT EXISTS announcement_reads (
  user_id         TEXT        NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  announcement_id TEXT        NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
  read_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, announcement_id)
);