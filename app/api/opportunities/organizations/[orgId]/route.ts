import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { database } from "@/lib/auth";
import { sql } from "kysely";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  try {
    const { orgId } = await params;
    const session = await auth.api.getSession({ headers: req.headers });
    const currentUserId = session?.user?.id;

    const orgResult: any = await sql`
      SELECT 
        o.*,
        ${
          currentUserId
            ? sql`EXISTS (SELECT 1 FROM organization_members om WHERE om.organization_id = o.id AND om.user_id = ${currentUserId})`
            : sql`false`
        } as is_recruiter,
        ${
          currentUserId
            ? sql`(SELECT om.role FROM organization_members om WHERE om.organization_id = o.id AND om.user_id = ${currentUserId} LIMIT 1)`
            : sql`NULL`
        } as recruiter_role
      FROM organizations o
      WHERE o.id = ${orgId} OR o.slug = ${orgId}
      LIMIT 1
    `.execute(database);

    if (!orgResult.rows?.[0]) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    const organization = orgResult.rows[0];

    // Fetch active jobs from this organization
    const jobsResult: any = await sql`
      SELECT 
        j.*,
        json_build_object(
          'id', o.id,
          'name', o.name,
          'slug', o.slug,
          'logo_url', o.logo_url,
          'verification_status', o.verification_status
        ) as organization
      FROM jobs j
      JOIN organizations o ON j.organization_id = o.id
      WHERE j.organization_id = ${organization.id} AND j.status = 'published'
      ORDER BY j.is_featured DESC, j.published_at DESC
    `.execute(database);

    return NextResponse.json({
      organization,
      jobs: jobsResult.rows || [],
    });
  } catch (error: any) {
    console.error("Failed to fetch organization:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch organization" }, { status: 500 });
  }
}
