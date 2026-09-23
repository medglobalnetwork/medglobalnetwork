-- ============================================================
-- MGN Opportunities & Healthcare Jobs System — Database Migration
-- Tables extend the existing Better Auth user and professional_profiles
-- ============================================================

-- ─────────────────────────────────────────────
-- 1. HEALTHCARE ORGANIZATIONS
-- Hospitals, Clinics, Medical Colleges, Research Institutes, Startups
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS organizations (
  id                    TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name                  TEXT        NOT NULL,
  slug                  TEXT        NOT NULL UNIQUE,
  logo_url              TEXT,
  cover_url             TEXT,
  description           TEXT,
  organization_type     TEXT        NOT NULL DEFAULT 'Hospital',
                                    -- 'Hospital' | 'Clinic' | 'Medical College' | 'University' |
                                    -- 'Research Institute' | 'Diagnostic Center' | 'Pharmaceutical' |
                                    -- 'Medical Device' | 'Healthcare Startup' | 'NGO' | 'Other'
  website               TEXT,
  email                 TEXT,
  phone                 TEXT,
  address               TEXT,
  city                  TEXT,
  state                 TEXT,
  country               TEXT        DEFAULT 'India',
  specialties           TEXT[],     -- ['Cardiology', 'Orthopedics', 'Physiotherapy']
  verification_status   TEXT        NOT NULL DEFAULT 'unverified',
                                    -- 'unverified' | 'pending' | 'verified' | 'suspended'
  created_by            TEXT        REFERENCES "user"(id) ON DELETE SET NULL,
  created_at            TIMESTAMPTZ DEFAULT now(),
  updated_at            TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);
CREATE INDEX IF NOT EXISTS idx_organizations_city ON organizations(city);
CREATE INDEX IF NOT EXISTS idx_organizations_type ON organizations(organization_type);
CREATE INDEX IF NOT EXISTS idx_organizations_verification ON organizations(verification_status);


