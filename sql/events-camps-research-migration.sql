-- ============================================================
-- MGN.life Phase 6: Events + Camps + Research Ecosystem Migration
-- File: sql/events-camps-research-migration.sql
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. EVENTS SYSTEM
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS events (
  id                        VARCHAR(64) PRIMARY KEY,
  slug                      VARCHAR(255) NOT NULL UNIQUE,
  title                     VARCHAR(255) NOT NULL,
  event_type                VARCHAR(64) NOT NULL DEFAULT 'conference',
  -- 'conference' | 'cme' | 'workshop' | 'webinar' | 'seminar' | 'symposium' |
  -- 'exhibition' | 'networking' | 'training' | 'academic' | 'meetup' | 'career'
  category                  VARCHAR(64) NOT NULL DEFAULT 'General Healthcare',
  short_description         TEXT,
  description               TEXT NOT NULL,
  cover_url                 TEXT,
  
  -- Organizer Identity
  organizer_type            VARCHAR(32) NOT NULL DEFAULT 'individual', -- 'individual' | 'organization'
  organizer_id              TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  organization_id           TEXT REFERENCES organizations(id) ON DELETE SET NULL,
  
  -- Date, Time & Format
  start_time                TIMESTAMPTZ NOT NULL,
  end_time                  TIMESTAMPTZ NOT NULL,
  timezone                  VARCHAR(64) DEFAULT 'Asia/Kolkata',
  format                    VARCHAR(32) NOT NULL DEFAULT 'online', -- 'online' | 'in_person' | 'hybrid'
  
  -- In-person Location
  venue_name                TEXT,
  address                   TEXT,
  city                      TEXT,
  state                     TEXT,
  country                   TEXT DEFAULT 'India',
  
  -- Online Meeting Details
  online_meeting_url        TEXT,
  online_meeting_platform   VARCHAR(64), -- 'Zoom' | 'Google Meet' | 'Microsoft Teams' | 'MGN Live'
  
  -- Ticketing & Capacity
  price                     NUMERIC(10, 2) DEFAULT 0,
  currency                  VARCHAR(8) DEFAULT 'INR',
  is_free                   BOOLEAN DEFAULT true,
  capacity                  INTEGER, -- NULL for unlimited
  registered_count          INTEGER DEFAULT 0,
  
  -- CME & Certificates
  cme_credits               NUMERIC(4, 1) DEFAULT 0,
  cme_accreditation_body    TEXT,
  certificate_enabled       BOOLEAN DEFAULT false,
  certificate_template      TEXT DEFAULT 'standard',
  
  -- Lifecycle Status
  status                    VARCHAR(32) NOT NULL DEFAULT 'draft',
  -- 'draft' | 'pending_review' | 'approved' | 'published' | 'paused' | 'cancelled' | 'completed' | 'archived'
  rejection_reason          TEXT,
  
  -- Tags & Prerequisites
  requirements              TEXT[],
  tags                      TEXT[],
  
  created_at                TIMESTAMPTZ DEFAULT NOW(),
  updated_at                TIMESTAMPTZ DEFAULT NOW(),
  published_at              TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_events_slug ON events(slug);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_start_time ON events(start_time);
CREATE INDEX IF NOT EXISTS idx_events_organizer ON events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_events_org ON events(organization_id);
CREATE INDEX IF NOT EXISTS idx_events_city ON events(city);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);

