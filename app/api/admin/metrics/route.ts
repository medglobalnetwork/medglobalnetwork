import { NextRequest, NextResponse } from "next/server";
import { database } from "@/lib/auth";
import { sql } from "kysely";
import { getAdminSession, hasPermission } from "@/modules/admin/lib/rbac";

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminSession(req.headers);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
    }

    // 1. Total users
    let totalUsers = 0;
    try {
      const uRes: any = await sql`SELECT COUNT(*) as count FROM "user"`.execute(database);
      totalUsers = parseInt(uRes?.rows?.[0]?.count || "0", 10);
    } catch {
      totalUsers = 1;
    }

    // 2. Professional Profiles & Verification stats
    let totalProfessionals = 0;
    let verifiedDoctors = 0;
    let pendingVerification = 0;

    try {
      const pRes: any = await sql`
        SELECT 
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE identity_verified = true OR registration_verified = true) as verified,
          COUNT(*) FILTER (WHERE registration_number IS NOT NULL AND (registration_verified = false OR registration_verified IS NULL)) as pending
        FROM professional_profiles
      `.execute(database);

      if (pRes?.rows?.[0]) {
        totalProfessionals = parseInt(pRes.rows[0].total || "0", 10);
        verifiedDoctors = parseInt(pRes.rows[0].verified || "0", 10);
        pendingVerification = parseInt(pRes.rows[0].pending || "0", 10);
      }
    } catch {
      // fallback
    }

    // 3. Courses stats
    let totalCourses = 0;
    let totalEnrollments = 0;
    try {
      const cRes: any = await sql`
        SELECT 
          (SELECT COUNT(*) FROM courses WHERE status = 'published') as courses_count,
          (SELECT COUNT(*) FROM course_enrollments) as enrollments_count
      `.execute(database);
      if (cRes?.rows?.[0]) {
        totalCourses = parseInt(cRes.rows[0].courses_count || "0", 10);
        totalEnrollments = parseInt(cRes.rows[0].enrollments_count || "0", 10);
      }
    } catch {
      // fallback
    }

    // 4. Jobs & Opportunities
    let totalJobs = 0;
    let totalApplications = 0;
    try {
      const jRes: any = await sql`
        SELECT 
          (SELECT COUNT(*) FROM jobs WHERE status = 'active') as jobs_count,
          (SELECT COUNT(*) FROM job_applications) as applications_count
      `.execute(database);
      if (jRes?.rows?.[0]) {
        totalJobs = parseInt(jRes.rows[0].jobs_count || "0", 10);
        totalApplications = parseInt(jRes.rows[0].applications_count || "0", 10);
      }
    } catch {
      // fallback
    }

    // 5. Moderation Reports
    let openReports = 0;
    try {
      const mRes: any = await sql`
        SELECT COUNT(*) as count FROM admin_moderation_reports WHERE status = 'pending'
      `.execute(database);
      openReports = parseInt(mRes?.rows?.[0]?.count || "0", 10);
    } catch {
      // fallback
    }

    // 6. Recent Audit Activity
    let recentAudits = [];
    try {
      const aRes: any = await sql`
        SELECT * FROM admin_audit_logs ORDER BY created_at DESC LIMIT 5
      `.execute(database);
      recentAudits = aRes?.rows || [];
    } catch {
      // fallback
    }

    return NextResponse.json({
      metrics: {
        totalUsers,
        totalProfessionals,
        verifiedDoctors,
        pendingVerification,
        totalCourses,
        totalEnrollments,
        totalJobs,
        totalApplications,
        openReports,
      },
      recentAudits,
      admin: {
        email: admin.email,
        roles: admin.roles,
        isSuperAdmin: admin.isSuperAdmin,
      },
    });
  } catch (error: any) {
    console.error("Error in admin metrics API:", error);
    return NextResponse.json({ error: error.message || "Failed to load admin metrics" }, { status: 500 });
  }
}
