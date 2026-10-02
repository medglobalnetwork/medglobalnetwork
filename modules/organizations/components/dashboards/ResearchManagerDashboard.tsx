"use client";

import React from "react";
import Link from "next/link";
import {
  FlaskConical,
  Users,
  FileText,
  Plus,
  ArrowUpRight,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { OrganizationRecord, OrgDashboardMetrics } from "../../types";

interface Props {
  organization: OrganizationRecord;
  metrics: OrgDashboardMetrics;
}

export function ResearchManagerDashboard({ organization, metrics }: Props) {
  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold mb-2">
            <FlaskConical className="size-3.5" />
            <span>Research & Clinical Trials</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white">Scientific Projects & Collaborations</h1>
          <p className="text-xs text-slate-400 mt-1">
            Conduct clinical studies, invite cross-institutional researchers, and publish scientific findings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/org/${organization.id}/research?action=create`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all"
          >
            <Plus className="size-4" />
            <span>Start Research Project</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-xs font-semibold text-slate-400">Active Projects</span>
          <p className="text-2xl font-bold text-white mt-2">{metrics.activeProjectsCount}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-xs font-semibold text-slate-400">Collaborating Researchers</span>
          <p className="text-2xl font-bold text-cyan-400 mt-2">{metrics.researchCollaboratorsCount}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-xs font-semibold text-slate-400">Publications & Papers</span>
          <p className="text-2xl font-bold text-emerald-400 mt-2">{metrics.publicationsCount}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-white mb-2">Ongoing Studies & Protocols</h3>
          <p className="text-xs text-slate-400 mb-4">
            Manage IRB approvals, trial phases, sample datasets, and hypothesis tracking.
          </p>
          <Link
            href={`/org/${organization.id}/research`}
            className="text-xs font-bold text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1"
          >
            <span>View Studies</span> <ArrowUpRight className="size-3.5" />
          </Link>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-white mb-2">Multi-Center Research Opportunities</h3>
          <p className="text-xs text-slate-400 mb-4">
            Post co-investigator openings and recruit qualified medical specialists across MGN.
          </p>
          <Link
            href={`/org/${organization.id}/research`}
            className="text-xs font-bold text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1"
          >
            <span>Manage Opportunities</span> <ArrowUpRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
