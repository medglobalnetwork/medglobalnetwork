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
          action: "update_project_status",
          targetId: projectId,
          status: newStatus,
          reason: `Admin updated status to ${newStatus}`,
        }),
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const columns: ColumnDef<ResearchAdminProject>[] = [
    {
      key: "title",
      header: "Research Study",
      render: (row: ResearchAdminProject) => (
        <div>
          <span className="font-bold text-xs text-[#171717]">{row.title}</span>
          <div className="flex items-center gap-2 text-[10px] text-purple-700">
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
          <p className="font-semibold text-[#171717]">{row.lead_name || "Investigator"}</p>
          <p className="text-[10px] text-[#77716b]">{row.lead_email}</p>
        </div>
      ),
    },
    {
      key: "collaborators_count",
      header: "Collaborators",
      render: (row: ResearchAdminProject) => (
        <span className="text-xs font-semibold text-[#171717]">
          {row.collaborators_count}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row: ResearchAdminProject) => (
        <span className="rounded-md bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-800 capitalize">
          {row.status}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (row: ResearchAdminProject) => (
        <div className="flex items-center gap-1">
          {row.status === "draft" || row.status === "pending_review" ? (
            <button
              type="button"
              onClick={() => handleUpdateStatus(row.id, "active")}
              className="rounded-lg bg-purple-700 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-purple-800"
            >
              Approve
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleUpdateStatus(row.id, "suspended")}
              className="rounded-lg border border-rose-300 px-2 py-1 text-[11px] font-semibold text-rose-700 hover:bg-rose-50"
            >
              Suspend
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#171717]">Research & Trials Control Plane</h1>
          <p className="text-xs text-[#5d5854]">
            Moderate clinical studies, multi-center trials, and scientific collaboration proposals.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchData}
          className="flex items-center gap-1.5 rounded-xl border border-[#ded8d1] bg-white px-3 py-1.5 text-xs font-semibold text-[#171717] hover:bg-[#f8f7f6]"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <AdminMetricCard
          title="Total Studies"
          value={projects.length}
          icon={<FlaskConical className="h-5 w-5" />}
        />
        <AdminMetricCard
          title="Active Projects"
          value={projects.filter((p) => p.status === "active" || p.status === "recruiting").length}
          icon={<CheckCircle className="h-5 w-5" />}
        />
        <AdminMetricCard
          title="Recruiting Collaborators"
          value={projects.filter((p) => p.status === "recruiting").length}
          icon={<Clock className="h-5 w-5" />}
        />
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-[#e8e6e3] bg-white shadow-xs overflow-hidden">
        <AdminDataTable
          columns={columns}
          data={projects}
          isLoading={loading}
        />
      </div>
    </div>
  );
}
