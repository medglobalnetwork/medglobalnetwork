// ============================================================
// MGN.life Phase 4: Learn Ecosystem — Course Completion Service
// modules/learn/lib/learn-completion-service.ts
// ============================================================

import { learnDb } from "./learn-db";
import { generateId, createNotification } from "@/modules/network/lib/network-db";
import { sql } from "kysely";

export async function checkAndProcessCourseCompletion({
  userId,
  courseId,
}: {
  userId: string;
  courseId: string;
}): Promise<{
  isCompleted: boolean;
  certificateId?: string;
  verificationCode?: string;
}> {
  try {
    // 1. Get total lessons in course
    const totalLessonsRes = await learnDb
      .selectFrom("course_lessons")
      .select(sql<string>`count(*)`.as("count"))
      .where("course_id", "=", courseId)
      .executeTakeFirst();
    const totalLessons = parseInt(totalLessonsRes?.count || "0", 10);

    if (totalLessons === 0) {
      return { isCompleted: false };
    }

    // 2. Get completed lessons for user
    const completedLessonsRes = await learnDb
      .selectFrom("lesson_progress")
      .select(sql<string>`count(*)`.as("count"))
      .where("user_id", "=", userId)
      .where("course_id", "=", courseId)
      .where("completed", "=", true)
      .executeTakeFirst();
    const completedLessons = parseInt(completedLessonsRes?.count || "0", 10);

    // If not all lessons completed, return early
    if (completedLessons < totalLessons) {
      return { isCompleted: false };
    }

    // 3. Check quizzes in this course
    const quizzes = await learnDb
      .selectFrom("quizzes")
      .select(["id", "passing_score"])
      .where("course_id", "=", courseId)
      .execute();

    if (quizzes.length > 0) {
      for (const q of quizzes) {
        const passedAttempt = await learnDb
          .selectFrom("quiz_attempts")
          .select(["id"])
          .where("quiz_id", "=", q.id)
          .where("user_id", "=", userId)
          .where("passed", "=", true)
          .executeTakeFirst();

        // If any required quiz is not passed, completion is blocked
        if (!passedAttempt) {
          return { isCompleted: false };
        }
      }
    }

    // 4. All requirements satisfied! Mark enrollment as completed
    const now = new Date();
    await learnDb
      .updateTable("course_enrollments")
      .set({
        status: "completed",
        progress_percentage: 100,
        completed_at: now,
        last_accessed_at: now,
      })
      .where("user_id", "=", userId)
      .where("course_id", "=", courseId)
      .execute();

    // 5. Fetch course details to check certificate enablement
    const course = await learnDb
      .selectFrom("courses as c")
      .innerJoin("user as u", "u.id", "c.instructor_id")
      .leftJoin("professional_profiles as pp", "pp.user_id", "c.instructor_id")
      .select([
        "c.id",
        "c.title",
        "c.duration_minutes",
        "c.certificate_enabled",
        "u.name as instructor_name",
        "pp.designation as instructor_designation",
        "pp.organization as instructor_organization",
      ])
      .where("c.id", "=", courseId)
      .executeTakeFirst();

    if (!course?.certificate_enabled) {
      return { isCompleted: true };
    }

    // Check if certificate already exists
    const existingCert = await learnDb
      .selectFrom("certificates")
      .select(["id", "verification_code"])
      .where("user_id", "=", userId)
      .where("course_id", "=", courseId)
      .executeTakeFirst();

    if (existingCert) {
      return {
        isCompleted: true,
        certificateId: existingCert.id,
        verificationCode: existingCert.verification_code,
      };
    }

    // 6. Generate verified certificate
    const certId = generateId();
    const certNumber = `MGN-CERT-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Date.now().toString().slice(-4)}`;
    const verificationCode = `VERIFY-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

    // Get user details
    const student = await learnDb
      .selectFrom("user as u")
      .leftJoin("professional_profiles as pp", "pp.user_id", "u.id")
      .select(["u.name", "u.email", "pp.profession"])
      .where("u.id", "=", userId)
      .executeTakeFirst();

    const metadata = {
      student_name: student?.name || "Healthcare Professional",
      student_email: student?.email || "",
      student_profession: student?.profession || "Clinician",
      course_title: course.title,
      instructor_name: course.instructor_name,
      instructor_designation: course.instructor_designation || undefined,
      instructor_organization: course.instructor_organization || undefined,
      duration_minutes: Number(course.duration_minutes) || 0,
      completion_date: now.toISOString(),
    };

    await learnDb
      .insertInto("certificates")
      .values({
        id: certId,
        certificate_number: certNumber,
        user_id: userId,
        course_id: courseId,
        issued_at: now,
        completion_date: now,
        verification_code: verificationCode,
        metadata: JSON.stringify(metadata) as any,
        status: "valid",
      })
      .onConflict((oc) => oc.columns(["user_id", "course_id"]).doNothing())
      .execute();

    // 7. Send In-App Notification
    await createNotification({
      userId,
      type: "course_completed",
      entityType: "certificate",
      entityId: certId,
      message: `🎉 Congratulations! You completed "${course.title}" and earned an accredited Certificate.`,
    });

    return {
      isCompleted: true,
      certificateId: certId,
      verificationCode,
    };
  } catch (error) {
    console.error("Error in checkAndProcessCourseCompletion:", error);
    return { isCompleted: false };
  }
}
