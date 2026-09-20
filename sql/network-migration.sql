-- ============================================================
-- MGN Networking System — Database Migration
-- Run this ONCE in your Supabase SQL Editor
-- Tables extend the existing Better Auth `user` table
-- ============================================================

-- ─────────────────────────────────────────────
-- 1. PROFESSIONAL PROFILES
-- Extends the existing user record
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS professional_profiles (
  id                        TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id                   TEXT        NOT NULL UNIQUE REFERENCES "user"(id) ON DELETE CASCADE,
  
  -- Professional identity
  profession                TEXT,          -- Doctor, Nurse, Physiotherapist, etc.
  specialization            TEXT,          -- Cardiology, Sports Medicine, etc.
  sub_specialization        TEXT,
  designation               TEXT,          -- Senior Consultant, Head of Department, etc.
  
  -- Education & registration
  primary_degree            TEXT,          -- MBBS, BPT, B.Sc Nursing, etc.
  additional_degrees        TEXT[],        -- ['MD Cardiology', 'FCPS']
  medical_council           TEXT,          -- MCI, State Medical Council, etc.
  registration_number       TEXT,
  
  -- Location & workplace
  organization              TEXT,          -- Hospital / Clinic / Institute name
  city                      TEXT,
  state                     TEXT,
  country                   TEXT DEFAULT 'India',
  
  -- Experience
  experience_years          INTEGER DEFAULT 0,
  
  -- About
  bio                       TEXT,
  skills                    TEXT[],        -- ['Echocardiography', 'Cardiac Cath', ...]
  languages                 TEXT[],        -- ['English', 'Hindi', 'Tamil']
  
  -- Verification flags
  identity_verified         BOOLEAN DEFAULT false,
  education_verified        BOOLEAN DEFAULT false,
  registration_verified     BOOLEAN DEFAULT false,
  experience_verified       BOOLEAN DEFAULT false,
  
  -- Visibility
  profile_visibility        TEXT DEFAULT 'public', -- 'public' | 'connections' | 'private'
  
  -- Metadata
  cover_image_url           TEXT,
  created_at                TIMESTAMPTZ DEFAULT now(),
  updated_at                TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_professional_profiles_user_id ON professional_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_professional_profiles_profession ON professional_profiles(profession);
CREATE INDEX IF NOT EXISTS idx_professional_profiles_specialization ON professional_profiles(specialization);
CREATE INDEX IF NOT EXISTS idx_professional_profiles_city ON professional_profiles(city);


-- ─────────────────────────────────────────────
-- 2. CONNECTION REQUESTS
-- Pending connection requests between users
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS connection_requests (
  id              TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  sender_id       TEXT        NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  receiver_id     TEXT        NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  message         TEXT,           -- Optional personal note (max 300 chars)
  status          TEXT        NOT NULL DEFAULT 'pending', -- 'pending' | 'accepted' | 'ignored' | 'withdrawn'
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT no_self_request CHECK (sender_id <> receiver_id),
  CONSTRAINT unique_active_request UNIQUE (sender_id, receiver_id)
);

CREATE INDEX IF NOT EXISTS idx_connection_requests_sender ON connection_requests(sender_id);
CREATE INDEX IF NOT EXISTS idx_connection_requests_receiver ON connection_requests(receiver_id);
CREATE INDEX IF NOT EXISTS idx_connection_requests_status ON connection_requests(status);


-- ─────────────────────────────────────────────
-- 3. CONNECTIONS
-- Accepted, active connections between users
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS connections (
  id              TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_a_id       TEXT        NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  user_b_id       TEXT        NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  connected_at    TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT no_self_connection CHECK (user_a_id <> user_b_id),
  CONSTRAINT unique_connection UNIQUE (
    LEAST(user_a_id, user_b_id),
    GREATEST(user_a_id, user_b_id)
  )
);

CREATE INDEX IF NOT EXISTS idx_connections_user_a ON connections(user_a_id);
CREATE INDEX IF NOT EXISTS idx_connections_user_b ON connections(user_b_id);


-- ─────────────────────────────────────────────
-- 4. FOLLOWS
-- Follow relationships (one-directional)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS follows (
  id              TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  follower_id     TEXT        NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  following_id    TEXT        NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT no_self_follow CHECK (follower_id <> following_id),
  CONSTRAINT unique_follow UNIQUE (follower_id, following_id)
);

CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id);


