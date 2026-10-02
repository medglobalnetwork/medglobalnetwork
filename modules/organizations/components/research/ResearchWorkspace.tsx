"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FlaskConical,
  Plus,
  Users,
  FileText,
  Search,
  CheckCircle2,
  X,
  BookOpen,
} from "lucide-react";
import { OrganizationRecord, OrgRole, OrgPermission } from "../../types";
import { hasOrgPermission } from "../../lib/org-permissions";

interface Props {
  organization: OrganizationRecord;
  userRole?: OrgRole;
  customPermissions?: OrgPermission[];
}

export function ResearchWorkspace({ organization, userRole, customPermissions }: Props) {
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [field, setField] = useState("Cardiology");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const canCreate = hasOrgPermission(userRole, customPermissions, "RESEARCH_CREATE");

  const loadProjects = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/org/${organization.id}/research`, { credentials: "include" });
      const data = await res.json();
      if (res.ok) {
        setProjects(data.projects || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, [organization.id]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/org/${organization.id}/research`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          field,
          description,
        }),
      });
      if (res.ok) {
        setIsCreateOpen(false);
        setTitle("");
        setDescription("");
        loadProjects();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold mb-2">
            <FlaskConical className="size-3.5" />
            <span>Clinical Research & Trials</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white">Research Studies & Opportunities</h1>
          <p className="text-xs text-slate-400 mt-1">
            Conduct multi-center trials, manage IRB ethics documentation, and publish scientific findings.
          </p>
        </div>

        {canCreate && (
          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-sm transition-all"
          >
            <Plus className="size-4" />
            <span>Start Research Study</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full p-12 text-center text-slate-500 text-xs animate-pulse">
            Loading research projects...
          </div>
        ) : projects.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl">
            <FlaskConical className="size-8 mx-auto mb-2 text-slate-600" />
            <p className="text-sm font-semibold text-white">No active research studies</p>
            <p className="text-xs text-slate-400 mt-1">
              Initiate a clinical investigation, epidemiological study, or medical trial.
            </p>
          </div>
        ) : (
          projects.map((p) => (
            <div
              key={p.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors flex flex-col justify-between"
            >
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  {p.field || "Clinical Research"}
                </span>
                <h3 className="text-base font-bold text-white mt-2">{p.title}</h3>
                <p className="text-xs text-slate-400 line-clamp-2 mt-1">{p.description}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Users className="size-3.5 text-cyan-400" />
                  {p.collaborators_count || 1} Collaborators
                </span>
                <span className="text-emerald-400 font-bold">Active</span>
              </div>
            </div>
          ))
        )}
      </div>

      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white">Start Research Study</h2>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Study Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Multi-Center Observational Study on Post-Infarction Biomarkers"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Medical Domain / Field</label>
                <input
                  type="text"
                  value={field}
                  onChange={(e) => setField(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Study Protocol / Abstract</label>
                <textarea
                  rows={4}
                  placeholder="Summary of methodology, hypothesis, and target cohort..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition-all disabled:opacity-50"
                >
                  {saving ? "Creating..." : "Launch Study"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
