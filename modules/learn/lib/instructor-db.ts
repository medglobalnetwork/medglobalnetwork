// ============================================================
// MGN.life Phase 4: Learn Ecosystem — Instructor & Faculty Database
// modules/learn/lib/instructor-db.ts
// ============================================================

import { database } from "@/lib/auth";
import { Kysely, sql } from "kysely";
import { generateId } from "@/modules/network/lib/network-db";
import {
  Batch,
  BatchStudent,
  BatchAnnouncement,
  InstructorProfileSettings,
  TestPaperSubmission,
  TestSubmissionAnswerDetail,
  QuizQuestion,
  QuizOption,
  CreateCourseInput,
  CourseStatus,
} from "../types";

const db = database as Kysely<any>;

// ─────────────────────────────────────────────
// SCHEMA INITIALIZER FOR INSTRUCTOR MODULES
// ─────────────────────────────────────────────
let instructorTablesEnsured = false;

export async function ensureInstructorTables(): Promise<void> {
  if (instructorTablesEnsured) return;
  try {
    const dbAny = database as any;

    // 1. Batches Table
    await dbAny.schema
      .createTable("learn_batches")
      .ifNotExists()
      .addColumn("id", "varchar(64)", (col: any) => col.primaryKey())
      .addColumn("course_id", "varchar(64)", (col: any) => col.notNull())
      .addColumn("instructor_id", "text", (col: any) => col.notNull())
      .addColumn("name", "varchar(255)", (col: any) => col.notNull())
      .addColumn("code", "varchar(64)", (col: any) => col.notNull())
      .addColumn("description", "text")
      .addColumn("max_capacity", "integer", (col: any) => col.defaultTo(50))
      .addColumn("enrolled_count", "integer", (col: any) => col.defaultTo(0))
      .addColumn("start_date", "timestamptz")
      .addColumn("end_date", "timestamptz")
      .addColumn("schedule_info", "text")
      .addColumn("meeting_url", "text")
      .addColumn("status", "varchar(32)", (col: any) => col.defaultTo("upcoming"))
      .addColumn("created_at", "timestamptz", (col: any) => col.defaultTo(dbAny.fn("now" as any)))
      .addColumn("updated_at", "timestamptz", (col: any) => col.defaultTo(dbAny.fn("now" as any)))
      .execute();

    // 2. Batch Students Mapping Table
    await dbAny.schema
      .createTable("learn_batch_students")
      .ifNotExists()
      .addColumn("id", "varchar(64)", (col: any) => col.primaryKey())
      .addColumn("batch_id", "varchar(64)", (col: any) => col.notNull())
      .addColumn("user_id", "text", (col: any) => col.notNull())
      .addColumn("enrolled_at", "timestamptz", (col: any) => col.defaultTo(dbAny.fn("now" as any)))
      .addColumn("status", "varchar(32)", (col: any) => col.defaultTo("active"))
      .addColumn("notes", "text")
      .execute();

    // 3. Batch Announcements Table
    await dbAny.schema
      .createTable("learn_batch_announcements")
      .ifNotExists()
      .addColumn("id", "varchar(64)", (col: any) => col.primaryKey())
      .addColumn("batch_id", "varchar(64)", (col: any) => col.notNull())
      .addColumn("instructor_id", "text", (col: any) => col.notNull())
      .addColumn("title", "varchar(255)", (col: any) => col.notNull())
      .addColumn("content", "text", (col: any) => col.notNull())
      .addColumn("priority", "varchar(32)", (col: any) => col.defaultTo("normal"))
      .addColumn("created_at", "timestamptz", (col: any) => col.defaultTo(dbAny.fn("now" as any)))
      .execute();

    // 4. Instructor Profiles & Teaching Settings Table
    await dbAny.schema
      .createTable("learn_instructor_profiles")
      .ifNotExists()
      .addColumn("id", "varchar(64)", (col: any) => col.primaryKey())
      .addColumn("user_id", "text", (col: any) => col.notNull().unique())
      .addColumn("designation", "varchar(255)")
      .addColumn("affiliation", "varchar(255)")
      .addColumn("registration_number", "varchar(128)")
      .addColumn("bio", "text")
      .addColumn("office_hours", "varchar(255)")
      .addColumn("qualifications", "text")
      .addColumn("credentials_doc_url", "text")
      .addColumn("notify_email", "boolean", (col: any) => col.defaultTo(true))
      .addColumn("notify_batch_activity", "boolean", (col: any) => col.defaultTo(true))
      .addColumn("notify_test_submissions", "boolean", (col: any) => col.defaultTo(true))
      .addColumn("payout_upi_id", "varchar(128)")
      .addColumn("payout_bank_name", "varchar(128)")
      .addColumn("payout_account_holder", "varchar(255)")
      .addColumn("payout_account_number", "varchar(128)")
      .addColumn("payout_ifsc_code", "varchar(64)")
      .addColumn("payout_currency", "varchar(16)", (col: any) => col.defaultTo("INR"))
      .addColumn("created_at", "timestamptz", (col: any) => col.defaultTo(dbAny.fn("now" as any)))
      .addColumn("updated_at", "timestamptz", (col: any) => col.defaultTo(dbAny.fn("now" as any)))
      .execute();

    // 5. Quiz Attempt Individual Answers Table (for subjective evaluation & detailed breakdown)
    await dbAny.schema
      .createTable("quiz_attempt_answers")
      .ifNotExists()
      .addColumn("id", "varchar(64)", (col: any) => col.primaryKey())
      .addColumn("attempt_id", "varchar(64)", (col: any) => col.notNull())
      .addColumn("question_id", "varchar(64)", (col: any) => col.notNull())
      .addColumn("selected_option_ids", "jsonb")
      .addColumn("text_answer", "text")
      .addColumn("is_correct", "boolean")
      .addColumn("points_awarded", "numeric(5,2)")
      .addColumn("feedback", "text")
      .addColumn("evaluated_at", "timestamptz")
      .execute();

    // 6. Add columns to courses if they don't exist
    try {
      await sql`ALTER TABLE courses ADD COLUMN IF NOT EXISTS discount_price numeric(10,2);`.execute(dbAny);
      await sql`ALTER TABLE courses ADD COLUMN IF NOT EXISTS accreditation varchar(255);`.execute(dbAny);
      await sql`ALTER TABLE courses ADD COLUMN IF NOT EXISTS subscription_tier varchar(64);`.execute(dbAny);
      await sql`ALTER TABLE courses ADD COLUMN IF NOT EXISTS bundle_access boolean DEFAULT false;`.execute(dbAny);
    } catch {
      // Ignore column alter errors if already exists
    }

    // 7. Add columns to quiz_questions if needed
    try {
      await sql`ALTER TABLE quiz_questions ADD COLUMN IF NOT EXISTS case_vignette text;`.execute(dbAny);
      await sql`ALTER TABLE quiz_questions ADD COLUMN IF NOT EXISTS points numeric(5,2) DEFAULT 1;`.execute(dbAny);
      await sql`ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS test_type varchar(64) DEFAULT 'quiz';`.execute(dbAny);
      await sql`ALTER TABLE quiz_attempts ADD COLUMN IF NOT EXISTS time_taken_seconds integer;`.execute(dbAny);
      await sql`ALTER TABLE quiz_attempts ADD COLUMN IF NOT EXISTS evaluated_at timestamptz;`.execute(dbAny);
      await sql`ALTER TABLE quiz_attempts ADD COLUMN IF NOT EXISTS evaluated_by text;`.execute(dbAny);
      await sql`ALTER TABLE quiz_attempts ADD COLUMN IF NOT EXISTS instructor_feedback text;`.execute(dbAny);
      await sql`ALTER TABLE quiz_attempts ADD COLUMN IF NOT EXISTS status varchar(32) DEFAULT 'evaluated';`.execute(dbAny);
    } catch {
      // Ignore column alter errors
    }

    instructorTablesEnsured = true;
  } catch (e) {
    console.error("ensureInstructorTables error:", e);
    instructorTablesEnsured = true;
  }
}

