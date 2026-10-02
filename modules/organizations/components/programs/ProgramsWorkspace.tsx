// ============================================================
// MGN College Academic Programs Workspace
// modules/organizations/components/programs/ProgramsWorkspace.tsx
// ============================================================

"use client";

import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Plus,
  Search,
  GraduationCap,
  Layers,
  ChevronRight,
  Clock,
  Award,
  RefreshCw,
  X,
  Users,
} from "lucide-react";
import { OrganizationRecord, AcademicProgramRecord, OrgRole, OrgPermission } from "../../types";
import { hasOrgPermission } from "../../lib/org-permissions";

interface ProgramsWorkspaceProps {
  organization: OrganizationRecord;
  userRole?: OrgRole;
  customPermissions?: OrgPermission[];
}

export function ProgramsWorkspace({
  organization,
  userRole = "VIEWER",
  customPermissions = [],
}: ProgramsWorkspaceProps) {
  const [programs, setPrograms] = useState<AcademicProgramRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    degree_level: "Undergraduate" as const,
    duration_years: 4,
    department: "Physiotherapy",
    description: "",
  });

  const canManage =
    hasOrgPermission(userRole, customPermissions, "PROGRAMS_MANAGE") ||
    userRole === "OWNER" ||
    userRole === "ADMIN" ||
    userRole === "DEAN";

  const fetchPrograms = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/org/${organization.id}/programs`);
      if (res.ok) {
        const data = await res.json();
        setPrograms(data.programs || []);
      }
    } catch (err) {
      console.error("Failed to fetch programs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, [organization.id]);

  const handleCreateProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.code) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/org/${organization.id}/programs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsAddModalOpen(false);
        setFormData({
          name: "",
          code: "",
          degree_level: "Undergraduate",
          duration_years: 4,
          department: "Physiotherapy",
          description: "",
        });
        await fetchPrograms();
      }
    } catch (err) {
      console.error("Failed to create academic program:", err);
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
              Academic Programs &amp; Curriculum
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
              {programs.length} Active Degrees
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Program &rarr; Year / Semester &rarr; Subjects &rarr; Courses &rarr; Modules &rarr; Lessons &rarr; Assessments
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-sm transition-all"
          >
            <Plus className="size-4" />
            <span>Create Program</span>
          </button>
        )}
      </div>

      {/* Programs Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-400 text-xs">
          <RefreshCw className="size-5 animate-spin mr-2 text-purple-500" />
          Loading academic programs...
        </div>
      ) : programs.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 space-y-3">
          <BookOpen className="size-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-white">No Academic Programs Configured</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Add degree programs such as BPT, MBBS, BDS, B.Sc Nursing, or MPT to organize your institutional learning.
          </p>
          {canManage && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-500 transition-colors"
            >
              <Plus className="size-3.5" /> Create First Program
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.map((program) => (
            <div
              key={program.id}
              className="rounded-2xl bg-slate-900/70 border border-slate-800 p-5 space-y-4 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-purple-500/15 text-purple-400 border border-purple-500/20 font-mono">
                      {program.code}
                    </span>
                    <h3 className="text-base font-bold text-white mt-1.5">{program.name}</h3>
                  </div>
                  <span className="text-xs font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                    {program.degree_level}
                  </span>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2">
                  {program.description || "Comprehensive academic syllabus and clinical internship structure."}
                </p>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Clock className="size-3.5 text-indigo-400" />
                    <span>{program.duration_years} Years</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="size-3.5 text-blue-400" />
                    <span>{program.student_count || 0} Enrolled</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] font-medium text-slate-500">
                  {program.department || "Academic Faculty"}
                </span>
                <button className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1">
                  <span>View Syllabus</span>
                  <ChevronRight className="size-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Program Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BookOpen className="size-4 text-purple-400" />
                Add Academic Program
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProgram} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Program Title *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Bachelor of Physiotherapy (BPT)"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Program Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. BPT"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Degree Level</label>
                  <select
                    value={formData.degree_level}
                    onChange={(e) => setFormData({ ...formData, degree_level: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="Undergraduate">Undergraduate</option>
                    <option value="Postgraduate">Postgraduate</option>
                    <option value="Diploma">Diploma</option>
                    <option value="Doctorate">Doctorate</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Duration (Years)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.duration_years}
                    onChange={(e) => setFormData({ ...formData, duration_years: parseFloat(e.target.value) || 4 })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Department</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="e.g. Physiotherapy"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Overview of syllabus, practical rotations, clinical postings..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
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
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold disabled:opacity-50"
                >
                  {isSubmitting ? "Creating..." : "Create Program"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
