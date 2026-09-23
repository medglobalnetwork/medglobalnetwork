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
          action: "update_camp_status",
          targetId: campId,
          status: newStatus,
          reason: `Admin updated status to ${newStatus}`,
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
          <span className="font-bold text-xs text-[#171717]">{row.title}</span>
          <div className="flex items-center gap-2 text-[10px] text-[#77716b]">
            <span className="capitalize font-semibold text-emerald-700">{row.camp_type.replace(/_/g, " ")}</span>
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
          <p className="font-semibold text-[#171717]">{row.organization_name || row.organizer_name || "Organizer"}</p>
          <p className="text-[10px] text-[#77716b]">{row.organizer_email}</p>
        </div>
      ),
    },
    {
      key: "start_date",
      header: "Schedule",
      render: (row: CampAdminRecord) => (
        <span className="text-xs text-[#5d5854]">
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
          pending_review: "bg-amber-100 text-amber-800",
          published: "bg-emerald-100 text-emerald-800",
          active: "bg-emerald-100 text-emerald-800",
          completed: "bg-blue-100 text-blue-800",
          draft: "bg-stone-100 text-stone-700",
          cancelled: "bg-rose-100 text-rose-800",
        };
        return (
          <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold capitalize ${badgeColors[row.status] || "bg-stone-100 text-stone-700"}`}>
            {row.status.replace(/_/g, " ")}
          </span>
        );
      },
    },
    {
      key: "report_status",
      header: "Outcome Report",
      render: (row: CampAdminRecord) => {
        if (!row.report_id) {
          return <span className="text-[11px] text-[#77716b]">No report yet</span>;
        }
        return (
          <div className="flex items-center gap-2 text-xs">
            <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold capitalize ${
              row.report_status === "verified" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
            }`}>
              {row.report_status || "Submitted"}
            </span>
            {row.report_status !== "verified" && (
              <button
                type="button"
                onClick={() => handleVerifyReport(row.report_id!)}
                className="rounded-md bg-emerald-700 px-2 py-0.5 text-[10px] font-bold text-white hover:bg-emerald-800"
              >
                Verify Report
              </button>
            )}
          </div>
        );
      },
    },
    {
      key: "actions",
      header: "Actions",
      render: (row: CampAdminRecord) => (
        <div className="flex items-center gap-1">
          {row.status === "pending_review" && (
            <button
              type="button"
              onClick={() => handleUpdateStatus(row.id, "active")}
              className="rounded-lg bg-emerald-700 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-emerald-800"
            >
              Approve
            </button>
          )}

          {row.status === "active" && (
            <button
              type="button"
              onClick={() => handleUpdateStatus(row.id, "completed")}
              className="rounded-lg border border-blue-300 bg-blue-50 px-2 py-1 text-[11px] font-semibold text-blue-800"
            >
              Mark Completed
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
          <h1 className="text-xl font-bold text-[#171717]">Medical Camps & Outreach Control Plane</h1>
          <p className="text-xs text-[#5d5854]">
            Approve healthcare screening camps, track volunteer coverage, and audit post-camp reports.
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
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <AdminMetricCard
          title="Total Camps"
          value={stats.total}
          icon={<Tent className="h-5 w-5" />}
        />
        <AdminMetricCard
          title="Pending Approval"
          value={stats.pending}
          icon={<Clock className="h-5 w-5" />}
        />
        <AdminMetricCard
          title="Active Outreach"
          value={stats.active}
          icon={<CheckCircle className="h-5 w-5" />}
        />
        <AdminMetricCard
          title="Completed & Audited"
          value={stats.completed}
          icon={<FileCheck2 className="h-5 w-5" />}
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-[#e8e6e3] pb-2">
        {["all", "pending_review", "active", "completed"].map((st) => (
          <button
            key={st}
            type="button"
            onClick={() => setStatusFilter(st)}
            className={`rounded-lg px-3 py-1 text-xs font-bold capitalize transition ${
              statusFilter === st
                ? "bg-emerald-700 text-white"
                : "text-[#5d5854] hover:bg-[#f8f7f6]"
            }`}
          >
            {st.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      {/* Data Table */}
      <div className="rounded-2xl border border-[#e8e6e3] bg-white shadow-xs overflow-hidden">
        <AdminDataTable
          columns={columns}
          data={filteredCamps}
          isLoading={loading}
        />
      </div>
    </div>
  );
}
