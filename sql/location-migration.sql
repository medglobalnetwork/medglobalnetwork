-- ============================================================
-- MGN Location Features — Database Migration
-- Run this ONCE in your Supabase SQL editor.
--
-- Three features live here:
--   1. Nearby discovery  — camps gain coordinates + a check-in radius.
--   2. Live location share — a short-lived, per-conversation pin.
--   3. Geofence check-in — proof-of-presence log for camp attendance.
--
-- Coordinates are plain DOUBLE PRECISION rather than PostGIS geography:
-- discovery only ever needs "nearby" over a small data set, and this
-- avoids requiring the PostGIS extension.
-- ============================================================

-- ── 1. Camps gain a location ───────────────────────────────
ALTER TABLE camps
  ADD COLUMN IF NOT EXISTS latitude  DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

-- How far a volunteer may be from the venue and still count as present.
ALTER TABLE camps
  ADD COLUMN IF NOT EXISTS checkin_radius_meters INTEGER NOT NULL DEFAULT 500;

CREATE INDEX IF NOT EXISTS idx_camps_coords ON camps(latitude, longitude)
  WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- ── 2. Live location share ─────────────────────────────────
-- One row per share session. The row is deleted when the sharer stops
-- or the TTL passes, so this table never grows unbounded.
CREATE TABLE IF NOT EXISTS location_shares (
  id                VARCHAR(64)  PRIMARY KEY,
  user_id           TEXT         NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  conversation_id   VARCHAR(64),
  latitude          DOUBLE PRECISION NOT NULL,
  longitude         DOUBLE PRECISION NOT NULL,
  accuracy_meters   REAL,
  label             TEXT,
  sharing_with      TEXT[]       NOT NULL DEFAULT '{}',
  created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  expires_at        TIMESTAMPTZ  NOT NULL
);

-- "Which live shares are visible to me" — matches either the sharer
-- (direct share) or a conversation I am a member of.
CREATE INDEX IF NOT EXISTS idx_location_shares_user ON location_shares(user_id);
CREATE INDEX IF NOT EXISTS idx_location_shares_live ON location_shares(expires_at DESC);

-- ── 3. Geofence check-in ───────────────────────────────────
-- Audit trail for camp presence. Written for every attempt, whether it
-- passed or failed the radius check, so attendance disputes can be reviewed.
CREATE TABLE IF NOT EXISTS camp_checkins (
  id               VARCHAR(64) PRIMARY KEY,
  camp_id          VARCHAR(64) NOT NULL REFERENCES camps(id) ON DELETE CASCADE,
  user_id          TEXT        NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  latitude         DOUBLE PRECISION NOT NULL,
  longitude        DOUBLE PRECISION NOT NULL,
  accuracy_meters  REAL,
  distance_meters  INTEGER,
  radius_meters    INTEGER,
  within_radius    BOOLEAN     NOT NULL DEFAULT false,
  method           VARCHAR(16) NOT NULL DEFAULT 'gps', -- gps | manual
  checked_in_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_camp_checkins_camp ON camp_checkins(camp_id, checked_in_at DESC);
CREATE INDEX IF NOT EXISTS idx_camp_checkins_user ON camp_checkins(user_id, checked_in_at DESC);

-- ============================================================
-- Backfill coordinates for existing camps.
--
-- Coordinates are NOT guessable from the city name, so these stay NULL
-- until an organizer adds them (the camp edit form now exposes the two
-- fields). Camps without coordinates simply do not appear in "nearby".
-- ============================================================

-- Prune expired shares. Call it from a scheduled job (pg_cron or an
-- external ping); DELETE FROM location_shares WHERE expires_at < NOW();