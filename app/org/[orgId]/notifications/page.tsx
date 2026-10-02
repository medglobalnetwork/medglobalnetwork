// app/org/[orgId]/notifications/page.tsx
import React from "react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { OrganizationService } from "@/modules/organizations/lib/org-service";
import { NotificationsWorkspace } from "@/modules/organizations/components/notifications/NotificationsWorkspace";

export const dynamic = "force-dynamic";

export default async function OrgNotificationsPage({
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
    <NotificationsWorkspace
      organization={organization}
      userRole={member.role}
      customPermissions={organization.my_permissions}
    />
  );
}