-- ─────────────────────────────────────────────
-- 2. ORGANIZATION MEMBERS / RECRUITERS
-- Role-based access control for hospital HR & hiring managers
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS organization_members (
  id                    TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  organization_id       TEXT        NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id               TEXT        NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  role                  TEXT        NOT NULL DEFAULT 'recruiter',
                                    -- 'owner' | 'admin' | 'recruiter' | 'hiring_manager' | 'viewer'
  created_at            TIMESTAMPTZ DEFAULT now(),
  updated_at            TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT unique_org_member UNIQUE (organization_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_org_members_org ON organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user ON organization_members(user_id);


-- ─────────────────────────────────────────────
-- 3. JOBS & OPPORTUNITIES
-- Canonical Job/Internship/Fellowship entity
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS jobs (
  id                    TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  organization_id       TEXT        NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  recruiter_id          TEXT        REFERENCES "user"(id) ON DELETE SET NULL,
  title                 TEXT        NOT NULL,
  slug                  TEXT        NOT NULL,
  
  -- Opportunity Classification
  opportunity_type      TEXT        NOT NULL DEFAULT 'job',
                                    -- 'job' | 'internship' | 'clinical_internship' |
                                    -- 'research_internship' | 'observership' | 'fellowship' | 'training'
  employment_type       TEXT        NOT NULL DEFAULT 'full_time',
                                    -- 'full_time' | 'part_time' | 'contract' |
                                    -- 'internship' | 'fellowship' | 'volunteer' | 'temporary'
  work_mode             TEXT        NOT NULL DEFAULT 'onsite',
                                    -- 'onsite' | 'hybrid' | 'remote'
  
  -- Location
  location              TEXT,
  city                  TEXT,
  state                 TEXT,
  country               TEXT        DEFAULT 'India',
  
  -- Compensation
  salary_min            INTEGER,
  salary_max            INTEGER,
  salary_currency       TEXT        DEFAULT 'INR',
  salary_period         TEXT        DEFAULT 'yearly', -- 'monthly' | 'yearly' | 'hourly'
  is_salary_negotiable  BOOLEAN     DEFAULT true,
  is_salary_visible     BOOLEAN     DEFAULT true,
  
  -- Clinical Domain & Experience
  profession            TEXT,          -- 'Physiotherapist' | 'Doctor' | 'Nurse' | etc.
  specialization        TEXT,          -- 'Sports Rehab' | 'Cardiology' | etc.
  experience_min        INTEGER     DEFAULT 0,
  experience_max        INTEGER,
  
  -- Clinical Scope & Description
  skills                TEXT[],
  qualifications        TEXT[],
  description           TEXT        NOT NULL,
  responsibilities      TEXT,
  requirements          TEXT,
  benefits              TEXT[],
  
  -- Custom Screening Questions
  application_questions JSONB,      -- [{"id": "q1", "question": "Are you registered with State Medical Council?", "type": "text", "required": true}]
  
  -- Application Deadline & Status
  application_deadline  TIMESTAMPTZ,
  status                TEXT        NOT NULL DEFAULT 'published',
                                    -- 'draft' | 'pending_review' | 'published' | 'paused' | 'closed' | 'expired'
  
  -- Engagement Metrics
  applicant_count       INTEGER     DEFAULT 0,
  views_count           INTEGER     DEFAULT 0,
  is_featured           BOOLEAN     DEFAULT false,
  is_urgent             BOOLEAN     DEFAULT false,
  
  published_at          TIMESTAMPTZ DEFAULT now(),
  created_at            TIMESTAMPTZ DEFAULT now(),
  updated_at            TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_jobs_organization ON jobs(organization_id);
CREATE INDEX IF NOT EXISTS idx_jobs_recruiter ON jobs(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_profession ON jobs(profession);
CREATE INDEX IF NOT EXISTS idx_jobs_specialization ON jobs(specialization);
CREATE INDEX IF NOT EXISTS idx_jobs_city ON jobs(city);
CREATE INDEX IF NOT EXISTS idx_jobs_opportunity_type ON jobs(opportunity_type);
CREATE INDEX IF NOT EXISTS idx_jobs_employment_type ON jobs(employment_type);
CREATE INDEX IF NOT EXISTS idx_jobs_published_at ON jobs(published_at DESC);


-- ─────────────────────────────────────────────
-- 4. JOB APPLICATIONS
-- Candidate job applications referencing canonical MGN profile
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS job_applications (
  id                    TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  job_id                TEXT        NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  applicant_id          TEXT        NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  
  -- Resume reference
  resume_url            TEXT,
  resume_type           TEXT        DEFAULT 'profile_generated', -- 'uploaded' | 'profile_generated'
  cover_letter          TEXT,
  
  -- Screening answers
  answers               JSONB,      -- {"q1": "Yes, Reg #12345/2021"}
  
  -- Application lifecycle status
  status                TEXT        NOT NULL DEFAULT 'applied',
                                    -- 'applied' | 'under_review' | 'shortlisted' |
                                    -- 'interview' | 'offer' | 'hired' | 'rejected' | 'withdrawn'
  
  -- Interview Details (Optional)
  interview_details     JSONB,      -- {"scheduled_at": "...", "meeting_link": "...", "mode": "video", "notes": "..."}
  
  -- Recruiter Internal Notes
  recruiter_notes       TEXT,
  
  applied_at            TIMESTAMPTZ DEFAULT now(),
  updated_at            TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT unique_job_application UNIQUE (job_id, applicant_id)
);

CREATE INDEX IF NOT EXISTS idx_job_applications_job ON job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_applicant ON job_applications(applicant_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON job_applications(status);
CREATE INDEX IF NOT EXISTS idx_job_applications_applied_at ON job_applications(applied_at DESC);


-- ─────────────────────────────────────────────
-- 5. APPLICATION STATUS AUDIT HISTORY
-- Immutable record of candidate stage changes
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS job_application_status_history (
  id                    TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  application_id        TEXT        NOT NULL REFERENCES job_applications(id) ON DELETE CASCADE,
  from_status           TEXT,
  to_status             TEXT        NOT NULL,
  changed_by            TEXT        REFERENCES "user"(id) ON DELETE SET NULL,
  note                  TEXT,
  created_at            TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_app_history_app ON job_application_status_history(application_id);
CREATE INDEX IF NOT EXISTS idx_app_history_created ON job_application_status_history(created_at DESC);


-- ─────────────────────────────────────────────
-- 6. SAVED JOBS
-- Bookmarked opportunities
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS saved_jobs (
  id                    TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id               TEXT        NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  job_id                TEXT        NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  created_at            TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT unique_saved_job UNIQUE (user_id, job_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_jobs_user ON saved_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_jobs_job ON saved_jobs(job_id);


-- ─────────────────────────────────────────────
-- 7. JOB ALERTS
-- Notification criteria for new matching openings
-- ─────────────────────────────────────────────
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
  frequency             TEXT        DEFAULT 'daily', -- 'instant' | 'daily' | 'weekly'
  is_active             BOOLEAN     DEFAULT true,
  created_at            TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_job_alerts_user ON job_alerts(user_id);


-- ─────────────────────────────────────────────
-- End of Opportunities Migration
-- ─────────────────────────────────────────────

