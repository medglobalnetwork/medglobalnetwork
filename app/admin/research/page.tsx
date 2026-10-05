// app/admin/research/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import {
  AdminDataTable,
  ColumnDef,
} from "@/modules/admin/components/AdminDataTable";
import {
  FlaskConical,
  CheckCircle,
  Clock,
  RefreshCw,
  Search,
  BookOpen,
  Briefcase,
} from "lucide-react";
import { AdminMetricCard } from "@/modules/admin/components/AdminMetricCard";

interface ResearchAdminProject {
  id: string;
  slug: string;
  title: string;
  research_area: string;
  status: string;
  collaborators_count: number;
  created_at: string;
  lead_name?: string;
  lead_email?: string;
  organization_name?: string;
}

export default function AdminResearchPage() {
  const [projects, setProjects] = useState<ResearchAdminProject[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/research");
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects || []);
      }
    } catch (err) {
      console.error("Error loading admin research:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateStatus = async (projectId: string, newStatus: string) => {
    try {
      const res = await fetch("/api/admin/research", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          status: newStatus,
        }),
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error("Error updating research status:", err);
    }
  };

  const columns: ColumnDef<ResearchAdminProject>[] = [
    {
      key: "title",
      header: "Study / Trial",
      render: (row: ResearchAdminProject) => (
        <div>
          <span className="font-bold text-xs text-slate-900 leading-tight block">{row.title}</span>
          <div className="flex items-center gap-2 text-[10px] text-purple-700 font-semibold mt-0.5">
            <span>{row.research_area}</span>
          </div>
        </div>
      ),
    },
    {
      key: "lead_name",
      header: "Lead Investigator",
      render: (row: ResearchAdminProject) => (
        <div className="text-xs">
          <p className="font-bold text-slate-900">{row.lead_name || "Investigator"}</p>
          <p className="text-[10px] text-slate-500">{row.lead_email}</p>
        </div>
      ),
    },
    {
      key: "collaborators_count",
      header: "Collaborators",
      render: (row: ResearchAdminProject) => (
        <span className="text-xs font-bold text-slate-900">
          {row.collaborators_count}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row: ResearchAdminProject) => {
        const badgeColors: Record<string, string> = {
          active: "bg-emerald-50 text-emerald-700 border-emerald-200",
          recruiting: "bg-blue-50 text-blue-700 border-blue-200",
          completed: "bg-purple-50 text-purple-700 border-purple-200",
          suspended: "bg-rose-50 text-rose-700 border-rose-200",
          draft: "bg-slate-100 text-slate-600 border-slate-200",
          pending_review: "bg-amber-50 text-amber-700 border-amber-200",
        };
        return (
          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold capitalize border ${badgeColors[row.status] || "bg-purple-50 text-purple-700 border-purple-200"}`}>
            {row.status.replace(/_/g, " ")}
          </span>
        );
      },
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (row: ResearchAdminProject) => (
        <div className="flex items-center justify-end gap-1.5">
          {row.status === "draft" || row.status === "pending_review" ? (
            <button
              type="button"
              onClick={() => handleUpdateStatus(row.id, "active")}
              className="rounded-xl bg-purple-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-purple-700 shadow-2xs"
            >
              Approve
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleUpdateStatus(row.id, "suspended")}
              className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 shadow-2xs"
            >
              Suspend
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
            Research & Trials Control Plane
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Moderate clinical studies, multi-center trials, and scientific collaboration proposals.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchData}
          className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-colors shadow-2xs w-fit"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-blue-600" : "text-slate-500"}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <AdminMetricCard
          title="Total Studies"
          value={projects.length}
          icon={<FlaskConical className="h-5 w-5" />}
          badgeColor="purple"
        />
        <AdminMetricCard
          title="Active Projects"
          value={projects.filter((p) => p.status === "active" || p.status === "recruiting").length}
          icon={<CheckCircle className="h-5 w-5" />}
          badgeColor="emerald"
        />
        <AdminMetricCard
          title="Recruiting Collaborators"
          value={projects.filter((p) => p.status === "recruiting").length}
          icon={<Clock className="h-5 w-5" />}
          badgeColor="blue"
        />
      </div>

      {/* Table */}
      <AdminDataTable
        columns={columns}
        data={projects}
        isLoading={loading}
        title="Active Scientific & Clinical Research Studies"
        subtitle="Multi-center trials and investigator registries"
      />
    </div>
  );
}
