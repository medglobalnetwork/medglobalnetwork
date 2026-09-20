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
-- SEED DATA: Verified Healthcare Organizations & Initial Clinical Jobs
-- ─────────────────────────────────────────────
INSERT INTO organizations (id, name, slug, logo_url, description, organization_type, city, state, country, specialties, verification_status)
VALUES
  (
    'org-apollo-hospitals',
    'Apollo Multispeciality Hospitals',
    'apollo-hospitals',
    'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=200&q=80',
    'One of Asia’s largest integrated healthcare delivery networks offering tertiary and quaternary care.',
    'Hospital',
    'Raipur',
    'Chhattisgarh',
    'India',
    ARRAY['Cardiology', 'Orthopedics', 'Physiotherapy', 'Critical Care', 'Neurology'],
    'verified'
  ),
  (
    'org-max-healthcare',
    'Max Super Speciality Hospital',
    'max-healthcare',
    'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=200&q=80',
    'Leading provider of comprehensive, seamless and integrated healthcare services.',
    'Hospital',
    'Delhi NCR',
    'Delhi',
    'India',
    ARRAY['Orthopedics', 'Sports Medicine', 'Physiotherapy', 'Oncology'],
    'verified'
  ),
  (
    'org-rehab-physio-clinic',
    'ActiveMotion Physical Rehabilitation Center',
    'activemotion-rehab',
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=200&q=80',
    'Specialized sports physiotherapy, musculoskeletal rehabilitation, and post-operative physical therapy center.',
    'Clinic',
    'Bengaluru',
    'Karnataka',
    'India',
    ARRAY['Physiotherapy', 'Sports Rehabilitation', 'Musculoskeletal', 'Ergonomics'],
    'verified'
  ),
  (
    'org-aiims-research',
    'Advanced Clinical Research Institute',
    'aiims-clinical-research',
    'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=200&q=80',
    'Premier biomedical and clinical research consortium conducting Phase II-IV trials and observational studies.',
    'Research Institute',
    'Raipur',
    'Chhattisgarh',
    'India',
    ARRAY['Clinical Research', 'Pharmacology', 'Cardiology', 'Epidemiology'],
    'verified'
  )
ON CONFLICT (slug) DO NOTHING;

