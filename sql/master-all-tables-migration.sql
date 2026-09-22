-- ============================================================
-- MGN.LIFE MASTER DATABASE MIGRATION SCRIPT
-- File: sql/master-all-tables-migration.sql
-- 
-- Paste and Run this ONCE in your Supabase SQL Editor.
-- This creates ALL required tables, indexes, constraints, 
-- and seeds for the entire MGN.life platform.
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- EXTENSIONS
-- ─────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ─────────────────────────────────────────────────────────────
-- SECTION 1: PLATFORM ADMIN CONTROL PLANE
-- ─────────────────────────────────────────────────────────────

-- 1.1 Admin Roles & Role Assignments
CREATE TABLE IF NOT EXISTS admin_user_roles (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL, -- 'SUPER_ADMIN', 'ADMIN', 'VERIFICATION_ADMIN', 'CONTENT_ADMIN', 'RECRUITMENT_ADMIN', 'LEARN_ADMIN', 'SUPPORT_ADMIN', 'ANALYTICS_VIEWER'
    granted_by VARCHAR(36),
    granted_by_email VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_admin_user_role UNIQUE (user_id, role)
);

CREATE INDEX IF NOT EXISTS idx_admin_user_roles_user ON admin_user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_user_roles_email ON admin_user_roles(user_email);
CREATE INDEX IF NOT EXISTS idx_admin_user_roles_role ON admin_user_roles(role);

