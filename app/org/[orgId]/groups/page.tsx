// app/org/[orgId]/groups/page.tsx
import React from "react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { OrganizationService } from "@/modules/organizations/lib/org-service";
import { GroupsWorkspace } from "@/modules/organizations/components/groups/GroupsWorkspace";

export const dynamic = "force-dynamic";

export default async function OrgGroupsPage({
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
    <GroupsWorkspace
      organization={organization}
      userRole={member.role}
      customPermissions={organization.my_permissions}
    />
  );
}
