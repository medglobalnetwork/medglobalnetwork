// app/org/[orgId]/layout.tsx
import React from "react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { OrganizationService } from "@/modules/organizations/lib/org-service";
import { OrgWorkspaceShell } from "@/modules/organizations/components/OrgWorkspaceShell";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<any>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const orgId = resolvedParams?.orgId;
  const { organization } = orgId ? await OrganizationService.getOrganizationById(orgId) : { organization: null };

  return {
    title: organization ? `${organization.name} | MGN Workspace` : "MGN Organisation Workspace",
    description: organization?.description || "Role-based B2B operational healthcare workspace on MGN.life",
  };
}

export default async function OrgLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<any>;
}) {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({ headers: reqHeaders });

  if (!session?.user?.id) {
    redirect("/");
  }

  const resolvedParams = await params;
  const orgId = resolvedParams?.orgId;
  const { organization, member } = await OrganizationService.getOrganizationById(
    orgId,
    session.user.id
  );

  if (!organization || !member) {
    // If not a member, redirect to organizations hub
    redirect("/organizations");
  }

  return (
    <OrgWorkspaceShell
      organization={organization}
      userRole={member.role}
      customPermissions={organization.my_permissions}
    >
      {children}
    </OrgWorkspaceShell>
  );
}
