"use client";

import React, { useEffect, useState } from "react";
import {
  Settings,
  Shield,
  ToggleLeft,
  ToggleRight,
  Save,
  Key,
  Database,
  Lock,
  RefreshCw,
  CheckCircle,
} from "lucide-react";

interface SettingItem {
  key: string;
  value: any;
  category: string;
  description: string;
}

interface AdminRoleAssignment {
  id: string;
  user_id: string;
  user_email: string;
  role: string;
  granted_by_email?: string;
  created_at: string;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SettingItem[]>([]);
  const [adminRoles, setAdminRoles] = useState<AdminRoleAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/settings");
      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings || []);
        setAdminRoles(data.adminRoles || []);
      }
    } catch (err) {
      console.error("Error loading settings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleToggleSetting = async (key: string, currentValue: any) => {
    const isEnabled = currentValue?.enabled ?? false;
    const newValue = { ...currentValue, enabled: !isEnabled };
    setSavingKey(key);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key,
          value: newValue,
          reason: `Admin toggled ${key} to ${!isEnabled}`,
        }),
      });
      if (res.ok) {
        setSettings((prev) =>
          prev.map((s) => (s.key === key ? { ...s, value: newValue } : s))
        );
      }
    } catch (err) {
      console.error("Error updating setting:", err);
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
          System Settings & Access Control (RBAC)
        </h1>
        <p className="mt-1 text-xs text-slate-400">
          Configure platform-wide feature flags, safety enforcement, and administrative permission boundaries.
        </p>
      </div>

      {/* Feature Flags Grid */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Platform Feature Flags
            </h3>
            <p className="text-xs text-slate-400">Live configuration switches across MGN.life</p>
          </div>
          <button
            type="button"
            onClick={fetchSettings}
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-blue-400" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>

        <div className="mt-6 divide-y divide-slate-800/60">
          {[
            {
              key: "doctor_verification_required_for_posting",
              label: "Enforce Verified Doctor Badge for Public Posts",
              desc: "Requires clinician KYC approval before posting medical cases to the public feed.",
            },
            {
              key: "user_registration_enabled",
              label: "Allow New User Registrations",
              desc: "Open registration for doctors, students, and healthcare institutions.",
            },
            {
              key: "story_creation_enabled",
              label: "Enable 24h Clinical Stories",
              desc: "Allow verified members to share transient medical case stories.",
            },
            {
              key: "maintenance_mode",
              label: "Platform Maintenance Mode",
              desc: "Show maintenance splash screen to standard users while admins retain access.",
            },
          ].map((item) => {
            const currentSetting = settings.find((s) => s.key === item.key);
            const isEnabled = currentSetting?.value?.enabled ?? false;
            const isSaving = savingKey === item.key;

            return (
              <div
                key={item.key}
                className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
              >
                <div>
                  <h4 className="text-xs font-bold text-white">{item.label}</h4>
                  <p className="mt-0.5 text-[11px] text-slate-400">{item.desc}</p>
                </div>

                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() =>
                    handleToggleSetting(item.key, currentSetting?.value || {})
                  }
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                    isEnabled
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                      : "bg-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  {isSaving ? (
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : isEnabled ? (
                    <ToggleRight className="h-4 w-4" />
                  ) : (
                    <ToggleLeft className="h-4 w-4" />
                  )}
                  <span>{isEnabled ? "Enabled" : "Disabled"}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* RBAC Admin User Roles */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl">
        <div className="border-b border-slate-800 pb-4">
          <h3 className="text-sm font-bold text-white tracking-tight">
            Role-Based Access Control (RBAC)
          </h3>
          <p className="text-xs text-slate-400">
            Assigned administrative roles and permission boundaries.
          </p>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-200">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-bold uppercase text-slate-400">
                <th className="py-3 px-3">Admin Email</th>
                <th className="py-3 px-3">Assigned Role</th>
                <th className="py-3 px-3">Granted By</th>
                <th className="py-3 px-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              <tr className="hover:bg-slate-800/40">
                <td className="py-3 px-3 font-semibold text-white">patreshubham141@gmail.com</td>
                <td className="py-3 px-3">
                  <span className="rounded-full bg-blue-500/20 text-blue-300 px-2.5 py-0.5 text-[10px] font-bold">
                    SUPER_ADMIN (Fallback)
                  </span>
                </td>
                <td className="py-3 px-3 text-slate-400">System Environment</td>
                <td className="py-3 px-3 text-slate-500">Platform Seed</td>
              </tr>
              {adminRoles.map((r) => (
                <tr key={r.id} className="hover:bg-slate-800/40">
                  <td className="py-3 px-3 font-semibold text-white">{r.user_email}</td>
                  <td className="py-3 px-3">
                    <span className="rounded-full bg-purple-500/20 text-purple-300 px-2.5 py-0.5 text-[10px] font-bold">
                      {r.role}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-400">{r.granted_by_email || "Super Admin"}</td>
                  <td className="py-3 px-3 text-slate-500">{new Date(r.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
