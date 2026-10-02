// ============================================================
// MGN Organisation Database Schema & Repositories
// modules/organizations/lib/org-db.ts
// ============================================================

import { database } from "@/lib/auth";
import { sql } from "kysely";
import crypto from "crypto";

const db = database as any;
let isInitialized = false;

export function generateOrgId(): string {
  return crypto.randomUUID();
}

export async function ensureOrgTables(): Promise<void> {
  if (isInitialized) return;
  try {
    // 1. Core organizations table
    await sql`
      CREATE TABLE IF NOT EXISTS organizations (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        logo_url TEXT,
        cover_url TEXT,
        description TEXT,
        about TEXT,
        organization_type VARCHAR(100) NOT NULL DEFAULT 'Hospital',
        website VARCHAR(255),
        email VARCHAR(255),
        phone VARCHAR(50),
        address TEXT,
        city VARCHAR(100),
        state VARCHAR(100),
        country VARCHAR(100) DEFAULT 'India',
        postal_code VARCHAR(20),
        specialties TEXT[],
        verification_status VARCHAR(50) NOT NULL DEFAULT 'unverified',
        license_number VARCHAR(100),
        accreditations TEXT[],
        gst_number VARCHAR(50),
        authorized_rep_name VARCHAR(150),
        authorized_rep_designation VARCHAR(150),
        official_domain VARCHAR(150),
        created_by VARCHAR(64),
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `.execute(db);

    // 2. Organization Members
    await sql`
      CREATE TABLE IF NOT EXISTS organization_members (
        id VARCHAR(64) PRIMARY KEY,
        organization_id VARCHAR(64) NOT NULL,
        user_id VARCHAR(64) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'HR_RECRUITER',
        custom_role_id VARCHAR(64),
        department VARCHAR(100),
        designation VARCHAR(150),
        status VARCHAR(30) NOT NULL DEFAULT 'active',
        invited_by VARCHAR(64),
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT uq_org_member UNIQUE (organization_id, user_id)
      );
      CREATE INDEX IF NOT EXISTS idx_org_members_org ON organization_members(organization_id);
      CREATE INDEX IF NOT EXISTS idx_org_members_user ON organization_members(user_id);
    `.execute(db);

    // 3. Organization Custom Roles
    await sql`
      CREATE TABLE IF NOT EXISTS organization_roles (
        id VARCHAR(64) PRIMARY KEY,
        organization_id VARCHAR(64) NOT NULL,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        permissions TEXT[] NOT NULL DEFAULT '{}',
        created_by VARCHAR(64),
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_org_roles_org ON organization_roles(organization_id);
    `.execute(db);

    // 4. Organization Departments
    await sql`
      CREATE TABLE IF NOT EXISTS organization_departments (
        id VARCHAR(64) PRIMARY KEY,
        organization_id VARCHAR(64) NOT NULL,
        name VARCHAR(100) NOT NULL,
        code VARCHAR(20),
        head_user_id VARCHAR(64),
        description TEXT,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_org_dept_org ON organization_departments(organization_id);
    `.execute(db);

    // 5. Organization Invitations
    await sql`
      CREATE TABLE IF NOT EXISTS organization_invitations (
        id VARCHAR(64) PRIMARY KEY,
        organization_id VARCHAR(64) NOT NULL,
        email VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'HR_RECRUITER',
        custom_role_id VARCHAR(64),
        department VARCHAR(100),
        invited_by VARCHAR(64) NOT NULL,
        status VARCHAR(30) NOT NULL DEFAULT 'pending',
        token VARCHAR(128) NOT NULL UNIQUE,
        expires_at TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_org_invites_org ON organization_invitations(organization_id);
      CREATE INDEX IF NOT EXISTS idx_org_invites_email ON organization_invitations(email);
    `.execute(db);

    // 6. Organization Audit Logs
    await sql`
      CREATE TABLE IF NOT EXISTS organization_audit_logs (
        id VARCHAR(64) PRIMARY KEY,
        organization_id VARCHAR(64) NOT NULL,
        user_id VARCHAR(64) NOT NULL,
        user_name VARCHAR(150) NOT NULL,
        user_email VARCHAR(255) NOT NULL,
        action VARCHAR(100) NOT NULL,
        entity_type VARCHAR(50) NOT NULL,
        entity_id VARCHAR(64) NOT NULL,
        details JSONB DEFAULT '{}',
        ip_address VARCHAR(45),
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_org_audit_org ON organization_audit_logs(organization_id);
    `.execute(db);

    // 7. Organization Subscriptions & Entitlements
    await sql`
      CREATE TABLE IF NOT EXISTS organization_subscriptions (
        id VARCHAR(64) PRIMARY KEY,
        organization_id VARCHAR(64) NOT NULL UNIQUE,
        plan VARCHAR(50) NOT NULL DEFAULT 'Basic',
        status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
        billing_cycle VARCHAR(20) NOT NULL DEFAULT 'monthly',
        current_period_start TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        current_period_end TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP + INTERVAL '30 days',
        grace_period_end TIMESTAMPTZ,
        auto_renew BOOLEAN DEFAULT TRUE,
        price_amount NUMERIC(10, 2) DEFAULT 0,
        currency VARCHAR(10) DEFAULT 'INR',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `.execute(db);

    // 8. Organization Invoices
    await sql`
      CREATE TABLE IF NOT EXISTS organization_invoices (
        id VARCHAR(64) PRIMARY KEY,
        organization_id VARCHAR(64) NOT NULL,
        subscription_id VARCHAR(64) NOT NULL,
        invoice_number VARCHAR(100) NOT NULL UNIQUE,
        amount NUMERIC(10, 2) NOT NULL,
        currency VARCHAR(10) DEFAULT 'INR',
        status VARCHAR(30) NOT NULL DEFAULT 'paid',
        plan_name VARCHAR(50) NOT NULL,
        billing_period VARCHAR(100) NOT NULL,
        payment_method VARCHAR(50) DEFAULT 'Credit Card / UPI',
        paid_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_org_invoices_org ON organization_invoices(organization_id);
    `.execute(db);

    // 9. Organization Groups
    await sql`
      CREATE TABLE IF NOT EXISTS organization_groups (
        id VARCHAR(64) PRIMARY KEY,
        organization_id VARCHAR(64) NOT NULL,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL,
        description TEXT,
        cover_url TEXT,
        category VARCHAR(100) NOT NULL DEFAULT 'Department',
        group_type VARCHAR(50) NOT NULL DEFAULT 'org_only',
        created_by VARCHAR(64) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_org_groups_org ON organization_groups(organization_id);
    `.execute(db);

    // 10. Organization Conferences
    await sql`
      CREATE TABLE IF NOT EXISTS organization_conferences (
        id VARCHAR(64) PRIMARY KEY,
        organization_id VARCHAR(64) NOT NULL,
        event_id VARCHAR(64),
        title VARCHAR(255) NOT NULL,
        theme TEXT,
        start_date TIMESTAMPTZ NOT NULL,
        end_date TIMESTAMPTZ NOT NULL,
        venue_type VARCHAR(30) NOT NULL DEFAULT 'online',
        venue_name TEXT,
        address TEXT,
        tracks JSONB DEFAULT '[]',
        sessions JSONB DEFAULT '[]',
        speakers JSONB DEFAULT '[]',
        sponsors JSONB DEFAULT '[]',
        abstract_submission_open BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_org_conf_org ON organization_conferences(organization_id);
    `.execute(db);

    // 11. Camp Volunteers Table
    await sql`
      CREATE TABLE IF NOT EXISTS organization_camp_volunteers (
        id VARCHAR(64) PRIMARY KEY,
        camp_id VARCHAR(64) NOT NULL,
        organization_id VARCHAR(64) NOT NULL,
        user_id VARCHAR(64) NOT NULL,
        assigned_role VARCHAR(100) NOT NULL,
        status VARCHAR(30) NOT NULL DEFAULT 'applied',
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_camp_vol_org ON organization_camp_volunteers(organization_id);
      CREATE INDEX IF NOT EXISTS idx_camp_vol_camp ON organization_camp_volunteers(camp_id);
    `.execute(db);

    // 12. College Students Table
    await sql`
      CREATE TABLE IF NOT EXISTS organization_students (
        id VARCHAR(64) PRIMARY KEY,
        organization_id VARCHAR(64) NOT NULL,
        user_id VARCHAR(64),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(50),
        program VARCHAR(100) NOT NULL,
        year INT DEFAULT 1,
        semester INT DEFAULT 1,
        department VARCHAR(100),
        enrollment_number VARCHAR(100) NOT NULL,
        batch VARCHAR(50),
        status VARCHAR(30) NOT NULL DEFAULT 'active',
        academic_standing VARCHAR(50) DEFAULT 'good',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT uq_org_enrollment UNIQUE (organization_id, enrollment_number)
      );
      CREATE INDEX IF NOT EXISTS idx_org_students_org ON organization_students(organization_id);
      CREATE INDEX IF NOT EXISTS idx_org_students_program ON organization_students(program);
    `.execute(db);

    // 13. College Academic Programs
    await sql`
      CREATE TABLE IF NOT EXISTS organization_academic_programs (
        id VARCHAR(64) PRIMARY KEY,
        organization_id VARCHAR(64) NOT NULL,
        name VARCHAR(255) NOT NULL,
        code VARCHAR(50) NOT NULL,
        degree_level VARCHAR(50) NOT NULL DEFAULT 'Undergraduate',
        duration_years NUMERIC(3, 1) NOT NULL DEFAULT 4.0,
        department VARCHAR(100),
        description TEXT,
        curriculum JSONB DEFAULT '[]',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT uq_org_program_code UNIQUE (organization_id, code)
      );
      CREATE INDEX IF NOT EXISTS idx_org_prog_org ON organization_academic_programs(organization_id);
    `.execute(db);

    // 14. College Assessments & Exams
    await sql`
      CREATE TABLE IF NOT EXISTS organization_assessments (
        id VARCHAR(64) PRIMARY KEY,
        organization_id VARCHAR(64) NOT NULL,
        department VARCHAR(100),
        program_id VARCHAR(64),
        course_id VARCHAR(64),
        title VARCHAR(255) NOT NULL,
        assessment_type VARCHAR(50) NOT NULL DEFAULT 'mcq',
        total_marks NUMERIC(6, 2) NOT NULL DEFAULT 100,
        pass_percentage NUMERIC(5, 2) NOT NULL DEFAULT 50,
        duration_minutes INT DEFAULT 60,
        due_date TIMESTAMPTZ,
        status VARCHAR(30) NOT NULL DEFAULT 'draft',
        question_bank JSONB DEFAULT '[]',
        scope VARCHAR(50) DEFAULT 'department',
        created_by VARCHAR(64) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_org_assess_org ON organization_assessments(organization_id);
    `.execute(db);

    // 15. College Assessment Submissions
    await sql`
      CREATE TABLE IF NOT EXISTS organization_assessment_submissions (
        id VARCHAR(64) PRIMARY KEY,
        assessment_id VARCHAR(64) NOT NULL,
        organization_id VARCHAR(64) NOT NULL,
        student_id VARCHAR(64) NOT NULL,
        student_name VARCHAR(255) NOT NULL,
        student_enrollment VARCHAR(100),
        submitted_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        score NUMERIC(6, 2),
        max_score NUMERIC(6, 2) NOT NULL DEFAULT 100,
        status VARCHAR(30) DEFAULT 'submitted',
        feedback TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_org_subm_assess ON organization_assessment_submissions(assessment_id);
      CREATE INDEX IF NOT EXISTS idx_org_subm_org ON organization_assessment_submissions(organization_id);
    `.execute(db);

    // 16. College Placements
    await sql`
      CREATE TABLE IF NOT EXISTS organization_placements (
        id VARCHAR(64) PRIMARY KEY,
        organization_id VARCHAR(64) NOT NULL,
        company_name VARCHAR(255) NOT NULL,
        job_title VARCHAR(255) NOT NULL,
        job_type VARCHAR(50) NOT NULL DEFAULT 'full_time',
        eligible_programs TEXT[] DEFAULT '{}',
        min_cgpa NUMERIC(4, 2),
        package_ctc VARCHAR(100),
        location VARCHAR(150),
        deadline TIMESTAMPTZ,
        status VARCHAR(30) NOT NULL DEFAULT 'active',
        description TEXT,
        applications_count INT DEFAULT 0,
        offers_count INT DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_org_place_org ON organization_placements(organization_id);
    `.execute(db);

    // 17. College Placement Applications
    await sql`
      CREATE TABLE IF NOT EXISTS organization_placement_applications (
        id VARCHAR(64) PRIMARY KEY,
        placement_id VARCHAR(64) NOT NULL,
        organization_id VARCHAR(64) NOT NULL,
        student_id VARCHAR(64) NOT NULL,
        student_name VARCHAR(255) NOT NULL,
        student_program VARCHAR(100) NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'applied',
        interview_date TIMESTAMPTZ,
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_org_papp_place ON organization_placement_applications(placement_id);
      CREATE INDEX IF NOT EXISTS idx_org_papp_org ON organization_placement_applications(organization_id);
    `.execute(db);

    // 18. Hospital Internal SOP & Clinical Trainings
    await sql`
      CREATE TABLE IF NOT EXISTS organization_internal_trainings (
        id VARCHAR(64) PRIMARY KEY,
        organization_id VARCHAR(64) NOT NULL,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL DEFAULT 'Clinical Skills',
        department VARCHAR(100),
        access_scope VARCHAR(50) NOT NULL DEFAULT 'org_only',
        content_type VARCHAR(50) NOT NULL DEFAULT 'video',
        duration_hours NUMERIC(4, 1) DEFAULT 2.0,
        has_certificate BOOLEAN DEFAULT TRUE,
        description TEXT,
        mandatory BOOLEAN DEFAULT FALSE,
        created_by VARCHAR(64) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_org_train_org ON organization_internal_trainings(organization_id);
    `.execute(db);

    // 19. Targeted Announcements
    await sql`
      CREATE TABLE IF NOT EXISTS organization_announcements (
        id VARCHAR(64) PRIMARY KEY,
        organization_id VARCHAR(64) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        target_audience VARCHAR(50) NOT NULL DEFAULT 'all',
        target_department VARCHAR(100),
        target_program VARCHAR(100),
        attachment_url TEXT,
        publish_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        expiry_date TIMESTAMPTZ,
        pinned BOOLEAN DEFAULT FALSE,
        created_by VARCHAR(64) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_org_ann_org ON organization_announcements(organization_id);
    `.execute(db);

    isInitialized = true;
  } catch (err) {
    console.error("ensureOrgTables error:", err);
  }
}
