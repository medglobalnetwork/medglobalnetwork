// ============================================================
// MGN.life Phase 4: Learn Ecosystem — Database Interface
// modules/learn/lib/learn-db.ts
// ============================================================

import { database } from "@/lib/auth";
import { Kysely, sql } from "kysely";
import {
  Course,
  CourseModule,
  CourseLesson,
  CourseEnrollment,
  Certificate,
  Quiz,
  QuizAttempt,
  CourseFilterParams,
  CreateCourseInput,
  SubmitQuizAnswerInput,
} from "../types";
import { generateId } from "@/modules/network/lib/network-db";

// ─────────────────────────────────────────────
// TABLE INTERFACES
// ─────────────────────────────────────────────

export interface CourseTable {
  id: string;
  instructor_id: string;
  organization_id: string | null;
  title: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  thumbnail: string | null;
  category: string;
  subcategory: string | null;
  profession: string | null;
  specialization: string | null;
  level: string | null;
  language: string | null;
  duration_minutes: number;
  price: number;
  currency: string;
  is_free: boolean;
  certificate_enabled: boolean;
  status: string;
  enrollment_count: number;
  rating_avg: number;
  rating_count: number;
  published_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface CourseModuleTable {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  order_index: number;
  created_at: Date;
  updated_at: Date;
}

export interface CourseLessonTable {
  id: string;
  module_id: string;
  course_id: string;
  title: string;
  description: string | null;
  lesson_type: string;
  content: string | null;
  media_url: string | null;
  duration_seconds: number;
  order_index: number;
  is_preview: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CourseResourceTable {
  id: string;
  lesson_id: string | null;
  course_id: string;
  title: string;
  file_url: string;
  file_type: string | null;
  file_size_bytes: number | null;
  created_at: Date;
}

export interface CourseEnrollmentTable {
  id: string;
  course_id: string;
  user_id: string;
  enrolled_at: Date;
  completed_at: Date | null;
  status: string;
  progress_percentage: number;
  last_lesson_id: string | null;
  last_accessed_at: Date;
}

export interface LessonProgressTable {
  id: string;
  user_id: string;
  lesson_id: string;
  course_id: string;
  progress_percentage: number;
  last_position_seconds: number;
  completed: boolean;
  completed_at: Date | null;
  updated_at: Date;
}

export interface QuizTable {
  id: string;
  lesson_id: string | null;
  course_id: string;
  title: string;
  description: string | null;
  passing_score: number;
  time_limit_minutes: number;
  max_attempts: number;
  status: string;
  created_at: Date;
  updated_at: Date;
}

export interface QuizQuestionTable {
  id: string;
  quiz_id: string;
  question: string;
  question_type: string;
  explanation: string | null;
  order_index: number;
}

export interface QuizOptionTable {
  id: string;
  question_id: string;
  option_text: string;
  is_correct: boolean;
  order_index: number;
}

export interface QuizAttemptTable {
  id: string;
  quiz_id: string;
  user_id: string;
  score: number;
  percentage: number;
  passed: boolean;
  total_questions: number;
  correct_answers: number;
  incorrect_answers: number;
  attempt_number: number;
  submitted_at: Date;
}

export interface CertificateTable {
  id: string;
  certificate_number: string;
  user_id: string;
  course_id: string;
  issued_at: Date;
  completion_date: Date;
  verification_code: string;
  metadata: any | null;
  status: string;
}

export interface LearnDatabase {
  courses: CourseTable;
  course_modules: CourseModuleTable;
  course_lessons: CourseLessonTable;
  course_resources: CourseResourceTable;
  course_enrollments: CourseEnrollmentTable;
  lesson_progress: LessonProgressTable;
  quizzes: QuizTable;
  quiz_questions: QuizQuestionTable;
  quiz_options: QuizOptionTable;
  quiz_attempts: QuizAttemptTable;
  certificates: CertificateTable;
  user: {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    image: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
  professional_profiles: {
    id: string;
    user_id: string;
    profession: string | null;
    specialization: string | null;
    designation: string | null;
    organization: string | null;
    identity_verified: boolean;
    education_verified: boolean;
    registration_verified: boolean;
  };
}

export const learnDb = database as unknown as Kysely<LearnDatabase>;

// ─────────────────────────────────────────────
// COURSE DISCOVERY & SEARCH
// ─────────────────────────────────────────────
export async function searchCourses(
  params: CourseFilterParams,
  currentUserId?: string
): Promise<{ courses: Course[]; total: number }> {
  const page = Math.max(1, params.page || 1);
  const pageSize = Math.min(50, params.pageSize || 12);
  const offset = (page - 1) * pageSize;

  let query = learnDb
    .selectFrom("courses as c")
    .innerJoin("user as u", "u.id", "c.instructor_id")
    .leftJoin("professional_profiles as pp", "pp.user_id", "c.instructor_id")
    .where("c.status", "=", "published");

  if (params.query?.trim()) {
    const q = `%${params.query.trim()}%`;
    query = query.where((eb) =>
      eb.or([
        eb("c.title", "ilike", q),
        eb("c.short_description", "ilike", q),
        eb("c.category", "ilike", q),
        eb("u.name", "ilike", q),
      ])
    );
  }

  if (params.category && params.category !== "All") {
    query = query.where("c.category", "=", params.category);
  }

  if (params.profession && params.profession !== "All") {
    query = query.where("c.profession", "=", params.profession);
  }

  if (params.specialization) {
    query = query.where("c.specialization", "=", params.specialization);
  }

  if (params.level && params.level !== "all_levels") {
    query = query.where("c.level", "=", params.level);
  }

  if (params.is_free !== undefined) {
    query = query.where("c.is_free", "=", params.is_free);
  }

  if (params.certificate_enabled !== undefined) {
    query = query.where("c.certificate_enabled", "=", params.certificate_enabled);
  }

  // Count query
  const countResult = await query
    .select(sql<string>`count(*)`.as("count"))
    .executeTakeFirst();
  const total = parseInt(countResult?.count || "0", 10);

  // Sorting
  if (params.sort === "newest") {
    query = query.orderBy("c.created_at", "desc");
  } else if (params.sort === "rating") {
    query = query.orderBy("c.rating_avg", "desc");
  } else if (params.sort === "duration") {
    query = query.orderBy("c.duration_minutes", "asc");
  } else {
    // Default popular
    query = query.orderBy("c.enrollment_count", "desc").orderBy("c.created_at", "desc");
  }

  const rawCourses = await query
    .select([
      "c.id",
      "c.instructor_id",
      "c.organization_id",
      "c.title",
      "c.slug",
      "c.short_description",
      "c.description",
      "c.thumbnail",
      "c.category",
      "c.subcategory",
      "c.profession",
      "c.specialization",
      "c.level",
      "c.language",
      "c.duration_minutes",
      "c.price",
      "c.currency",
      "c.is_free",
      "c.certificate_enabled",
      "c.status",
      "c.enrollment_count",
      "c.rating_avg",
      "c.rating_count",
      "c.published_at",
      "c.created_at",
      "c.updated_at",
      "u.name as instructor_name",
      "u.email as instructor_email",
      "u.image as instructor_image",
      "pp.profession as instructor_profession",
      "pp.specialization as instructor_specialization",
      "pp.designation as instructor_designation",
      "pp.organization as instructor_organization",
      "pp.identity_verified as instructor_identity_verified",
      "pp.education_verified as instructor_education_verified",
      "pp.registration_verified as instructor_registration_verified",
    ])
    .limit(pageSize)
    .offset(offset)
    .execute();

  // If user is authenticated, check enrollments & progress
  let enrollmentMap = new Map<string, { progress: number }>();
  if (currentUserId && rawCourses.length > 0) {
    const courseIds = rawCourses.map((c) => c.id);
    const enrollments = await learnDb
      .selectFrom("course_enrollments")
      .select(["course_id", "progress_percentage"])
      .where("user_id", "=", currentUserId)
      .where("course_id", "in", courseIds)
      .execute();
    for (const e of enrollments) {
      enrollmentMap.set(e.course_id, { progress: e.progress_percentage });
    }
  }

  const courses: Course[] = rawCourses.map((r) => ({
    id: r.id,
    instructor_id: r.instructor_id,
    organization_id: r.organization_id,
    title: r.title,
    slug: r.slug,
    short_description: r.short_description,
    description: r.description,
    thumbnail: r.thumbnail,
    category: r.category,
    subcategory: r.subcategory,
    profession: r.profession,
    specialization: r.specialization,
    level: (r.level as any) || "all_levels",
    language: r.language || "English",
    duration_minutes: Number(r.duration_minutes) || 0,
    price: Number(r.price) || 0,
    currency: r.currency || "INR",
    is_free: r.is_free,
    certificate_enabled: r.certificate_enabled,
    status: (r.status as any) || "published",
    enrollment_count: Number(r.enrollment_count) || 0,
    rating_avg: Number(r.rating_avg) || 0,
    rating_count: Number(r.rating_count) || 0,
    published_at: r.published_at ? r.published_at.toISOString() : null,
    created_at: r.created_at.toISOString(),
    updated_at: r.updated_at.toISOString(),
    instructor: {
      id: r.instructor_id,
      name: r.instructor_name,
      email: r.instructor_email,
      image: r.instructor_image,
      profession: r.instructor_profession,
      specialization: r.instructor_specialization,
      designation: r.instructor_designation,
      organization: r.instructor_organization,
      identity_verified: r.instructor_identity_verified || false,
      education_verified: r.instructor_education_verified || false,
      registration_verified: r.instructor_registration_verified || false,
    },
    user_enrolled: enrollmentMap.has(r.id),
    user_progress: enrollmentMap.get(r.id)?.progress || 0,
  }));

  return { courses, total };
}

// ─────────────────────────────────────────────
// GET COURSE BY ID OR SLUG
// ─────────────────────────────────────────────
export async function getCourseDetails(
  courseIdOrSlug: string,
  currentUserId?: string
): Promise<Course | null> {
  const isId = courseIdOrSlug.length <= 64 && !courseIdOrSlug.includes(" ");

  let query = learnDb
    .selectFrom("courses as c")
    .innerJoin("user as u", "u.id", "c.instructor_id")
    .leftJoin("professional_profiles as pp", "pp.user_id", "c.instructor_id");

  if (isId) {
    query = query.where((eb) =>
      eb.or([eb("c.id", "=", courseIdOrSlug), eb("c.slug", "=", courseIdOrSlug)])
    );
  } else {
    query = query.where("c.slug", "=", courseIdOrSlug);
  }

  const raw = await query
    .select([
      "c.id",
      "c.instructor_id",
      "c.organization_id",
      "c.title",
      "c.slug",
      "c.short_description",
      "c.description",
      "c.thumbnail",
      "c.category",
      "c.subcategory",
      "c.profession",
      "c.specialization",
      "c.level",
      "c.language",
      "c.duration_minutes",
      "c.price",
      "c.currency",
      "c.is_free",
      "c.certificate_enabled",
      "c.status",
      "c.enrollment_count",
      "c.rating_avg",
      "c.rating_count",
      "c.published_at",
      "c.created_at",
      "c.updated_at",
      "u.name as instructor_name",
      "u.email as instructor_email",
      "u.image as instructor_image",
      "pp.profession as instructor_profession",
      "pp.specialization as instructor_specialization",
      "pp.designation as instructor_designation",
      "pp.organization as instructor_organization",
      "pp.identity_verified as instructor_identity_verified",
      "pp.education_verified as instructor_education_verified",
      "pp.registration_verified as instructor_registration_verified",
    ])
    .executeTakeFirst();

  if (!raw) return null;

  // Count modules & lessons
  const moduleCountRes = await learnDb
    .selectFrom("course_modules")
    .select(sql<string>`count(*)`.as("count"))
    .where("course_id", "=", raw.id)
    .executeTakeFirst();

  const lessonCountRes = await learnDb
    .selectFrom("course_lessons")
    .select(sql<string>`count(*)`.as("count"))
    .where("course_id", "=", raw.id)
    .executeTakeFirst();

  let userEnrolled = false;
  let userProgress = 0;

  if (currentUserId) {
    const enrollment = await learnDb
      .selectFrom("course_enrollments")
      .select(["progress_percentage"])
      .where("user_id", "=", currentUserId)
      .where("course_id", "=", raw.id)
      .executeTakeFirst();

    if (enrollment) {
      userEnrolled = true;
      userProgress = enrollment.progress_percentage;
    }
  }

  return {
    id: raw.id,
    instructor_id: raw.instructor_id,
    organization_id: raw.organization_id,
    title: raw.title,
    slug: raw.slug,
    short_description: raw.short_description,
    description: raw.description,
    thumbnail: raw.thumbnail,
    category: raw.category,
    subcategory: raw.subcategory,
    profession: raw.profession,
    specialization: raw.specialization,
    level: (raw.level as any) || "all_levels",
    language: raw.language || "English",
    duration_minutes: Number(raw.duration_minutes) || 0,
    price: Number(raw.price) || 0,
    currency: raw.currency || "INR",
    is_free: raw.is_free,
    certificate_enabled: raw.certificate_enabled,
    status: (raw.status as any) || "published",
    enrollment_count: Number(raw.enrollment_count) || 0,
    rating_avg: Number(raw.rating_avg) || 0,
    rating_count: Number(raw.rating_count) || 0,
    published_at: raw.published_at ? raw.published_at.toISOString() : null,
    created_at: raw.created_at.toISOString(),
    updated_at: raw.updated_at.toISOString(),
    instructor: {
      id: raw.instructor_id,
      name: raw.instructor_name,
      email: raw.instructor_email,
      image: raw.instructor_image,
      profession: raw.instructor_profession,
      specialization: raw.instructor_specialization,
      designation: raw.instructor_designation,
      organization: raw.instructor_organization,
      identity_verified: raw.instructor_identity_verified || false,
      education_verified: raw.instructor_education_verified || false,
      registration_verified: raw.instructor_registration_verified || false,
    },
    module_count: parseInt(moduleCountRes?.count || "0", 10),
    lesson_count: parseInt(lessonCountRes?.count || "0", 10),
    user_enrolled: userEnrolled,
    user_progress: userProgress,
  };
}

// ─────────────────────────────────────────────
// GET CURRICULUM TREE (Modules + Lessons)
// ─────────────────────────────────────────────
export async function getCourseCurriculum(
  courseId: string,
  currentUserId?: string
): Promise<CourseModule[]> {
  const rawModules = await learnDb
    .selectFrom("course_modules")
    .selectAll()
    .where("course_id", "=", courseId)
    .orderBy("order_index", "asc")
    .execute();

  if (rawModules.length === 0) return [];

  const rawLessons = await learnDb
    .selectFrom("course_lessons")
    .selectAll()
    .where("course_id", "=", courseId)
    .orderBy("order_index", "asc")
    .execute();

  // If user is logged in, fetch lesson progress
  let progressMap = new Map<string, { completed: boolean; position: number }>();
  if (currentUserId) {
    const progressList = await learnDb
      .selectFrom("lesson_progress")
      .select(["lesson_id", "completed", "last_position_seconds"])
      .where("user_id", "=", currentUserId)
      .where("course_id", "=", courseId)
      .execute();

    for (const p of progressList) {
      progressMap.set(p.lesson_id, {
        completed: p.completed,
        position: p.last_position_seconds,
      });
    }
  }

  // Group lessons by module_id
  const lessonsByModule = new Map<string, CourseLesson[]>();
  for (const l of rawLessons) {
    const p = progressMap.get(l.id);
    const item: CourseLesson = {
      id: l.id,
      module_id: l.module_id,
      course_id: l.course_id,
      title: l.title,
      description: l.description,
      lesson_type: (l.lesson_type as any) || "video",
      content: l.content,
      media_url: l.media_url,
      duration_seconds: l.duration_seconds || 0,
      order_index: l.order_index,
      is_preview: l.is_preview,
      created_at: l.created_at.toISOString(),
      updated_at: l.updated_at.toISOString(),
      completed: p?.completed || false,
      last_position_seconds: p?.position || 0,
    };

    const list = lessonsByModule.get(l.module_id) || [];
    list.push(item);
    lessonsByModule.set(l.module_id, list);
  }

  return rawModules.map((m) => ({
    id: m.id,
    course_id: m.course_id,
    title: m.title,
    description: m.description,
    order_index: m.order_index,
    created_at: m.created_at.toISOString(),
    updated_at: m.updated_at.toISOString(),
    lessons: lessonsByModule.get(m.id) || [],
  }));
}

// ─────────────────────────────────────────────
// ENROLL USER IN COURSE
// ─────────────────────────────────────────────
export async function enrollUser(courseId: string, userId: string): Promise<string> {
  const enrollmentId = generateId();
  const now = new Date();

  await learnDb
    .insertInto("course_enrollments")
    .values({
      id: enrollmentId,
      course_id: courseId,
      user_id: userId,
      enrolled_at: now,
      completed_at: null,
      status: "active",
      progress_percentage: 0,
      last_lesson_id: null,
      last_accessed_at: now,
    })
    .onConflict((oc) => oc.columns(["course_id", "user_id"]).doNothing())
    .execute();

  // Increment course enrollment count
  await learnDb
    .updateTable("courses")
    .set({
      enrollment_count: sql`enrollment_count + 1`,
      updated_at: now,
    })
    .where("id", "=", courseId)
    .execute();

  return enrollmentId;
}

// ─────────────────────────────────────────────
// UPDATE LESSON PROGRESS
// ─────────────────────────────────────────────
export async function updateLessonProgress({
  userId,
  lessonId,
  courseId,
  progressPercentage,
  lastPositionSeconds,
  completed,
}: {
  userId: string;
  lessonId: string;
  courseId: string;
  progressPercentage: number;
  lastPositionSeconds: number;
  completed: boolean;
}): Promise<void> {
  const now = new Date();

  // Upsert lesson progress
  await learnDb
    .insertInto("lesson_progress")
    .values({
      id: generateId(),
      user_id: userId,
      lesson_id: lessonId,
      course_id: courseId,
      progress_percentage: Math.min(100, Math.max(0, progressPercentage)),
      last_position_seconds: lastPositionSeconds,
      completed,
      completed_at: completed ? now : null,
      updated_at: now,
    })
    .onConflict((oc) =>
      oc.columns(["user_id", "lesson_id"]).doUpdateSet({
        progress_percentage: Math.min(100, Math.max(0, progressPercentage)),
        last_position_seconds: lastPositionSeconds,
        completed: sql`lesson_progress.completed OR ${completed}`,
        completed_at: completed ? now : sql`lesson_progress.completed_at`,
        updated_at: now,
      })
    )
    .execute();

  // Recalculate total course progress
  const totalLessonsRes = await learnDb
    .selectFrom("course_lessons")
    .select(sql<string>`count(*)`.as("count"))
    .where("course_id", "=", courseId)
    .executeTakeFirst();
  const totalLessons = parseInt(totalLessonsRes?.count || "0", 10);

  if (totalLessons > 0) {
    const completedLessonsRes = await learnDb
      .selectFrom("lesson_progress")
      .select(sql<string>`count(*)`.as("count"))
      .where("user_id", "=", userId)
      .where("course_id", "=", courseId)
      .where("completed", "=", true)
      .executeTakeFirst();
    const completedLessons = parseInt(completedLessonsRes?.count || "0", 10);

    const overallCourseProgress = Math.round((completedLessons / totalLessons) * 100);

    await learnDb
      .updateTable("course_enrollments")
      .set({
        progress_percentage: overallCourseProgress,
        last_lesson_id: lessonId,
        last_accessed_at: now,
      })
      .where("user_id", "=", userId)
      .where("course_id", "=", courseId)
      .execute();
  }
}

// ─────────────────────────────────────────────
// GET QUIZ FOR STUDENT (Strips is_correct)
// ─────────────────────────────────────────────
export async function getQuizForStudent(
  quizId: string,
  userId?: string
): Promise<Quiz | null> {
  const quiz = await learnDb
    .selectFrom("quizzes")
    .selectAll()
    .where("id", "=", quizId)
    .executeTakeFirst();

  if (!quiz) return null;

  const questions = await learnDb
    .selectFrom("quiz_questions")
    .selectAll()
    .where("quiz_id", "=", quizId)
    .orderBy("order_index", "asc")
    .execute();

  const questionIds = questions.map((q) => q.id);

  let optionsByQuestion = new Map<string, any[]>();
  if (questionIds.length > 0) {
    const rawOptions = await learnDb
      .selectFrom("quiz_options")
      .select(["id", "question_id", "option_text", "order_index"]) // Omit is_correct
      .where("question_id", "in", questionIds)
      .orderBy("order_index", "asc")
      .execute();

    for (const opt of rawOptions) {
      const list = optionsByQuestion.get(opt.question_id) || [];
      list.push(opt);
      optionsByQuestion.set(opt.question_id, list);
    }
  }

  let attemptsCount = 0;
  let userPassed = false;

  if (userId) {
    const attempts = await learnDb
      .selectFrom("quiz_attempts")
      .selectAll()
      .where("quiz_id", "=", quizId)
      .where("user_id", "=", userId)
      .execute();

    attemptsCount = attempts.length;
    userPassed = attempts.some((a) => a.passed);
  }

  return {
    id: quiz.id,
    lesson_id: quiz.lesson_id,
    course_id: quiz.course_id,
    title: quiz.title,
    description: quiz.description,
    passing_score: quiz.passing_score,
    time_limit_minutes: quiz.time_limit_minutes,
    max_attempts: quiz.max_attempts,
    status: quiz.status,
    created_at: quiz.created_at.toISOString(),
    updated_at: quiz.updated_at.toISOString(),
    questions: questions.map((q) => ({
      id: q.id,
      quiz_id: q.quiz_id,
      question: q.question,
      question_type: (q.question_type as any) || "single",
      explanation: q.explanation,
      order_index: q.order_index,
      options: optionsByQuestion.get(q.id) || [],
    })),
    user_attempts_count: attemptsCount,
    user_passed: userPassed,
  };
}

// ─────────────────────────────────────────────
// EVALUATE QUIZ ATTEMPT (Strict Server-Side Scoring)
// ─────────────────────────────────────────────
export async function evaluateQuizAttempt({
  quizId,
  userId,
  answers,
}: {
  quizId: string;
  userId: string;
  answers: SubmitQuizAnswerInput[];
}): Promise<QuizAttempt> {
  const quiz = await learnDb
    .selectFrom("quizzes")
    .selectAll()
    .where("id", "=", quizId)
    .executeTakeFirst();

  if (!quiz) throw new Error("Quiz not found");

  const questions = await learnDb
    .selectFrom("quiz_questions")
    .selectAll()
    .where("quiz_id", "=", quizId)
    .execute();

  const options = await learnDb
    .selectFrom("quiz_options")
    .selectAll()
    .where("question_id", "in", questions.map((q) => q.id))
    .execute();

  const correctOptionsByQuestion = new Map<string, Set<string>>();
  for (const opt of options) {
    if (opt.is_correct) {
      const set = correctOptionsByQuestion.get(opt.question_id) || new Set<string>();
      set.add(opt.id);
      correctOptionsByQuestion.set(opt.question_id, set);
    }
  }

  const answerMap = new Map<string, Set<string>>();
  for (const a of answers) {
    answerMap.set(a.question_id, new Set(a.selected_option_ids));
  }

  let correctCount = 0;
  for (const q of questions) {
    const correctSet = correctOptionsByQuestion.get(q.id) || new Set<string>();
    const userSet = answerMap.get(q.id) || new Set<string>();

    // Compare sets
    if (
      correctSet.size === userSet.size &&
      [...correctSet].every((id) => userSet.has(id))
    ) {
      correctCount++;
    }
  }

  const totalQuestions = questions.length;
  const incorrectCount = totalQuestions - correctCount;
  const percentage = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;
  const passed = percentage >= quiz.passing_score;

  // Get previous attempts count
  const prevAttemptsRes = await learnDb
    .selectFrom("quiz_attempts")
    .select(sql<string>`count(*)`.as("count"))
    .where("quiz_id", "=", quizId)
    .where("user_id", "=", userId)
    .executeTakeFirst();
  const attemptNumber = parseInt(prevAttemptsRes?.count || "0", 10) + 1;

  const attemptId = generateId();
  const now = new Date();

  await learnDb
    .insertInto("quiz_attempts")
    .values({
      id: attemptId,
      quiz_id: quizId,
      user_id: userId,
      score: correctCount,
      percentage: Number(percentage.toFixed(2)),
      passed,
      total_questions: totalQuestions,
      correct_answers: correctCount,
      incorrect_answers: incorrectCount,
      attempt_number: attemptNumber,
      submitted_at: now,
    })
    .execute();

  // If quiz is attached to a lesson and passed, mark lesson completed
  if (quiz.lesson_id && passed) {
    await updateLessonProgress({
      userId,
      lessonId: quiz.lesson_id,
      courseId: quiz.course_id,
      progressPercentage: 100,
      lastPositionSeconds: 0,
      completed: true,
    });
  }

  return {
    id: attemptId,
    quiz_id: quizId,
    user_id: userId,
    score: correctCount,
    percentage: Number(percentage.toFixed(2)),
    passed,
    total_questions: totalQuestions,
    correct_answers: correctCount,
    incorrect_answers: incorrectCount,
    attempt_number: attemptNumber,
    submitted_at: now.toISOString(),
  };
}

// ─────────────────────────────────────────────
// GET USER'S ENROLLMENTS & CERTIFICATES
// ─────────────────────────────────────────────
export async function getUserMyLearning(userId: string): Promise<{
  inProgress: CourseEnrollment[];
  completed: CourseEnrollment[];
  certificates: Certificate[];
}> {
  const enrollments = await learnDb
    .selectFrom("course_enrollments as ce")
    .innerJoin("courses as c", "c.id", "ce.course_id")
    .innerJoin("user as u", "u.id", "c.instructor_id")
    .select([
      "ce.id as enrollment_id",
      "ce.course_id",
      "ce.enrolled_at",
      "ce.completed_at",
      "ce.status as enrollment_status",
      "ce.progress_percentage",
      "ce.last_lesson_id",
      "ce.last_accessed_at",
      "c.title as course_title",
      "c.slug as course_slug",
      "c.thumbnail as course_thumbnail",
      "c.category as course_category",
      "c.duration_minutes as course_duration",
      "c.certificate_enabled",
      "u.name as instructor_name",
    ])
    .where("ce.user_id", "=", userId)
    .orderBy("ce.last_accessed_at", "desc")
    .execute();

  const certificatesRaw = await learnDb
    .selectFrom("certificates as cert")
    .innerJoin("courses as c", "c.id", "cert.course_id")
    .innerJoin("user as u", "u.id", "c.instructor_id")
    .select([
      "cert.id",
      "cert.certificate_number",
      "cert.user_id",
      "cert.course_id",
      "cert.issued_at",
      "cert.completion_date",
      "cert.verification_code",
      "cert.metadata",
      "cert.status",
      "c.title as course_title",
      "c.slug as course_slug",
      "c.thumbnail as course_thumbnail",
      "u.name as instructor_name",
    ])
    .where("cert.user_id", "=", userId)
    .orderBy("cert.issued_at", "desc")
    .execute();

  const inProgress: CourseEnrollment[] = [];
  const completed: CourseEnrollment[] = [];

  for (const e of enrollments) {
    const item: CourseEnrollment = {
      id: e.enrollment_id,
      course_id: e.course_id,
      user_id: userId,
      enrolled_at: e.enrolled_at.toISOString(),
      completed_at: e.completed_at ? e.completed_at.toISOString() : null,
      status: (e.enrollment_status as any) || "active",
      progress_percentage: Number(e.progress_percentage) || 0,
      last_lesson_id: e.last_lesson_id,
      last_accessed_at: e.last_accessed_at.toISOString(),
      course: {
        id: e.course_id,
        instructor_id: "",
        title: e.course_title,
        slug: e.course_slug,
        thumbnail: e.course_thumbnail,
        category: e.course_category,
        duration_minutes: Number(e.course_duration) || 0,
        certificate_enabled: e.certificate_enabled,
        level: "all_levels",
        language: "English",
        price: 0,
        currency: "INR",
        is_free: true,
        status: "published",
        enrollment_count: 0,
        rating_avg: 0,
        rating_count: 0,
        created_at: "",
        updated_at: "",
        instructor: {
          id: "",
          name: e.instructor_name,
          email: "",
          image: null,
        },
      },
    };

    if (e.enrollment_status === "completed" || e.progress_percentage === 100) {
      completed.push(item);
    } else {
      inProgress.push(item);
    }
  }

  const certificates: Certificate[] = certificatesRaw.map((c) => ({
    id: c.id,
    certificate_number: c.certificate_number,
    user_id: c.user_id,
    course_id: c.course_id,
    issued_at: c.issued_at.toISOString(),
    completion_date: c.completion_date.toISOString(),
    verification_code: c.verification_code,
    metadata: c.metadata,
    status: (c.status as any) || "valid",
    course: {
      id: c.course_id,
      instructor_id: "",
      title: c.course_title,
      slug: c.course_slug,
      thumbnail: c.course_thumbnail,
      category: "",
      duration_minutes: 0,
      certificate_enabled: true,
      level: "all_levels",
      language: "English",
      price: 0,
      currency: "INR",
      is_free: true,
      status: "published",
      enrollment_count: 0,
      rating_avg: 0,
      rating_count: 0,
      created_at: "",
      updated_at: "",
      instructor: {
        id: "",
        name: c.instructor_name,
        email: "",
        image: null,
      },
    },
  }));

  return { inProgress, completed, certificates };
}

// ─────────────────────────────────────────────
// GET CERTIFICATE BY VERIFICATION CODE (Public)
// ─────────────────────────────────────────────
export async function getCertificateByCode(code: string): Promise<Certificate | null> {
  const raw = await learnDb
    .selectFrom("certificates as cert")
    .innerJoin("courses as c", "c.id", "cert.course_id")
    .innerJoin("user as u", "u.id", "cert.user_id")
    .innerJoin("user as inst", "inst.id", "c.instructor_id")
    .leftJoin("professional_profiles as pp", "pp.user_id", "c.instructor_id")
    .select([
      "cert.id",
      "cert.certificate_number",
      "cert.user_id",
      "cert.course_id",
      "cert.issued_at",
      "cert.completion_date",
      "cert.verification_code",
      "cert.metadata",
      "cert.status",
      "u.name as student_name",
      "u.email as student_email",
      "c.title as course_title",
      "c.category as course_category",
      "c.duration_minutes as course_duration",
      "inst.name as instructor_name",
      "pp.designation as instructor_designation",
      "pp.organization as instructor_organization",
    ])
    .where("cert.verification_code", "=", code)
    .executeTakeFirst();

  if (!raw) return null;

  return {
    id: raw.id,
    certificate_number: raw.certificate_number,
    user_id: raw.user_id,
    course_id: raw.course_id,
    issued_at: raw.issued_at.toISOString(),
    completion_date: raw.completion_date.toISOString(),
    verification_code: raw.verification_code,
    metadata: raw.metadata || {
      student_name: raw.student_name,
      student_email: raw.student_email,
      course_title: raw.course_title,
      instructor_name: raw.instructor_name,
      instructor_designation: raw.instructor_designation || undefined,
      instructor_organization: raw.instructor_organization || undefined,
      duration_minutes: Number(raw.course_duration) || 0,
      completion_date: raw.completion_date.toISOString(),
    },
    status: (raw.status as any) || "valid",
    user: {
      id: raw.user_id,
      name: raw.student_name,
      email: raw.student_email,
    },
    course: {
      id: raw.course_id,
      instructor_id: "",
      title: raw.course_title,
      slug: "",
      category: raw.course_category,
      duration_minutes: Number(raw.course_duration) || 0,
      certificate_enabled: true,
      level: "all_levels",
      language: "English",
      price: 0,
      currency: "INR",
      is_free: true,
      status: "published",
      enrollment_count: 0,
      rating_avg: 0,
      rating_count: 0,
      created_at: "",
      updated_at: "",
      instructor: {
        id: "",
        name: raw.instructor_name,
        email: "",
        image: null,
      },
    },
  };
}

// ─────────────────────────────────────────────
// INSTRUCTOR ACTIONS (Create / Update Course)
// ─────────────────────────────────────────────
export function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-")
    .trim();
  return `${base}-${Math.random().toString(36).substring(2, 7)}`;
}

export async function createCourse(
  instructorId: string,
  input: CreateCourseInput
): Promise<string> {
  const id = generateId();
  const slug = generateSlug(input.title);
  const now = new Date();

  await learnDb
    .insertInto("courses")
    .values({
      id,
      instructor_id: instructorId,
      organization_id: null,
      title: input.title.trim(),
      slug,
      short_description: input.short_description || null,
      description: input.description || null,
      thumbnail: input.thumbnail || null,
      category: input.category,
      subcategory: input.subcategory || null,
      profession: input.profession || null,
      specialization: input.specialization || null,
      level: input.level || "all_levels",
      language: input.language || "English",
      duration_minutes: 0,
      price: input.price || 0,
      currency: "INR",
      is_free: input.is_free !== false,
      certificate_enabled: input.certificate_enabled !== false,
      status: "published",
      enrollment_count: 0,
      rating_avg: 0,
      rating_count: 0,
      published_at: now,
      created_at: now,
      updated_at: now,
    })
    .execute();

  return id;
}
