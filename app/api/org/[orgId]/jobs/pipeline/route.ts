// app/api/org/[orgId]/jobs/pipeline/route.ts
import { auth, database } from "@/lib/auth";
import { headers } from "next/headers";
import { OrganizationService } from "@/modules/organizations/lib/org-service";
import { hasOrgPermission } from "@/modules/organizations/lib/org-permissions";
import { sql } from "kysely";

const db = database as any;

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
    if (!member || !hasOrgPermission(member.role, undefined, "APPLICATIONS_MANAGE")) {
      return Response.json({ error: "Permission denied" }, { status: 403 });
    }

    const body = await request.json();
    const { applicationId, status } = body;

    await sql`
      UPDATE job_applications SET
        status = ${status},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${applicationId}
    `.execute(db);

    await OrganizationService.logAudit({
      organization_id: orgId,
      user_id: session.user.id,
      user_name: session.user.name || "Recruiter",
      user_email: session.user.email || "",
      action: "APPLICATION_STATUS_UPDATED",
      entity_type: "APPLICATION",
      entity_id: applicationId,
      details: { status },
    });

    return Response.json({ success: true });
  } catch (err: any) {
    console.error(`PATCH /api/org/${orgId}/jobs/pipeline error:`, err);
    return Response.json({ error: err.message || "Failed to update status" }, { status: 500 });
  }
}