// ─────────────────────────────────────────────
// 1. INSTRUCTOR PROFILE & SETTINGS
// ─────────────────────────────────────────────

export async function getInstructorProfileSettings(userId: string): Promise<InstructorProfileSettings> {
  await ensureInstructorTables();

  const user = await db
    .selectFrom("user")
    .select(["id", "name", "email", "image"])
    .where("id", "=", userId)
    .executeTakeFirst();

  const profile = await db
    .selectFrom("learn_instructor_profiles")
    .selectAll()
    .where("user_id", "=", userId)
    .executeTakeFirst();

  // If no custom instructor profile yet, check professional_profiles for defaults
  let defaultDesignation: string | null = null;
  let defaultAffiliation: string | null = null;
  let defaultReg: string | null = null;
  let defaultBio: string | null = null;

  if (!profile) {
    const profProfile = await db
      .selectFrom("professional_profiles")
      .select(["designation", "organization", "registration_number", "bio"])
      .where("user_id", "=", userId)
      .executeTakeFirst();
    if (profProfile) {
      defaultDesignation = profProfile.designation || null;
      defaultAffiliation = profProfile.organization || null;
      defaultReg = profProfile.registration_number || null;
      defaultBio = profProfile.bio || null;
    }
  }

  return {
    id: profile?.id || userId,
    user_id: userId,
    name: user?.name || "Medical Instructor",
    email: user?.email || "",
    image: user?.image || null,
    designation: profile?.designation ?? defaultDesignation,
    affiliation: profile?.affiliation ?? defaultAffiliation,
    registration_number: profile?.registration_number ?? defaultReg,
    bio: profile?.bio ?? defaultBio,
    office_hours: profile?.office_hours || null,
    qualifications: profile?.qualifications || null,
    credentials_doc_url: profile?.credentials_doc_url || null,
    notify_email: profile?.notify_email ?? true,
    notify_batch_activity: profile?.notify_batch_activity ?? true,
    notify_test_submissions: profile?.notify_test_submissions ?? true,
    payout_upi_id: profile?.payout_upi_id || null,
    payout_bank_name: profile?.payout_bank_name || null,
    payout_account_holder: profile?.payout_account_holder || (user?.name ?? null),
    payout_account_number: profile?.payout_account_number || null,
    payout_ifsc_code: profile?.payout_ifsc_code || null,
    payout_currency: profile?.payout_currency || "INR",
    created_at: profile?.created_at ? new Date(profile.created_at).toISOString() : undefined,
    updated_at: profile?.updated_at ? new Date(profile.updated_at).toISOString() : undefined,
  };
}

export async function saveInstructorProfileSettings(
  userId: string,
  data: Partial<InstructorProfileSettings>
): Promise<InstructorProfileSettings> {
  await ensureInstructorTables();

  const existing = await db
    .selectFrom("learn_instructor_profiles")
    .select(["id"])
    .where("user_id", "=", userId)
    .executeTakeFirst();

  const now = new Date();

  if (existing) {
    await db
      .updateTable("learn_instructor_profiles")
      .set({
        designation: data.designation ?? null,
        affiliation: data.affiliation ?? null,
        registration_number: data.registration_number ?? null,
        bio: data.bio ?? null,
        office_hours: data.office_hours ?? null,
        qualifications: typeof data.qualifications === "string" ? data.qualifications : JSON.stringify(data.qualifications || []),
        credentials_doc_url: data.credentials_doc_url ?? null,
        notify_email: data.notify_email ?? true,
        notify_batch_activity: data.notify_batch_activity ?? true,
        notify_test_submissions: data.notify_test_submissions ?? true,
        payout_upi_id: data.payout_upi_id ?? null,
        payout_bank_name: data.payout_bank_name ?? null,
        payout_account_holder: data.payout_account_holder ?? null,
        payout_account_number: data.payout_account_number ?? null,
        payout_ifsc_code: data.payout_ifsc_code ?? null,
        payout_currency: data.payout_currency ?? "INR",
        updated_at: now,
      })
      .where("user_id", "=", userId)
      .execute();
  } else {
    await db
      .insertInto("learn_instructor_profiles")
      .values({
        id: generateId(),
        user_id: userId,
        designation: data.designation ?? null,
        affiliation: data.affiliation ?? null,
        registration_number: data.registration_number ?? null,
        bio: data.bio ?? null,
        office_hours: data.office_hours ?? null,
        qualifications: typeof data.qualifications === "string" ? data.qualifications : JSON.stringify(data.qualifications || []),
        credentials_doc_url: data.credentials_doc_url ?? null,
        notify_email: data.notify_email ?? true,
        notify_batch_activity: data.notify_batch_activity ?? true,
        notify_test_submissions: data.notify_test_submissions ?? true,
        payout_upi_id: data.payout_upi_id ?? null,
        payout_bank_name: data.payout_bank_name ?? null,
        payout_account_holder: data.payout_account_holder ?? null,
        payout_account_number: data.payout_account_number ?? null,
        payout_ifsc_code: data.payout_ifsc_code ?? null,
        payout_currency: data.payout_currency ?? "INR",
        created_at: now,
        updated_at: now,
      })
      .execute();
  }

  return getInstructorProfileSettings(userId);
}

