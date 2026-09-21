"use client";

import React, { useEffect, useState } from "react";
import {
  AdminDataTable,
  ColumnDef,
} from "@/modules/admin/components/AdminDataTable";
import {
  Share2,
  Users,
  MessageSquare,
  Sparkles,
  Layers,
  CheckCircle,
  RefreshCw,
} from "lucide-react";
import { AdminMetricCard } from "@/modules/admin/components/AdminMetricCard";

export default function AdminNetworkPage() {
  const [communities, setCommunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCommunities = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/network/communities");
      if (res.ok) {
        const data = await res.json();
        setCommunities(data.communities || []);
      }
    } catch (err) {
      console.error("Error fetching communities:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunities();
  }, []);

  const columns: ColumnDef<any>[] = [
    {
      key: "name",
      header: "Medical Community / Specialty Group",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-300 font-bold">
            {row.name.charAt(0)}
          </div>
          <div>
            <span className="font-bold text-white block">{row.name}</span>
            <span className="text-[11px] text-slate-400">/{row.slug}</span>
          </div>
        </div>
      ),
    },
    {
      key: "specialty",
      header: "Specialty & Scope",
      sortable: true,
      render: (row) => (
        <div>
          <span className="text-slate-200 font-medium">{row.specialty || "Interdisciplinary"}</span>
          <p className="text-[11px] text-slate-400 capitalize">{row.visibility || "public"}</p>
        </div>
      ),
    },
    {
      key: "member_count",
      header: "Doctors Enrolled",
      sortable: true,
      align: "center",
      render: (row) => (
        <span className="font-bold text-blue-400">{row.member_count || 0}</span>
      ),
    },
    {
      key: "post_count",
      header: "Discussions & Cases",
      sortable: true,
      align: "center",
      render: (row) => (
        <span className="font-bold text-slate-300">{row.post_count || 0}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
          Network & Communities Control Plane
        </h1>
        <p className="mt-1 text-xs text-slate-400">
          Supervise peer clinical discussions, medical specialty groups, and clinical case feeds.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <AdminMetricCard
          title="Active Communities"
          value={communities.length}
          icon={<Users className="h-5 w-5" />}
        />
        <AdminMetricCard
          title="Feed Protocol"
          value="Healthy"
          subtitle="Real-time timeline delivery"
          icon={<Share2 className="h-5 w-5" />}
          badgeColor="emerald"
        />
        <AdminMetricCard
          title="24h Stories Engine"
          value="Active"
          subtitle="Disappearing media stories"
          icon={<Sparkles className="h-5 w-5" />}
          badgeColor="purple"
        />
      </div>

      {/* Communities Table */}
      <AdminDataTable
        columns={columns}
        data={communities}
        isLoading={loading}
        onRefresh={fetchCommunities}
        title="Verified Medical Communities"
        subtitle="Public and moderated clinical interest groups"
      />
    </div>
  );
}
