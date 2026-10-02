// app/org/[orgId]/page.tsx
import React from "react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { OrganizationService } from "@/modules/organizations/lib/org-service";
import { OrgDashboardDispatcher } from "@/modules/organizations/components/dashboards/OrgDashboardDispatcher";

export const dynamic = "force-dynamic";

export default async function OrgDashboardPage({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({ headers: reqHeaders });

  if (!session?.user?.id) {
    redirect("/");
  }

  const { orgId } = await params;
  const { organization, member } = await OrganizationService.getOrganizationById(
    orgId,
    session.user.id
  );

  if (!organization || !member) {
    notFound();
  }

  const metrics = await OrganizationService.getDashboardMetrics(orgId);

  return (
    <OrgDashboardDispatcher
      organization={organization}
      metrics={metrics}
      initialRole={member.role}
      customPermissions={organization.my_permissions}
    />
  );
}