// ─────────────────────────────────────────────
// 2. BATCHES MANAGEMENT
// ─────────────────────────────────────────────

export async function getInstructorBatches(
  instructorId: string,
  courseId?: string
): Promise<Batch[]> {
  await ensureInstructorTables();

  let query = db
    .selectFrom("learn_batches as b")
    .innerJoin("courses as c", "c.id", "b.course_id")
    .select([
      "b.id",
      "b.course_id",
      "b.instructor_id",
      "b.name",
      "b.code",
      "b.description",
      "b.max_capacity",
      "b.enrolled_count",
      "b.start_date",
      "b.end_date",
      "b.schedule_info",
      "b.meeting_url",
      "b.status",
      "b.created_at",
      "b.updated_at",
      "c.title as course_title",
    ])
    .where("b.instructor_id", "=", instructorId);

  if (courseId) {
    query = query.where("b.course_id", "=", courseId);
  }

  const rows = await query.orderBy("b.created_at", "desc").execute();

  return rows.map((r) => ({
    id: r.id,
    course_id: r.course_id,
    course_title: r.course_title,
    instructor_id: r.instructor_id,
    name: r.name,
    code: r.code,
    description: r.description,
    max_capacity: Number(r.max_capacity) || 50,
    enrolled_count: Number(r.enrolled_count) || 0,
    start_date: r.start_date ? new Date(r.start_date).toISOString() : null,
    end_date: r.end_date ? new Date(r.end_date).toISOString() : null,
    schedule_info: r.schedule_info,
    meeting_url: r.meeting_url,
    status: (r.status as any) || "upcoming",
    created_at: new Date(r.created_at).toISOString(),
    updated_at: new Date(r.updated_at).toISOString(),
  }));
}

export async function getBatchDetails(
  batchId: string,
  instructorId?: string
): Promise<Batch | null> {
  await ensureInstructorTables();

  let query = db
    .selectFrom("learn_batches as b")
    .innerJoin("courses as c", "c.id", "b.course_id")
    .select([
      "b.id",
      "b.course_id",
      "b.instructor_id",
      "b.name",
      "b.code",
      "b.description",
      "b.max_capacity",
      "b.enrolled_count",
      "b.start_date",
      "b.end_date",
      "b.schedule_info",
      "b.meeting_url",
      "b.status",
      "b.created_at",
      "b.updated_at",
      "c.title as course_title",
    ])
    .where("b.id", "=", batchId);

  if (instructorId) {
    query = query.where("b.instructor_id", "=", instructorId);
  }

  const batch = await query.executeTakeFirst();
  if (!batch) return null;

  // Fetch enrolled students
  const studentsRaw = await db
    .selectFrom("learn_batch_students as bs")
    .innerJoin("user as u", "u.id", "bs.user_id")
    .leftJoin("course_enrollments as ce", (join: any) =>
      join.onRef("ce.user_id", "=", "bs.user_id").on("ce.course_id", "=", batch.course_id)
    )
    .select([
      "bs.id",
      "bs.batch_id",
      "bs.user_id",
      "bs.enrolled_at",
      "bs.status",
      "bs.notes",
      "u.name as user_name",
      "u.email as user_email",
      "u.image as user_image",
      "ce.progress_percentage",
    ])
    .where("bs.batch_id", "=", batchId)
    .orderBy("bs.enrolled_at", "desc")
    .execute();

  const students: BatchStudent[] = studentsRaw.map((s) => ({
    id: s.id,
    batch_id: s.batch_id,
    user_id: s.user_id,
    user_name: s.user_name || "Healthcare Learner",
    user_email: s.user_email || "",
    user_image: s.user_image || null,
    enrolled_at: new Date(s.enrolled_at).toISOString(),
    status: (s.status as any) || "active",
    progress_percentage: Number(s.progress_percentage) || 0,
    notes: s.notes || null,
  }));

  // Fetch announcements
  const announcementsRaw = await db
    .selectFrom("learn_batch_announcements")
    .selectAll()
    .where("batch_id", "=", batchId)
    .orderBy("created_at", "desc")
    .execute();

  const announcements: BatchAnnouncement[] = announcementsRaw.map((a) => ({
    id: a.id,
    batch_id: a.batch_id,
    instructor_id: a.instructor_id,
    title: a.title,
    content: a.content,
    priority: (a.priority as any) || "normal",
    created_at: new Date(a.created_at).toISOString(),
  }));

  return {
    id: batch.id,
    course_id: batch.course_id,
    course_title: batch.course_title,
    instructor_id: batch.instructor_id,
    name: batch.name,
    code: batch.code,
    description: batch.description,
    max_capacity: Number(batch.max_capacity) || 50,
    enrolled_count: students.length,
    start_date: batch.start_date ? new Date(batch.start_date).toISOString() : null,
    end_date: batch.end_date ? new Date(batch.end_date).toISOString() : null,
    schedule_info: batch.schedule_info,
    meeting_url: batch.meeting_url,
    status: (batch.status as any) || "upcoming",
    created_at: new Date(batch.created_at).toISOString(),
    updated_at: new Date(batch.updated_at).toISOString(),
    students,
    announcements,
  };
}

export async function createBatch(
  instructorId: string,
  data: {
    courseId: string;
    name: string;
    code: string;
    description?: string;
    maxCapacity?: number;
    startDate?: string;
    endDate?: string;
    scheduleInfo?: string;
    meetingUrl?: string;
    status?: string;
  }
): Promise<string> {
  await ensureInstructorTables();

  const batchId = generateId();
  const now = new Date();

  await db
    .insertInto("learn_batches")
    .values({
      id: batchId,
      course_id: data.courseId,
      instructor_id: instructorId,
      name: data.name.trim(),
      code: data.code.trim().toUpperCase(),
      description: data.description?.trim() || null,
      max_capacity: data.maxCapacity || 50,
      enrolled_count: 0,
      start_date: data.startDate ? new Date(data.startDate) : null,
      end_date: data.endDate ? new Date(data.endDate) : null,
      schedule_info: data.scheduleInfo?.trim() || null,
      meeting_url: data.meetingUrl?.trim() || null,
      status: data.status || "upcoming",
      created_at: now,
      updated_at: now,
    })
    .execute();

  return batchId;
}

