// app/api/organizations/[orgId]/route.ts
import { auth, database } from "@/lib/auth";
import { headers } from "next/headers";
import { OrganizationService } from "@/modules/organizations/lib/org-service";
import { sql } from "kysely";

const db = database as any;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  const { orgId } = await params;

  try {
    const { organization, member } = await OrganizationService.getOrganizationById(
      orgId,
      session?.user?.id
    );

    if (!organization) {
      return Response.json({ error: "Organization not found" }, { status: 404 });
    }

    return Response.json({ organization, member });
  } catch (err: any) {
    console.error(`GET /api/organizations/${orgId} error:`, err);
    return Response.json({ error: err.message || "Failed to fetch organization" }, { status: 500 });
  }
}

export async function PATCH(
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
    if (!member || (member.role !== "OWNER" && member.role !== "ADMIN")) {
      return Response.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    const body = await request.json();

    await sql`
      UPDATE organizations SET
        name = COALESCE(${body.name}, name),
        description = COALESCE(${body.description}, description),
        about = COALESCE(${body.about}, about),
        website = COALESCE(${body.website}, website),
        email = COALESCE(${body.email}, email),
        phone = COALESCE(${body.phone}, phone),
        address = COALESCE(${body.address}, address),
        city = COALESCE(${body.city}, city),
        state = COALESCE(${body.state}, state),
        license_number = COALESCE(${body.license_number}, license_number),
        gst_number = COALESCE(${body.gst_number}, gst_number),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${orgId}
    `.execute(db);

    await OrganizationService.logAudit({
      organization_id: orgId,
      user_id: session.user.id,
      user_name: session.user.name || "Admin",
      user_email: session.user.email || "",
      action: "ORGANIZATION_UPDATED",
      entity_type: "ORGANIZATION",
      entity_id: orgId,
      details: body,
    });

    const { organization } = await OrganizationService.getOrganizationById(orgId, session.user.id);
    return Response.json({ organization });
  } catch (err: any) {
    console.error(`PATCH /api/organizations/${orgId} error:`, err);
    return Response.json({ error: err.message || "Failed to update organization" }, { status: 500 });
  }
}