-- ─────────────────────────────────────────────
-- 5. NETWORK POSTS
-- Professional feed posts
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS network_posts (
  id              TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  author_id       TEXT        NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  post_type       TEXT        NOT NULL DEFAULT 'text',
                              -- 'text'|'image'|'video'|'document'|'poll'|
                              -- 'research'|'achievement'|'question'|'job'|'event'
  content         TEXT        NOT NULL,
  media_urls      TEXT[],     -- Image/video/document URLs
  
  -- Poll fields
  poll_options    JSONB,      -- [{"option": "Yes", "votes": 12}, ...]
  poll_ends_at    TIMESTAMPTZ,
  
  -- Post context
  community_id    TEXT,       -- If posted inside a community
  visibility      TEXT DEFAULT 'public', -- 'public' | 'connections' | 'community'
  
  -- Engagement counts (denormalized for speed)
  reaction_count  INTEGER DEFAULT 0,
  comment_count   INTEGER DEFAULT 0,
  share_count     INTEGER DEFAULT 0,
  
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_network_posts_author ON network_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_network_posts_created ON network_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_network_posts_community ON network_posts(community_id);


-- ─────────────────────────────────────────────
-- 6. POST REACTIONS (Likes)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS post_reactions (
  id              TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  post_id         TEXT        NOT NULL REFERENCES network_posts(id) ON DELETE CASCADE,
  user_id         TEXT        NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  reaction_type   TEXT        NOT NULL DEFAULT 'like', -- 'like'|'insightful'|'celebrate'|'support'
  created_at      TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT unique_reaction UNIQUE (post_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_post_reactions_post ON post_reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_post_reactions_user ON post_reactions(user_id);


-- ─────────────────────────────────────────────
-- 7. POST COMMENTS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS post_comments (
  id              TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  post_id         TEXT        NOT NULL REFERENCES network_posts(id) ON DELETE CASCADE,
  author_id       TEXT        NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  parent_id       TEXT        REFERENCES post_comments(id) ON DELETE CASCADE, -- replies
  content         TEXT        NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_post_comments_post ON post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_author ON post_comments(author_id);


-- ─────────────────────────────────────────────
-- 8. COMMUNITIES
-- Healthcare professional communities
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS communities (
  id              TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  slug            TEXT        NOT NULL UNIQUE, -- URL-safe identifier
  name            TEXT        NOT NULL,
  description     TEXT,
  specialty       TEXT,                   -- 'Cardiology', 'Physiotherapy', etc.
  cover_url       TEXT,
  icon_url        TEXT,
  
  -- Community rules & visibility
  visibility      TEXT DEFAULT 'public',  -- 'public' | 'private' | 'invite_only'
  join_mode       TEXT DEFAULT 'open',    -- 'open' | 'approval_required'
  
  -- Creator & admin
  created_by      TEXT        REFERENCES "user"(id) ON DELETE SET NULL,
  
  -- Counts (denormalized)
  member_count    INTEGER DEFAULT 0,
  post_count      INTEGER DEFAULT 0,
  
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_communities_slug ON communities(slug);
CREATE INDEX IF NOT EXISTS idx_communities_specialty ON communities(specialty);


-- ─────────────────────────────────────────────
-- 9. COMMUNITY MEMBERS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS community_members (
  id              TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  community_id    TEXT        NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  user_id         TEXT        NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  role            TEXT        DEFAULT 'member', -- 'admin' | 'moderator' | 'member'
  joined_at       TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT unique_community_member UNIQUE (community_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_community_members_community ON community_members(community_id);
CREATE INDEX IF NOT EXISTS idx_community_members_user ON community_members(user_id);


-- ─────────────────────────────────────────────
-- 10. NETWORK NOTIFICATIONS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS network_notifications (
  id              TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id         TEXT        NOT NULL REFERENCES "user"(id) ON DELETE CASCADE, -- recipient
  actor_id        TEXT        REFERENCES "user"(id) ON DELETE SET NULL,          -- who triggered it
  
  type            TEXT        NOT NULL,
  -- 'connection_request' | 'connection_accepted' | 'new_follower'
  -- 'post_like' | 'post_comment' | 'post_mention' | 'community_invite'
  
  -- Target entity (flexible)
  entity_type     TEXT,       -- 'post' | 'community' | 'connection_request'
  entity_id       TEXT,
  
  message         TEXT,
  is_read         BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_network_notifications_user ON network_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_network_notifications_read ON network_notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_network_notifications_created ON network_notifications(created_at DESC);


-- ─────────────────────────────────────────────
-- SEED: Default healthcare communities
-- ─────────────────────────────────────────────
INSERT INTO communities (id, slug, name, description, specialty, visibility, join_mode, member_count)
VALUES
  (gen_random_uuid()::TEXT, 'physiotherapy-india',      'Physiotherapy India',          'For physiotherapists, physical therapists, and rehab professionals across India.',         'Physiotherapy',      'public', 'open', 0),
  (gen_random_uuid()::TEXT, 'cardiology-network',        'Cardiology Network',           'Clinical cardiology discussions, research, and ECG interpretation.',                       'Cardiology',         'public', 'open', 0),
  (gen_random_uuid()::TEXT, 'medical-students-forum',    'Medical Students Forum',       'For MBBS, BDS, BPT, BSN and allied health students across India.',                        'Medical Students',   'public', 'open', 0),
  (gen_random_uuid()::TEXT, 'clinical-research-hub',     'Clinical Research Hub',        'Multi-center trial collaboration, research methodology, and publication support.',         'Clinical Research',  'public', 'open', 0),
  (gen_random_uuid()::TEXT, 'nursing-excellence',         'Nursing Excellence',           'For nurses, nurse practitioners, and nursing educators.',                                  'Nursing',            'public', 'open', 0),
  (gen_random_uuid()::TEXT, 'sports-medicine-rehab',     'Sports Medicine & Rehab',      'Sports injuries, exercise science, and athletic rehabilitation professionals.',             'Sports Medicine',    'public', 'open', 0),
  (gen_random_uuid()::TEXT, 'radiology-imaging',          'Radiology & Imaging',          'Diagnostic radiology, CT, MRI, and interventional radiology discussions.',                'Radiology',          'public', 'open', 0),
  (gen_random_uuid()::TEXT, 'pediatrics-india',           'Pediatrics India',             'For pediatricians, neonatologists, and child health specialists.',                         'Pediatrics',         'public', 'open', 0)
ON CONFLICT (slug) DO NOTHING;


-- ─────────────────────────────────────────────
-- DONE
-- All 10 networking tables created successfully.
-- ─────────────────────────────────────────────
