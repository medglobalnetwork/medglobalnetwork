// app/api/org/[orgId]/audit-logs/route.ts
import { auth, database } from "@/lib/auth";
import { headers } from "next/headers";
import { OrganizationService } from "@/modules/organizations/lib/org-service";
import { hasOrgPermission } from "@/modules/organizations/lib/org-permissions";
import { ensureOrgTables } from "@/modules/organizations/lib/org-db";
import { sql } from "kysely";

const db = database as any;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  const { orgId } = await params;
  await ensureOrgTables();

  try {
    const { member } = await OrganizationService.getOrganizationById(orgId, session.user.id);
    if (!member || !hasOrgPermission(member.role, undefined, "AUDIT_LOGS_VIEW")) {
      return Response.json({ error: "Permission denied" }, { status: 403 });
    }

    const logsRes = await sql<any>`
      SELECT * FROM organization_audit_logs
      WHERE organization_id = ${orgId}
      ORDER BY created_at DESC
      LIMIT 100
    `.execute(db);

    return Response.json({ logs: logsRes.rows });
  } catch (err: any) {
    console.error(`GET /api/org/${orgId}/audit-logs error:`, err);
    return Response.json({ error: err.message || "Failed to fetch audit logs" }, { status: 500 });
  }
}
