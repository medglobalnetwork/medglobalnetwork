// app/org/[orgId]/content/page.tsx
import React from "react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { OrganizationService } from "@/modules/organizations/lib/org-service";
import { MarketingDashboard } from "@/modules/organizations/components/dashboards/MarketingDashboard";

export const dynamic = "force-dynamic";

export default async function OrgContentPage({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({ headers: reqHeaders });
  if (!session?.user?.id) redirect("/");

  const { orgId } = await params;
  const { organization, member } = await OrganizationService.getOrganizationById(orgId, session.user.id);
  if (!organization || !member) notFound();

  const metrics = await OrganizationService.getDashboardMetrics(orgId);

  return (
    <MarketingDashboard
      organization={organization}
      metrics={metrics}
    />
  );
}
