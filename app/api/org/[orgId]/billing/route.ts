// app/api/org/[orgId]/billing/route.ts
import { auth, database } from "@/lib/auth";
import { headers } from "next/headers";
import { OrganizationService } from "@/modules/organizations/lib/org-service";
import { hasOrgPermission } from "@/modules/organizations/lib/org-permissions";
import { sql } from "kysely";

const db = database as any;

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
    if (!member || !hasOrgPermission(member.role, undefined, "BILLING_MANAGE")) {
      return Response.json({ error: "Permission denied" }, { status: 403 });
    }

    const body = await request.json();
    const { plan } = body;

    await sql`
      INSERT INTO organization_subscriptions (
        id, organization_id, plan, status, billing_cycle, current_period_start, current_period_end, updated_at
      ) VALUES (
        gen_random_uuid()::TEXT, ${orgId}, ${plan}, 'ACTIVE', 'monthly', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '30 days', CURRENT_TIMESTAMP
      )
      ON CONFLICT (organization_id) DO UPDATE SET
        plan = ${plan},
        status = 'ACTIVE',
        current_period_end = CURRENT_TIMESTAMP + INTERVAL '30 days',
        updated_at = CURRENT_TIMESTAMP
    `.execute(db);

    await OrganizationService.logAudit({
      organization_id: orgId,
      user_id: session.user.id,
      user_name: session.user.name || "Finance Lead",
      user_email: session.user.email || "",
      action: "SUBSCRIPTION_PLAN_CHANGED",
      entity_type: "SUBSCRIPTION",
      entity_id: orgId,
      details: { newPlan: plan },
    });

    return Response.json({ success: true });
  } catch (err: any) {
    console.error(`POST /api/org/${orgId}/billing error:`, err);
    return Response.json({ error: err.message || "Failed to update subscription" }, { status: 500 });
  }
}
