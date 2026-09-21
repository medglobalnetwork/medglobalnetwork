-- ============================================================
-- MGN.life Central Identity, Onboarding & Verification Migration
-- File: sql/onboarding-verification-migration.sql
-- ============================================================

-- 1. CANONICAL MGN IDENTITIES
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
  -- 'DRAFT' | 'ENROLLED' | 'VERIFICATION_INCOMPLETE' | 'READY_FOR_REVIEW' | 'UNDER_REVIEW' | 'CORRECTION_REQUIRED' | 'APPROVED' | 'REJECTED' | 'SUSPENDED'
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

-- 2. PROFESSIONAL TITLE REGISTRY (Claimed vs Verified Prefix/Suffix)
CREATE TABLE IF NOT EXISTS mgn_professional_titles (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  title_type VARCHAR(16) NOT NULL, -- 'PREFIX' | 'SUFFIX'
  claimed_title VARCHAR(32) NOT NULL, -- 'Dr.', 'Prof.', 'PT', 'RN', 'MD', 'PharmD'
  verified_title VARCHAR(32),
  status VARCHAR(32) NOT NULL DEFAULT 'CLAIMED', -- 'CLAIMED' | 'PENDING' | 'VERIFIED' | 'REJECTED'
  document_id VARCHAR(64),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mgn_titles_user ON mgn_professional_titles(user_id);

-- 3. QUALIFICATIONS & DEGREES
CREATE TABLE IF NOT EXISTS mgn_qualifications (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  degree VARCHAR(150) NOT NULL,
  specialization VARCHAR(150),
  institution VARCHAR(200) NOT NULL,
  graduation_year INT,
  status VARCHAR(32) NOT NULL DEFAULT 'CLAIMED', -- 'CLAIMED' | 'PENDING' | 'VERIFIED' | 'REJECTED'
  document_id VARCHAR(64),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mgn_qualifications_user ON mgn_qualifications(user_id);

-- 4. PROFESSIONAL REGISTRATIONS & COUNCIL LICENSES
CREATE TABLE IF NOT EXISTS mgn_registrations (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  council_name VARCHAR(200) NOT NULL,
  registration_number VARCHAR(100) NOT NULL,
  state_or_jurisdiction VARCHAR(100),
  valid_until DATE,
  status VARCHAR(32) NOT NULL DEFAULT 'CLAIMED', -- 'CLAIMED' | 'PENDING' | 'VERIFIED' | 'REJECTED'
  document_id VARCHAR(64),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mgn_registrations_user ON mgn_registrations(user_id);

-- 5. ORGANISATION IDENTITIES
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

-- 6. VERIFICATION DOCUMENTS (Private Storage References)
CREATE TABLE IF NOT EXISTS mgn_verification_documents (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  document_type VARCHAR(64) NOT NULL,
  -- 'GOVT_ID' | 'DEGREE_CERTIFICATE' | 'COUNCIL_REGISTRATION' | 'HOSPITAL_LICENSE' | 'INCORPORATION_CERTIFICATE' | 'TAX_DOCUMENT' | 'EXPERIENCE_LETTER' | 'OTHER'
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size INT NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'PENDING', -- 'PENDING' | 'VERIFIED' | 'REJECTED' | 'CORRECTION_REQUIRED'
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mgn_verif_docs_user ON mgn_verification_documents(user_id);

-- 7. VERIFICATION AUDIT LOGS
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
