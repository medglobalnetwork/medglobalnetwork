// app/org/[orgId]/learning/certificates/page.tsx
import React from "react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { OrganizationService } from "@/modules/organizations/lib/org-service";
import { LearningWorkspace } from "@/modules/organizations/components/learning/LearningWorkspace";

export const dynamic = "force-dynamic";

export default async function OrgCertificatesPage({
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
    <LearningWorkspace
      organization={organization}
      userRole={member.role}
      customPermissions={organization.my_permissions}
    />
  );
}
