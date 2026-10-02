"use client";

import React, { useState, useEffect } from "react";
import { OrgSidebar } from "./OrgSidebar";
import { OrgHeader } from "./OrgHeader";
import { OrganizationRecord, OrgRole, OrgPermission } from "../types";

interface OrgWorkspaceShellProps {
  organization: OrganizationRecord;
  userRole?: OrgRole;
  customPermissions?: OrgPermission[];
  children: React.ReactNode;
}

export function OrgWorkspaceShell({
  organization,
  userRole = "VIEWER",
  customPermissions = [],
  children,
}: OrgWorkspaceShellProps) {
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [userOrganizations, setUserOrganizations] = useState<OrganizationRecord[]>([]);

  useEffect(() => {
    // Fetch all user organizations for the switcher
    fetch("/api/organizations", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (Array.isArray(data)) {
          setUserOrganizations(data);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="flex min-h-dvh bg-slate-950 text-slate-100 font-sans antialiased">
      {/* Sidebar */}
      <OrgSidebar
        organization={organization}
        userRole={userRole}
        customPermissions={customPermissions}
        isMobileOpen={isMobileDrawerOpen}
        onCloseMobile={() => setIsMobileDrawerOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <OrgHeader
          organization={organization}
          userOrganizations={userOrganizations}
          userRole={userRole}
          customPermissions={customPermissions}
          onToggleSidebar={() => setIsMobileDrawerOpen((prev) => !prev)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
