import React from "react";
import { AdminShell } from "@/modules/admin/components/AdminShell";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Control Plane | MGN.life",
  description: "Platform-wide administrative operations and control plane for MGN.life",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminShell>{children}</AdminShell>;
}
