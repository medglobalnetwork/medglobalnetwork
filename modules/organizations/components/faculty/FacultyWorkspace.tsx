// ============================================================
// MGN College Faculty Directory Workspace
// modules/organizations/components/faculty/FacultyWorkspace.tsx
// ============================================================

"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  Plus,
  BookOpen,
  GraduationCap,
  Mail,
  ShieldCheck,
  RefreshCw,
  Award,
} from "lucide-react";
import { OrganizationRecord, OrganizationMemberRecord, OrgRole, OrgPermission } from "../../types";
import { hasOrgPermission } from "../../lib/org-permissions";

interface FacultyWorkspaceProps {
  organization: OrganizationRecord;
  userRole?: OrgRole;
  customPermissions?: OrgPermission[];
}

export function FacultyWorkspace({
  organization,
  userRole = "VIEWER",
  customPermissions = [],
}: FacultyWorkspaceProps) {
  const [faculty, setFaculty] = useState<OrganizationMemberRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const canManage =
    hasOrgPermission(userRole, customPermissions, "FACULTY_MANAGE") ||
    userRole === "OWNER" ||
    userRole === "ADMIN" ||
    userRole === "DEAN";

  const fetchFaculty = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/org/${organization.id}/members`);
      if (res.ok) {
        const data = await res.json();
        // Filter or display all teaching/academic members
        setFaculty(data.members || []);
      }
    } catch (err) {
      console.error("Failed to load faculty:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaculty();
  }, [organization.id]);

  const filteredFaculty = faculty.filter((f) => {
    const term = searchQuery.toLowerCase();
    return (
      (f.name && f.name.toLowerCase().includes(term)) ||
      (f.email && f.email.toLowerCase().includes(term)) ||
      (f.department && f.department.toLowerCase().includes(term)) ||
      (f.designation && f.designation.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Faculty &amp; Academic Staff
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {faculty.length} Instructors
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Professors, Assistant Lecturers, Clinical Demonstrators, and Academic Department Heads.
          </p>
        </div>

        {canManage && (
          <a
            href={`/org/${organization.id}/members?invite=true`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition-all"
          >
            <Plus className="size-4" />
            <span>Invite Faculty Member</span>
          </a>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="size-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by faculty name, designation, or department..."
          className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
        />
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-400 text-xs">
          <RefreshCw className="size-5 animate-spin mr-2 text-emerald-500" />
          Loading faculty directory...
        </div>
      ) : filteredFaculty.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 space-y-3">
          <Users className="size-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-white">No Faculty Members Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Invite professors and teaching instructors to configure their Instructor Studio and assign subjects.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFaculty.map((member) => (
            <div
              key={member.id}
              className="rounded-2xl bg-slate-900/70 border border-slate-800 p-5 space-y-4 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div className="flex items-start gap-3">
                <div className="size-10 rounded-full bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-sm font-bold shrink-0">
                  {member.name ? member.name.charAt(0).toUpperCase() : "F"}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-white truncate">{member.name || "Faculty Member"}</h3>
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
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                  <ShieldCheck className="size-3" /> Active
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
