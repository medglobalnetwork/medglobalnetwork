import { NextRequest, NextResponse } from "next/server";
import { database } from "@/lib/auth";
import { sql } from "kysely";
import { getAdminSession, hasPermission } from "@/modules/admin/lib/rbac";
import { recordAuditLog } from "@/modules/admin/lib/audit";

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminSession(req.headers);
    if (!admin || !hasPermission(admin, "courses.read")) {
      return NextResponse.json({ error: "Unauthorized. Permission courses.read required." }, { status: 403 });
    }

    const coursesRes: any = await sql`
      SELECT 
        c.id, c.title, c.slug, c.category, c.profession, c.level, c.price, c.currency,
        c.is_free, c.status, c.enrollment_count, c.rating_avg, c.published_at, c.created_at,
        u.name as instructor_name,
        u.email as instructor_email
      FROM courses c
      LEFT JOIN "user" u ON u.id = c.instructor_id
      ORDER BY c.created_at DESC
      LIMIT 100
    `.execute(database);

    const statsRes: any = await sql`
      SELECT 
        (SELECT COUNT(*) FROM courses) as total_courses,
        (SELECT COUNT(*) FROM courses WHERE status = 'published') as published_courses,
        (SELECT COUNT(*) FROM course_enrollments) as total_enrollments,
        (SELECT COUNT(*) FROM certificates) as total_certificates
    `.execute(database);

    return NextResponse.json({
      courses: coursesRes?.rows || [],
      stats: statsRes?.rows?.[0] || {},
    });
  } catch (error: any) {
    console.error("Error in admin learn API:", error);
    return NextResponse.json({ error: error.message || "Failed to load learn data" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = await getAdminSession(req.headers);
    if (!admin || !hasPermission(admin, "courses.publish")) {
      return NextResponse.json({ error: "Unauthorized. Permission courses.publish required." }, { status: 403 });
    }

    const body = await req.json();
    const { courseId, status, reason } = body;

    await sql`
      UPDATE courses 
      SET status = ${status}, updated_at = NOW(), published_at = CASE WHEN ${status} = 'published' THEN NOW() ELSE published_at END
      WHERE id = ${courseId}
    `.execute(database);

    await recordAuditLog({
      admin,
      action: `course.status_changed_${status}`,
      entityType: "course",
      entityId: courseId,
      newState: { status },
      reason,
    });

    return NextResponse.json({ success: true, message: `Course status updated to ${status}` });
  } catch (error: any) {
    console.error("Error updating course:", error);
    return NextResponse.json({ error: error.message || "Failed to update course" }, { status: 500 });
  }
}