-- Event Speakers
CREATE TABLE IF NOT EXISTS event_speakers (
  id            VARCHAR(64) PRIMARY KEY,
  event_id      VARCHAR(64) NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id       TEXT REFERENCES "user"(id) ON DELETE SET NULL,
  name          VARCHAR(255) NOT NULL,
  title         VARCHAR(255),
  organization  VARCHAR(255),
  bio           TEXT,
  avatar_url    TEXT,
  topic         VARCHAR(255),
  order_index   INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_event_speakers_event ON event_speakers(event_id);

-- Event Agenda
CREATE TABLE IF NOT EXISTS event_agenda (
  id            VARCHAR(64) PRIMARY KEY,
  event_id      VARCHAR(64) NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  title         VARCHAR(255) NOT NULL,
  description   TEXT,
  speaker_name  VARCHAR(255),
  start_time    TIMESTAMPTZ NOT NULL,
  end_time      TIMESTAMPTZ NOT NULL,
  order_index   INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_event_agenda_event ON event_agenda(event_id);

-- Event Registrations (Shared Registration Model)
CREATE TABLE IF NOT EXISTS event_registrations (
  id            VARCHAR(64) PRIMARY KEY,
  event_id      VARCHAR(64) NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id       TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  status        VARCHAR(32) DEFAULT 'confirmed', -- 'confirmed' | 'cancelled' | 'attended' | 'waitlist'
  ticket_number VARCHAR(64) UNIQUE,
  answers       JSONB,
  attended_at   TIMESTAMPTZ,
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_event_user_reg UNIQUE (event_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_event_reg_event ON event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_reg_user ON event_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_event_reg_status ON event_registrations(status);

-- Event Feedback
CREATE TABLE IF NOT EXISTS event_feedback (
  id            VARCHAR(64) PRIMARY KEY,
  event_id      VARCHAR(64) NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id       TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  rating        INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review        TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_event_user_feedback UNIQUE (event_id, user_id)
);


-- ─────────────────────────────────────────────────────────────
-- 2. CAMPS SYSTEM (Operational Healthcare Campaigns)
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS camps (
  id                            VARCHAR(64) PRIMARY KEY,
  slug                          VARCHAR(255) NOT NULL UNIQUE,
  title                         VARCHAR(255) NOT NULL,
  camp_type                     VARCHAR(64) NOT NULL DEFAULT 'health_screening',
  -- 'health_screening' | 'physiotherapy' | 'rehabilitation' | 'rural_health' |
  -- 'awareness' | 'preventive_health' | 'community_outreach' | 'blood_donation' | 'other'
  description                   TEXT NOT NULL,
  cover_url                     TEXT,
  
  -- Organizer
  organizer_type                VARCHAR(32) NOT NULL DEFAULT 'organization', -- 'individual' | 'organization'
  organizer_id                  TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  organization_id               TEXT REFERENCES organizations(id) ON DELETE SET NULL,
  
  -- Schedule & Location
  start_date                    TIMESTAMPTZ NOT NULL,
  end_date                      TIMESTAMPTZ NOT NULL,
  venue_name                    TEXT NOT NULL,
  address                       TEXT NOT NULL,
  city                          TEXT NOT NULL,
  state                         TEXT NOT NULL,
  country                       TEXT DEFAULT 'India',
  
  -- Scope & Capacity
  target_population             TEXT,
  expected_beneficiaries        INTEGER DEFAULT 0,
  participant_capacity          INTEGER,
  participant_registered_count  INTEGER DEFAULT 0,
  services                      TEXT[], -- ['Free BP check', 'Physiotherapy screening', 'Blood sugar check']
  guidelines                    TEXT,
  certificate_enabled           BOOLEAN DEFAULT true,
  
  -- Status
  status                        VARCHAR(32) NOT NULL DEFAULT 'draft',
  -- 'draft' | 'pending_review' | 'approved' | 'published' | 'active' | 'completed' | 'cancelled' | 'archived'
  rejection_reason              TEXT,
  
  created_at                    TIMESTAMPTZ DEFAULT NOW(),
  updated_at                    TIMESTAMPTZ DEFAULT NOW(),
  published_at                  TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_camps_slug ON camps(slug);
CREATE INDEX IF NOT EXISTS idx_camps_status ON camps(status);
CREATE INDEX IF NOT EXISTS idx_camps_start_date ON camps(start_date);
CREATE INDEX IF NOT EXISTS idx_camps_city ON camps(city);
CREATE INDEX IF NOT EXISTS idx_camps_organizer ON camps(organizer_id);
CREATE INDEX IF NOT EXISTS idx_camps_org ON camps(organization_id);

-- Camp Required Roles & Volunteer Slots
CREATE TABLE IF NOT EXISTS camp_required_roles (
  id              VARCHAR(64) PRIMARY KEY,
  camp_id         VARCHAR(64) NOT NULL REFERENCES camps(id) ON DELETE CASCADE,
  role_title      VARCHAR(128) NOT NULL, -- 'Physiotherapist', 'Doctor', 'Nurse', 'Lab Professional', 'Volunteer'
  is_professional BOOLEAN DEFAULT true,
  profession      VARCHAR(64), -- Must match MGN identity profession for professional roles
  slots_needed    INTEGER NOT NULL DEFAULT 1,
  slots_filled    INTEGER NOT NULL DEFAULT 0,
  description     TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_camp_roles_camp ON camp_required_roles(camp_id);

-- Camp Volunteers Applications & Allocations
CREATE TABLE IF NOT EXISTS camp_volunteers (
  id                    VARCHAR(64) PRIMARY KEY,
  camp_id               VARCHAR(64) NOT NULL REFERENCES camps(id) ON DELETE CASCADE,
  user_id               TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  role_id               VARCHAR(64) NOT NULL REFERENCES camp_required_roles(id) ON DELETE CASCADE,
  status                VARCHAR(32) DEFAULT 'pending', -- 'pending' | 'approved' | 'rejected' | 'attended' | 'cancelled'
  application_note      TEXT,
  reviewed_by           TEXT REFERENCES "user"(id) ON DELETE SET NULL,
  reviewed_at           TIMESTAMPTZ,
  attended              BOOLEAN DEFAULT false,
  attendance_marked_at  TIMESTAMPTZ,
  certificate_issued    BOOLEAN DEFAULT false,
  certificate_id        VARCHAR(64),
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_camp_volunteer UNIQUE (camp_id, user_id, role_id)
);

CREATE INDEX IF NOT EXISTS idx_camp_volunteers_camp ON camp_volunteers(camp_id);
CREATE INDEX IF NOT EXISTS idx_camp_volunteers_user ON camp_volunteers(user_id);
CREATE INDEX IF NOT EXISTS idx_camp_volunteers_status ON camp_volunteers(status);

-- Camp Participant / Patient Registrations
CREATE TABLE IF NOT EXISTS camp_registrations (
  id                  VARCHAR(64) PRIMARY KEY,
  camp_id             VARCHAR(64) NOT NULL REFERENCES camps(id) ON DELETE CASCADE,
  user_id             TEXT REFERENCES "user"(id) ON DELETE SET NULL,
  participant_name    VARCHAR(255) NOT NULL,
  participant_phone   VARCHAR(32),
  participant_age     INTEGER,
  participant_gender  VARCHAR(32),
  registration_number VARCHAR(64) UNIQUE,
  status              VARCHAR(32) DEFAULT 'confirmed', -- 'confirmed' | 'attended' | 'cancelled'
  attended_at         TIMESTAMPTZ,
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_camp_reg_camp ON camp_registrations(camp_id);
CREATE INDEX IF NOT EXISTS idx_camp_reg_user ON camp_registrations(user_id);

-- Post-Camp Outcome & Verification Report
CREATE TABLE IF NOT EXISTS camp_reports (
  id                      VARCHAR(64) PRIMARY KEY,
  camp_id                 VARCHAR(64) NOT NULL REFERENCES camps(id) ON DELETE CASCADE UNIQUE,
  submitted_by            TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  participants_screened   INTEGER NOT NULL DEFAULT 0,
  volunteers_present      INTEGER NOT NULL DEFAULT 0,
  professionals_present   INTEGER NOT NULL DEFAULT 0,
  referrals_made          INTEGER DEFAULT 0,
  services_delivered      TEXT[],
  key_findings_summary    TEXT NOT NULL,
  challenges_and_feedback TEXT,
  photos                  TEXT[],
  documents               TEXT[],
  status                  VARCHAR(32) DEFAULT 'submitted', -- 'submitted' | 'verified' | 'rejected'
  verified_by             TEXT REFERENCES "user"(id) ON DELETE SET NULL,
  verified_at             TIMESTAMPTZ,
  created_at              TIMESTAMPTZ DEFAULT NOW(),
  updated_at              TIMESTAMPTZ DEFAULT NOW()
);


-- ─────────────────────────────────────────────────────────────
-- 3. RESEARCH SYSTEM
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS research_projects (
  id                        VARCHAR(64) PRIMARY KEY,
  slug                      VARCHAR(255) NOT NULL UNIQUE,
  title                     VARCHAR(255) NOT NULL,
  lead_researcher_id        TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  organization_id           TEXT REFERENCES organizations(id) ON DELETE SET NULL,
  research_area             VARCHAR(128) NOT NULL,
  abstract                  TEXT NOT NULL,
  methodology               TEXT,
  research_questions        TEXT[],
  required_skills           TEXT[],
  status                    VARCHAR(32) NOT NULL DEFAULT 'draft',
  -- 'draft' | 'pending_review' | 'active' | 'recruiting' | 'completed' | 'archived' | 'suspended'
  start_date                TIMESTAMPTZ,
  estimated_end_date        TIMESTAMPTZ,
  cover_url                 TEXT,
  ethical_approval_number   VARCHAR(128),
  funding_status            VARCHAR(64) DEFAULT 'unfunded',
  documents                 JSONB,
  collaborators_count       INTEGER DEFAULT 1,
  views_count               INTEGER DEFAULT 0,
  created_at                TIMESTAMPTZ DEFAULT NOW(),
  updated_at                TIMESTAMPTZ DEFAULT NOW(),
  published_at              TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_research_projects_slug ON research_projects(slug);
CREATE INDEX IF NOT EXISTS idx_research_projects_lead ON research_projects(lead_researcher_id);
CREATE INDEX IF NOT EXISTS idx_research_projects_status ON research_projects(status);
CREATE INDEX IF NOT EXISTS idx_research_projects_area ON research_projects(research_area);

-- Research Project Members / Collaborators
CREATE TABLE IF NOT EXISTS research_project_members (
  id                    VARCHAR(64) PRIMARY KEY,
  project_id            VARCHAR(64) NOT NULL REFERENCES research_projects(id) ON DELETE CASCADE,
  user_id               TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  role                  VARCHAR(64) NOT NULL DEFAULT 'collaborator',
  -- 'lead' | 'co_principal_investigator' | 'collaborator' | 'assistant' | 'advisor' | 'data_collector'
  contribution_details  TEXT,
  joined_at             TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_research_project_member UNIQUE (project_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_research_members_project ON research_project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_research_members_user ON research_project_members(user_id);

-- Research Collaboration Requests
CREATE TABLE IF NOT EXISTS research_collaboration_requests (
  id                VARCHAR(64) PRIMARY KEY,
  project_id        VARCHAR(64) NOT NULL REFERENCES research_projects(id) ON DELETE CASCADE,
  sender_id         TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  receiver_id       TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  role_applied      VARCHAR(64),
  proposal_message  TEXT NOT NULL,
  status            VARCHAR(32) DEFAULT 'pending', -- 'pending' | 'accepted' | 'declined' | 'cancelled'
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  responded_at      TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_research_collab_proj ON research_collaboration_requests(project_id);
CREATE INDEX IF NOT EXISTS idx_research_collab_sender ON research_collaboration_requests(sender_id);
CREATE INDEX IF NOT EXISTS idx_research_collab_receiver ON research_collaboration_requests(receiver_id);

-- Research Opportunities (Research Assistant, Student Researcher, Co-Author, Data Collection)
CREATE TABLE IF NOT EXISTS research_opportunities (
  id                      VARCHAR(64) PRIMARY KEY,
  project_id              VARCHAR(64) REFERENCES research_projects(id) ON DELETE CASCADE,
  organization_id         TEXT REFERENCES organizations(id) ON DELETE SET NULL,
  created_by              TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  title                   VARCHAR(255) NOT NULL,
  opportunity_type        VARCHAR(64) NOT NULL DEFAULT 'research_assistant',
  -- 'research_assistant' | 'student_researcher' | 'clinical_research' | 'data_collection' |
  -- 'research_volunteer' | 'statistical_analysis' | 'academic_collaboration' | 'co_author'
  description             TEXT NOT NULL,
  required_qualifications TEXT[],
  required_skills         TEXT[],
  stipend_amount          NUMERIC(10, 2),
  stipend_currency        VARCHAR(8) DEFAULT 'INR',
  is_funded               BOOLEAN DEFAULT false,
  location_type           VARCHAR(32) DEFAULT 'remote', -- 'remote' | 'onsite' | 'hybrid'
  city                    TEXT,
  application_deadline    TIMESTAMPTZ,
  slots_available         INTEGER DEFAULT 1,
  applicant_count         INTEGER DEFAULT 0,
  status                  VARCHAR(32) DEFAULT 'published', -- 'draft' | 'published' | 'closed' | 'archived'
  created_at              TIMESTAMPTZ DEFAULT NOW(),
  updated_at              TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_research_opp_project ON research_opportunities(project_id);
CREATE INDEX IF NOT EXISTS idx_research_opp_creator ON research_opportunities(created_by);
CREATE INDEX IF NOT EXISTS idx_research_opp_status ON research_opportunities(status);
CREATE INDEX IF NOT EXISTS idx_research_opp_type ON research_opportunities(opportunity_type);

-- Research Opportunity Applications
CREATE TABLE IF NOT EXISTS research_opportunity_applications (
  id              VARCHAR(64) PRIMARY KEY,
  opportunity_id  VARCHAR(64) NOT NULL REFERENCES research_opportunities(id) ON DELETE CASCADE,
  applicant_id    TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  cover_letter    TEXT,
  resume_url      TEXT,
  status          VARCHAR(32) DEFAULT 'applied', -- 'applied' | 'under_review' | 'shortlisted' | 'accepted' | 'rejected'
  applied_at      TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at     TIMESTAMPTZ,
  CONSTRAINT uq_research_opp_application UNIQUE (opportunity_id, applicant_id)
);

CREATE INDEX IF NOT EXISTS idx_research_app_opp ON research_opportunity_applications(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_research_app_user ON research_opportunity_applications(applicant_id);

-- Research Publications
CREATE TABLE IF NOT EXISTS research_publications (
  id                    VARCHAR(64) PRIMARY KEY,
  user_id               TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  project_id            VARCHAR(64) REFERENCES research_projects(id) ON DELETE SET NULL,
  title                 VARCHAR(500) NOT NULL,
  authors               TEXT[] NOT NULL,
  journal_or_conference VARCHAR(255) NOT NULL,
  publication_date      DATE,
  doi                   VARCHAR(255),
  abstract              TEXT,
  research_area         VARCHAR(128),
  external_url          TEXT,
  pdf_url               TEXT,
  citation_count        INTEGER DEFAULT 0,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_research_pub_user ON research_publications(user_id);
CREATE INDEX IF NOT EXISTS idx_research_pub_project ON research_publications(project_id);
CREATE INDEX IF NOT EXISTS idx_research_pub_doi ON research_publications(doi);


-- ─────────────────────────────────────────────────────────────
-- 4. CENTRAL CALENDAR & SCHEDULING
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS calendar_events (
  id                      VARCHAR(64) PRIMARY KEY,
  user_id                 TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  source_type             VARCHAR(32) NOT NULL, -- 'event' | 'camp' | 'meeting' | 'interview' | 'research_meeting'
  source_id               VARCHAR(64) NOT NULL,
  title                   VARCHAR(255) NOT NULL,
  description             TEXT,
  start_time              TIMESTAMPTZ NOT NULL,
  end_time                TIMESTAMPTZ NOT NULL,
  timezone                VARCHAR(64) DEFAULT 'Asia/Kolkata',
  location                TEXT,
  meeting_link            TEXT,
  status                  VARCHAR(32) DEFAULT 'confirmed', -- 'confirmed' | 'cancelled' | 'tentative'
  reminder_minutes_before INTEGER DEFAULT 30,
  created_at              TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_user_calendar_entry UNIQUE (user_id, source_type, source_id)
);

CREATE INDEX IF NOT EXISTS idx_calendar_user ON calendar_events(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_time ON calendar_events(user_id, start_time, end_time);


-- ─────────────────────────────────────────────────────────────
-- 5. UNIFIED CERTIFICATES EXTENSION
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS unified_certificates (
  id                  VARCHAR(64) PRIMARY KEY,
  certificate_number  VARCHAR(64) NOT NULL UNIQUE,
  verification_code   VARCHAR(64) NOT NULL UNIQUE,
  user_id             TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  recipient_name      VARCHAR(255) NOT NULL,
  issuer_name         VARCHAR(255) NOT NULL,
  entity_type         VARCHAR(32) NOT NULL, -- 'course' | 'event' | 'camp' | 'research'
  entity_id           VARCHAR(64) NOT NULL,
  title               VARCHAR(255) NOT NULL,
  subtitle            TEXT,
  issued_at           TIMESTAMPTZ DEFAULT NOW(),
  metadata            JSONB,
  status              VARCHAR(32) DEFAULT 'valid', -- 'valid' | 'revoked'
  CONSTRAINT uq_unified_cert UNIQUE (user_id, entity_type, entity_id)
);

CREATE INDEX IF NOT EXISTS idx_unified_cert_user ON unified_certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_unified_cert_code ON unified_certificates(verification_code);
CREATE INDEX IF NOT EXISTS idx_unified_cert_entity ON unified_certificates(entity_type, entity_id);
