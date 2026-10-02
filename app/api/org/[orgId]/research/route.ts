// app/api/org/[orgId]/research/route.ts
import { auth, database } from "@/lib/auth";
import { headers } from "next/headers";
import { OrganizationService } from "@/modules/organizations/lib/org-service";
import { hasOrgPermission } from "@/modules/organizations/lib/org-permissions";
import { generateOrgId, ensureOrgTables } from "@/modules/organizations/lib/org-db";
import { sql } from "kysely";

const db = database as any;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const { orgId } = await params;
  await ensureOrgTables();

  try {
    const projectsRes = await sql<any>`
      SELECT * FROM research_projects
      WHERE organization_id = ${orgId}
      ORDER BY created_at DESC
    `.execute(db).catch(() => ({ rows: [] }));

    return Response.json({ projects: projectsRes.rows });
  } catch (err: any) {
    console.error(`GET /api/org/${orgId}/research error:`, err);
    return Response.json({ error: err.message || "Failed to fetch research" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  const { orgId } = await params;

  try {
    const { member } = await OrganizationService.getOrganizationById(orgId, session.user.id);
    if (!member || !hasOrgPermission(member.role, undefined, "RESEARCH_CREATE")) {
      return Response.json({ error: "Permission denied" }, { status: 403 });
    }

    const body = await request.json();
    const id = generateOrgId();
    const slug = (body.title || "study")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") + "-" + Date.now().toString(36);

    await sql`
      INSERT INTO research_projects (
        id, slug, title, field, description, lead_investigator_id, organization_id,
        status, created_at, updated_at
      ) VALUES (
        ${id}, ${slug}, ${body.title}, ${body.field || "Clinical Medicine"},
        ${body.description}, ${session.user.id}, ${orgId},
        'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
    `.execute(db).catch(async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS research_projects (
          id VARCHAR(64) PRIMARY KEY,
          slug VARCHAR(255) NOT NULL UNIQUE,
          title VARCHAR(255) NOT NULL,
          field VARCHAR(100),
          description TEXT,
          lead_investigator_id VARCHAR(64),
          organization_id VARCHAR(64),
          status VARCHAR(30) DEFAULT 'active',
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
      `.execute(db);

      await sql`
        INSERT INTO research_projects (
          id, slug, title, field, description, lead_investigator_id, organization_id,
          status, created_at, updated_at
        ) VALUES (
          ${id}, ${slug}, ${body.title}, ${body.field || "Clinical Medicine"},
          ${body.description}, ${session.user.id}, ${orgId},
          'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        )
      `.execute(db);
    });

    await OrganizationService.logAudit({
      organization_id: orgId,
      user_id: session.user.id,
      user_name: session.user.name || "Research Manager",
      user_email: session.user.email || "",
      action: "RESEARCH_PROJECT_CREATED",
      entity_type: "RESEARCH_PROJECT",
      entity_id: id,
      details: { title: body.title },
    });

    return Response.json({ success: true, id }, { status: 201 });
  } catch (err: any) {
    console.error(`POST /api/org/${orgId}/research error:`, err);
    return Response.json({ error: err.message || "Failed to create research project" }, { status: 500 });
  }
}