export async function updateBatch(
  batchId: string,
  instructorId: string,
  data: Partial<{
    name: string;
    code: string;
    description: string;
    maxCapacity: number;
    startDate: string;
    endDate: string;
    scheduleInfo: string;
    meetingUrl: string;
    status: string;
  }>
): Promise<void> {
  await ensureInstructorTables();

  const updatePayload: any = {
    updated_at: new Date(),
  };

  if (data.name !== undefined) updatePayload.name = data.name.trim();
  if (data.code !== undefined) updatePayload.code = data.code.trim().toUpperCase();
  if (data.description !== undefined) updatePayload.description = data.description.trim() || null;
  if (data.maxCapacity !== undefined) updatePayload.max_capacity = Number(data.maxCapacity);
  if (data.startDate !== undefined) updatePayload.start_date = data.startDate ? new Date(data.startDate) : null;
  if (data.endDate !== undefined) updatePayload.end_date = data.endDate ? new Date(data.endDate) : null;
  if (data.scheduleInfo !== undefined) updatePayload.schedule_info = data.scheduleInfo.trim() || null;
  if (data.meetingUrl !== undefined) updatePayload.meeting_url = data.meetingUrl.trim() || null;
  if (data.status !== undefined) updatePayload.status = data.status;

  await db
    .updateTable("learn_batches")
    .set(updatePayload)
    .where("id", "=", batchId)
    .where("instructor_id", "=", instructorId)
    .execute();
}

export async function deleteBatch(batchId: string, instructorId: string): Promise<void> {
  await ensureInstructorTables();

  await db
    .deleteFrom("learn_batch_students")
    .where("batch_id", "=", batchId)
    .execute();

  await db
    .deleteFrom("learn_batch_announcements")
    .where("batch_id", "=", batchId)
    .execute();

  await db
    .deleteFrom("learn_batches")
    .where("id", "=", batchId)
    .where("instructor_id", "=", instructorId)
    .execute();
}

export async function addStudentToBatch(
  batchId: string,
  instructorId: string,
  studentIdentifier: string, // User ID or Email
  notes?: string
): Promise<{ success: boolean; studentId: string; userName: string }> {
  await ensureInstructorTables();

  const batch = await db
    .selectFrom("learn_batches")
    .selectAll()
    .where("id", "=", batchId)
    .where("instructor_id", "=", instructorId)
    .executeTakeFirst();

  if (!batch) throw new Error("Batch not found or unauthorized");

  // Find user by ID or Email
  const user = await db
    .selectFrom("user")
    .select(["id", "name", "email"])
    .where((eb: any) =>
      eb.or([
        eb("id", "=", studentIdentifier),
        eb("email", "ilike", studentIdentifier.trim()),
      ])
    )
    .executeTakeFirst();

  if (!user) throw new Error(`Student with email/id "${studentIdentifier}" not found on MGN.`);

  // Check if already in batch
  const existing = await db
    .selectFrom("learn_batch_students")
    .select(["id"])
    .where("batch_id", "=", batchId)
    .where("user_id", "=", user.id)
    .executeTakeFirst();

  if (existing) {
    throw new Error("Student is already enrolled in this batch.");
  }

  // Ensure course enrollment exists for this user
  const courseEnrollment = await db
    .selectFrom("course_enrollments")
    .select(["id"])
    .where("course_id", "=", batch.course_id)
    .where("user_id", "=", user.id)
    .executeTakeFirst();

  if (!courseEnrollment) {
    await db
      .insertInto("course_enrollments")
      .values({
        id: generateId(),
        course_id: batch.course_id,
        user_id: user.id,
        enrolled_at: new Date(),
        status: "active",
        progress_percentage: 0,
        last_accessed_at: new Date(),
      })
      .execute();
  }

  const studentMapId = generateId();
  await db
    .insertInto("learn_batch_students")
    .values({
      id: studentMapId,
      batch_id: batchId,
      user_id: user.id,
      enrolled_at: new Date(),
      status: "active",
      notes: notes || null,
    })
    .execute();

  // Increment enrolled count on batch
  await db
    .updateTable("learn_batches")
    .set({
      enrolled_count: sql`enrolled_count + 1`,
      updated_at: new Date(),
    })
    .where("id", "=", batchId)
    .execute();

  return { success: true, studentId: user.id, userName: user.name || user.email };
}

export async function removeStudentFromBatch(
  batchId: string,
  instructorId: string,
  userId: string
): Promise<void> {
  await ensureInstructorTables();

  const batch = await db
    .selectFrom("learn_batches")
    .select(["id"])
    .where("id", "=", batchId)
    .where("instructor_id", "=", instructorId)
    .executeTakeFirst();

  if (!batch) throw new Error("Batch not found or unauthorized");

  await db
    .deleteFrom("learn_batch_students")
    .where("batch_id", "=", batchId)
    .where("user_id", "=", userId)
    .execute();

  await db
    .updateTable("learn_batches")
    .set({
      enrolled_count: sql`GREATEST(0, enrolled_count - 1)`,
      updated_at: new Date(),
    })
    .where("id", "=", batchId)
    .execute();
}

export async function createBatchAnnouncement(
  batchId: string,
  instructorId: string,
  data: { title: string; content: string; priority?: string }
): Promise<string> {
  await ensureInstructorTables();

  const announcementId = generateId();
  await db
    .insertInto("learn_batch_announcements")
    .values({
      id: announcementId,
      batch_id: batchId,
      instructor_id: instructorId,
      title: data.title.trim(),
      content: data.content.trim(),
      priority: data.priority || "normal",
      created_at: new Date(),
    })
    .execute();

  return announcementId;
}

export async function deleteBatchAnnouncement(
  announcementId: string,
  instructorId: string
): Promise<void> {
  await ensureInstructorTables();

  await db
    .deleteFrom("learn_batch_announcements")
    .where("id", "=", announcementId)
    .where("instructor_id", "=", instructorId)
    .execute();
}

// ─────────────────────────────────────────────
// 3. TEST CREATION & TEST PAPER SUBMISSIONS
// ─────────────────────────────────────────────

