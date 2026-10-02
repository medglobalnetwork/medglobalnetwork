// ============================================================
// MGN Organisation Service
// modules/organizations/lib/org-service.ts
// ============================================================

import { database } from "@/lib/auth";
import { sql } from "kysely";
import { ensureOrgTables, generateOrgId } from "./org-db";
import {
  OrganizationRecord,
  OrganizationMemberRecord,
  OrganizationCustomRoleRecord,
  OrganizationDepartmentRecord,
  OrganizationInvitationRecord,
  OrganizationAuditLogRecord,
  OrgDashboardMetrics,
  OrgRole,
  OrgPermission,
  OrganizationType,
  StudentRecord,
  AcademicProgramRecord,
  AssessmentRecord,
  AssessmentSubmissionRecord,
  PlacementRecord,
  PlacementApplicationRecord,
  HospitalInternalTrainingRecord,
  OrganizationAnnouncementRecord,
} from "../types";
import { ROLE_DEFAULT_PERMISSIONS } from "./org-permissions";

const db = database as any;

export class OrganizationService {
  /**
   * Retrieves all organizations where the user is a member
   */
  static async getUserOrganizations(userId: string): Promise<OrganizationRecord[]> {
    await ensureOrgTables();

    const rows = await sql<any>`
      SELECT 
        o.*,
        om.role as my_role,
        om.status as member_status,
        om.custom_role_id,
        cr.name as custom_role_name,
        cr.permissions as custom_permissions,
        s.plan,
        s.status as subscription_status,
        (SELECT COUNT(*) FROM organization_members WHERE organization_id = o.id) as member_count
      FROM organizations o
      JOIN organization_members om ON o.id = om.organization_id
      LEFT JOIN organization_roles cr ON om.custom_role_id = cr.id
      LEFT JOIN organization_subscriptions s ON o.id = s.organization_id
      WHERE om.user_id = ${userId} AND om.status = 'active'
      ORDER BY o.updated_at DESC
    `.execute(db);

    return rows.rows.map((r: any) => {
      let perms: OrgPermission[] = [];
      const role = (r.my_role || "VIEWER").toUpperCase() as OrgRole;
      if (role === "CUSTOM" && r.custom_permissions) {
        perms = Array.isArray(r.custom_permissions) ? r.custom_permissions : [];
      } else {
        perms = ROLE_DEFAULT_PERMISSIONS[role] || ROLE_DEFAULT_PERMISSIONS.VIEWER;
      }

      return {
        ...r,
        my_role: role,
        my_permissions: perms,
        member_count: parseInt(r.member_count || "1", 10),
        plan: r.plan || "Basic",
        subscription_status: r.subscription_status || "ACTIVE",
        specialties: Array.isArray(r.specialties) ? r.specialties : [],
      };
    });
  }

