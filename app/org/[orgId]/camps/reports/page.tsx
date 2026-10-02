// app/org/[orgId]/camps/reports/page.tsx
import React from "react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { OrganizationService } from "@/modules/organizations/lib/org-service";
import { CampsWorkspace } from "@/modules/organizations/components/camps/CampsWorkspace";

export const dynamic = "force-dynamic";

export default async function OrgCampReportsPage({
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

  return (
    <CampsWorkspace
      organization={organization}
      userRole={member.role}
      customPermissions={organization.my_permissions}
    />
  );
}
