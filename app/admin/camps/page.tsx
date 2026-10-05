// app/admin/camps/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import {
  AdminDataTable,
  ColumnDef,
} from "@/modules/admin/components/AdminDataTable";
import {
  Tent,
  CheckCircle,
  Clock,
  Eye,
  RefreshCw,
  Search,
  XCircle,
  FileCheck2,
} from "lucide-react";
import { AdminMetricCard } from "@/modules/admin/components/AdminMetricCard";

interface CampAdminRecord {
  id: string;
  slug: string;
  title: string;
  camp_type: string;
  city: string;
  state: string;
  venue_name: string;
  start_date: string;
  end_date: string;
  expected_beneficiaries: number;
  participant_registered_count: number;
  status: string;
  created_at: string;
  organizer_name?: string;
  organizer_email?: string;
  organization_name?: string;
  report_id?: string | null;
  report_status?: string | null;
  participants_screened?: number | null;
}

export default function AdminCampsPage() {
  const [camps, setCamps] = useState<CampAdminRecord[]>([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, active: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/camps");
      if (res.ok) {
        const data = await res.json();
        setCamps(data.camps || []);
        setStats(data.stats || { total: 0, pending: 0, active: 0, completed: 0 });
      }
    } catch (err) {
      console.error("Error loading admin camps:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateStatus = async (campId: string, newStatus: string) => {
    try {
      const res = await fetch("/api/admin/camps", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campId,
          status: newStatus,
        }),
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleVerifyReport = async (reportId: string) => {
    try {
      const res = await fetch("/api/admin/camps", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "verify_camp_report",
          targetId: reportId,
        }),
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredCamps = camps.filter((c) => {
    if (statusFilter === "all") return true;
    return c.status === statusFilter;
  });

  const columns: ColumnDef<CampAdminRecord>[] = [
    {
      key: "title",
      header: "Medical Camp",
      render: (row: CampAdminRecord) => (
        <div>
          <span className="font-bold text-xs text-slate-900 leading-tight block">{row.title}</span>
          <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
            <span className="capitalize font-bold text-emerald-700">{row.camp_type.replace(/_/g, " ")}</span>
            <span>·</span>
            <span>{row.venue_name}, {row.city}</span>
          </div>
        </div>
      ),
    },
    {
      key: "organizer_name",
      header: "Organizer",
      render: (row: CampAdminRecord) => (
        <div className="text-xs">
          <p className="font-bold text-slate-900">{row.organization_name || row.organizer_name || "Organizer"}</p>
          <p className="text-[10px] text-slate-500">{row.organizer_email}</p>
        </div>
      ),
    },
    {
      key: "start_date",
      header: "Schedule",
      render: (row: CampAdminRecord) => (
        <span className="text-xs text-slate-600 font-medium">
          {new Date(row.start_date).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
          })}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row: CampAdminRecord) => {
        const badgeColors: Record<string, string> = {
          pending_review: "bg-amber-50 text-amber-700 border-amber-200",
          published: "bg-emerald-50 text-emerald-700 border-emerald-200",
          active: "bg-emerald-50 text-emerald-700 border-emerald-200",
          completed: "bg-blue-50 text-blue-700 border-blue-200",
          draft: "bg-slate-100 text-slate-600 border-slate-200",
          cancelled: "bg-rose-50 text-rose-700 border-rose-200",
        };
        return (
          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold capitalize border ${badgeColors[row.status] || "bg-slate-100 text-slate-700 border-slate-200"}`}>
            {row.status.replace(/_/g, " ")}
          </span>
        );
      },
    },
    {
      key: "report",
      header: "Post-Camp Audit",
      render: (row: CampAdminRecord) => {
        if (!row.report_id) {
          return <span className="text-[11px] text-slate-400">No report yet</span>;
        }
        return (
          <div className="flex items-center gap-2">
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${
                row.report_status === "verified"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-amber-50 text-amber-700 border-amber-200"
              }`}
            >
              {row.report_status === "verified" ? "Audited ✓" : "Submitted"}
            </span>
            {row.report_status !== "verified" && (
              <button
                type="button"
                onClick={() => handleVerifyReport(row.report_id!)}
                className="text-[11px] font-bold text-blue-600 hover:underline"
              >
                Approve Audit
              </button>
            )}
          </div>
        );
      },
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (row: CampAdminRecord) => (
        <div className="flex items-center justify-end gap-1.5">
          {row.status === "pending_review" && (
            <button
              type="button"
              onClick={() => handleUpdateStatus(row.id, "active")}
              className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-2xs"
            >
              Approve
            </button>
          )}

          {row.status === "active" && (
            <button
              type="button"
              onClick={() => handleUpdateStatus(row.id, "completed")}
              className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100 shadow-2xs"
            >
              Mark Completed
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
            Medical Camps & Outreach Control Plane
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Approve healthcare screening camps, track volunteer coverage, and audit post-camp reports.
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
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <AdminMetricCard
          title="Total Camps"
          value={stats.total}
          icon={<Tent className="h-5 w-5" />}
          badgeColor="blue"
        />
        <AdminMetricCard
          title="Pending Approval"
          value={stats.pending}
          icon={<Clock className="h-5 w-5" />}
          badgeColor="amber"
        />
        <AdminMetricCard
          title="Active Outreach"
          value={stats.active}
          icon={<CheckCircle className="h-5 w-5" />}
          badgeColor="emerald"
        />
        <AdminMetricCard
          title="Completed & Audited"
          value={stats.completed}
          icon={<FileCheck2 className="h-5 w-5" />}
          badgeColor="purple"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        {["all", "pending_review", "active", "completed"].map((st) => (
          <button
            key={st}
            type="button"
            onClick={() => setStatusFilter(st)}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold capitalize transition ${
              statusFilter === st
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            {st.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      {/* Data Table */}
      <AdminDataTable
        columns={columns}
        data={filteredCamps}
        isLoading={loading}
        title="Outreach Healthcare Screening Camps"
        subtitle="Field camps, community screenings, and rural diagnostic operations"
      />
    </div>
  );
}
