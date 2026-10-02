"use client";

import React, { useState } from "react";
import { OrganizationRecord, OrgDashboardMetrics, OrgRole, OrgPermission } from "../../types";
import { OwnerDashboard } from "./OwnerDashboard";
import { AdminDashboard } from "./AdminDashboard";
import { RecruiterDashboard } from "./RecruiterDashboard";
import { EventManagerDashboard } from "./EventManagerDashboard";
import { CampManagerDashboard } from "./CampManagerDashboard";
import { LearningManagerDashboard } from "./LearningManagerDashboard";
import { ResearchManagerDashboard } from "./ResearchManagerDashboard";
import { MarketingDashboard } from "./MarketingDashboard";
import { FinanceDashboard } from "./FinanceDashboard";
import { ModeratorDashboard } from "./ModeratorDashboard";
import { ViewerDashboard } from "./ViewerDashboard";
import { Eye, Shield } from "lucide-react";
import { getRoleDisplayName } from "../../lib/org-permissions";

interface DispatcherProps {
  organization: OrganizationRecord;
  metrics: OrgDashboardMetrics;
  initialRole?: OrgRole;
  customPermissions?: OrgPermission[];
}

export function OrgDashboardDispatcher({
  organization,
  metrics,
  initialRole = "VIEWER",
  customPermissions = [],
}: DispatcherProps) {
  const [activeViewRole, setActiveViewRole] = useState<OrgRole>(initialRole);

  const isOwnerOrAdmin = initialRole === "OWNER" || initialRole === "ADMIN";

  const renderDashboard = () => {
    switch (activeViewRole) {
      case "OWNER":
        return <OwnerDashboard organization={organization} metrics={metrics} />;
      case "ADMIN":
        return <AdminDashboard organization={organization} metrics={metrics} />;
      case "HR_RECRUITER":
        return <RecruiterDashboard organization={organization} metrics={metrics} />;
      case "EVENT_MANAGER":
        return <EventManagerDashboard organization={organization} metrics={metrics} />;
      case "CAMP_MANAGER":
        return <CampManagerDashboard organization={organization} metrics={metrics} />;
      case "LEARNING_MANAGER":
        return <LearningManagerDashboard organization={organization} metrics={metrics} />;
      case "RESEARCH_MANAGER":
        return <ResearchManagerDashboard organization={organization} metrics={metrics} />;
      case "MARKETING_MANAGER":
        return <MarketingDashboard organization={organization} metrics={metrics} />;
      case "FINANCE_MANAGER":
        return <FinanceDashboard organization={organization} metrics={metrics} />;
      case "MODERATOR":
        return <ModeratorDashboard organization={organization} metrics={metrics} />;
      case "VIEWER":
      case "CUSTOM":
      default:
        return <ViewerDashboard organization={organization} metrics={metrics} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Role Preview Switcher for Owners/Admins */}
      {isOwnerOrAdmin && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <Eye className="size-3.5 text-blue-400" />
            <span>Viewing Dashboard as:</span>
            <span className="font-bold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
              {getRoleDisplayName(activeViewRole)}
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0">
            <span className="text-[11px] text-slate-500 mr-1">Preview Role:</span>
            {[
              "OWNER",
              "ADMIN",
              "HR_RECRUITER",
              "EVENT_MANAGER",
              "CAMP_MANAGER",
              "LEARNING_MANAGER",
              "RESEARCH_MANAGER",
              "MARKETING_MANAGER",
              "FINANCE_MANAGER",
              "MODERATOR",
              "VIEWER",
            ].map((r) => (
              <button
                key={r}
                onClick={() => setActiveViewRole(r as OrgRole)}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                  activeViewRole === r
                    ? "bg-blue-600 text-white font-bold"
                    : "bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                {getRoleDisplayName(r as OrgRole)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Render selected dashboard */}
      {renderDashboard()}
    </div>
  );
}
