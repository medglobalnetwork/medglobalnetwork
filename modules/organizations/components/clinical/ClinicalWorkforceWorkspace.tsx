// ============================================================
// MGN Hospital Clinical Workforce Workspace
// modules/organizations/components/clinical/ClinicalWorkforceWorkspace.tsx
// ============================================================

"use client";

import React, { useState, useEffect } from "react";
import {
  Stethoscope,
  Users,
  Search,
  Plus,
  ShieldCheck,
  AlertCircle,
  Award,
  Network,
  Mail,
  HeartPulse,
  Activity,
  RefreshCw,
} from "lucide-react";
import { OrganizationRecord, OrganizationMemberRecord, OrgRole, OrgPermission } from "../../types";
import { hasOrgPermission } from "../../lib/org-permissions";

interface ClinicalWorkforceWorkspaceProps {
  organization: OrganizationRecord;
  userRole?: OrgRole;
  customPermissions?: OrgPermission[];
}

export function ClinicalWorkforceWorkspace({
  organization,
  userRole = "VIEWER",
  customPermissions = [],
}: ClinicalWorkforceWorkspaceProps) {
  const [members, setMembers] = useState<OrganizationMemberRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProfession, setSelectedProfession] = useState<string>("all");

  const canManage =
    hasOrgPermission(userRole, customPermissions, "CLINICAL_WORKFORCE_MANAGE") ||
    userRole === "OWNER" ||
    userRole === "ADMIN" ||
    userRole === "HR_MANAGER" ||
    userRole === "HR_RECRUITER";

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/org/${organization.id}/members`);
      if (res.ok) {
        const data = await res.json();
        setMembers(data.members || []);
      }
    } catch (err) {
      console.error("Failed to load clinical members:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [organization.id]);

  const filteredMembers = members.filter((m) => {
    const term = searchQuery.toLowerCase();
    const matchesSearch =
      (m.name && m.name.toLowerCase().includes(term)) ||
      (m.email && m.email.toLowerCase().includes(term)) ||
      (m.department && m.department.toLowerCase().includes(term)) ||
      (m.designation && m.designation.toLowerCase().includes(term));

    if (selectedProfession === "all") return matchesSearch;

    const des = (m.designation || "").toLowerCase();
    const dept = (m.department || "").toLowerCase();
    const prof = (m.profession || "").toLowerCase();

    if (selectedProfession === "doctor") {
      return matchesSearch && (des.includes("dr") || des.includes("doctor") || prof.includes("doctor"));
    }
    if (selectedProfession === "nurse") {
      return matchesSearch && (des.includes("nurse") || dept.includes("nurs") || prof.includes("nurse"));
    }
    if (selectedProfession === "physio") {
      return matchesSearch && (des.includes("physio") || dept.includes("physio") || prof.includes("physio"));
    }
    if (selectedProfession === "allied") {
      return matchesSearch && (des.includes("technician") || des.includes("therapist") || des.includes("pharmacist") || des.includes("radiology") || des.includes("lab"));
    }
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Clinical Workforce Roster
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-500/10 text-teal-400 border border-teal-500/20">
              {members.length} Total Staff
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Doctors, Nurses, Physiotherapists, Pharmacists, Radiology, Lab &amp; OT Healthcare Staff.
          </p>
        </div>

        {canManage && (
          <a
            href={`/org/${organization.id}/members?invite=true`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-sm transition-all"
          >
            <Plus className="size-4" />
            <span>Onboard Clinical Staff</span>
          </a>
        )}
      </div>

      {/* Verification Boundary Notice */}
      <div className="p-3.5 rounded-xl bg-slate-900/90 border border-teal-900/40 flex items-start gap-3 text-xs text-slate-300">
        <ShieldCheck className="size-4 text-teal-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-white">Central Verification Standard: </span>
          Hospital administrators manage organization membership and clinical departmental roles. Medical license and professional badge verification is verified via the central MGN credentialing system.
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {[
          { id: "all", label: "All Clinical Staff" },
          { id: "doctor", label: "Doctors / Physicians" },
          { id: "nurse", label: "Nursing Staff" },
          { id: "physio", label: "Physiotherapists" },
          { id: "allied", label: "Allied Health / OT / Lab" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedProfession(tab.id)}
            className={`px-3 py-1.5 rounded-xl font-medium transition-colors whitespace-nowrap ${
              selectedProfession === tab.id
                ? "bg-teal-600 text-white font-bold"
                : "bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="size-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by practitioner name, department, designation, or email..."
          className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
        />
      </div>

      {/* Workforce Roster */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-400 text-xs">
          <RefreshCw className="size-5 animate-spin mr-2 text-teal-500" />
          Loading clinical workforce roster...
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 space-y-3">
          <Stethoscope className="size-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-white">No Clinical Staff in Category</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Onboard doctors, nurses, and allied healthcare professionals to this hospital roster.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map((member) => (
            <div
              key={member.id}
              className="rounded-2xl bg-slate-900/70 border border-slate-800 p-5 space-y-4 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div className="flex items-start gap-3">
                <div className="size-10 rounded-full bg-teal-600/20 text-teal-400 border border-teal-500/30 flex items-center justify-center text-sm font-bold shrink-0">
                  {member.name ? member.name.charAt(0).toUpperCase() : "C"}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-white truncate">{member.name || "Practitioner"}</h3>
                  <p className="text-xs text-slate-400 truncate">{member.designation || member.role}</p>
                  {member.department && (
                    <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300">
                      {member.department}
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-1.5 truncate">
                  <Mail className="size-3.5 text-slate-500 shrink-0" />
                  <span className="truncate">{member.email}</span>
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-400">
                  <ShieldCheck className="size-3" /> Verified Org Role
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