export async function getInstructorQuizzes(
  instructorId: string,
  courseId?: string
): Promise<any[]> {
  await ensureInstructorTables();

  let query = db
    .selectFrom("quizzes as q")
    .innerJoin("courses as c", "c.id", "q.course_id")
    .leftJoin("course_lessons as l", "l.id", "q.lesson_id")
    .select([
      "q.id",
      "q.course_id",
      "q.lesson_id",
      "q.title",
      "q.description",
      "q.passing_score",
      "q.time_limit_minutes",
      "q.max_attempts",
      "q.status",
      "q.test_type",
      "q.created_at",
      "q.updated_at",
      "c.title as course_title",
      "l.title as lesson_title",
    ])
    .where("c.instructor_id", "=", instructorId);

  if (courseId) {
    query = query.where("q.course_id", "=", courseId);
  }

  const quizzes = await query.orderBy("q.created_at", "desc").execute();

  // For each quiz, get question count and attempt count
  const results = await Promise.all(
    quizzes.map(async (q) => {
      const qCountRes = await db
        .selectFrom("quiz_questions")
        .select(sql<string>`count(*)`.as("count"))
        .where("quiz_id", "=", q.id)
        .executeTakeFirst();

      const aCountRes = await db
        .selectFrom("quiz_attempts")
        .select(sql<string>`count(*)`.as("count"))
        .where("quiz_id", "=", q.id)
        .executeTakeFirst();

      return {
        id: q.id,
        course_id: q.course_id,
        course_title: q.course_title,
        lesson_id: q.lesson_id,
        lesson_title: q.lesson_title,
        title: q.title,
        description: q.description,
        test_type: q.test_type || "quiz",
        passing_score: Number(q.passing_score) || 70,
        time_limit_minutes: Number(q.time_limit_minutes) || 30,
        max_attempts: Number(q.max_attempts) || 3,
        status: q.status || "published",
        question_count: parseInt(qCountRes?.count || "0", 10),
        attempt_count: parseInt(aCountRes?.count || "0", 10),
        created_at: new Date(q.created_at).toISOString(),
        updated_at: new Date(q.updated_at).toISOString(),
      };
    })
  );

  return results;
}

export async function getQuizWithFullQuestions(
  quizId: string,
  instructorId?: string
): Promise<any | null> {
  await ensureInstructorTables();

  let query = db
    .selectFrom("quizzes as q")
    .innerJoin("courses as c", "c.id", "q.course_id")
    .leftJoin("course_lessons as l", "l.id", "q.lesson_id")
    .select([
      "q.id",
      "q.course_id",
      "q.lesson_id",
      "q.title",
      "q.description",
      "q.passing_score",
      "q.time_limit_minutes",
      "q.max_attempts",
      "q.status",
      "q.test_type",
      "q.created_at",
      "q.updated_at",
      "c.title as course_title",
      "c.instructor_id",
      "l.title as lesson_title",
    ])
    .where("q.id", "=", quizId);

  if (instructorId) {
    query = query.where("c.instructor_id", "=", instructorId);
  }

  const quiz = await query.executeTakeFirst();
  if (!quiz) return null;

  const questions = await db
    .selectFrom("quiz_questions")
    .selectAll()
    .where("quiz_id", "=", quizId)
    .orderBy("order_index", "asc")
    .execute();

  const questionIds = questions.map((q) => q.id);

  let options: any[] = [];
  if (questionIds.length > 0) {
    options = await db
      .selectFrom("quiz_options")
      .selectAll()
      .where("question_id", "in", questionIds)
      .orderBy("order_index", "asc")
      .execute();
  }

  const optionsByQuestion = new Map<string, QuizOption[]>();
  for (const opt of options) {
    const list = optionsByQuestion.get(opt.question_id) || [];
    list.push({
      id: opt.id,
      question_id: opt.question_id,
      option_text: opt.option_text,
      is_correct: Boolean(opt.is_correct),
      order_index: opt.order_index,
    });
    optionsByQuestion.set(opt.question_id, list);
  }

  return {
    id: quiz.id,
    course_id: quiz.course_id,
    course_title: quiz.course_title,
    lesson_id: quiz.lesson_id,
    lesson_title: quiz.lesson_title,
    title: quiz.title,
    description: quiz.description,
    test_type: quiz.test_type || "quiz",
    passing_score: Number(quiz.passing_score) || 70,
    time_limit_minutes: Number(quiz.time_limit_minutes) || 30,
    max_attempts: Number(quiz.max_attempts) || 3,
    status: quiz.status || "published",
    created_at: new Date(quiz.created_at).toISOString(),
    updated_at: new Date(quiz.updated_at).toISOString(),
    questions: questions.map((q) => ({
      id: q.id,
      quiz_id: q.quiz_id,
      question: q.question,
      question_type: q.question_type || "single",
      case_vignette: q.case_vignette || null,
      explanation: q.explanation || null,
      order_index: q.order_index,
      points: Number(q.points) || 1,
      options: optionsByQuestion.get(q.id) || [],
    })),
  };
}

export async function createQuizWithQuestions(
  instructorId: string,
  payload: {
    courseId: string;
    lessonId?: string;
    title: string;
    description?: string;
    testType?: string;
    passingScore?: number;
    timeLimitMinutes?: number;
    maxAttempts?: number;
    status?: string;
    questions: {
      question: string;
      question_type: string;
      case_vignette?: string;
      explanation?: string;
      points?: number;
      options: { option_text: string; is_correct: boolean }[];
    }[];
  }
): Promise<string> {
  await ensureInstructorTables();

  // Verify course belongs to instructor
  const course = await db
    .selectFrom("courses")
    .select(["id"])
    .where("id", "=", payload.courseId)
    .where("instructor_id", "=", instructorId)
    .executeTakeFirst();

  if (!course) throw new Error("Course not found or unauthorized");

  const quizId = generateId();
  const now = new Date();

  await db
    .insertInto("quizzes")
    .values({
      id: quizId,
      course_id: payload.courseId,
      lesson_id: payload.lessonId || null,
      title: payload.title.trim(),
      description: payload.description?.trim() || null,
      test_type: payload.testType || "quiz",
      passing_score: payload.passingScore ?? 70,
      time_limit_minutes: payload.timeLimitMinutes ?? 30,
      max_attempts: payload.maxAttempts ?? 3,
      status: payload.status || "published",
      created_at: now,
      updated_at: now,
    })
    .execute();

  // Insert questions and options
  for (let qIdx = 0; qIdx < (payload.questions || []).length; qIdx++) {
    const q = payload.questions[qIdx];
    const questionId = generateId();

    await db
      .insertInto("quiz_questions")
      .values({
        id: questionId,
        quiz_id: quizId,
        question: q.question.trim(),
        question_type: q.question_type || "single",
        case_vignette: q.case_vignette?.trim() || null,
        explanation: q.explanation?.trim() || null,
        points: q.points || 1,
        order_index: qIdx,
      })
      .execute();

    if (Array.isArray(q.options) && q.options.length > 0) {
      for (let oIdx = 0; oIdx < q.options.length; oIdx++) {
        const opt = q.options[oIdx];
        await db
          .insertInto("quiz_options")
          .values({
            id: generateId(),
            question_id: questionId,
            option_text: opt.option_text.trim(),
            is_correct: Boolean(opt.is_correct),
            order_index: oIdx,
          })
          .execute();
      }
    }
  }

  return quizId;
}

