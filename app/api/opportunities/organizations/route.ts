import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { database } from "@/lib/auth";
import { sql } from "kysely";

let opportunitiesTablesInitialized = false;

async function ensureOpportunitiesTables() {
  if (opportunitiesTablesInitialized) return;
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS organizations (
        id                  TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
        name                TEXT NOT NULL,
        slug                TEXT NOT NULL UNIQUE,
        logo_url            TEXT,
        cover_url           TEXT,
        description         TEXT,
        organization_type   TEXT NOT NULL DEFAULT 'Hospital',
        website             TEXT,
        email               TEXT,
        phone               TEXT,
        address             TEXT,
        city                TEXT,
        state               TEXT,
        country             TEXT DEFAULT 'India',
        specialties         TEXT[],
        verification_status TEXT NOT NULL DEFAULT 'unverified',
        created_by          TEXT REFERENCES "user"(id) ON DELETE SET NULL,
        created_at          TIMESTAMPTZ DEFAULT now(),
        updated_at          TIMESTAMPTZ DEFAULT now()
      );
    `.execute(database);

    await sql`
      CREATE TABLE IF NOT EXISTS jobs (
        id                  TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
        organization_id     TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        recruiter_id        TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
        title               TEXT NOT NULL,
        slug                TEXT NOT NULL UNIQUE,
        job_type            TEXT NOT NULL DEFAULT 'full_time',
        status              TEXT NOT NULL DEFAULT 'draft',
        created_at          TIMESTAMPTZ DEFAULT now(),
        updated_at          TIMESTAMPTZ DEFAULT now()
      );
    `.execute(database);

    // Clean up any old dummy seed organizations
    await sql`
      DELETE FROM organizations 
      WHERE id IN ('org-apollo-hospitals', 'org-max-healthcare', 'org-rehab-physio-clinic', 'org-aiims-research')
         OR slug IN ('apollo-hospitals', 'max-healthcare', 'activemotion-rehab', 'aiims-clinical-research');
    `.execute(database);

    opportunitiesTablesInitialized = true;
  } catch (err) {
    console.warn("ensureOpportunitiesTables warning:", err);
  }
}

export async function GET(req: NextRequest) {
  try {
    await ensureOpportunitiesTables();

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query")?.trim() || "";
    const type = searchParams.get("type") || "";

    let queryBuilder = sql`
      SELECT 
        o.*,
        (SELECT COUNT(*) FROM jobs j WHERE j.organization_id = o.id AND j.status = 'published') as active_jobs_count
      FROM organizations o
      WHERE o.verification_status != 'suspended'
        AND o.id NOT IN ('org-apollo-hospitals', 'org-max-healthcare', 'org-rehab-physio-clinic', 'org-aiims-research')
        AND o.slug NOT IN ('apollo-hospitals', 'max-healthcare', 'activemotion-rehab', 'aiims-clinical-research')
    `;

    if (query) {
      queryBuilder = sql`${queryBuilder} AND (o.name ILIKE ${`%${query}%`} OR o.city ILIKE ${`%${query}%`})`;
    }

    if (type && type !== "All") {
      queryBuilder = sql`${queryBuilder} AND o.organization_type = ${type}`;
    }

    queryBuilder = sql`${queryBuilder} ORDER BY o.verification_status = 'verified' DESC, o.name ASC LIMIT 50`;

    const orgsResult: any = await queryBuilder.execute(database);

    return NextResponse.json({
      organizations: orgsResult.rows || [],
    });
  } catch (error: any) {
    console.error("Failed to fetch organizations:", error);
    return NextResponse.json({ organizations: [], error: error.message || "Failed to fetch organizations" });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const currentUserId = session.user.id;
    const body = await req.json();

    const {
      name,
      organization_type = "Hospital",
      logo_url,
      cover_url,
      description,
      website,
      email,
      phone,
      address,
      city,
      state,
      country = "India",
      specialties = [],
    } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: "Organization name is required" }, { status: 400 });
    }

    const slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString(36)}`;

    // Create organization
    const orgResult: any = await sql`
      INSERT INTO organizations (
        name, slug, logo_url, cover_url, description, organization_type,
        website, email, phone, address, city, state, country, specialties,
        verification_status, created_by
      ) VALUES (
        ${name.trim()}, ${slug}, ${logo_url || null}, ${cover_url || null},
        ${description || null}, ${organization_type}, ${website || null},
        ${email || null}, ${phone || null}, ${address || null}, ${city || null},
        ${state || null}, ${country}, ${specialties}, 'pending', ${currentUserId}
      )
      RETURNING id, slug
    `.execute(database);

    const newOrg = orgResult.rows[0];

    // Add creator as owner in organization_members
    await sql`
      INSERT INTO organization_members (organization_id, user_id, role)
      VALUES (${newOrg.id}, ${currentUserId}, 'owner')
      ON CONFLICT (organization_id, user_id) DO NOTHING
    `.execute(database);

    return NextResponse.json({
      success: true,
      organizationId: newOrg.id,
      slug: newOrg.slug,
    }, { status: 201 });
  } catch (error: any) {
    console.error("Failed to create organization:", error);
    return NextResponse.json({ error: error.message || "Failed to create organization" }, { status: 500 });
  }
}
