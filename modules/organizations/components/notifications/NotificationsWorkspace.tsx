"use client";

import React, { useState, useEffect } from "react";
import {
  Bell,
  Briefcase,
  Calendar,
  Tent,
  Users,
  ShieldAlert,
  CheckCircle2,
} from "lucide-react";
import { OrganizationRecord, OrgRole, OrgPermission } from "../../types";

interface Props {
  organization: OrganizationRecord;
  userRole?: OrgRole;
  customPermissions?: OrgPermission[];
}

export function NotificationsWorkspace({ organization }: Props) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetch(`/api/org/${organization.id}/notifications`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : { notifications: [] }))
      .then((d) => setNotifications(d.notifications || []))
      .catch(() => setNotifications([]))
      .finally(() => setIsLoading(false));
  }, [organization.id]);

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold mb-2">
          <Bell className="size-3.5" />
          <span>Operations Feed</span>
        </div>
        <h1 className="text-2xl font-extrabold text-white">Organisation Activity & Notifications</h1>
        <p className="text-xs text-slate-400 mt-1">
          Real-time alerts for candidate applications, event check-ins, volunteer submissions, and membership invitations.
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
        {isLoading ? (
          <div className="p-12 text-center text-slate-500 text-xs animate-pulse">
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center bg-slate-950/40 rounded-xl border border-slate-800">
            <Bell className="size-8 mx-auto mb-2 text-slate-600" />
            <p className="text-sm font-semibold text-white">No new activity alerts</p>
            <p className="text-xs text-slate-500 mt-1">
              You are completely caught up with all workspace operations.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((n) => (
              <div
                key={n.id}
                className="p-3.5 bg-slate-950 rounded-xl border border-slate-800/80 flex items-center justify-between gap-4 text-xs"
              >
                <div>
                  <span className="font-bold text-white block">{n.title}</span>
                  <span className="text-slate-400 text-[11px]">{n.description}</span>
                </div>
                <span className="text-[11px] text-slate-500 shrink-0">
                  {new Date(n.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