export async function updateQuizWithQuestions(
  quizId: string,
  instructorId: string,
  payload: {
    title?: string;
    description?: string;
    testType?: string;
    passingScore?: number;
    timeLimitMinutes?: number;
    maxAttempts?: number;
    status?: string;
    questions?: {
      id?: string;
      question: string;
      question_type: string;
      case_vignette?: string;
      explanation?: string;
      points?: number;
      options: { id?: string; option_text: string; is_correct: boolean }[];
    }[];
  }
): Promise<void> {
  await ensureInstructorTables();

  const quiz = await db
    .selectFrom("quizzes as q")
    .innerJoin("courses as c", "c.id", "q.course_id")
    .select(["q.id", "q.course_id"])
    .where("q.id", "=", quizId)
    .where("c.instructor_id", "=", instructorId)
    .executeTakeFirst();

  if (!quiz) throw new Error("Quiz not found or unauthorized");

  const updateFields: any = { updated_at: new Date() };
  if (payload.title !== undefined) updateFields.title = payload.title.trim();
  if (payload.description !== undefined) updateFields.description = payload.description.trim() || null;
  if (payload.testType !== undefined) updateFields.test_type = payload.testType;
  if (payload.passingScore !== undefined) updateFields.passing_score = Number(payload.passingScore);
  if (payload.timeLimitMinutes !== undefined) updateFields.time_limit_minutes = Number(payload.timeLimitMinutes);
  if (payload.maxAttempts !== undefined) updateFields.max_attempts = Number(payload.maxAttempts);
  if (payload.status !== undefined) updateFields.status = payload.status;

  await db
    .updateTable("quizzes")
    .set(updateFields)
    .where("id", "=", quizId)
    .execute();

  if (Array.isArray(payload.questions)) {
    // Delete existing questions & options, re-insert
    const existingQ = await db
      .selectFrom("quiz_questions")
      .select(["id"])
      .where("quiz_id", "=", quizId)
      .execute();

    if (existingQ.length > 0) {
      await db
        .deleteFrom("quiz_options")
        .where("question_id", "in", existingQ.map((q) => q.id))
        .execute();
      await db
        .deleteFrom("quiz_questions")
        .where("quiz_id", "=", quizId)
        .execute();
    }

    for (let qIdx = 0; qIdx < payload.questions.length; qIdx++) {
      const q = payload.questions[qIdx];
      const questionId = generateId();

      await db
        .insertInto("quiz_questions")
        .values({
          id: questionId,
          quiz_id: quizId,
          question: q.question.trim(),
          question_type: q.question_type || "single",
          case_vignette: q.case_vignette?.trim() || null,
          explanation: q.explanation?.trim() || null,
          points: q.points || 1,
          order_index: qIdx,
        })
        .execute();

      if (Array.isArray(q.options) && q.options.length > 0) {
        for (let oIdx = 0; oIdx < q.options.length; oIdx++) {
          const opt = q.options[oIdx];
          await db
            .insertInto("quiz_options")
            .values({
              id: generateId(),
              question_id: questionId,
              option_text: opt.option_text.trim(),
              is_correct: Boolean(opt.is_correct),
              order_index: oIdx,
            })
            .execute();
        }
      }
    }
  }
}

export async function deleteQuiz(quizId: string, instructorId: string): Promise<void> {
  await ensureInstructorTables();

  const quiz = await db
    .selectFrom("quizzes as q")
    .innerJoin("courses as c", "c.id", "q.course_id")
    .select(["q.id"])
    .where("q.id", "=", quizId)
    .where("c.instructor_id", "=", instructorId)
    .executeTakeFirst();

  if (!quiz) throw new Error("Quiz not found or unauthorized");

  const existingQ = await db
    .selectFrom("quiz_questions")
    .select(["id"])
    .where("quiz_id", "=", quizId)
    .execute();

  if (existingQ.length > 0) {
    await db
      .deleteFrom("quiz_options")
      .where("question_id", "in", existingQ.map((q) => q.id))
      .execute();
    await db
      .deleteFrom("quiz_questions")
      .where("quiz_id", "=", quizId)
      .execute();
  }

  await db
    .deleteFrom("quiz_attempts")
    .where("quiz_id", "=", quizId)
    .execute();

  await db
    .deleteFrom("quizzes")
    .where("id", "=", quizId)
    .execute();
}

// ─────────────────────────────────────────────
// 4. TEST PAPER SUBMISSIONS & EVALUATION
// ─────────────────────────────────────────────

export async function getInstructorSubmissions(
  instructorId: string,
  filters?: { courseId?: string; quizId?: string; status?: string; search?: string }
): Promise<TestPaperSubmission[]> {
  await ensureInstructorTables();

  let query = db
    .selectFrom("quiz_attempts as qa")
    .innerJoin("quizzes as q", "q.id", "qa.quiz_id")
    .innerJoin("courses as c", "c.id", "q.course_id")
    .innerJoin("user as u", "u.id", "qa.user_id")
    .select([
      "qa.id",
      "qa.quiz_id",
      "qa.user_id",
      "qa.score",
      "qa.percentage",
      "qa.passed",
      "qa.total_questions",
      "qa.correct_answers",
      "qa.incorrect_answers",
      "qa.attempt_number",
      "qa.time_taken_seconds",
      "qa.submitted_at",
      "qa.evaluated_at",
      "qa.evaluated_by",
      "qa.instructor_feedback",
      "qa.status",
      "q.title as quiz_title",
      "c.id as course_id",
      "c.title as course_title",
      "u.name as student_name",
      "u.email as student_email",
      "u.image as student_image",
    ])
    .where("c.instructor_id", "=", instructorId);

  if (filters?.courseId) {
    query = query.where("c.id", "=", filters.courseId);
  }
  if (filters?.quizId) {
    query = query.where("q.id", "=", filters.quizId);
  }
  if (filters?.status) {
    query = query.where("qa.status", "=", filters.status);
  }
  if (filters?.search?.trim()) {
    const s = `%${filters.search.trim()}%`;
    query = query.where((eb: any) =>
      eb.or([
        eb("u.name", "ilike", s),
        eb("u.email", "ilike", s),
        eb("q.title", "ilike", s),
      ])
    );
  }

  const rows = await query.orderBy("qa.submitted_at", "desc").execute();

  return rows.map((r) => ({
    id: r.id,
    quiz_id: r.quiz_id,
    quiz_title: r.quiz_title,
    course_id: r.course_id,
    course_title: r.course_title,
    user_id: r.user_id,
    student_name: r.student_name || "Healthcare Learner",
    student_email: r.student_email || "",
    student_image: r.student_image || null,
    score: Number(r.score) || 0,
    percentage: Number(r.percentage) || 0,
    passed: Boolean(r.passed),
    total_questions: Number(r.total_questions) || 0,
    correct_answers: Number(r.correct_answers) || 0,
    incorrect_answers: Number(r.incorrect_answers) || 0,
    attempt_number: Number(r.attempt_number) || 1,
    time_taken_seconds: r.time_taken_seconds ? Number(r.time_taken_seconds) : null,
    submitted_at: new Date(r.submitted_at).toISOString(),
    evaluated_at: r.evaluated_at ? new Date(r.evaluated_at).toISOString() : null,
    evaluated_by: r.evaluated_by || null,
    instructor_feedback: r.instructor_feedback || null,
    status: (r.status as any) || "evaluated",
  }));
}