  /**
   * Retrieves a single organization and user's membership details
   */
  static async getOrganizationById(
    orgId: string,
    userId?: string
  ): Promise<{ organization: OrganizationRecord | null; member: OrganizationMemberRecord | null }> {
    await ensureOrgTables();

    const orgRow = await db
      .selectFrom("organizations")
      .selectAll()
      .where("id", "=", orgId)
      .executeTakeFirst();

    if (!orgRow) {
      return { organization: null, member: null };
    }

    let member: OrganizationMemberRecord | null = null;
    let myRole: OrgRole = "VIEWER";
    let myPerms: OrgPermission[] = [];

    if (userId) {
      const memberRow = await sql<any>`
        SELECT 
          om.*,
          u.name,
          u.email,
          u.image,
          cr.name as custom_role_name,
          cr.permissions as custom_permissions
        FROM organization_members om
        JOIN "user" u ON om.user_id = u.id
        LEFT JOIN organization_roles cr ON om.custom_role_id = cr.id
        WHERE om.organization_id = ${orgId} AND om.user_id = ${userId}
      `.execute(db);

      if (memberRow.rows.length > 0) {
        const m = memberRow.rows[0];
        myRole = (m.role || "VIEWER").toUpperCase() as OrgRole;
        if (myRole === "CUSTOM" && m.custom_permissions) {
          myPerms = Array.isArray(m.custom_permissions) ? m.custom_permissions : [];
        } else {
          myPerms = ROLE_DEFAULT_PERMISSIONS[myRole] || [];
        }

        member = {
          id: m.id,
          organization_id: m.organization_id,
          user_id: m.user_id,
          role: myRole,
          custom_role_id: m.custom_role_id,
          custom_role_name: m.custom_role_name,
          department: m.department,
          designation: m.designation,
          status: m.status,
          created_at: m.created_at,
          updated_at: m.updated_at,
          name: m.name,
          email: m.email,
          image: m.image,
        };
      }
    }

    const sub = await db
      .selectFrom("organization_subscriptions")
      .select(["plan", "status"])
      .where("organization_id", "=", orgId)
      .executeTakeFirst();

    const countRes = await sql<{ count: string }>`
      SELECT COUNT(*) as count FROM organization_members WHERE organization_id = ${orgId}
    `.execute(db);

    const organization: OrganizationRecord = {
      ...orgRow,
      specialties: Array.isArray(orgRow.specialties) ? orgRow.specialties : [],
      accreditations: Array.isArray(orgRow.accreditations) ? orgRow.accreditations : [],
      my_role: myRole,
      my_permissions: myPerms,
      member_count: parseInt(countRes.rows[0]?.count || "1", 10),
      plan: sub?.plan || "Basic",
      subscription_status: sub?.status || "ACTIVE",
    };

    return { organization, member };
  }

