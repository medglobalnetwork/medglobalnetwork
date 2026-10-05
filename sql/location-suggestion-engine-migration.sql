-- ============================================================
-- MGN Location Tracking & Complete Suggestion Engine Migration
-- sql/location-suggestion-engine-migration.sql
-- ============================================================

-- 1. USER LOCATIONS TABLE (Persistent GPS & Area Tracking)
CREATE TABLE IF NOT EXISTS user_locations (
  id                  TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id             TEXT REFERENCES "user"(id) ON DELETE CASCADE,
  session_id          TEXT,
  latitude            DOUBLE PRECISION NOT NULL,
  longitude           DOUBLE PRECISION NOT NULL,
  accuracy_meters     REAL,
  altitude            REAL,
  heading             REAL,
  speed               REAL,
  city                TEXT,
  state               TEXT,
  country             TEXT DEFAULT 'India',
  locality            TEXT,
  postal_code         TEXT,
  formatted_address   TEXT,
  source              TEXT DEFAULT 'gps', -- 'gps' | 'ip' | 'manual' | 'browser'
  is_active           BOOLEAN DEFAULT true,
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_locations_user_id ON user_locations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_locations_session ON user_locations(session_id);
CREATE INDEX IF NOT EXISTS idx_user_locations_coords ON user_locations(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_user_locations_city ON user_locations(city);
CREATE INDEX IF NOT EXISTS idx_user_locations_updated ON user_locations(updated_at DESC);

-- 2. ADD COORDINATES TO PROFESSIONAL PROFILES
ALTER TABLE professional_profiles
  ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS locality TEXT;

CREATE INDEX IF NOT EXISTS idx_professional_profiles_coords ON professional_profiles(latitude, longitude)
  WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- 3. ADD COORDINATES TO EVENTS
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

CREATE INDEX IF NOT EXISTS idx_events_coords ON events(latitude, longitude)
  WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- 4. ADD COORDINATES TO OPPORTUNITIES / JOBS
ALTER TABLE jobs
  ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

CREATE INDEX IF NOT EXISTS idx_jobs_coords ON jobs(latitude, longitude)
  WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- 5. ADD COORDINATES TO ORGANIZATIONS
ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

CREATE INDEX IF NOT EXISTS idx_organizations_coords ON organizations(latitude, longitude)
  WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- 6. ADD COORDINATES TO CAMPS
ALTER TABLE camps
  ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

CREATE INDEX IF NOT EXISTS idx_camps_coords ON camps(latitude, longitude)
  WHERE latitude IS NOT NULL AND longitude IS NOT NULL;


