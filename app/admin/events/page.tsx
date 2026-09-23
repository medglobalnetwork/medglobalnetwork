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
          action: "update_event_status",
          targetId: eventId,
          status: newStatus,
          reason: `Admin updated status to ${newStatus}`,
        }),
      });
      if (res.ok) fetchData();
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
          <span className="font-bold text-xs text-[#171717]">{row.title}</span>
          <div className="flex items-center gap-2 text-[10px] text-[#77716b]">
            <span className="uppercase font-semibold text-[#1769c2]">{row.event_type}</span>
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
          <p className="font-semibold text-[#171717]">{row.organization_name || row.organizer_name || "Organizer"}</p>
          <p className="text-[10px] text-[#77716b]">{row.organizer_email}</p>
        </div>
      ),
    },
    {
      key: "start_time",
      header: "Start Date",
      render: (row: EventAdminRecord) => (
        <span className="text-xs text-[#5d5854]">
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
        <span className="text-xs font-semibold text-[#171717]">
          {row.registered_count} {row.capacity ? `/ ${row.capacity}` : ""}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row: EventAdminRecord) => {
        const badgeColors: Record<string, string> = {
          pending_review: "bg-amber-100 text-amber-800",
          published: "bg-emerald-100 text-emerald-800",
          draft: "bg-stone-100 text-stone-700",
          paused: "bg-orange-100 text-orange-800",
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
      key: "actions",
      header: "Actions",
      render: (row: EventAdminRecord) => (
        <div className="flex items-center gap-1">
          {row.status === "pending_review" && (
            <button
              type="button"
              onClick={() => handleUpdateStatus(row.id, "published")}
              className="rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-emerald-700"
            >
              Approve
            </button>
          )}

          {row.status === "published" && (
            <button
              type="button"
              onClick={() => handleUpdateStatus(row.id, "paused")}
              className="rounded-lg border border-orange-300 bg-orange-50 px-2 py-1 text-[11px] font-semibold text-orange-800 hover:bg-orange-100"
            >
              Pause
            </button>
          )}

          {row.status === "paused" && (
            <button
              type="button"
              onClick={() => handleUpdateStatus(row.id, "published")}
              className="rounded-lg bg-[#1769c2] px-2.5 py-1 text-[11px] font-semibold text-white"
            >
              Resume
            </button>
          )}

          {row.status !== "cancelled" && (
            <button
              type="button"
              onClick={() => handleUpdateStatus(row.id, "cancelled")}
              className="rounded-lg border border-rose-200 px-2 py-1 text-[11px] font-semibold text-rose-700 hover:bg-rose-50"
            >
              Cancel
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#171717]">Events & CME Control Plane</h1>
          <p className="text-xs text-[#5d5854]">
            Review, approve, and moderate healthcare conferences, workshops, and webinars.
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
          title="Total Events"
          value={stats.total}
          icon={<Calendar className="h-5 w-5" />}
        />
        <AdminMetricCard
          title="Pending Review"
          value={stats.pending}
          icon={<Clock className="h-5 w-5" />}
        />
        <AdminMetricCard
          title="Published & Active"
          value={stats.published}
          icon={<CheckCircle className="h-5 w-5" />}
        />
        <AdminMetricCard
          title="Cancelled"
          value={stats.cancelled}
          icon={<XCircle className="h-5 w-5" />}
        />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 border-b border-[#e8e6e3] pb-2">
        {["all", "pending_review", "published", "paused", "cancelled"].map((st) => (
          <button
            key={st}
            type="button"
            onClick={() => setStatusFilter(st)}
            className={`rounded-lg px-3 py-1 text-xs font-bold capitalize transition ${
              statusFilter === st
                ? "bg-[#1769c2] text-white"
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
          data={filteredEvents}
          isLoading={loading}
        />
      </div>
    </div>
  );
}