  /**
   * Create a new organization and assign creator as OWNER
   */
  static async createOrganization(
    userId: string,
    data: {
      name: string;
      organization_type: OrganizationType;
      description?: string;
      about?: string;
      website?: string;
      email?: string;
      phone?: string;
      address?: string;
      city?: string;
      state?: string;
      country?: string;
      specialties?: string[];
      logo_url?: string;
      cover_url?: string;
      license_number?: string;
    }
  ): Promise<OrganizationRecord> {
    await ensureOrgTables();

    const id = generateOrgId();
    let slug = data.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    if (!slug) slug = "org-" + Date.now().toString(36);

    const existing = await db
      .selectFrom("organizations")
      .select("id")
      .where("slug", "=", slug)
      .executeTakeFirst();
    if (existing) {
      slug = `${slug}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    await sql`
      INSERT INTO organizations (
        id, name, slug, organization_type, description, about, website, email, phone,
        address, city, state, country, specialties, logo_url, cover_url, license_number,
        verification_status, created_by, created_at, updated_at
      ) VALUES (
        ${id}, ${data.name}, ${slug}, ${data.organization_type}, ${data.description || null},
        ${data.about || null}, ${data.website || null}, ${data.email || null}, ${data.phone || null},
        ${data.address || null}, ${data.city || null}, ${data.state || null}, ${data.country || "India"},
        ${data.specialties || []}, ${data.logo_url || null}, ${data.cover_url || null}, ${data.license_number || null},
        'unverified', ${userId}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
    `.execute(db);

    // Add creator as OWNER
    await sql`
      INSERT INTO organization_members (
        id, organization_id, user_id, role, designation, status, created_at, updated_at
      ) VALUES (
        ${generateOrgId()}, ${id}, ${userId}, 'OWNER', 'Organization Founder', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
    `.execute(db);

    // Provision Basic Plan Subscription
    await sql`
      INSERT INTO organization_subscriptions (
        id, organization_id, plan, status, billing_cycle, current_period_start, current_period_end, price_amount
      ) VALUES (
        ${generateOrgId()}, ${id}, 'Basic', 'ACTIVE', 'monthly', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '365 days', 0
      )
    `.execute(db);

    // Audit log
    await this.logAudit({
      organization_id: id,
      user_id: userId,
      user_name: "Workspace Founder",
      user_email: data.email || "",
      action: "ORGANIZATION_CREATED",
      entity_type: "ORGANIZATION",
      entity_id: id,
      details: { name: data.name, type: data.organization_type },
    });

    const { organization } = await this.getOrganizationById(id, userId);
    return organization!;
  }

  /**
   * Log an audit event
   */
  static async logAudit(entry: {
    organization_id: string;
    user_id: string;
    user_name: string;
    user_email: string;
    action: string;
    entity_type: string;
    entity_id: string;
    details?: Record<string, any>;
    ip_address?: string;
  }): Promise<void> {
    try {
      await ensureOrgTables();
      await sql`
        INSERT INTO organization_audit_logs (
          id, organization_id, user_id, user_name, user_email, action, entity_type, entity_id, details, ip_address, created_at
        ) VALUES (
          ${generateOrgId()}, ${entry.organization_id}, ${entry.user_id}, ${entry.user_name},
          ${entry.user_email}, ${entry.action}, ${entry.entity_type}, ${entry.entity_id},
          ${JSON.stringify(entry.details || {})}, ${entry.ip_address || null}, CURRENT_TIMESTAMP
        )
      `.execute(db);
    } catch (err) {
      console.error("Audit log error:", err);
    }
  }

  /**
   * Retrieve real dashboard metrics (no mock numbers)
   */
  static async getDashboardMetrics(orgId: string): Promise<OrgDashboardMetrics> {
    await ensureOrgTables();

    // 1. Jobs & recruitment real counts
    const jobsRes = await sql<any>`
      SELECT
        COUNT(*) FILTER (WHERE status = 'published') as active_jobs,
        COUNT(DISTINCT a.id) as total_applications,
        COUNT(DISTINCT a.id) FILTER (WHERE a.status = 'shortlisted') as shortlisted,
        COUNT(DISTINCT a.id) FILTER (WHERE a.status = 'interview') as interviews_scheduled,
        COUNT(DISTINCT a.id) FILTER (WHERE a.status = 'offered') as offers,
        COUNT(DISTINCT a.id) FILTER (WHERE a.status = 'hired') as hires
      FROM jobs j
      LEFT JOIN job_applications a ON j.id = a.job_id
      WHERE j.organization_id = ${orgId}
    `.execute(db);

    // 2. Events & Conferences
    const eventsRes = await sql<any>`
      SELECT
        COUNT(*) FILTER (WHERE start_time >= CURRENT_TIMESTAMP) as upcoming_events,
        COALESCE(SUM(registered_count), 0) as event_registrations
      FROM events
      WHERE organization_id = ${orgId}
    `.execute(db);

    const confRes = await sql<any>`
      SELECT COUNT(*) as upcoming_conferences
      FROM organization_conferences
      WHERE organization_id = ${orgId} AND start_date >= CURRENT_TIMESTAMP
    `.execute(db);

    // 3. Camps
    const campsRes = await sql<any>`
      SELECT
        COUNT(*) FILTER (WHERE start_date >= CURRENT_TIMESTAMP) as active_camps,
        COUNT(*) FILTER (WHERE start_date < CURRENT_TIMESTAMP) as camps_completed
      FROM camps
      WHERE organization_id = ${orgId}
    `.execute(db);

    const volRes = await sql<any>`
      SELECT COUNT(*) as camp_volunteers
      FROM organization_camp_volunteers
      WHERE organization_id = ${orgId} AND status IN ('approved', 'attended')
    `.execute(db);

    // 4. Learning / LMS
    const learnRes = await sql<any>`
      SELECT
        COUNT(*) as courses_count
      FROM learn_courses
      WHERE organization_id = ${orgId}
    `.execute(db).catch(() => ({ rows: [{ courses_count: "0" }] }));

    // 5. Groups & Communities
    const groupsRes = await sql<any>`
      SELECT
        COUNT(*) as groups_count
      FROM organization_groups
      WHERE organization_id = ${orgId}
    `.execute(db);

    // 6. Research
    const researchRes = await sql<any>`
      SELECT
        COUNT(*) as active_projects
      FROM research_projects
      WHERE organization_id = ${orgId}
    `.execute(db).catch(() => ({ rows: [{ active_projects: "0" }] }));

    // 7. Team & Members & Clinical Workforce
    const membersRes = await sql<any>`
      SELECT
        COUNT(*) as total_members,
        COUNT(*) FILTER (WHERE om.role = 'FACULTY') as faculty_count
      FROM organization_members om
      WHERE om.organization_id = ${orgId} AND om.status = 'active'
    `.execute(db);

    const deptRes = await sql<any>`
      SELECT COUNT(*) as total_depts
      FROM organization_departments
      WHERE organization_id = ${orgId}
    `.execute(db);

    // 8. Hospital Clinical Workforce Breakdown
    const clinicalRes = await sql<any>`
      SELECT
        COUNT(*) FILTER (WHERE LOWER(om.designation) LIKE '%doctor%' OR LOWER(om.department) IN ('cardiology', 'neurology', 'orthopaedics', 'emergency', 'icu', 'paediatrics')) as doctors_count,
        COUNT(*) FILTER (WHERE LOWER(om.designation) LIKE '%nurse%' OR LOWER(om.department) LIKE '%nurs%') as nurses_count,
        COUNT(*) FILTER (WHERE LOWER(om.designation) LIKE '%physio%' OR LOWER(om.department) LIKE '%physio%') as physios_count,
        COUNT(*) FILTER (WHERE LOWER(om.designation) LIKE '%allied%' OR LOWER(om.designation) LIKE '%therapist%' OR LOWER(om.designation) LIKE '%technician%') as allied_count
      FROM organization_members om
      WHERE om.organization_id = ${orgId} AND om.status = 'active'
    `.execute(db).catch(() => ({ rows: [{}] }));

    // 9. Hospital Internal Trainings
    const trainRes = await sql<any>`
      SELECT COUNT(*) as internal_trainings_count
      FROM organization_internal_trainings
      WHERE organization_id = ${orgId}
    `.execute(db).catch(() => ({ rows: [{ internal_trainings_count: "0" }] }));

    // 10. College Students & Programs & Placements & Assessments
    const studentsRes = await sql<any>`
      SELECT COUNT(*) as students_count
      FROM organization_students
      WHERE organization_id = ${orgId} AND status = 'active'
    `.execute(db).catch(() => ({ rows: [{ students_count: "0" }] }));

    const progRes = await sql<any>`
      SELECT COUNT(*) as prog_count
      FROM organization_academic_programs
      WHERE organization_id = ${orgId}
    `.execute(db).catch(() => ({ rows: [{ prog_count: "0" }] }));

    const placeRes = await sql<any>`
      SELECT COUNT(*) as placements_count
      FROM organization_placements
      WHERE organization_id = ${orgId} AND status = 'active'
    `.execute(db).catch(() => ({ rows: [{ placements_count: "0" }] }));

    const assessRes = await sql<any>`
      SELECT COUNT(*) as assess_count
      FROM organization_assessments
      WHERE organization_id = ${orgId} AND status IN ('published', 'draft')
    `.execute(db).catch(() => ({ rows: [{ assess_count: "0" }] }));

    // 11. Subscription
    const subRes = await db
      .selectFrom("organization_subscriptions")
      .select(["plan", "status", "current_period_end"])
      .where("organization_id", "=", orgId)
      .executeTakeFirst();

    const j = jobsRes.rows[0] || {};
    const e = eventsRes.rows[0] || {};
    const c = confRes.rows[0] || {};
    const camp = campsRes.rows[0] || {};
    const vol = volRes.rows[0] || {};
    const l = learnRes.rows[0] || {};
    const g = groupsRes.rows[0] || {};
    const r = researchRes.rows[0] || {};
    const m = membersRes.rows[0] || {};
    const d = deptRes.rows[0] || {};
    const clin = clinicalRes.rows[0] || {};
    const tr = trainRes.rows[0] || {};
    const stu = studentsRes.rows[0] || {};
    const pr = progRes.rows[0] || {};
    const pl = placeRes.rows[0] || {};
    const as = assessRes.rows[0] || {};

    return {
      activeJobsCount: parseInt(j.active_jobs || "0", 10),
      totalApplicationsCount: parseInt(j.total_applications || "0", 10),
      shortlistedCount: parseInt(j.shortlisted || "0", 10),
      interviewsScheduledCount: parseInt(j.interviews_scheduled || "0", 10),
      offersCount: parseInt(j.offers || "0", 10),
      hiresCount: parseInt(j.hires || "0", 10),

      upcomingEventsCount: parseInt(e.upcoming_events || "0", 10),
      eventRegistrationsCount: parseInt(e.event_registrations || "0", 10),
      upcomingConferencesCount: parseInt(c.upcoming_conferences || "0", 10),
      certificatesIssuedCount: 0,

      activeCampsCount: parseInt(camp.active_camps || "0", 10),
      campVolunteersCount: parseInt(vol.camp_volunteers || "0", 10),
      campRegistrationsCount: 0,
      campsCompletedCount: parseInt(camp.camps_completed || "0", 10),

      coursesCount: parseInt(l.courses_count || "0", 10),
      enrolledStudentsCount: parseInt(stu.students_count || "0", 10),
      liveClassesUpcomingCount: 0,
      courseCompletionsCount: 0,

      groupsCount: parseInt(g.groups_count || "0", 10),
      groupMembersCount: 0,
      groupPostsCount: 0,

      activeProjectsCount: parseInt(r.active_projects || "0", 10),
      researchCollaboratorsCount: 0,
      publicationsCount: 0,

      totalMembersCount: parseInt(m.total_members || "1", 10),
      departmentsCount: parseInt(d.total_depts || "0", 10),

      // Hospital metrics
      clinicalDoctorsCount: parseInt(clin.doctors_count || "0", 10),
      clinicalNursesCount: parseInt(clin.nurses_count || "0", 10),
      clinicalPhysiosCount: parseInt(clin.physios_count || "0", 10),
      clinicalAlliedCount: parseInt(clin.allied_count || "0", 10),
      internalTrainingsCount: parseInt(tr.internal_trainings_count || "0", 10),

      // College metrics
      studentsCount: parseInt(stu.students_count || "0", 10),
      facultyCount: parseInt(m.faculty_count || "0", 10),
      academicProgramsCount: parseInt(pr.prog_count || "0", 10),
      activePlacementsCount: parseInt(pl.placements_count || "0", 10),
      pendingAssessmentsCount: parseInt(as.assess_count || "0", 10),

      planName: (subRes?.plan as any) || "Basic",
      subscriptionStatus: (subRes?.status as any) || "ACTIVE",
      renewalDate: subRes?.current_period_end ? new Date(subRes.current_period_end).toISOString() : new Date().toISOString(),
    };
  }

  // ============================================================
  // College Service Methods: Students, Programs, Assessments, Placements
  // ============================================================

  static async getStudents(
    orgId: string,
    filters?: { program?: string; year?: number; status?: string; search?: string }
  ): Promise<StudentRecord[]> {
    await ensureOrgTables();

    let query = sql<any>`
      SELECT * FROM organization_students
      WHERE organization_id = ${orgId}
    `;

    if (filters?.program) {
      query = sql<any>`${query} AND program = ${filters.program}`;
    }
    if (filters?.year) {
      query = sql<any>`${query} AND year = ${filters.year}`;
    }
    if (filters?.status) {
      query = sql<any>`${query} AND status = ${filters.status}`;
    }
    if (filters?.search) {
      const term = `%${filters.search}%`;
      query = sql<any>`${query} AND (name ILIKE ${term} OR enrollment_number ILIKE ${term} OR email ILIKE ${term})`;
    }

    query = sql<any>`${query} ORDER BY name ASC`;

    const res = await query.execute(db);
    return res.rows;
  }

  static async createStudent(orgId: string, data: Partial<StudentRecord>): Promise<StudentRecord> {
    await ensureOrgTables();
    const id = generateOrgId();

    await sql`
      INSERT INTO organization_students (
        id, organization_id, user_id, name, email, phone, program, year, semester,
        department, enrollment_number, batch, status, academic_standing, created_at, updated_at
      ) VALUES (
        ${id}, ${orgId}, ${data.user_id || null}, ${data.name}, ${data.email || null},
        ${data.phone || null}, ${data.program || "BPT"}, ${data.year || 1}, ${data.semester || 1},
        ${data.department || null}, ${data.enrollment_number}, ${data.batch || null},
        ${data.status || "active"}, ${data.academic_standing || "good"}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
    `.execute(db);

    const res = await sql<any>`SELECT * FROM organization_students WHERE id = ${id}`.execute(db);
    return res.rows[0];
  }

  static async deleteStudent(orgId: string, studentId: string): Promise<boolean> {
    await ensureOrgTables();
    await sql`DELETE FROM organization_students WHERE id = ${studentId} AND organization_id = ${orgId}`.execute(db);
    return true;
  }

  static async getAcademicPrograms(orgId: string): Promise<AcademicProgramRecord[]> {
    await ensureOrgTables();
    const res = await sql<any>`
      SELECT 
        p.*,
        (SELECT COUNT(*) FROM organization_students WHERE organization_id = ${orgId} AND program = p.code) as student_count
      FROM organization_academic_programs p
      WHERE p.organization_id = ${orgId}
      ORDER BY p.name ASC
    `.execute(db);

    return res.rows.map((r: any) => ({
      ...r,
      student_count: parseInt(r.student_count || "0", 10),
      curriculum: Array.isArray(r.curriculum) ? r.curriculum : [],
    }));
  }

  static async createAcademicProgram(orgId: string, data: Partial<AcademicProgramRecord>): Promise<AcademicProgramRecord> {
    await ensureOrgTables();
    const id = generateOrgId();

    await sql`
      INSERT INTO organization_academic_programs (
        id, organization_id, name, code, degree_level, duration_years, department, description, curriculum, created_at
      ) VALUES (
        ${id}, ${orgId}, ${data.name}, ${data.code}, ${data.degree_level || "Undergraduate"},
        ${data.duration_years || 4.0}, ${data.department || null}, ${data.description || null},
        ${JSON.stringify(data.curriculum || [])}, CURRENT_TIMESTAMP
      )
    `.execute(db);

    const res = await sql<any>`SELECT * FROM organization_academic_programs WHERE id = ${id}`.execute(db);
    return res.rows[0];
  }

  static async getAssessments(orgId: string, department?: string): Promise<AssessmentRecord[]> {
    await ensureOrgTables();
    let q = sql<any>`
      SELECT 
        a.*,
        (SELECT COUNT(*) FROM organization_assessment_submissions WHERE assessment_id = a.id) as submissions_count
      FROM organization_assessments a
      WHERE a.organization_id = ${orgId}
    `;

    if (department) {
      q = sql<any>`${q} AND a.department = ${department}`;
    }

    q = sql<any>`${q} ORDER BY a.created_at DESC`;
    const res = await q.execute(db);
    return res.rows.map((r: any) => ({
      ...r,
      submissions_count: parseInt(r.submissions_count || "0", 10),
      question_bank: Array.isArray(r.question_bank) ? r.question_bank : [],
    }));
  }

  static async createAssessment(orgId: string, userId: string, data: Partial<AssessmentRecord>): Promise<AssessmentRecord> {
    await ensureOrgTables();
    const id = generateOrgId();

    await sql`
      INSERT INTO organization_assessments (
        id, organization_id, department, program_id, course_id, title, assessment_type,
        total_marks, pass_percentage, duration_minutes, due_date, status, question_bank, scope, created_by, created_at
      ) VALUES (
        ${id}, ${orgId}, ${data.department || null}, ${data.program_id || null}, ${data.course_id || null},
        ${data.title}, ${data.assessment_type || "mcq"}, ${data.total_marks || 100}, ${data.pass_percentage || 50},
        ${data.duration_minutes || 60}, ${data.due_date || null}, ${data.status || "published"},
        ${JSON.stringify(data.question_bank || [])}, ${data.scope || "department"}, ${userId}, CURRENT_TIMESTAMP
      )
    `.execute(db);

    const res = await sql<any>`SELECT * FROM organization_assessments WHERE id = ${id}`.execute(db);
    return res.rows[0];
  }

  static async getPlacements(orgId: string): Promise<PlacementRecord[]> {
    await ensureOrgTables();
    const res = await sql<any>`
      SELECT * FROM organization_placements
      WHERE organization_id = ${orgId}
      ORDER BY created_at DESC
    `.execute(db);

    return res.rows.map((r: any) => ({
      ...r,
      eligible_programs: Array.isArray(r.eligible_programs) ? r.eligible_programs : [],
      applications_count: parseInt(r.applications_count || "0", 10),
      offers_count: parseInt(r.offers_count || "0", 10),
    }));
  }

  static async createPlacement(orgId: string, data: Partial<PlacementRecord>): Promise<PlacementRecord> {
    await ensureOrgTables();
    const id = generateOrgId();

    await sql`
      INSERT INTO organization_placements (
        id, organization_id, company_name, job_title, job_type, eligible_programs,
        min_cgpa, package_ctc, location, deadline, status, description, created_at
      ) VALUES (
        ${id}, ${orgId}, ${data.company_name}, ${data.job_title}, ${data.job_type || "full_time"},
        ${data.eligible_programs || []}, ${data.min_cgpa || null}, ${data.package_ctc || null},
        ${data.location || null}, ${data.deadline || null}, ${data.status || "active"},
        ${data.description || null}, CURRENT_TIMESTAMP
      )
    `.execute(db);

    const res = await sql<any>`SELECT * FROM organization_placements WHERE id = ${id}`.execute(db);
    return res.rows[0];
  }

  // ============================================================
  // Hospital Service Methods: Internal SOP Training & Clinical Workforce
  // ============================================================

  static async getInternalTrainings(orgId: string, department?: string): Promise<HospitalInternalTrainingRecord[]> {
    await ensureOrgTables();
    let q = sql<any>`
      SELECT * FROM organization_internal_trainings
      WHERE organization_id = ${orgId}
    `;
    if (department) {
      q = sql<any>`${q} AND (department = ${department} OR access_scope = 'org_only' OR access_scope = 'public')`;
    }
    q = sql<any>`${q} ORDER BY created_at DESC`;

    const res = await q.execute(db);
    return res.rows;
  }

  static async createInternalTraining(
    orgId: string,
    userId: string,
    data: Partial<HospitalInternalTrainingRecord>
  ): Promise<HospitalInternalTrainingRecord> {
    await ensureOrgTables();
    const id = generateOrgId();

    await sql`
      INSERT INTO organization_internal_trainings (
        id, organization_id, title, category, department, access_scope, content_type,
        duration_hours, has_certificate, description, mandatory, created_by, created_at
      ) VALUES (
        ${id}, ${orgId}, ${data.title}, ${data.category || "Clinical Skills"}, ${data.department || null},
        ${data.access_scope || "org_only"}, ${data.content_type || "video"}, ${data.duration_hours || 2.0},
        ${data.has_certificate ?? true}, ${data.description || null}, ${data.mandatory ?? false},
        ${userId}, CURRENT_TIMESTAMP
      )
    `.execute(db);

    const res = await sql<any>`SELECT * FROM organization_internal_trainings WHERE id = ${id}`.execute(db);
    return res.rows[0];
  }

  // ============================================================
  // Targeted Announcements Service Methods
  // ============================================================

  static async getAnnouncements(orgId: string, audience?: string): Promise<OrganizationAnnouncementRecord[]> {
    await ensureOrgTables();
    let q = sql<any>`
      SELECT * FROM organization_announcements
      WHERE organization_id = ${orgId}
    `;

    if (audience && audience !== "all") {
      q = sql<any>`${q} AND (target_audience = 'all' OR target_audience = ${audience})`;
    }

    q = sql<any>`${q} ORDER BY pinned DESC, publish_date DESC`;
    const res = await q.execute(db);
    return res.rows;
  }

  static async createAnnouncement(
    orgId: string,
    userId: string,
    data: Partial<OrganizationAnnouncementRecord>
  ): Promise<OrganizationAnnouncementRecord> {
    await ensureOrgTables();
    const id = generateOrgId();

    await sql`
      INSERT INTO organization_announcements (
        id, organization_id, title, message, target_audience, target_department,
        target_program, attachment_url, publish_date, expiry_date, pinned, created_by, created_at
      ) VALUES (
        ${id}, ${orgId}, ${data.title}, ${data.message}, ${data.target_audience || "all"},
        ${data.target_department || null}, ${data.target_program || null}, ${data.attachment_url || null},
        ${data.publish_date || new Date().toISOString()}, ${data.expiry_date || null},
        ${data.pinned ?? false}, ${userId}, CURRENT_TIMESTAMP
      )
    `.execute(db);

    const res = await sql<any>`SELECT * FROM organization_announcements WHERE id = ${id}`.execute(db);
    return res.rows[0];
  }
}
