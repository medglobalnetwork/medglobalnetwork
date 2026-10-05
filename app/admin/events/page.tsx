// app/admin/events/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import {
  AdminDataTable,
  ColumnDef,
} from "@/modules/admin/components/AdminDataTable";
import {
  Calendar,
  CheckCircle,
  Clock,
  Eye,
  RefreshCw,
  Search,
  XCircle,
  PauseCircle,
  Award,
} from "lucide-react";
import { AdminMetricCard } from "@/modules/admin/components/AdminMetricCard";

interface EventAdminRecord {
  id: string;
  slug: string;
  title: string;
  event_type: string;
  category: string;
  format: string;
  city?: string;
  state?: string;
  start_time: string;
  end_time: string;
  price: number;
  is_free: boolean;
  registered_count: number;
  capacity?: number;
  status: string;
  created_at: string;
  organizer_name?: string;
  organizer_email?: string;
  organization_name?: string;
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<EventAdminRecord[]>([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, published: 0, cancelled: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/events");
      if (res.ok) {
        const data = await res.json();
        setEvents(data.events || []);
        setStats(data.stats || { total: 0, pending: 0, published: 0, cancelled: 0 });
      }
    } catch (err) {
      console.error("Error loading admin events:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateStatus = async (eventId: string, newStatus: string) => {
    try {
      const res = await fetch("/api/admin/events", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId,
          status: newStatus,
        }),
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error("Error updating event status:", err);
    }
  };

  const filteredEvents = events.filter((e) => {
    if (statusFilter === "all") return true;
    return e.status === statusFilter;
  });

  const columns: ColumnDef<EventAdminRecord>[] = [
    {
      key: "title",
      header: "Event",
      render: (row: EventAdminRecord) => (
        <div>
          <span className="font-bold text-xs text-slate-900 leading-tight block">{row.title}</span>
          <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
            <span className="uppercase font-bold text-blue-600">{row.event_type}</span>
            <span>·</span>
            <span>{row.format === "online" ? "Online" : row.city || "In-Person"}</span>
          </div>
        </div>
      ),
    },
    {
      key: "organizer_name",
      header: "Organizer",
      render: (row: EventAdminRecord) => (
        <div className="text-xs">
          <p className="font-bold text-slate-900">{row.organization_name || row.organizer_name || "Organizer"}</p>
          <p className="text-[10px] text-slate-500">{row.organizer_email}</p>
        </div>
      ),
    },
    {
      key: "start_time",
      header: "Start Date",
      render: (row: EventAdminRecord) => (
        <span className="text-xs text-slate-600 font-medium">
          {new Date(row.start_time).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
      ),
    },
    {
      key: "registered_count",
      header: "Registrations",
      render: (row: EventAdminRecord) => (
        <span className="text-xs font-bold text-slate-900">
          {row.registered_count} {row.capacity ? `/ ${row.capacity}` : ""}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row: EventAdminRecord) => {
        const badgeColors: Record<string, string> = {
          pending_review: "bg-amber-50 text-amber-700 border-amber-200",
          published: "bg-emerald-50 text-emerald-700 border-emerald-200",
          draft: "bg-slate-100 text-slate-600 border-slate-200",
          paused: "bg-orange-50 text-orange-700 border-orange-200",
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
      key: "actions",
      header: "Actions",
      align: "right",
      render: (row: EventAdminRecord) => (
        <div className="flex items-center justify-end gap-1.5">
          {row.status === "pending_review" && (
            <button
              type="button"
              onClick={() => handleUpdateStatus(row.id, "published")}
              className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-2xs"
            >
              Approve
            </button>
          )}

          {row.status === "published" && (
            <button
              type="button"
              onClick={() => handleUpdateStatus(row.id, "paused")}
              className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700 hover:bg-amber-100 shadow-2xs"
            >
              Pause
            </button>
          )}

          {row.status === "paused" && (
            <button
              type="button"
              onClick={() => handleUpdateStatus(row.id, "published")}
              className="rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700 shadow-2xs"
            >
              Resume
            </button>
          )}

          {row.status !== "cancelled" && (
            <button
              type="button"
              onClick={() => handleUpdateStatus(row.id, "cancelled")}
              className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 shadow-2xs"
            >
              Cancel
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
            Events & CME Control Plane
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Review, approve, and moderate healthcare conferences, workshops, and webinars.
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
          title="Total Events"
          value={stats.total}
          icon={<Calendar className="h-5 w-5" />}
          badgeColor="blue"
        />
        <AdminMetricCard
          title="Pending Review"
          value={stats.pending}
          icon={<Clock className="h-5 w-5" />}
          badgeColor="amber"
        />
        <AdminMetricCard
          title="Published & Active"
          value={stats.published}
          icon={<CheckCircle className="h-5 w-5" />}
          badgeColor="emerald"
        />
        <AdminMetricCard
          title="Cancelled"
          value={stats.cancelled}
          icon={<XCircle className="h-5 w-5" />}
          badgeColor="rose"
        />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        {["all", "pending_review", "published", "paused", "cancelled"].map((st) => (
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
        data={filteredEvents}
        isLoading={loading}
        title="Scheduled CME & Medical Events"
        subtitle="Full conference and webinar roster"
      />
    </div>
  );
}
