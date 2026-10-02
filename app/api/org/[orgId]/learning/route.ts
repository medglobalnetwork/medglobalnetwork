// app/api/org/[orgId]/learning/route.ts
import { auth, database } from "@/lib/auth";
import { headers } from "next/headers";
import { OrganizationService } from "@/modules/organizations/lib/org-service";
import { hasOrgPermission } from "@/modules/organizations/lib/org-permissions";
import { OrgEntitlementService } from "@/modules/organizations/lib/org-entitlements";
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
    const coursesRes = await sql<any>`
      SELECT * FROM learn_courses
      WHERE organization_id = ${orgId}
      ORDER BY created_at DESC
    `.execute(db).catch(() => ({ rows: [] }));

    return Response.json({ courses: coursesRes.rows });
  } catch (err: any) {
    console.error(`GET /api/org/${orgId}/learning error:`, err);
    return Response.json({ error: err.message || "Failed to fetch courses" }, { status: 500 });
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
    if (!member || !hasOrgPermission(member.role, undefined, "LEARNING_CREATE")) {
      return Response.json({ error: "Permission denied" }, { status: 403 });
    }

    const entitlement = await OrgEntitlementService.canCreateCourse(orgId);
    if (!entitlement.allowed) {
      return Response.json({ error: entitlement.reason }, { status: 403 });
    }

    const body = await request.json();
    const id = generateOrgId();
    const slug = (body.title || "course")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") + "-" + Date.now().toString(36);

    await sql`
      INSERT INTO learn_courses (
        id, slug, title, category, description, instructor_id, organization_id,
        cme_credits, status, created_at, updated_at
      ) VALUES (
        ${id}, ${slug}, ${body.title}, ${body.category || "Clinical Medicine"},
        ${body.description}, ${session.user.id}, ${orgId}, ${body.cme_credits || 0},
        'published', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
    `.execute(db).catch(async () => {
      // Create table if not present
      await sql`
        CREATE TABLE IF NOT EXISTS learn_courses (
          id VARCHAR(64) PRIMARY KEY,
          slug VARCHAR(255) NOT NULL UNIQUE,
          title VARCHAR(255) NOT NULL,
          category VARCHAR(100),
          description TEXT,
          instructor_id VARCHAR(64),
          organization_id VARCHAR(64),
          cme_credits NUMERIC(4,1) DEFAULT 0,
          status VARCHAR(30) DEFAULT 'published',
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
      `.execute(db);

      await sql`
        INSERT INTO learn_courses (
          id, slug, title, category, description, instructor_id, organization_id,
          cme_credits, status, created_at, updated_at
        ) VALUES (
          ${id}, ${slug}, ${body.title}, ${body.category || "Clinical Medicine"},
          ${body.description}, ${session.user.id}, ${orgId}, ${body.cme_credits || 0},
          'published', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        )
      `.execute(db);
    });

    await OrganizationService.logAudit({
      organization_id: orgId,
      user_id: session.user.id,
      user_name: session.user.name || "Learning Manager",
      user_email: session.user.email || "",
      action: "COURSE_CREATED",
      entity_type: "COURSE",
      entity_id: id,
      details: { title: body.title },
    });

    return Response.json({ success: true, id }, { status: 201 });
  } catch (err: any) {
    console.error(`POST /api/org/${orgId}/learning error:`, err);
    return Response.json({ error: err.message || "Failed to create course" }, { status: 500 });
  }
}
