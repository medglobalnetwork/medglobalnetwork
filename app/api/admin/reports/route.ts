// ============================================================
// MGN Admin Reports & Intelligence API
// app/api/admin/reports/route.ts
// Handles platform-wide clinical reports, user moderation reports,
// financial metrics, and CSV export.
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { getAdminSession, hasPermission } from "@/modules/admin/lib/rbac";
import { pool, database } from "@/lib/auth";
import { sql } from "kysely";
import { ensureAdminTables } from "@/modules/admin/lib/admin-db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminSession(req.headers);
    if (!admin || !hasPermission(admin, "reports.read")) {
      return NextResponse.json(
        { error: "Unauthorized. Permission reports.read required." },
        { status: 403 }
      );
    }

    await ensureAdminTables();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || "all";
    const exportFormat = searchParams.get("export"); // "csv" | null

    // 1. User & Content Abuse Reports
    const abuseReportsRes = await pool.query(
      `SELECT * FROM admin_moderation_reports ORDER BY created_at DESC LIMIT 100`
    ).catch(() => ({ rows: [] }));

    // 2. Clinical & Platform Activity Stats
    const usersCountRes = await pool.query<{ count: string }>(
      `SELECT COUNT(*)::text as count FROM "user"`
    ).catch(() => ({ rows: [{ count: "0" }] }));

    const verifiedDoctorsRes = await pool.query<{ count: string }>(
      `SELECT COUNT(*)::text as count FROM "user" WHERE (medical_council IS NOT NULL OR profession = 'doctor') AND (status = 'verified' OR identity_verified = true)`
    ).catch(() => ({ rows: [{ count: "0" }] }));

    const pendingVerificationRes = await pool.query<{ count: string }>(
      `SELECT COUNT(*)::text as count FROM "user" WHERE status = 'pending_verification'`
    ).catch(() => ({ rows: [{ count: "0" }] }));

    const campsRes = await pool.query<{ count: string }>(
      `SELECT COUNT(*)::text as count FROM camps`
    ).catch(() => ({ rows: [{ count: "0" }] }));

    const eventsRes = await pool.query<{ count: string }>(
      `SELECT COUNT(*)::text as count FROM events`
    ).catch(() => ({ rows: [{ count: "0" }] }));

    const jobsRes = await pool.query<{ count: string }>(
      `SELECT COUNT(*)::text as count FROM opportunities`
    ).catch(() => ({ rows: [{ count: "0" }] }));

    const researchRes = await pool.query<{ count: string }>(
      `SELECT COUNT(*)::text as count FROM clinical_trials`
    ).catch(() => ({ rows: [{ count: "0" }] }));

    // 3. User Specialty Distribution Report
    const specialtyDistRes = await pool.query<{ specialization: string; count: string }>(
      `SELECT COALESCE(specialization, 'General Medicine') as specialization, COUNT(*)::text as count 
       FROM "user" 
       WHERE specialization IS NOT NULL AND specialization != ''
       GROUP BY specialization 
       ORDER BY COUNT(*) DESC 
       LIMIT 10`
    ).catch(() => ({ rows: [] }));

    // 4. Commercial / Ads Activity Report
    const adsRes = await pool.query<{ count: string; impressions: string; clicks: string }>(
      `SELECT COUNT(*)::text as count, COALESCE(SUM(impressions), 0)::text as impressions, COALESCE(SUM(clicks), 0)::text as clicks FROM ads`
    ).catch(() => ({ rows: [{ count: "0", impressions: "0", clicks: "0" }] }));

    const data = {
      summary: {
        totalUsers: parseInt(usersCountRes.rows[0]?.count || "0", 10),
        verifiedDoctors: parseInt(verifiedDoctorsRes.rows[0]?.count || "0", 10),
        pendingVerifications: parseInt(pendingVerificationRes.rows[0]?.count || "0", 10),
        totalCamps: parseInt(campsRes.rows[0]?.count || "0", 10),
        totalEvents: parseInt(eventsRes.rows[0]?.count || "0", 10),
        totalJobs: parseInt(jobsRes.rows[0]?.count || "0", 10),
        totalResearchStudies: parseInt(researchRes.rows[0]?.count || "0", 10),
        ads: {
          activeCampaigns: parseInt(adsRes.rows[0]?.count || "0", 10),
          totalImpressions: parseInt(adsRes.rows[0]?.impressions || "0", 10),
          totalClicks: parseInt(adsRes.rows[0]?.clicks || "0", 10),
        },
      },
      abuseReports: abuseReportsRes.rows,
      specialtyDistribution: specialtyDistRes.rows.map((r) => ({
        specialization: r.specialization,
        count: parseInt(r.count, 10),
      })),
    };

    // If CSV export requested:
    if (exportFormat === "csv") {
      let csvContent = "Category,Metric,Value\n";
      csvContent += `Users,Total Registered,${data.summary.totalUsers}\n`;
      csvContent += `Users,Verified Doctors,${data.summary.verifiedDoctors}\n`;
      csvContent += `Users,Pending Verification,${data.summary.pendingVerifications}\n`;
      csvContent += `Operations,Total Camps,${data.summary.totalCamps}\n`;
      csvContent += `Operations,Total CME Events,${data.summary.totalEvents}\n`;
      csvContent += `Operations,Clinical Opportunities,${data.summary.totalJobs}\n`;
      csvContent += `Operations,Research Trials,${data.summary.totalResearchStudies}\n`;
      csvContent += `Advertising,Active Campaigns,${data.summary.ads.activeCampaigns}\n`;
      csvContent += `Advertising,Total Impressions,${data.summary.ads.totalImpressions}\n`;
      csvContent += `Advertising,Total Clicks,${data.summary.ads.totalClicks}\n`;

      return new Response(csvContent, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="mgn-platform-report-${Date.now()}.csv"`,
        },
      });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("GET /api/admin/reports error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to load reports" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminSession(req.headers);
    if (!admin || !hasPermission(admin, "reports.action")) {
      return NextResponse.json(
        { error: "Unauthorized. Permission reports.action required." },
        { status: 403 }
      );
    }

    await ensureAdminTables();
    const body = await req.json().catch(() => ({}));
    const { reportId, action, notes } = body;

    if (!reportId || !action) {
      return NextResponse.json({ error: "reportId and action are required." }, { status: 400 });
    }

    // Resolve or update report status
    await sql`
      UPDATE admin_moderation_reports
      SET 
        status = ${action === "dismiss" ? "resolved_dismissed" : "resolved_action_taken"},
        resolved_by = ${admin.userId},
        resolution_action = ${action},
        resolution_notes = ${notes || null},
        resolved_at = NOW()
      WHERE id = ${reportId}
    `.execute(database);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("POST /api/admin/reports error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process report action" },
      { status: 500 }
    );
  }
}
