// ============================================================
// MGN College Exams & Assessments Workspace
// modules/organizations/components/assessments/AssessmentsWorkspace.tsx
// ============================================================

"use client";

import React, { useState, useEffect } from "react";
import {
  ClipboardList,
  Plus,
  Search,
  CheckCircle2,
  FileQuestion,
  GraduationCap,
  Clock,
  Layers,
  Award,
  RefreshCw,
  X,
  BookOpen,
  Filter,
} from "lucide-react";
import { OrganizationRecord, AssessmentRecord, OrgRole, OrgPermission } from "../../types";
import { hasOrgPermission } from "../../lib/org-permissions";

interface AssessmentsWorkspaceProps {
  organization: OrganizationRecord;
  userRole?: OrgRole;
  customPermissions?: OrgPermission[];
}

export function AssessmentsWorkspace({
  organization,
  userRole = "VIEWER",
  customPermissions = [],
}: AssessmentsWorkspaceProps) {
  const [assessments, setAssessments] = useState<AssessmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    assessment_type: "mcq" as const,
    department: "Physiotherapy",
    total_marks: 100,
    pass_percentage: 50,
    duration_minutes: 60,
    scope: "department" as const,
  });

  const canManage =
    hasOrgPermission(userRole, customPermissions, "ASSESSMENTS_MANAGE") ||
    userRole === "OWNER" ||
    userRole === "ADMIN" ||
    userRole === "DEAN" ||
    userRole === "FACULTY" ||
    userRole === "HOD";

  const fetchAssessments = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/org/${organization.id}/assessments`);
      if (res.ok) {
        const data = await res.json();
        setAssessments(data.assessments || []);
      }
    } catch (err) {
      console.error("Failed to fetch assessments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessments();
  }, [organization.id]);

  const handleCreateAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/org/${organization.id}/assessments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsAddModalOpen(false);
        setFormData({
          title: "",
          assessment_type: "mcq",
          department: "Physiotherapy",
          total_marks: 100,
          pass_percentage: 50,
          duration_minutes: 60,
          scope: "department",
        });
        await fetchAssessments();
      }
    } catch (err) {
      console.error("Failed to create assessment:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = assessments.filter((a) => {
    if (selectedType === "all") return true;
    return a.assessment_type === selectedType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Exams &amp; Assessments
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              {assessments.length} Test Modules
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Create MCQ banks, clinical case scenarios, practical grading, and internal examinations.
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-sm transition-all"
          >
            <Plus className="size-4" />
            <span>Create Assessment</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {[
          { id: "all", label: "All Formats" },
          { id: "mcq", label: "MCQ Quizzes" },
          { id: "case_based", label: "Clinical Case Scenarios" },
          { id: "practical", label: "Practical / OSCE" },
          { id: "internal", label: "Internal Assessments" },
          { id: "assignment", label: "Assignments" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedType(tab.id)}
            className={`px-3 py-1.5 rounded-xl font-medium transition-colors whitespace-nowrap ${
              selectedType === tab.id
                ? "bg-cyan-600 text-white font-bold"
                : "bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-400 text-xs">
          <RefreshCw className="size-5 animate-spin mr-2 text-cyan-500" />
          Loading assessments...
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 space-y-3">
          <ClipboardList className="size-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-white">No Assessments Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Design multiple-choice examinations, OSCE practical rubrics, or case studies for your students.
          </p>
          {canManage && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-600 text-white text-xs font-bold hover:bg-cyan-500 transition-colors"
            >
              <Plus className="size-3.5" /> Build First Assessment
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl bg-slate-900/70 border border-slate-800 p-5 space-y-4 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-cyan-500/15 text-cyan-400 border border-cyan-500/20">
                    {item.assessment_type.replace("_", " ")}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded capitalize">
                    {item.scope}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white leading-snug">{item.title}</h3>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Clock className="size-3.5 text-cyan-400" />
                    <span>{item.duration_minutes} Mins</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Award className="size-3.5 text-amber-400" />
                    <span>{item.total_marks} Marks</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-500">{item.submissions_count || 0} Attempts</span>
                <button className="font-semibold text-cyan-400 hover:text-cyan-300">
                  {canManage ? "Manage & Grade" : "Take Exam"} &rarr;
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
                <ClipboardList className="size-4 text-cyan-400" />
                Create Exam / Assessment
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAssessment} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Assessment Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Biomechanics & Kinesiology Midterm Assessment"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Type</label>
                  <select
                    value={formData.assessment_type}
                    onChange={(e) => setFormData({ ...formData, assessment_type: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="mcq">MCQ Quiz</option>
                    <option value="case_based">Clinical Case</option>
                    <option value="practical">Practical / OSCE</option>
                    <option value="internal">Internal Exam</option>
                    <option value="assignment">Assignment</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Scope</label>
                  <select
                    value={formData.scope}
                    onChange={(e) => setFormData({ ...formData, scope: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="department">Department Only</option>
                    <option value="institution">Whole Institution</option>
                    <option value="private">Private Faculty</option>
                    <option value="mgn_published">MGN Published</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Total Marks</label>
                  <input
                    type="number"
                    value={formData.total_marks}
                    onChange={(e) => setFormData({ ...formData, total_marks: parseInt(e.target.value, 10) || 100 })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Pass %</label>
                  <input
                    type="number"
                    value={formData.pass_percentage}
                    onChange={(e) => setFormData({ ...formData, pass_percentage: parseInt(e.target.value, 10) || 50 })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Duration (Min)</label>
                  <input
                    type="number"
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value, 10) || 60 })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
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
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold disabled:opacity-50"
                >
                  {isSubmitting ? "Creating..." : "Create Assessment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