export async function getSubmissionDetail(
  attemptId: string,
  instructorId: string
): Promise<TestPaperSubmission | null> {
  await ensureInstructorTables();

  const row = await db
    .selectFrom("quiz_attempts as qa")
    .innerJoin("quizzes as q", "q.id", "qa.quiz_id")
    .innerJoin("courses as c", "c.id", "q.course_id")
    .innerJoin("user as u", "u.id", "qa.user_id")
    .select([
      "qa.id",
      "qa.quiz_id",
      "qa.user_id",
      "qa.score",
      "qa.percentage",
      "qa.passed",
      "qa.total_questions",
      "qa.correct_answers",
      "qa.incorrect_answers",
      "qa.attempt_number",
      "qa.time_taken_seconds",
      "qa.submitted_at",
      "qa.evaluated_at",
      "qa.evaluated_by",
      "qa.instructor_feedback",
      "qa.status",
      "q.title as quiz_title",
      "c.id as course_id",
      "c.title as course_title",
      "u.name as student_name",
      "u.email as student_email",
      "u.image as student_image",
    ])
    .where("qa.id", "=", attemptId)
    .where("c.instructor_id", "=", instructorId)
    .executeTakeFirst();

  if (!row) return null;

  // Fetch all questions for this quiz
  const questions = await db
    .selectFrom("quiz_questions")
    .selectAll()
    .where("quiz_id", "=", row.quiz_id)
    .orderBy("order_index", "asc")
    .execute();

  const questionIds = questions.map((q) => q.id);

  let options: any[] = [];
  if (questionIds.length > 0) {
    options = await db
      .selectFrom("quiz_options")
      .selectAll()
      .where("question_id", "in", questionIds)
      .orderBy("order_index", "asc")
      .execute();
  }

  // Fetch recorded answers for this attempt
  const answersRaw = await db
    .selectFrom("quiz_attempt_answers")
    .selectAll()
    .where("attempt_id", "=", attemptId)
    .execute();

  const answerByQuestion = new Map<string, any>();
  for (const ans of answersRaw) {
    answerByQuestion.set(ans.question_id, ans);
  }

  const optionsByQuestion = new Map<string, any[]>();
  const correctOptionsByQuestion = new Map<string, string[]>();
  for (const opt of options) {
    const list = optionsByQuestion.get(opt.question_id) || [];
    list.push({
      id: opt.id,
      option_text: opt.option_text,
      is_correct: Boolean(opt.is_correct),
    });
    optionsByQuestion.set(opt.question_id, list);

    if (opt.is_correct) {
      const correctList = correctOptionsByQuestion.get(opt.question_id) || [];
      correctList.push(opt.id);
      correctOptionsByQuestion.set(opt.question_id, correctList);
    }
  }

  const answers: TestSubmissionAnswerDetail[] = questions.map((q) => {
    const recorded = answerByQuestion.get(q.id);
    const selectedOptions = recorded?.selected_option_ids
      ? (typeof recorded.selected_option_ids === "string"
          ? JSON.parse(recorded.selected_option_ids)
          : recorded.selected_option_ids)
      : [];

    return {
      id: recorded?.id || generateId(),
      attempt_id: attemptId,
      question_id: q.id,
      question_text: q.question,
      question_type: (q.question_type as any) || "single",
      case_vignette: q.case_vignette || null,
      selected_option_ids: selectedOptions,
      text_answer: recorded?.text_answer || null,
      correct_option_ids: correctOptionsByQuestion.get(q.id) || [],
      options: optionsByQuestion.get(q.id) || [],
      is_correct: recorded?.is_correct ?? null,
      points_awarded: recorded?.points_awarded !== undefined ? Number(recorded.points_awarded) : null,
      max_points: Number(q.points) || 1,
      feedback: recorded?.feedback || null,
      explanation: q.explanation || null,
    };
  });

  return {
    id: row.id,
    quiz_id: row.quiz_id,
    quiz_title: row.quiz_title,
    course_id: row.course_id,
    course_title: row.course_title,
    user_id: row.user_id,
    student_name: row.student_name || "Healthcare Learner",
    student_email: row.student_email || "",
    student_image: row.student_image || null,
    score: Number(row.score) || 0,
    percentage: Number(row.percentage) || 0,
    passed: Boolean(row.passed),
    total_questions: Number(row.total_questions) || 0,
    correct_answers: Number(row.correct_answers) || 0,
    incorrect_answers: Number(row.incorrect_answers) || 0,
    attempt_number: Number(row.attempt_number) || 1,
    time_taken_seconds: row.time_taken_seconds ? Number(row.time_taken_seconds) : null,
    submitted_at: new Date(row.submitted_at).toISOString(),
    evaluated_at: row.evaluated_at ? new Date(row.evaluated_at).toISOString() : null,
    evaluated_by: row.evaluated_by || null,
    instructor_feedback: row.instructor_feedback || null,
    status: (row.status as any) || "evaluated",
    answers,
  };
}

