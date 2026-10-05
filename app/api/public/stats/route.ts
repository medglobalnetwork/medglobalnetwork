// ============================================================
// MGN Public Telemetry — Real-time Platform Statistics API
// app/api/public/stats/route.ts
// ============================================================

import { NextResponse } from "next/server";
import { database } from "@/lib/auth";
import { sql } from "kysely";

export async function GET() {
  try {
    const statsRes: any = await sql`
      SELECT 
        (SELECT COUNT(*)::INT FROM "user") as total_users,
        (SELECT COUNT(*)::INT FROM professional_profiles) as total_professionals,
        (SELECT COUNT(*)::INT FROM jobs WHERE status IN ('published', 'active')) as active_jobs,
        (SELECT COUNT(*)::INT FROM courses WHERE status = 'published') as published_courses,
        (SELECT COUNT(*)::INT FROM professional_profiles WHERE identity_verified = true OR registration_verified = true) as verified_clinicians
    `.execute(database);

    const row = statsRes?.rows?.[0] || {};
    const totalUsers = parseInt(row.total_users || "0", 10);
    const totalProfessionals = parseInt(row.total_professionals || "0", 10);
    const professionalsCount = Math.max(totalUsers, totalProfessionals);
    const jobsCount = parseInt(row.active_jobs || "0", 10);
    const coursesCount = parseInt(row.published_courses || "0", 10);
    const verifiedClinicians = parseInt(row.verified_clinicians || "0", 10);

    return NextResponse.json(
      {
        professionals: professionalsCount,
        jobs: jobsCount,
        courses: coursesCount,
        verifiedClinicians,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (error: any) {
    console.warn("Public stats query failed, returning fallback:", error);
    return NextResponse.json(
      {
        professionals: 0,
        jobs: 0,
        courses: 0,
        verifiedClinicians: 0,
      },
      { status: 200 }
    );
  }
}
