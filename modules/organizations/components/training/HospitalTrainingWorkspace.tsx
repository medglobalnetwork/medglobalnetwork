// ============================================================
// MGN Hospital Internal Training & SOP Workspace
// modules/organizations/components/training/HospitalTrainingWorkspace.tsx
// ============================================================

"use client";

import React, { useState, useEffect } from "react";
import {
  Award,
  Plus,
  Search,
  CheckCircle2,
  Video,
  FileText,
  Clock,
  ShieldCheck,
  RefreshCw,
  X,
  AlertCircle,
  Users,
} from "lucide-react";
import { OrganizationRecord, HospitalInternalTrainingRecord, OrgRole, OrgPermission } from "../../types";
import { hasOrgPermission } from "../../lib/org-permissions";

interface HospitalTrainingWorkspaceProps {
  organization: OrganizationRecord;
  userRole?: OrgRole;
  customPermissions?: OrgPermission[];
}

export function HospitalTrainingWorkspace({
  organization,
  userRole = "VIEWER",
  customPermissions = [],
}: HospitalTrainingWorkspaceProps) {
  const [trainings, setTrainings] = useState<HospitalInternalTrainingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    category: "Infection Control" as const,
    department: "Emergency",
    access_scope: "org_only" as const,
    content_type: "video" as const,
    duration_hours: 2,
    has_certificate: true,
    mandatory: true,
    description: "",
  });

  const canManage =
    hasOrgPermission(userRole, customPermissions, "TRAINING_MANAGE") ||
    userRole === "OWNER" ||
    userRole === "ADMIN" ||
    userRole === "TRAINING_MANAGER" ||
    userRole === "HOD";

  const fetchTrainings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/org/${organization.id}/training`);
      if (res.ok) {
        const data = await res.json();
        setTrainings(data.trainings || []);
      }
    } catch (err) {
      console.error("Failed to load hospital trainings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainings();
  }, [organization.id]);

  const handleCreateTraining = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/org/${organization.id}/training`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsAddModalOpen(false);
        setFormData({
          title: "",
          category: "Infection Control",
          department: "Emergency",
          access_scope: "org_only",
          content_type: "video",
          duration_hours: 2,
          has_certificate: true,
          mandatory: true,
          description: "",
        });
        await fetchTrainings();
      }
    } catch (err) {
      console.error("Failed to create hospital training:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = trainings.filter((t) => {
    if (selectedCategory === "all") return true;
    return t.category === selectedCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Hospital Internal Training &amp; SOPs
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {trainings.length} Modules Active
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Mandatory clinical safety protocols, infection control guidelines, SOP videos, and quizzes.
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-sm transition-all"
          >
            <Plus className="size-4" />
            <span>Create SOP Training</span>
          </button>
        )}
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {[
          { id: "all", label: "All SOP Categories" },
          { id: "Infection Control", label: "Infection Control" },
          { id: "Emergency Protocol", label: "Emergency Protocols" },
          { id: "Patient Safety", label: "Patient Safety" },
          { id: "Clinical Skills", label: "Clinical Skills" },
          { id: "Hospital SOP Training", label: "Hospital SOPs" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedCategory(tab.id)}
            className={`px-3 py-1.5 rounded-xl font-medium transition-colors whitespace-nowrap ${
              selectedCategory === tab.id
                ? "bg-indigo-600 text-white font-bold"
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
          <RefreshCw className="size-5 animate-spin mr-2 text-indigo-500" />
          Loading SOP trainings...
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 space-y-3">
          <Award className="size-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-white">No Hospital SOP Modules Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Publish clinical SOPs, infection control standards, and mandatory department compliance modules.
          </p>
          {canManage && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 transition-colors"
            >
              <Plus className="size-3.5" /> Publish First Training
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((t) => (
            <div
              key={t.id}
              className="rounded-2xl bg-slate-900/70 border border-slate-800 p-5 space-y-4 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
                    {t.category}
                  </span>
                  {t.mandatory && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      Mandatory
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-white leading-snug">{t.title}</h3>

                <p className="text-xs text-slate-400 line-clamp-2">
                  {t.description || "Clinical SOP guideline module with video demonstration and staff verification quiz."}
                </p>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Clock className="size-3.5 text-indigo-400" />
                    <span>{t.duration_hours} Hours</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="size-3.5 text-emerald-400" />
                    <span>{t.has_certificate ? "Certificate" : "Standard"}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-500 capitalize">{t.access_scope.replace("_", " ")}</span>
                <button className="font-semibold text-indigo-400 hover:text-indigo-300">
                  {canManage ? "Manage Module" : "Start Module"} &rarr;
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
                <Award className="size-4 text-indigo-400" />
                Add Hospital SOP Training
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTraining} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Training Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Hospital-Acquired Infection (HAI) Prevention SOP"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Infection Control">Infection Control</option>
                    <option value="Emergency Protocol">Emergency Protocol</option>
                    <option value="Patient Safety">Patient Safety</option>
                    <option value="Clinical Skills">Clinical Skills</option>
                    <option value="Hospital SOP Training">Hospital SOP Training</option>
                    <option value="Department Training">Department Training</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Access Scope</label>
                  <select
                    value={formData.access_scope}
                    onChange={(e) => setFormData({ ...formData, access_scope: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="org_only">Whole Hospital Staff</option>
                    <option value="department_only">Department Only</option>
                    <option value="selected_staff">Selected Staff</option>
                    <option value="public">Public</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Duration (Hours)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.duration_hours}
                    onChange={(e) => setFormData({ ...formData, duration_hours: parseFloat(e.target.value) || 2 })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Department</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="e.g. ICU / Emergency"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.mandatory}
                    onChange={(e) => setFormData({ ...formData, mandatory: e.target.checked })}
                    className="rounded border-slate-800 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-slate-300 font-medium">Mandatory Compliance</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.has_certificate}
                    onChange={(e) => setFormData({ ...formData, has_certificate: e.target.checked })}
                    className="rounded border-slate-800 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-slate-300 font-medium">Issue Certificate</span>
                </label>
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
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold disabled:opacity-50"
                >
                  {isSubmitting ? "Creating..." : "Create Training"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