-- 1.2 Immutable Platform Audit Logs
CREATE TABLE IF NOT EXISTS admin_audit_logs (
    id VARCHAR(36) PRIMARY KEY,
    admin_id VARCHAR(36) NOT NULL,
    admin_email VARCHAR(255) NOT NULL,
    admin_role VARCHAR(50) NOT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(36) NOT NULL,
    previous_state JSONB,
    new_state JSONB,
    reason TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_admin_id ON admin_audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON admin_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON admin_audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON admin_audit_logs(created_at DESC);

-- 1.3 Moderation Reports & Content Flagging Queue
CREATE TABLE IF NOT EXISTS admin_moderation_reports (
    id VARCHAR(36) PRIMARY KEY,
    reporter_id VARCHAR(36),
    reporter_email VARCHAR(255),
    target_type VARCHAR(50) NOT NULL,
    target_id VARCHAR(36) NOT NULL,
    target_content_preview TEXT,
    target_author_id VARCHAR(36),
    reason VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(30) DEFAULT 'pending',
    severity VARCHAR(20) DEFAULT 'medium',
    assigned_to VARCHAR(36),
    resolved_by VARCHAR(36),
    resolution_action VARCHAR(50),
    resolution_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_mod_status ON admin_moderation_reports(status);
CREATE INDEX IF NOT EXISTS idx_mod_target ON admin_moderation_reports(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_mod_created_at ON admin_moderation_reports(created_at DESC);

-- 1.4 Global Platform Configuration & Feature Flags
CREATE TABLE IF NOT EXISTS admin_settings (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'general',
    description TEXT,
    updated_by VARCHAR(36),
    updated_by_email VARCHAR(255),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO admin_settings (key, value, category, description)
VALUES 
('maintenance_mode', '{"enabled": false, "allowed_ips": []}', 'general', 'System-wide maintenance mode'),
('user_registration_enabled', '{"enabled": true}', 'general', 'Allow new user registration'),
('doctor_verification_required_for_posting', '{"enabled": false}', 'safety', 'Require verified badge to create public network posts'),
('ai_moderation_enabled', '{"enabled": true, "auto_flag_keywords": true}', 'safety', 'Automated toxicity and keyword filtering'),
('story_creation_enabled', '{"enabled": true, "max_duration_hours": 24}', 'features', 'Enable 24h disappearing stories'),
('lms_public_access', '{"enabled": true}', 'features', 'Allow non-logged-in users to preview course catalogues')
ON CONFLICT (key) DO NOTHING;


-- ─────────────────────────────────────────────────────────────
-- SECTION 2: NETWORKING & CLINICAL SOCIAL GRAPH
-- ─────────────────────────────────────────────────────────────

-- 2.1 Professional Profiles
CREATE TABLE IF NOT EXISTS professional_profiles (
  id                        TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id                   TEXT        NOT NULL UNIQUE REFERENCES "user"(id) ON DELETE CASCADE,
  profession                TEXT,
  specialization            TEXT,
  sub_specialization        TEXT,
  designation               TEXT,
  primary_degree            TEXT,
  additional_degrees        TEXT[],
  medical_council           TEXT,
  registration_number       TEXT,
  organization              TEXT,
  city                      TEXT,
  state                     TEXT,
  country                   TEXT DEFAULT 'India',
  experience_years          INTEGER DEFAULT 0,
  bio                       TEXT,
  skills                    TEXT[],
  languages                 TEXT[],
  identity_verified         BOOLEAN DEFAULT false,
  education_verified        BOOLEAN DEFAULT false,
  registration_verified     BOOLEAN DEFAULT false,
  experience_verified       BOOLEAN DEFAULT false,
  profile_visibility        TEXT DEFAULT 'public',
  cover_image_url           TEXT,
  created_at                TIMESTAMPTZ DEFAULT now(),
  updated_at                TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_professional_profiles_user_id ON professional_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_professional_profiles_profession ON professional_profiles(profession);
CREATE INDEX IF NOT EXISTS idx_professional_profiles_specialization ON professional_profiles(specialization);
CREATE INDEX IF NOT EXISTS idx_professional_profiles_city ON professional_profiles(city);

-- 2.2 Connection Requests
CREATE TABLE IF NOT EXISTS connection_requests (
  id              TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  sender_id       TEXT        NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  receiver_id     TEXT        NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  message         TEXT,
  status          TEXT        NOT NULL DEFAULT 'pending',
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT no_self_request CHECK (sender_id <> receiver_id),
  CONSTRAINT unique_active_request UNIQUE (sender_id, receiver_id)
);

CREATE INDEX IF NOT EXISTS idx_connection_requests_sender ON connection_requests(sender_id);
CREATE INDEX IF NOT EXISTS idx_connection_requests_receiver ON connection_requests(receiver_id);
CREATE INDEX IF NOT EXISTS idx_connection_requests_status ON connection_requests(status);

-- 2.3 Connections (Mutual)
CREATE TABLE IF NOT EXISTS connections (
  id              TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_a_id       TEXT        NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  user_b_id       TEXT        NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  connected_at    TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT no_self_connection CHECK (user_a_id <> user_b_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_connection ON connections (
  LEAST(user_a_id, user_b_id),
  GREATEST(user_a_id, user_b_id)
);

CREATE INDEX IF NOT EXISTS idx_connections_user_a ON connections(user_a_id);
CREATE INDEX IF NOT EXISTS idx_connections_user_b ON connections(user_b_id);

-- 2.4 Follows
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

-- 2.5 Network Posts
CREATE TABLE IF NOT EXISTS network_posts (
  id              TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  author_id       TEXT        NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  post_type       TEXT        NOT NULL DEFAULT 'text',
  content         TEXT        NOT NULL,
  media_urls      TEXT[],
  poll_options    JSONB,
  poll_ends_at    TIMESTAMPTZ,
  community_id    TEXT,
  visibility      TEXT DEFAULT 'public',
  reaction_count  INTEGER DEFAULT 0,
  comment_count   INTEGER DEFAULT 0,
  share_count     INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_network_posts_author ON network_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_network_posts_created ON network_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_network_posts_community ON network_posts(community_id);

-- 2.6 Post Reactions
CREATE TABLE IF NOT EXISTS post_reactions (
  id              TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  post_id         TEXT        NOT NULL REFERENCES network_posts(id) ON DELETE CASCADE,
  user_id         TEXT        NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  reaction_type   TEXT        NOT NULL DEFAULT 'like',
  created_at      TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_reaction UNIQUE (post_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_post_reactions_post ON post_reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_post_reactions_user ON post_reactions(user_id);

-- 2.7 Post Comments
CREATE TABLE IF NOT EXISTS post_comments (
  id              TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  post_id         TEXT        NOT NULL REFERENCES network_posts(id) ON DELETE CASCADE,
  author_id       TEXT        NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  parent_id       TEXT        REFERENCES post_comments(id) ON DELETE CASCADE,
  content         TEXT        NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_post_comments_post ON post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_author ON post_comments(author_id);

-- 2.8 Communities
CREATE TABLE IF NOT EXISTS communities (
  id              TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  slug            TEXT        NOT NULL UNIQUE,
  name            TEXT        NOT NULL,
  description     TEXT,
  specialty       TEXT,
  cover_url       TEXT,
  icon_url        TEXT,
  visibility      TEXT DEFAULT 'public',
  join_mode       TEXT DEFAULT 'open',
  created_by      TEXT        REFERENCES "user"(id) ON DELETE SET NULL,
  member_count    INTEGER DEFAULT 0,
  post_count      INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_communities_slug ON communities(slug);
CREATE INDEX IF NOT EXISTS idx_communities_specialty ON communities(specialty);

-- 2.9 Community Members
CREATE TABLE IF NOT EXISTS community_members (
  id              TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  community_id    TEXT        NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  user_id         TEXT        NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  role            TEXT        DEFAULT 'member',
  joined_at       TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_community_member UNIQUE (community_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_community_members_community ON community_members(community_id);
CREATE INDEX IF NOT EXISTS idx_community_members_user ON community_members(user_id);

-- 2.10 Network Notifications
CREATE TABLE IF NOT EXISTS network_notifications (
  id              TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id         TEXT        NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  actor_id        TEXT        REFERENCES "user"(id) ON DELETE SET NULL,
  type            TEXT        NOT NULL,
  entity_type     TEXT,
  entity_id       TEXT,
  message         TEXT,
  is_read         BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_network_notifications_user ON network_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_network_notifications_read ON network_notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_network_notifications_created ON network_notifications(created_at DESC);

-- Seed Default Communities
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


-- ─────────────────────────────────────────────────────────────
-- SECTION 3: LEARN & LMS ACADEMY SYSTEM
-- ─────────────────────────────────────────────────────────────

-- 3.1 Courses
CREATE TABLE IF NOT EXISTS courses (
  id VARCHAR(64) PRIMARY KEY,
  instructor_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  organization_id TEXT,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  short_description TEXT,
  description TEXT,
  thumbnail TEXT,
  category VARCHAR(64) NOT NULL,
  subcategory VARCHAR(64),
  profession VARCHAR(64),
  specialization VARCHAR(64),
  level VARCHAR(32) DEFAULT 'all_levels',
  language VARCHAR(32) DEFAULT 'English',
  duration_minutes INTEGER DEFAULT 0,
  price NUMERIC(10, 2) DEFAULT 0,
  currency VARCHAR(8) DEFAULT 'INR',
  is_free BOOLEAN DEFAULT true,
  certificate_enabled BOOLEAN DEFAULT true,
  status VARCHAR(32) DEFAULT 'published',
  enrollment_count INTEGER DEFAULT 0,
  rating_avg NUMERIC(3, 2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_courses_instructor_id ON courses(instructor_id);
CREATE INDEX IF NOT EXISTS idx_courses_profession ON courses(profession);
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category);
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);
CREATE INDEX IF NOT EXISTS idx_courses_slug ON courses(slug);

-- 3.2 Course Modules
CREATE TABLE IF NOT EXISTS course_modules (
  id VARCHAR(64) PRIMARY KEY,
  course_id VARCHAR(64) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_course_modules_course_id ON course_modules(course_id);

-- 3.3 Course Lessons
CREATE TABLE IF NOT EXISTS course_lessons (
  id VARCHAR(64) PRIMARY KEY,
  module_id VARCHAR(64) NOT NULL REFERENCES course_modules(id) ON DELETE CASCADE,
  course_id VARCHAR(64) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  lesson_type VARCHAR(32) NOT NULL DEFAULT 'video',
  content TEXT,
  media_url TEXT,
  duration_seconds INTEGER DEFAULT 0,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_preview BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_course_lessons_module_id ON course_lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_course_lessons_course_id ON course_lessons(course_id);

-- 3.4 Course Resources
CREATE TABLE IF NOT EXISTS course_resources (
  id VARCHAR(64) PRIMARY KEY,
  lesson_id VARCHAR(64) REFERENCES course_lessons(id) ON DELETE CASCADE,
  course_id VARCHAR(64) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_type VARCHAR(32),
  file_size_bytes INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_course_resources_lesson_id ON course_resources(lesson_id);
CREATE INDEX IF NOT EXISTS idx_course_resources_course_id ON course_resources(course_id);

-- 3.5 Course Enrollments
CREATE TABLE IF NOT EXISTS course_enrollments (
  id VARCHAR(64) PRIMARY KEY,
  course_id VARCHAR(64) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  status VARCHAR(32) DEFAULT 'active',
  progress_percentage INTEGER DEFAULT 0,
  last_lesson_id VARCHAR(64),
  last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_course_user_enrollment UNIQUE (course_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_course_enrollments_user_id ON course_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_course_id ON course_enrollments(course_id);

-- 3.6 Lesson Progress
CREATE TABLE IF NOT EXISTS lesson_progress (
  id VARCHAR(64) PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  lesson_id VARCHAR(64) NOT NULL REFERENCES course_lessons(id) ON DELETE CASCADE,
  course_id VARCHAR(64) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  progress_percentage INTEGER DEFAULT 0,
  last_position_seconds INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_user_lesson_progress UNIQUE (user_id, lesson_id)
);

CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_id ON lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_lesson_id ON lesson_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_course_id ON lesson_progress(course_id);

-- 3.7 Quizzes & Questions
CREATE TABLE IF NOT EXISTS quizzes (
  id VARCHAR(64) PRIMARY KEY,
  lesson_id VARCHAR(64) REFERENCES course_lessons(id) ON DELETE CASCADE,
  course_id VARCHAR(64) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  passing_score INTEGER DEFAULT 70,
  time_limit_minutes INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  status VARCHAR(32) DEFAULT 'published',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quiz_questions (
  id VARCHAR(64) PRIMARY KEY,
  quiz_id VARCHAR(64) NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  question_type VARCHAR(32) DEFAULT 'single',
  explanation TEXT,
  order_index INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS quiz_options (
  id VARCHAR(64) PRIMARY KEY,
  question_id VARCHAR(64) NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT false,
  order_index INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS quiz_attempts (
  id VARCHAR(64) PRIMARY KEY,
  quiz_id VARCHAR(64) NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  percentage NUMERIC(5, 2) NOT NULL,
  passed BOOLEAN NOT NULL,
  total_questions INTEGER NOT NULL,
  correct_answers INTEGER NOT NULL,
  incorrect_answers INTEGER NOT NULL,
  attempt_number INTEGER NOT NULL,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.8 Certificates
CREATE TABLE IF NOT EXISTS certificates (
  id VARCHAR(64) PRIMARY KEY,
  certificate_number VARCHAR(64) NOT NULL UNIQUE,
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  course_id VARCHAR(64) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  completion_date TIMESTAMPTZ DEFAULT NOW(),
  verification_code VARCHAR(64) NOT NULL UNIQUE,
  metadata JSONB,
  status VARCHAR(32) DEFAULT 'valid',
  CONSTRAINT uq_user_course_certificate UNIQUE (user_id, course_id)
);

CREATE INDEX IF NOT EXISTS idx_certificates_user_id ON certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_course_id ON certificates(course_id);
CREATE INDEX IF NOT EXISTS idx_certificates_verification_code ON certificates(verification_code);


-- ─────────────────────────────────────────────────────────────
-- SECTION 4: OPPORTUNITIES & RECRUITMENT SYSTEM
-- ─────────────────────────────────────────────────────────────

-- 4.1 Healthcare Organizations
CREATE TABLE IF NOT EXISTS organizations (
  id                    TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name                  TEXT        NOT NULL,
  slug                  TEXT        NOT NULL UNIQUE,
  logo_url              TEXT,
  cover_url             TEXT,
  description           TEXT,
  organization_type     TEXT        NOT NULL DEFAULT 'Hospital',
  website               TEXT,
  email                 TEXT,
  phone                 TEXT,
  address               TEXT,
  city                  TEXT,
  state                 TEXT,
  country               TEXT        DEFAULT 'India',
  specialties           TEXT[],
  verification_status   TEXT        NOT NULL DEFAULT 'unverified',
  created_by            TEXT        REFERENCES "user"(id) ON DELETE SET NULL,
  created_at            TIMESTAMPTZ DEFAULT now(),
  updated_at            TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);
CREATE INDEX IF NOT EXISTS idx_organizations_city ON organizations(city);
CREATE INDEX IF NOT EXISTS idx_organizations_type ON organizations(organization_type);

-- 4.2 Organization Members
CREATE TABLE IF NOT EXISTS organization_members (
  id                    TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  organization_id       TEXT        NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id               TEXT        NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  role                  TEXT        NOT NULL DEFAULT 'recruiter',
  created_at            TIMESTAMPTZ DEFAULT now(),
  updated_at            TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_org_member UNIQUE (organization_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_org_members_org ON organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user ON organization_members(user_id);

-- 4.3 Jobs & Openings
CREATE TABLE IF NOT EXISTS jobs (
  id                    TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  organization_id       TEXT        NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  recruiter_id          TEXT        REFERENCES "user"(id) ON DELETE SET NULL,
  title                 TEXT        NOT NULL,
  slug                  TEXT        NOT NULL,
  opportunity_type      TEXT        NOT NULL DEFAULT 'job',
  employment_type       TEXT        NOT NULL DEFAULT 'full_time',
  work_mode             TEXT        NOT NULL DEFAULT 'onsite',
  location              TEXT,
  city                  TEXT,
  state                 TEXT,
  country               TEXT        DEFAULT 'India',
  salary_min            INTEGER,
  salary_max            INTEGER,
  salary_currency       TEXT        DEFAULT 'INR',
  salary_period         TEXT        DEFAULT 'yearly',
  is_salary_negotiable  BOOLEAN     DEFAULT true,
  is_salary_visible     BOOLEAN     DEFAULT true,
  profession            TEXT,
  specialization        TEXT,
  experience_min        INTEGER     DEFAULT 0,
  experience_max        INTEGER,
  skills                TEXT[],
  qualifications        TEXT[],
  description           TEXT        NOT NULL,
  responsibilities      TEXT,
  requirements          TEXT,
  benefits              TEXT[],
  application_questions JSONB,
  application_deadline  TIMESTAMPTZ,
  status                TEXT        NOT NULL DEFAULT 'published',
  applicant_count       INTEGER     DEFAULT 0,
  views_count           INTEGER     DEFAULT 0,
  is_featured           BOOLEAN     DEFAULT false,
  is_urgent             BOOLEAN     DEFAULT false,
  published_at          TIMESTAMPTZ DEFAULT now(),
  created_at            TIMESTAMPTZ DEFAULT now(),
  updated_at            TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_jobs_organization ON jobs(organization_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_profession ON jobs(profession);

-- 4.4 Job Applications & History
CREATE TABLE IF NOT EXISTS job_applications (
  id                    TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  job_id                TEXT        NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  applicant_id          TEXT        NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  resume_url            TEXT,
  resume_type           TEXT        DEFAULT 'profile_generated',
  cover_letter          TEXT,
  answers               JSONB,
  status                TEXT        NOT NULL DEFAULT 'applied',
  interview_details     JSONB,
  recruiter_notes       TEXT,
  applied_at            TIMESTAMPTZ DEFAULT now(),
  updated_at            TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_job_application UNIQUE (job_id, applicant_id)
);

CREATE TABLE IF NOT EXISTS job_application_status_history (
  id                    TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  application_id        TEXT        NOT NULL REFERENCES job_applications(id) ON DELETE CASCADE,
  from_status           TEXT,
  to_status             TEXT        NOT NULL,
  changed_by            TEXT        REFERENCES "user"(id) ON DELETE SET NULL,
  note                  TEXT,
  created_at            TIMESTAMPTZ DEFAULT now()
);

-- 4.5 Saved Jobs & Alerts
CREATE TABLE IF NOT EXISTS saved_jobs (
  id                    TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id               TEXT        NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  job_id                TEXT        NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  created_at            TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_saved_job UNIQUE (user_id, job_id)
);

CREATE TABLE IF NOT EXISTS job_alerts (
  id                    TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id               TEXT        NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  title                 TEXT,
  keywords              TEXT,
  profession            TEXT,
  specialization        TEXT,
  location              TEXT,
  work_mode             TEXT,
  employment_type       TEXT,
  frequency             TEXT        DEFAULT 'daily',
  is_active             BOOLEAN     DEFAULT true,
  created_at            TIMESTAMPTZ DEFAULT now()
);


-- ─────────────────────────────────────────────────────────────
-- SECTION 5: CLINICAL STORIES & 24H UPDATES
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS stories (
  id VARCHAR(64) PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  media_url TEXT,
  media_type VARCHAR(32) NOT NULL DEFAULT 'text',
  caption TEXT,
  background_color VARCHAR(32) DEFAULT '#1769c2',
  font_style VARCHAR(32) DEFAULT 'sans',
  visibility VARCHAR(32) NOT NULL DEFAULT 'public',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours')
);

CREATE INDEX IF NOT EXISTS idx_stories_user_id ON stories(user_id);
CREATE INDEX IF NOT EXISTS idx_stories_expires_at ON stories(expires_at);

CREATE TABLE IF NOT EXISTS story_views (
  id VARCHAR(64) PRIMARY KEY,
  story_id VARCHAR(64) NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  viewer_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_story_viewer UNIQUE (story_id, viewer_id)
);

CREATE TABLE IF NOT EXISTS story_reactions (
  id VARCHAR(64) PRIMARY KEY,
  story_id VARCHAR(64) NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  reaction_type VARCHAR(32) NOT NULL DEFAULT 'like',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_story_reaction UNIQUE (story_id, user_id, reaction_type)
);


-- ─────────────────────────────────────────────────────────────
-- SECTION 6: CENTRAL ONBOARDING & VERIFICATION ENGINE
-- ─────────────────────────────────────────────────────────────

-- 6.1 Canonical MGN Identities
CREATE TABLE IF NOT EXISTS mgn_identities (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL UNIQUE,
  account_type VARCHAR(32) NOT NULL, -- 'INDIVIDUAL' | 'ORGANISATION'
  category VARCHAR(64) NOT NULL,
  profession_or_type VARCHAR(64) NOT NULL,
  legal_first_name VARCHAR(100),
  legal_middle_name VARCHAR(100),
  legal_last_name VARCHAR(100),
  display_name VARCHAR(200),
  dob DATE,
  gender VARCHAR(32),
  country VARCHAR(100),
  state VARCHAR(100),
  city VARCHAR(100),
  address TEXT,
  phone VARCHAR(32),
  official_email VARCHAR(200),
  website VARCHAR(255),
  profile_photo_url TEXT,
  experience_years INT DEFAULT 0,
  current_organization VARCHAR(200),
  specialization VARCHAR(150),
  sub_specialization VARCHAR(150),
  verification_status VARCHAR(32) NOT NULL DEFAULT 'DRAFT',
  verification_deadline TIMESTAMP WITH TIME ZONE,
  enrolled_at TIMESTAMP WITH TIME ZONE,
  submitted_at TIMESTAMP WITH TIME ZONE,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by VARCHAR(64),
  correction_reason TEXT,
  correction_fields JSONB,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mgn_identities_user ON mgn_identities(user_id);
CREATE INDEX IF NOT EXISTS idx_mgn_identities_status ON mgn_identities(verification_status);
CREATE INDEX IF NOT EXISTS idx_mgn_identities_deadline ON mgn_identities(verification_deadline);

-- 6.2 Professional Title Registry
CREATE TABLE IF NOT EXISTS mgn_professional_titles (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  title_type VARCHAR(16) NOT NULL,
  claimed_title VARCHAR(32) NOT NULL,
  verified_title VARCHAR(32),
  status VARCHAR(32) NOT NULL DEFAULT 'CLAIMED',
  document_id VARCHAR(64),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mgn_titles_user ON mgn_professional_titles(user_id);

-- 6.3 Qualifications & Degrees
CREATE TABLE IF NOT EXISTS mgn_qualifications (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  degree VARCHAR(150) NOT NULL,
  specialization VARCHAR(150),
  institution VARCHAR(200) NOT NULL,
  graduation_year INT,
  status VARCHAR(32) NOT NULL DEFAULT 'CLAIMED',
  document_id VARCHAR(64),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mgn_qualifications_user ON mgn_qualifications(user_id);

-- 6.4 Professional Registrations & Council Licenses
CREATE TABLE IF NOT EXISTS mgn_registrations (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  council_name VARCHAR(200) NOT NULL,
  registration_number VARCHAR(100) NOT NULL,
  state_or_jurisdiction VARCHAR(100),
  valid_until DATE,
  status VARCHAR(32) NOT NULL DEFAULT 'CLAIMED',
  document_id VARCHAR(64),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mgn_registrations_user ON mgn_registrations(user_id);

-- 6.5 Organisation Identities
CREATE TABLE IF NOT EXISTS mgn_organisation_identities (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL UNIQUE,
  legal_name VARCHAR(200) NOT NULL,
  display_name VARCHAR(200),
  org_type VARCHAR(64) NOT NULL,
  registration_number VARCHAR(100),
  tax_id VARCHAR(100),
  year_established INT,
  accreditations TEXT[],
  auth_rep_name VARCHAR(150),
  auth_rep_designation VARCHAR(150),
  auth_rep_email VARCHAR(200),
  auth_rep_phone VARCHAR(32),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mgn_org_identities_user ON mgn_organisation_identities(user_id);

-- 6.6 Verification Documents (Private Storage References)
CREATE TABLE IF NOT EXISTS mgn_verification_documents (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  document_type VARCHAR(64) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size INT NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mgn_verif_docs_user ON mgn_verification_documents(user_id);

-- 6.7 Verification Audit Logs
CREATE TABLE IF NOT EXISTS mgn_verification_audit_logs (
  id VARCHAR(64) PRIMARY KEY,
  target_user_id VARCHAR(64) NOT NULL,
  actor_id VARCHAR(64) NOT NULL,
  action VARCHAR(100) NOT NULL,
  reason TEXT,
  previous_state VARCHAR(50),
  new_state VARCHAR(50),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mgn_verif_audit_target ON mgn_verification_audit_logs(target_user_id);
CREATE INDEX IF NOT EXISTS idx_mgn_verif_audit_actor ON mgn_verification_audit_logs(actor_id);
