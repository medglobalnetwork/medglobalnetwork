// app/api/org/[orgId]/dashboard/route.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { OrganizationService } from "@/modules/organizations/lib/org-service";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  const { orgId } = await params;

  try {
    const { organization, member } = await OrganizationService.getOrganizationById(
      orgId,
      session.user.id
    );

    if (!organization || !member) {
      return Response.json({ error: "Organization access denied" }, { status: 403 });
    }

    const metrics = await OrganizationService.getDashboardMetrics(orgId);

    return Response.json({ organization, member, metrics });
  } catch (err: any) {
    console.error(`GET /api/org/${orgId}/dashboard error:`, err);
    return Response.json({ error: err.message || "Failed to fetch dashboard metrics" }, { status: 500 });
  }
}
