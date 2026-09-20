-- ============================================================
-- MGN.life Stories System — Migration
-- sql/stories-migration.sql
-- ============================================================

-- 1. Stories Table
CREATE TABLE IF NOT EXISTS stories (
  id VARCHAR(64) PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  media_url TEXT,
  media_type VARCHAR(32) NOT NULL DEFAULT 'text', -- 'image' | 'video' | 'text'
  caption TEXT,
  background_color VARCHAR(32) DEFAULT '#1769c2',
  font_style VARCHAR(32) DEFAULT 'sans',
  visibility VARCHAR(32) NOT NULL DEFAULT 'public', -- 'public' | 'connections'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours')
);

CREATE INDEX IF NOT EXISTS idx_stories_user_id ON stories(user_id);
CREATE INDEX IF NOT EXISTS idx_stories_expires_at ON stories(expires_at);

-- 2. Story Views Table
CREATE TABLE IF NOT EXISTS story_views (
  id VARCHAR(64) PRIMARY KEY,
  story_id VARCHAR(64) NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  viewer_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_story_viewer UNIQUE (story_id, viewer_id)
);

CREATE INDEX IF NOT EXISTS idx_story_views_story_id ON story_views(story_id);
CREATE INDEX IF NOT EXISTS idx_story_views_viewer_id ON story_views(viewer_id);

-- 3. Story Reactions Table
CREATE TABLE IF NOT EXISTS story_reactions (
  id VARCHAR(64) PRIMARY KEY,
  story_id VARCHAR(64) NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  reaction_type VARCHAR(32) NOT NULL DEFAULT 'like',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_story_reaction UNIQUE (story_id, user_id, reaction_type)
);

CREATE INDEX IF NOT EXISTS idx_story_reactions_story_id ON story_reactions(story_id);
