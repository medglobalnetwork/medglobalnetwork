// ============================================================
// MGN College Placements & Career Cell Workspace
// modules/organizations/components/placements/PlacementsWorkspace.tsx
// ============================================================

"use client";

import React, { useState, useEffect } from "react";
import {
  Target,
  Plus,
  Search,
  Building2,
  Briefcase,
  Users,
  Award,
  CheckCircle2,
  MapPin,
  Clock,
  RefreshCw,
  X,
  ExternalLink,
} from "lucide-react";
import { OrganizationRecord, PlacementRecord, OrgRole, OrgPermission } from "../../types";
import { hasOrgPermission } from "../../lib/org-permissions";

interface PlacementsWorkspaceProps {
  organization: OrganizationRecord;
  userRole?: OrgRole;
  customPermissions?: OrgPermission[];
}

export function PlacementsWorkspace({
  organization,
  userRole = "VIEWER",
  customPermissions = [],
}: PlacementsWorkspaceProps) {
  const [placements, setPlacements] = useState<PlacementRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    company_name: "",
    job_title: "",
    job_type: "full_time" as const,
    eligible_programs: ["BPT", "MPT"],
    package_ctc: "₹6,00,000 - ₹9,00,000 PA",
    location: "Mumbai / Bengaluru",
    description: "",
  });

  const canManage =
    hasOrgPermission(userRole, customPermissions, "PLACEMENTS_MANAGE") ||
    userRole === "OWNER" ||
    userRole === "ADMIN" ||
    userRole === "DEAN" ||
    userRole === "PLACEMENT_OFFICER";

  const fetchPlacements = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/org/${organization.id}/placements`);
      if (res.ok) {
        const data = await res.json();
        setPlacements(data.placements || []);
      }
    } catch (err) {
      console.error("Failed to fetch placements:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlacements();
  }, [organization.id]);

  const handleCreatePlacement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.company_name || !formData.job_title) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/org/${organization.id}/placements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsAddModalOpen(false);
        setFormData({
          company_name: "",
          job_title: "",
          job_type: "full_time",
          eligible_programs: ["BPT", "MPT"],
          package_ctc: "",
          location: "",
          description: "",
        });
        await fetchPlacements();
      }
    } catch (err) {
      console.error("Failed to create placement:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Campus Placements &amp; Career Cell
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
              {placements.length} Active Drives
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Partner hospitals and corporate recruiters conducting campus hiring for enrolled students.
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-sm transition-all"
          >
            <Plus className="size-4" />
            <span>Post Placement Drive</span>
          </button>
        )}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-400 text-xs">
          <RefreshCw className="size-5 animate-spin mr-2 text-rose-500" />
          Loading placement portal...
        </div>
      ) : placements.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 space-y-3">
          <Target className="size-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-white">No Placement Drives Active</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Create placement drives, connect corporate healthcare recruiters, and match eligible students to career opportunities.
          </p>
          {canManage && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-500 transition-colors"
            >
              <Plus className="size-3.5" /> Post First Hiring Drive
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {placements.map((p) => (
            <div
              key={p.id}
              className="rounded-2xl bg-slate-900/70 border border-slate-800 p-5 space-y-4 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-semibold text-rose-400 flex items-center gap-1">
                      <Building2 className="size-3.5" />
                      {p.company_name}
                    </span>
                    <h3 className="text-base font-bold text-white mt-1">{p.job_title}</h3>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {p.status}
                  </span>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2">
                  {p.description || "Healthcare role for certified graduates with on-campus interview rounds."}
                </p>

                <div className="space-y-1.5 pt-2 border-t border-slate-800/80 text-xs text-slate-400">
                  {p.package_ctc && (
                    <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                      <span>Package: {p.package_ctc}</span>
                    </div>
                  )}
                  {p.location && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="size-3.5 text-slate-500" />
                      <span>{p.location}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-1 pt-1">
                  {p.eligible_programs.map((prog) => (
                    <span
                      key={prog}
                      className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300"
                    >
                      {prog}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-500">{p.applications_count || 0} Applied</span>
                <button className="font-semibold text-rose-400 hover:text-rose-300">
                  {canManage ? "Review Candidates" : "Apply Now"} &rarr;
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Target className="size-4 text-rose-400" />
                Post Placement Drive
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePlacement} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Recruiting Company / Hospital *</label>
                <input
                  type="text"
                  required
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  placeholder="e.g. Apollo Healthcare / Max Hospital Group"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Job Title *</label>
                <input
                  type="text"
                  required
                  value={formData.job_title}
                  onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                  placeholder="e.g. Resident Physiotherapist / Clinical Associate"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Package (CTC)</label>
                  <input
                    type="text"
                    value={formData.package_ctc}
                    onChange={(e) => setFormData({ ...formData, package_ctc: e.target.value })}
                    placeholder="e.g. 6.5 LPA"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Mumbai, India"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Job Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Eligibility criteria, selection stages, interview rounds..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold disabled:opacity-50"
                >
                  {isSubmitting ? "Posting..." : "Post Drive"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