-- Seed Clinical Jobs and Internships
INSERT INTO jobs (
  id, organization_id, title, slug, opportunity_type, employment_type, work_mode, 
  location, city, state, country, salary_min, salary_max, salary_currency, salary_period,
  is_salary_negotiable, is_salary_visible, profession, specialization, experience_min, experience_max,
  skills, qualifications, description, responsibilities, requirements, benefits, status, is_featured, is_urgent
)
VALUES
  (
    'job-sr-sports-physio',
    'org-apollo-hospitals',
    'Senior Sports Physiotherapist (Ortho & ACL Rehab)',
    'senior-sports-physiotherapist-raipur',
    'job',
    'full_time',
    'onsite',
    'Apollo Medical Campus, Sector 4',
    'Raipur',
    'Chhattisgarh',
    'India',
    600000,
    950000,
    'INR',
    'yearly',
    true,
    true,
    'Physiotherapist',
    'Sports Rehabilitation',
    2,
    6,
    ARRAY['ACL Protocol', 'Manual Therapy', 'Dry Needling', 'Kinematic Assessment', 'Taping'],
    ARRAY['BPT / MPT (Orthopedics / Sports)', 'State Council Registration'],
    'We are seeking a skilled and passionate Senior Sports Physiotherapist to lead our outpatient musculoskeletal and post-surgical athletic rehabilitation unit at Apollo Hospitals Raipur.',
    '• Lead assessment and individualized rehabilitation protocols for ACL, rotator cuff, and meniscal repairs.\n• Utilize biomechanical motion analysis and force plates for return-to-sport testing.\n• Collaborate closely with orthopedic surgeons and physical conditioning teams.\n• Document electronic clinical progress notes and patient functional outcome scores.',
    '• MPT in Orthopedics / Sports or BPT with 2+ years of relevant clinical sports rehabilitation experience.\n• Valid state physiotherapy council registration.\n• Hands-on proficiency with manual therapy, athletic strapping, and therapeutic exercise prescription.',
    ARRAY['Comprehensive Health Insurance', 'Continuing Medical Education (CME) Allowance', 'Annual Performance Bonus', 'Subsidized Hospital Cafeteria'],
    'published',
    true,
    true
  ),
  (
    'job-clinical-physio-internship',
    'org-rehab-physio-clinic',
    'Clinical Internship in Musculoskeletal Physical Therapy',
    'clinical-physiotherapy-internship-bengaluru',
    'clinical_internship',
    'internship',
    'onsite',
    'Indiranagar Clinic',
    'Bengaluru',
    'Karnataka',
    'India',
    20000,
    30000,
    'INR',
    'monthly',
    false,
    true,
    'Physiotherapist',
    'Musculoskeletal',
    0,
    1,
    ARRAY['Gait Analysis', 'Exercise Therapy', 'Patient Education', 'Electrotherapy'],
    ARRAY['Final year BPT student or BPT Intern / Graduate'],
    'A 6-month intensive clinical internship under leading orthopedic physiotherapy specialists covering spine care, joint mobilizations, and advanced athletic rehabilitation.',
    '• Shadow senior consultants during complex musculoskeletal consultations.\n• Assist in administering prescribed therapeutic exercise regimens.\n• Maintain modalities and track patient recovery benchmarks.\n• Participate in weekly clinical case rounds and journal clubs.',
    '• Completed or currently enrolled in BPT clinical internship.\n• High dedication to clinical evidence and empathetic patient interaction.\n• Strong foundation in functional human anatomy and kinesiology.',
    ARRAY['Certificate of Clinical Fellowship on completion', 'Monthly Stipend', 'Mentorship by National Sports Faculty', 'Direct placement opportunity'],
    'published',
    true,
    false
  ),
  (
    'job-cardiology-fellow',
    'org-apollo-hospitals',
    'Clinical Fellow in Interventional Cardiology',
    'clinical-fellow-interventional-cardiology',
    'fellowship',
    'fellowship',
    'onsite',
    'Apollo Heart Institute',
    'Raipur',
    'Chhattisgarh',
    'India',
    1200000,
    1800000,
    'INR',
    'yearly',
    true,
    true,
    'Doctor',
    'Cardiology',
    1,
    4,
    ARRAY['Angiography', 'Echocardiography', 'Cath Lab Protocols', 'Critical Care'],
    ARRAY['MD / DNB in General Medicine / DM Cardiology'],
    'Advanced hands-on fellowship program in coronary interventions, primary angioplasties, and structural heart procedures.',
    '• Assist in diagnostic coronary angiograms and complex PCI cases.\n• Manage post-procedure ICU cardiac monitoring.\n• Participate in clinical registry trials and departmental mortality/morbidity meetings.',
    '• MD/DNB in Internal Medicine or DM/DrNB Cardiology.\n• Registered with Medical Council of India / State Medical Council.\n• ACLS / BLS certification.',
    ARRAY['Hospital Housing Accommodation', 'Conference Sponsorship', 'Professional Indemnity Coverage'],
    'published',
    false,
    false
  ),
  (
    'job-clinical-trial-coordinator',
    'org-aiims-research',
    'Clinical Research Coordinator (GCP / Oncology Trials)',
    'clinical-research-coordinator-raipur',
    'job',
    'full_time',
    'hybrid',
    'Clinical Trial Division',
    'Raipur',
    'Chhattisgarh',
    'India',
    450000,
    700000,
    'INR',
    'yearly',
    true,
    true,
    'Researcher',
    'Clinical Research',
    1,
    3,
    ARRAY['ICH-GCP', 'eCRF Entry', 'Patient Screening', 'Protocol Compliance', 'Ethics Submissions'],
    ARRAY['B.Pharm / M.Pharm / MBBS / B.Sc Life Sciences with Clinical Research Diploma'],
    'Manage trial operations, subject recruitment, data entry, and ethics committee compliance for multi-center therapeutic trials.',
    '• Screen potential participants according to inclusion/exclusion criteria.\n• Coordinate with principal investigators and sponsor clinical research associates (CRAs).\n• Maintain Investigator Site Files (ISF) and regulatory binders in compliance with ICH-GCP.\n• Schedule patient follow-up visits and process pharmacokinetic lab samples.',
    '• Relevant degree in pharmacy, medicine, or allied health.\n• Valid Good Clinical Practice (GCP) certification.\n• Prior experience with electronic data capture (EDC) systems (Medidata Rave / RedCap).',
    ARRAY['Hybrid flexibility', 'Health Insurance', 'Research Publication Authorship Credits'],
    'published',
    false,
    false
  )
ON CONFLICT (id) DO NOTHING;
