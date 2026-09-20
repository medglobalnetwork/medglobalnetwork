import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { database } from "@/lib/auth";
import { sql } from "kysely";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const currentUserId = session.user.id;

    const savedResult: any = await sql`
      SELECT 
        sj.id as saved_id,
        sj.created_at as saved_at,
        j.*,
        json_build_object(
          'id', o.id,
          'name', o.name,
          'slug', o.slug,
          'logo_url', o.logo_url,
          'verification_status', o.verification_status
        ) as organization,
        EXISTS (SELECT 1 FROM job_applications ja WHERE ja.job_id = j.id AND ja.applicant_id = ${currentUserId}) as has_applied,
        true as is_saved
      FROM saved_jobs sj
      JOIN jobs j ON sj.job_id = j.id
      JOIN organizations o ON j.organization_id = o.id
      WHERE sj.user_id = ${currentUserId}
      ORDER BY sj.created_at DESC
    `.execute(database);

    return NextResponse.json({
      savedJobs: savedResult.rows || [],
    });
  } catch (error: any) {
    console.error("Failed to fetch saved jobs:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch saved jobs" }, { status: 500 });
  }
}
