"use client";

import React, { useEffect, useState } from "react";
import {
  AdminDataTable,
  ColumnDef,
  FacetFilter,
} from "@/modules/admin/components/AdminDataTable";
import {
  ScrollText,
  Shield,
  Clock,
  User,
  RefreshCw,
  Search,
  Filter,
} from "lucide-react";
import { AuditLogItem } from "@/modules/admin/lib/audit";

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/audit-logs");
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error("Error loading audit logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const columns: ColumnDef<AuditLogItem>[] = [
    {
      key: "created_at",
      header: "Timestamp",
      sortable: true,
      render: (row) => (
        <div className="font-mono text-xs text-slate-300">
          {new Date(row.created_at).toLocaleString()}
        </div>
      ),
    },
    {
      key: "admin_email",
      header: "Admin Identity",
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-semibold text-white">{row.admin_email}</span>
          <span className="text-[10px] text-blue-400 block font-mono">
            {row.admin_role}
          </span>
        </div>
      ),
    },
    {
      key: "action",
      header: "Action Executed",
      sortable: true,
      render: (row) => (
        <span className="font-mono text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
          {row.action}
        </span>
      ),
    },
    {
      key: "entity_type",
      header: "Target Entity",
      sortable: true,
      render: (row) => (
        <div>
          <span className="capitalize text-slate-200 font-medium">{row.entity_type}</span>
          <span className="text-[10px] text-slate-500 block font-mono">
            ID: {row.entity_id}
          </span>
        </div>
      ),
    },
    {
      key: "reason",
      header: "Administrative Rationale",
      render: (row) => (
        <span className="text-slate-400 text-xs truncate max-w-xs block">
          {row.reason || "Standard system operation"}
        </span>
      ),
    },
  ];

  const filters: FacetFilter[] = [
    {
      key: "entity_type",
      label: "Entities",
      options: [
        { label: "User", value: "user" },
        { label: "Professional Profile", value: "professional_profile" },
        { label: "Course", value: "course" },
        { label: "Job", value: "job" },
        { label: "Setting", value: "setting" },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
          Immutable Audit Ledger & Compliance Trail
        </h1>
        <p className="mt-1 text-xs text-slate-400">
          Tamper-proof record of all administrative state modifications, verification decisions, and role grants.
        </p>
      </div>

      {/* Audit Log Table */}
      <AdminDataTable
        columns={columns}
        data={logs}
        isLoading={loading}
        onRefresh={fetchLogs}
        filters={filters}
        searchPlaceholder="Search action, admin email, or entity ID..."
        title="Chronological Audit Records"
        subtitle="Write-only event ledger with administrative justification tracking"
      />
    </div>
  );
}
