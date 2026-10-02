"use client";

import React, { useState, useEffect } from "react";
import {
  Settings,
  Shield,
  FileText,
  Clock,
  CheckCircle2,
  Lock,
  Building2,
  Save,
  AlertCircle,
  FileCheck,
} from "lucide-react";
import { OrganizationRecord, OrganizationAuditLogRecord, OrgRole, OrgPermission } from "../../types";
import { hasOrgPermission } from "../../lib/org-permissions";

interface Props {
  organization: OrganizationRecord;
  userRole?: OrgRole;
  customPermissions?: OrgPermission[];
}

export function SettingsWorkspace({ organization, userRole, customPermissions }: Props) {
  const [activeTab, setActiveTab] = useState<"general" | "verification" | "audit">("general");
  const [auditLogs, setAuditLogs] = useState<OrganizationAuditLogRecord[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  // General settings state
  const [name, setName] = useState(organization.name || "");
  const [email, setEmail] = useState(organization.email || "");
  const [phone, setPhone] = useState(organization.phone || "");
  const [website, setWebsite] = useState(organization.website || "");
  const [about, setAbout] = useState(organization.about || "");
  const [licenseNumber, setLicenseNumber] = useState(organization.license_number || "");
  const [gstNumber, setGstNumber] = useState(organization.gst_number || "");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const canEditSettings = hasOrgPermission(userRole, customPermissions, "ORG_SETTINGS");
  const canViewAudit = hasOrgPermission(userRole, customPermissions, "AUDIT_LOGS_VIEW");

  useEffect(() => {
    if (activeTab === "audit" && canViewAudit) {
      setIsLoadingLogs(true);
      fetch(`/api/org/${organization.id}/audit-logs`, { credentials: "include" })
        .then((r) => (r.ok ? r.json() : { logs: [] }))
        .then((d) => setAuditLogs(d.logs || []))
        .catch(() => setAuditLogs([]))
        .finally(() => setIsLoadingLogs(false));
    }
  }, [activeTab, organization.id, canViewAudit]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEditSettings) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/organizations/${organization.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          website,
          about,
          license_number: licenseNumber,
          gst_number: gstNumber,
        }),
      });
      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold mb-2">
          <Settings className="size-3.5" />
          <span>Governance & Workspace Configuration</span>
        </div>
        <h1 className="text-2xl font-extrabold text-white">Organisation Settings & Compliance</h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage workspace credentials, official regulatory verification, security parameters, and immutable audit logs.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab("general")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
            activeTab === "general"
              ? "bg-blue-600 text-white"
              : "text-slate-400 hover:text-white hover:bg-slate-800"
          }`}
        >
          General Information
        </button>
        <button
          onClick={() => setActiveTab("verification")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
            activeTab === "verification"
              ? "bg-blue-600 text-white"
              : "text-slate-400 hover:text-white hover:bg-slate-800"
          }`}
        >
          Healthcare Verification
        </button>
        {canViewAudit && (
          <button
            onClick={() => setActiveTab("audit")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              activeTab === "audit"
                ? "bg-blue-600 text-white"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            Audit Logs
          </button>
        )}
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="size-4" /> Organisation settings saved successfully!
        </div>
      )}

      {/* General Settings */}
      {activeTab === "general" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs max-w-2xl">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Organisation Name *</label>
              <input
                type="text"
                required
                disabled={!canEditSettings}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Official Email</label>
                <input
                  type="email"
                  disabled={!canEditSettings}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Contact Phone</label>
                <input
                  type="text"
                  disabled={!canEditSettings}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Official Website</label>
              <input
                type="url"
                disabled={!canEditSettings}
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">About & Clinical Mission</label>
              <textarea
                rows={4}
                disabled={!canEditSettings}
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
              />
            </div>

            {canEditSettings && (
              <div className="pt-3 border-t border-slate-800 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  <Save className="size-4" />
                  <span>{saving ? "Saving..." : "Save Changes"}</span>
                </button>
              </div>
            )}
          </form>
        </div>
      )}

      {/* Healthcare Verification */}
      {activeTab === "verification" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 max-w-2xl">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
            <Shield className="size-5 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-white">Regulatory Verification Badge</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Verified healthcare organisations receive priority listing on jobs, automated CME accreditation clearance, and a verified trust badge.
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Clinical Establishment / Hospital Registration No.
              </label>
              <input
                type="text"
                placeholder="e.g. CEA/MH/2024/98432"
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                GSTIN / Corporate Tax Identification
              </label>
              <input
                type="text"
                placeholder="e.g. 27AAAAA0000A1Z5"
                value={gstNumber}
                onChange={(e) => setGstNumber(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {canEditSettings && (
              <div className="pt-3 border-t border-slate-800 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Submit Verification Details"}
                </button>
              </div>
            )}
          </form>
        </div>
      )}

      {/* Audit Logs */}
      {activeTab === "audit" && canViewAudit && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-white">Immutable Operational Audit Trail</h3>
          {isLoadingLogs ? (
            <div className="p-12 text-center text-slate-500 text-xs animate-pulse">
              Loading audit logs...
            </div>
          ) : auditLogs.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs">
              No audit log entries recorded yet.
            </div>
          ) : (
            <div className="space-y-2">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3.5 bg-slate-950 rounded-xl border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                >
                  <div>
                    <span className="font-bold text-white block">{log.action}</span>
                    <span className="text-slate-400 text-[11px]">
                      By {log.user_name} ({log.user_email}) • Entity: {log.entity_type} #{log.entity_id.slice(0, 8)}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 shrink-0">
                    {new Date(log.created_at).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