export async function evaluateSubjectiveSubmission(
  attemptId: string,
  instructorId: string,
  data: {
    instructorFeedback?: string;
    questionGrades?: {
      questionId: string;
      pointsAwarded: number;
      feedback?: string;
      isCorrect?: boolean;
    }[];
    passedOverride?: boolean;
  }
): Promise<void> {
  await ensureInstructorTables();

  const submission = await db
    .selectFrom("quiz_attempts as qa")
    .innerJoin("quizzes as q", "q.id", "qa.quiz_id")
    .innerJoin("courses as c", "c.id", "q.course_id")
    .select(["qa.id", "qa.quiz_id", "qa.total_questions", "q.passing_score"])
    .where("qa.id", "=", attemptId)
    .where("c.instructor_id", "=", instructorId)
    .executeTakeFirst();

  if (!submission) throw new Error("Submission not found or unauthorized");

  const now = new Date();

  // Update question grades
  let totalScore = 0;
  let correctCount = 0;

  if (Array.isArray(data.questionGrades) && data.questionGrades.length > 0) {
    for (const grade of data.questionGrades) {
      const existing = await db
        .selectFrom("quiz_attempt_answers")
        .select(["id"])
        .where("attempt_id", "=", attemptId)
        .where("question_id", "=", grade.questionId)
        .executeTakeFirst();

      const isCorrect = grade.isCorrect ?? (grade.pointsAwarded > 0);
      if (isCorrect) correctCount++;
      totalScore += Number(grade.pointsAwarded);

      if (existing) {
        await db
          .updateTable("quiz_attempt_answers")
          .set({
            points_awarded: grade.pointsAwarded,
            is_correct: isCorrect,
            feedback: grade.feedback?.trim() || null,
            evaluated_at: now,
          })
          .where("id", "=", existing.id)
          .execute();
      } else {
        await db
          .insertInto("quiz_attempt_answers")
          .values({
            id: generateId(),
            attempt_id: attemptId,
            question_id: grade.questionId,
            points_awarded: grade.pointsAwarded,
            is_correct: isCorrect,
            feedback: grade.feedback?.trim() || null,
            evaluated_at: now,
          })
          .execute();
      }
    }
  }

  const totalQuestions = Number(submission.total_questions) || 1;
  const percentage = Number(((correctCount / totalQuestions) * 100).toFixed(2));
  const passingScore = Number(submission.passing_score) || 70;
  const passed = data.passedOverride !== undefined ? data.passedOverride : percentage >= passingScore;

  await db
    .updateTable("quiz_attempts")
    .set({
      score: totalScore > 0 ? totalScore : correctCount,
      percentage,
      passed,
      correct_answers: correctCount,
      incorrect_answers: totalQuestions - correctCount,
      evaluated_at: now,
      evaluated_by: instructorId,
      instructor_feedback: data.instructorFeedback?.trim() || null,
      status: "evaluated",
    })
    .where("id", "=", attemptId)
    .execute();
}

// ─────────────────────────────────────────────
// 5. HIERARCHICAL CURRICULUM / FOLDERS / LECTURES
// ─────────────────────────────────────────────

export async function getCourseCurriculumHierarchy(courseId: string): Promise<{
  modules: {
    id: string;
    course_id: string;
    title: string;
    description?: string | null;
    order_index: number;
    lessons: any[];
  }[];
}> {
  await ensureInstructorTables();

  const modules = await db
    .selectFrom("course_modules")
    .selectAll()
    .where("course_id", "=", courseId)
    .orderBy("order_index", "asc")
    .execute();

  const moduleIds = modules.map((m) => m.id);

  let lessons: any[] = [];
  if (moduleIds.length > 0) {
    lessons = await db
      .selectFrom("course_lessons")
      .selectAll()
      .where("module_id", "in", moduleIds)
      .orderBy("order_index", "asc")
      .execute();
  }

  const lessonsByModule = new Map<string, any[]>();
  for (const l of lessons) {
    const list = lessonsByModule.get(l.module_id) || [];
    list.push({
      id: l.id,
      module_id: l.module_id,
      course_id: l.course_id,
      title: l.title,
      description: l.description,
      lesson_type: l.lesson_type,
      content: l.content,
      media_url: l.media_url,
      duration_seconds: Number(l.duration_seconds) || 0,
      order_index: Number(l.order_index) || 0,
      is_preview: Boolean(l.is_preview),
      created_at: new Date(l.created_at).toISOString(),
    });
    lessonsByModule.set(l.module_id, list);
  }

  return {
    modules: modules.map((m) => ({
      id: m.id,
      course_id: m.course_id,
      title: m.title,
      description: m.description,
      order_index: Number(m.order_index) || 0,
      lessons: lessonsByModule.get(m.id) || [],
    })),
  };
}

export async function updateCourseFull(
  courseId: string,
  instructorId: string,
  data: Partial<CreateCourseInput & { status: CourseStatus }>
): Promise<void> {
  await ensureInstructorTables();

  const course = await db
    .selectFrom("courses")
    .select(["id"])
    .where("id", "=", courseId)
    .where("instructor_id", "=", instructorId)
    .executeTakeFirst();

  if (!course) throw new Error("Course not found or unauthorized");

  const updates: any = { updated_at: new Date() };

  if (data.title !== undefined) updates.title = data.title.trim();
  if (data.short_description !== undefined) updates.short_description = data.short_description.trim() || null;
  if (data.description !== undefined) updates.description = data.description.trim() || null;
  if (data.thumbnail !== undefined) updates.thumbnail = data.thumbnail.trim() || null;
  if (data.category !== undefined) updates.category = data.category;
  if (data.subcategory !== undefined) updates.subcategory = data.subcategory.trim() || null;
  if (data.profession !== undefined) updates.profession = data.profession;
  if (data.specialization !== undefined) updates.specialization = data.specialization.trim() || null;
  if (data.level !== undefined) updates.level = data.level;
  if (data.language !== undefined) updates.language = data.language;
  if (data.is_free !== undefined) updates.is_free = Boolean(data.is_free);
  if (data.price !== undefined) updates.price = Number(data.price) || 0;
  if (data.discount_price !== undefined) updates.discount_price = Number(data.discount_price) || null;
  if (data.certificate_enabled !== undefined) updates.certificate_enabled = Boolean(data.certificate_enabled);
  if (data.accreditation !== undefined) updates.accreditation = data.accreditation.trim() || null;
  if (data.subscription_tier !== undefined) updates.subscription_tier = data.subscription_tier || null;
  if (data.bundle_access !== undefined) updates.bundle_access = Boolean(data.bundle_access);
  if (data.status !== undefined) updates.status = data.status;

  await db
    .updateTable("courses")
    .set(updates)
    .where("id", "=", courseId)
    .execute();
}

export async function deleteCourseFull(courseId: string, instructorId: string): Promise<void> {
  await ensureInstructorTables();

  const course = await db
    .selectFrom("courses")
    .select(["id"])
    .where("id", "=", courseId)
    .where("instructor_id", "=", instructorId)
    .executeTakeFirst();

  if (!course) throw new Error("Course not found or unauthorized");

  // Cascading deletes
  await db.deleteFrom("learn_batches").where("course_id", "=", courseId).execute();
  await db.deleteFrom("quizzes").where("course_id", "=", courseId).execute();
  await db.deleteFrom("course_resources").where("course_id", "=", courseId).execute();
  await db.deleteFrom("course_lessons").where("course_id", "=", courseId).execute();
  await db.deleteFrom("course_modules").where("course_id", "=", courseId).execute();
  await db.deleteFrom("course_enrollments").where("course_id", "=", courseId).execute();
  await db.deleteFrom("courses").where("id", "=", courseId).execute();
}
