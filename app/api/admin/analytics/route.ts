import { NextRequest, NextResponse } from "next/server";
import { database } from "@/lib/auth";
import { sql } from "kysely";
import { getAdminSession, hasPermission } from "@/modules/admin/lib/rbac";

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminSession(req.headers);
    if (!admin || !hasPermission(admin, "analytics.read")) {
      return NextResponse.json(
        { error: "Unauthorized. Admin privileges with analytics.read permission required." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const daysParam = parseInt(searchParams.get("days") || "30", 10);
    const days = isNaN(daysParam) || daysParam <= 0 ? 30 : Math.min(daysParam, 365);

    const now = new Date();
    const periodStart = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const prevPeriodStart = new Date(now.getTime() - days * 2 * 24 * 60 * 60 * 1000);

    // 1. Core User Counts & Growth
    let totalUsers = 0;
    let newUsersPeriod = 0;
    let newUsersPrevPeriod = 0;
    try {
      const uRes: any = await sql`
        SELECT 
          COUNT(*)::INT as total,
          COUNT(*) FILTER (WHERE "createdAt" >= ${periodStart})::INT as new_period,
          COUNT(*) FILTER (WHERE "createdAt" >= ${prevPeriodStart} AND "createdAt" < ${periodStart})::INT as new_prev_period
        FROM "user"
      `.execute(database);

      if (uRes?.rows?.[0]) {
        totalUsers = parseInt(uRes.rows[0].total || "0", 10);
        newUsersPeriod = parseInt(uRes.rows[0].new_period || "0", 10);
        newUsersPrevPeriod = parseInt(uRes.rows[0].new_prev_period || "0", 10);
      }
    } catch (e) {
      console.warn("Analytics: Error querying user table:", e);
    }

    let userGrowthTrend = 0;
    if (newUsersPrevPeriod > 0) {
      userGrowthTrend = Math.round(((newUsersPeriod - newUsersPrevPeriod) / newUsersPrevPeriod) * 1000) / 10;
    } else if (newUsersPeriod > 0) {
      userGrowthTrend = 100;
    }

    // 2. Professional Profiles & Verification
    let totalProfessionals = 0;
    let verifiedDoctors = 0;
    let pendingVerification = 0;
    let avgVerificationHours = 0;

    try {
      const pRes: any = await sql`
        SELECT 
          COUNT(*)::INT as total,
          COUNT(*) FILTER (WHERE identity_verified = true OR registration_verified = true)::INT as verified,
          COUNT(*) FILTER (WHERE registration_number IS NOT NULL AND (registration_verified = false OR registration_verified IS NULL))::INT as pending,
          AVG(
            CASE 
              WHEN (identity_verified = true OR registration_verified = true) AND updated_at >= created_at 
              THEN EXTRACT(EPOCH FROM (updated_at - created_at)) / 3600 
              ELSE NULL 
            END
          )::FLOAT as avg_hours
        FROM professional_profiles
      `.execute(database);

      if (pRes?.rows?.[0]) {
        totalProfessionals = parseInt(pRes.rows[0].total || "0", 10);
        verifiedDoctors = parseInt(pRes.rows[0].verified || "0", 10);
        pendingVerification = parseInt(pRes.rows[0].pending || "0", 10);
        avgVerificationHours = Math.round(parseFloat(pRes.rows[0].avg_hours || "0") * 10) / 10;
      }
    } catch (e) {
      console.warn("Analytics: Error querying professional_profiles:", e);
    }

    const userConversionRate = totalUsers > 0
      ? Math.round((totalProfessionals / totalUsers) * 1000) / 10
      : 0;

    const doctorVerificationRate = totalProfessionals > 0
      ? Math.round((verifiedDoctors / totalProfessionals) * 1000) / 10
      : 0;

    // 3. Learn & Courses stats
    let totalCourses = 0;
    let publishedCourses = 0;
    let totalEnrollments = 0;
    let completedEnrollments = 0;
    let avgCourseProgress = 0;

    try {
      const cRes: any = await sql`
        SELECT 
          (SELECT COUNT(*)::INT FROM courses) as total_courses,
          (SELECT COUNT(*)::INT FROM courses WHERE status = 'published') as published_courses,
          (SELECT COUNT(*)::INT FROM course_enrollments) as total_enrollments,
          (SELECT COUNT(*)::INT FROM course_enrollments WHERE status = 'completed') as completed_enrollments,
          (SELECT AVG(progress_percentage)::FLOAT FROM course_enrollments) as avg_progress
      `.execute(database);

      if (cRes?.rows?.[0]) {
        totalCourses = parseInt(cRes.rows[0].total_courses || "0", 10);
        publishedCourses = parseInt(cRes.rows[0].published_courses || "0", 10);
        totalEnrollments = parseInt(cRes.rows[0].total_enrollments || "0", 10);
        completedEnrollments = parseInt(cRes.rows[0].completed_enrollments || "0", 10);
        avgCourseProgress = Math.round(parseFloat(cRes.rows[0].avg_progress || "0") * 10) / 10;
      }
    } catch (e) {
      console.warn("Analytics: Error querying courses/enrollments:", e);
    }

    const courseCompletionRate = totalEnrollments > 0
      ? Math.round((completedEnrollments / totalEnrollments) * 1000) / 10
      : 0;

    // 4. Jobs & Applications
    let totalJobs = 0;
    let activeJobs = 0;
    let totalApplications = 0;

    try {
      const jRes: any = await sql`
        SELECT 
          (SELECT COUNT(*)::INT FROM jobs) as total_jobs,
          (SELECT COUNT(*)::INT FROM jobs WHERE status IN ('active', 'published')) as active_jobs,
          (SELECT COUNT(*)::INT FROM job_applications) as applications_count
      `.execute(database);

      if (jRes?.rows?.[0]) {
        totalJobs = parseInt(jRes.rows[0].total_jobs || "0", 10);
        activeJobs = parseInt(jRes.rows[0].active_jobs || "0", 10);
        totalApplications = parseInt(jRes.rows[0].applications_count || "0", 10);
      }
    } catch (e) {
      console.warn("Analytics: Error querying jobs/applications:", e);
    }

    const opportunityApplyRate = activeJobs > 0
      ? Math.round((totalApplications / activeJobs) * 10) / 10
      : totalJobs > 0
      ? Math.round((totalApplications / totalJobs) * 10) / 10
      : 0;

    // 5. Activity counts across platform ecosystems
    let totalPosts = 0;
    let totalConnections = 0;
    let totalStories = 0;
    let totalCamps = 0;
    let totalEvents = 0;
    let totalResearch = 0;
    let totalMessages = 0;

    try {
      const aRes: any = await sql`
        SELECT 
          (SELECT COUNT(*)::INT FROM network_posts) as posts_count,
          (SELECT COUNT(*)::INT FROM connections) as connections_count,
          (SELECT COUNT(*)::INT FROM stories) as stories_count,
          (SELECT COUNT(*)::INT FROM camps) as camps_count,
          (SELECT COUNT(*)::INT FROM events) as events_count,
          (SELECT COUNT(*)::INT FROM research_projects) as research_count,
          (SELECT COUNT(*)::INT FROM communication_messages) as messages_count
      `.execute(database);

      if (aRes?.rows?.[0]) {
        totalPosts = parseInt(aRes.rows[0].posts_count || "0", 10);
        totalConnections = parseInt(aRes.rows[0].connections_count || "0", 10);
        totalStories = parseInt(aRes.rows[0].stories_count || "0", 10);
        totalCamps = parseInt(aRes.rows[0].camps_count || "0", 10);
        totalEvents = parseInt(aRes.rows[0].events_count || "0", 10);
        totalResearch = parseInt(aRes.rows[0].research_count || "0", 10);
        totalMessages = parseInt(aRes.rows[0].messages_count || "0", 10);
      }
    } catch (e) {
      console.warn("Analytics: Error querying ecosystem activity counts:", e);
    }

    // Real ecosystem volume
    const networkingVolume = totalPosts + totalConnections;
    const learnVolume = totalEnrollments + totalCourses;
    const opportunitiesVolume = totalApplications + totalJobs;
    const clinicalProgramsVolume = totalCamps + totalEvents + totalResearch + totalStories;
    const totalEcosystemActivity = networkingVolume + learnVolume + opportunitiesVolume + clinicalProgramsVolume;

    const ecosystemSplit = {
      networking: {
        volume: networkingVolume,
        percentage: totalEcosystemActivity > 0 ? Math.round((networkingVolume / totalEcosystemActivity) * 100) : 0,
      },
      learn: {
        volume: learnVolume,
        percentage: totalEcosystemActivity > 0 ? Math.round((learnVolume / totalEcosystemActivity) * 100) : 0,
      },
      opportunities: {
        volume: opportunitiesVolume,
        percentage: totalEcosystemActivity > 0 ? Math.round((opportunitiesVolume / totalEcosystemActivity) * 100) : 0,
      },
      clinicalPrograms: {
        volume: clinicalProgramsVolume,
        percentage: totalEcosystemActivity > 0 ? Math.round((clinicalProgramsVolume / totalEcosystemActivity) * 100) : 0,
      },
      totalActivity: totalEcosystemActivity,
    };

    // 6. User daily registrations stream (for trend display)
    let dailySignups: { date: string; count: number }[] = [];
    try {
      const sRes: any = await sql`
        SELECT 
          TO_CHAR("createdAt", 'YYYY-MM-DD') as date_str,
          COUNT(*)::INT as count
        FROM "user"
        WHERE "createdAt" >= ${periodStart}
        GROUP BY TO_CHAR("createdAt", 'YYYY-MM-DD')
        ORDER BY date_str ASC
      `.execute(database);

      dailySignups = (sRes?.rows || []).map((r: any) => ({
        date: r.date_str,
        count: parseInt(r.count || "0", 10),
      }));
    } catch (e) {
      console.warn("Analytics: Error querying daily signups:", e);
    }

    // 7. Clinical Specialties Breakdown
    let topSpecialties: { specialty: string; count: number }[] = [];
    try {
      const spRes: any = await sql`
        SELECT 
          specialization as specialty,
          COUNT(*)::INT as count
        FROM professional_profiles
        WHERE specialization IS NOT NULL AND specialization <> ''
        GROUP BY specialization
        ORDER BY count DESC
        LIMIT 6
      `.execute(database);

      topSpecialties = (spRes?.rows || []).map((r: any) => ({
        specialty: r.specialty,
        count: parseInt(r.count || "0", 10),
      }));
    } catch (e) {
      console.warn("Analytics: Error querying top specialties:", e);
    }

    // 8. Regional Clinician Distribution
    let topLocations: { state: string; count: number }[] = [];
    try {
      const locRes: any = await sql`
        SELECT 
          state,
          COUNT(*)::INT as count
        FROM professional_profiles
        WHERE state IS NOT NULL AND state <> ''
        GROUP BY state
        ORDER BY count DESC
        LIMIT 6
      `.execute(database);

      topLocations = (locRes?.rows || []).map((r: any) => ({
        state: r.state,
        count: parseInt(r.count || "0", 10),
      }));
    } catch (e) {
      console.warn("Analytics: Error querying top locations:", e);
    }

    return NextResponse.json({
      periodDays: days,
      kpis: {
        totalUsers,
        totalProfessionals,
        verifiedDoctors,
        pendingVerification,
        userConversionRate,
        userGrowthTrend,
        newUsersPeriod,
        doctorVerificationRate,
        avgVerificationHours,
        totalCourses,
        publishedCourses,
        totalEnrollments,
        completedEnrollments,
        courseCompletionRate,
        avgCourseProgress,
        totalJobs,
        activeJobs,
        totalApplications,
        opportunityApplyRate,
      },
      funnel: {
        registeredUsers: totalUsers,
        profilesCreated: totalProfessionals,
        profileConversionPct: userConversionRate,
        verifiedDoctors: verifiedDoctors,
        verificationOfProfilesPct: doctorVerificationRate,
        verificationOfUsersPct: totalUsers > 0 ? Math.round((verifiedDoctors / totalUsers) * 1000) / 10 : 0,
        pendingVerification: pendingVerification,
      },
      ecosystem: ecosystemSplit,
      activityCounts: {
        totalPosts,
        totalConnections,
        totalStories,
        totalCamps,
        totalEvents,
        totalResearch,
        totalMessages,
      },
      dailySignups,
      topSpecialties,
      topLocations,
    });
  } catch (error: any) {
    console.error("GET /api/admin/analytics error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to load platform analytics" },
      { status: 500 }
    );
  }
}
