import React from "react";
import { AdminShell } from "@/modules/admin/components/AdminShell";
import { Metadata } from "next";
import { getAdminSession } from "@/modules/admin/lib/rbac";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { AdminAccessDenied } from "@/modules/admin/components/AdminAccessDenied";

export const metadata: Metadata = {
  title: "Admin Control Plane | MGN.life",
  description: "Platform-wide administrative operations and control plane for MGN.life",
};

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({ headers: reqHeaders });

  // 1. If not logged in at all, redirect cleanly to login instead of 404
  if (!session?.user) {
    redirect("/login?redirect=/admin");
  }

  // 2. Evaluate Admin RBAC
  const admin = await getAdminSession(reqHeaders);

  // 3. If logged in but not an authorized admin, show friendly Access Denied screen instead of 404
  if (!admin) {
    return <AdminAccessDenied user={session.user} />;
  }

  return <AdminShell>{children}</AdminShell>;
}
