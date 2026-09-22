import React from "react";
import { AdminShell } from "@/modules/admin/components/AdminShell";
import { Metadata } from "next";
import { getAdminSession } from "@/modules/admin/lib/rbac";
import { notFound } from "next/navigation";
import { headers } from "next/headers";

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
  const admin = await getAdminSession(reqHeaders);

  if (!admin) {
    notFound();
  }

  return <AdminShell>{children}</AdminShell>;
}
