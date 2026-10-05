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
  UserCheck,
} from "lucide-react";
import { AdminMetricCard } from "@/modules/admin/components/AdminMetricCard";

export default function AdminNetworkPage() {
  const [communities, setCommunities] = useState<any[]>([]);
  const [stats, setStats] = useState<{
    total_communities: number;
    total_posts: number;
    active_stories: number;
    total_stories: number;
    total_connections: number;
  }>({
    total_communities: 0,
    total_posts: 0,
    active_stories: 0,
    total_stories: 0,
    total_connections: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchNetworkData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/network");
      if (res.ok) {
        const data = await res.json();
        setCommunities(data.communities || []);
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch (err) {
      console.error("Error fetching network administration data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNetworkData();
  }, []);

  const columns: ColumnDef<any>[] = [
    {
      key: "name",
      header: "Medical Community / Specialty Group",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 border border-blue-100 text-blue-600 font-bold text-sm shadow-2xs">
            {row.name ? row.name.charAt(0) : "C"}
          </div>
          <div>
            <span className="font-bold text-slate-900 block">{row.name}</span>
            <span className="text-[11px] text-slate-500">/{row.slug}</span>
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
          <span className="text-slate-800 font-semibold">{row.specialty || "Interdisciplinary"}</span>
          <p className="text-[11px] text-slate-500 capitalize">{row.visibility || "public"}</p>
        </div>
      ),
    },
    {
      key: "member_count",
      header: "Doctors Enrolled",
      sortable: true,
      align: "center",
      render: (row) => (
        <span className="font-bold text-blue-600">{row.member_count || 0}</span>
      ),
    },
    {
      key: "post_count",
      header: "Discussions & Cases",
      sortable: true,
      align: "center",
      render: (row) => (
        <span className="font-bold text-slate-700">{row.post_count || 0}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div>
        <h1 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
          Network & Communities Control Plane
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Supervise peer clinical discussions, medical specialty groups, and clinical case feeds.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <AdminMetricCard
          title="Active Communities"
          value={stats.total_communities || communities.length}
          subtitle="Specialty clinical groups"
          icon={<Users className="h-5 w-5" />}
          badgeColor="blue"
        />
        <AdminMetricCard
          title="Clinical Posts"
          value={stats.total_posts || 0}
          subtitle="Peer discussion timeline"
          icon={<Share2 className="h-5 w-5" />}
          badgeColor="emerald"
        />
        <AdminMetricCard
          title="Active Stories"
          value={stats.active_stories || 0}
          subtitle={`${stats.total_stories || 0} lifetime stories`}
          icon={<Sparkles className="h-5 w-5" />}
          badgeColor="purple"
        />
        <AdminMetricCard
          title="Peer Connections"
          value={stats.total_connections || 0}
          subtitle="Verified doctor relationships"
          icon={<UserCheck className="h-5 w-5" />}
          badgeColor="amber"
        />
      </div>

      {/* Communities Table */}
      <AdminDataTable
        columns={columns}
        data={communities}
        isLoading={loading}
        onRefresh={fetchNetworkData}
        title="Verified Medical Communities"
        subtitle="Public and moderated clinical interest groups"
      />
    </div>
  );
}
