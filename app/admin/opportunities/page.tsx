"use client";

import React, { useEffect, useState } from "react";
import {
  AdminDataTable,
  ColumnDef,
} from "@/modules/admin/components/AdminDataTable";
import {
  Briefcase,
  Building,
  CheckCircle,
  Clock,
  Eye,
  RefreshCw,
  Search,
} from "lucide-react";
import { AdminMetricCard } from "@/modules/admin/components/AdminMetricCard";

interface JobRecord {
  id: string;
  title: string;
  opportunity_type: string;
  profession: string;
  specialization: string;
  employment_type: string;
  work_mode: string;
  city: string;
  state: string;
  status: string;
  views_count: number;
  applications_count: number;
  organization_name?: string;
  organization_verification?: string;
  created_at: string;
}

interface OrgRecord {
  id: string;
  name: string;
  slug: string;
  organization_type: string;
  city?: string;
  state?: string;
  verification_status: string;
}

export default function AdminOpportunitiesPage() {
  const [jobs, setJobs] = useState<JobRecord[]>([]);
  const [orgs, setOrgs] = useState<OrgRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"jobs" | "orgs">("jobs");

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/opportunities");
      if (res.ok) {
        const data = await res.json();
        setJobs(data.jobs || []);
        setOrgs(data.organizations || []);
      }
    } catch (err) {
      console.error("Error loading opportunities:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleJobStatus = async (jobId: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "closed" : "active";
    try {
      const res = await fetch("/api/admin/opportunities", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_job_status",
          targetId: jobId,
          status: newStatus,
          reason: `Admin updated status to ${newStatus}`,
        }),
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error("Error toggling job:", err);
    }
  };

  const handleVerifyOrg = async (orgId: string, status: string) => {
    try {
      const res = await fetch("/api/admin/opportunities", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "verify_organization",
          targetId: orgId,
          status,
          reason: `Admin set verification to ${status}`,
        }),
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error("Error verifying org:", err);
    }
  };

  const jobColumns: ColumnDef<JobRecord>[] = [
    {
      key: "title",
      header: "Opportunity & Hospital",
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-bold text-slate-900 leading-tight block">{row.title}</span>
          <span className="text-[11px] text-slate-500">
            {row.organization_name || "Healthcare Institution"} • {row.city || "India"}
          </span>
        </div>
      ),
    },
    {
      key: "opportunity_type",
      header: "Type & Profession",
      sortable: true,
      render: (row) => (
        <div>
          <span className="text-slate-800 font-semibold capitalize">{row.opportunity_type}</span>
          <p className="text-[11px] text-slate-500">{row.profession} - {row.specialization}</p>
        </div>
      ),
    },
    {
      key: "applications_count",
      header: "Applications",
      sortable: true,
      align: "center",
      render: (row) => (
        <span className="font-bold text-blue-600">{row.applications_count || 0}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <span
          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
            row.status === "active"
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : row.status === "closed"
              ? "bg-rose-50 text-rose-700 border-rose-200"
              : "bg-slate-100 text-slate-600 border-slate-200"
          }`}
        >
          {row.status.toUpperCase()}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Action",
      align: "right",
      render: (row) => (
        <button
          type="button"
          onClick={() => handleToggleJobStatus(row.id, row.status)}
          className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-colors shadow-2xs ${
            row.status === "active"
              ? "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              : "bg-blue-600 text-white hover:bg-blue-700 shadow-xs"
          }`}
        >
          {row.status === "active" ? "Close Listing" : "Reopen Job"}
        </button>
      ),
    },
  ];

  const orgColumns: ColumnDef<OrgRecord>[] = [
    {
      key: "name",
      header: "Organization Name",
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-bold text-slate-900 block">{row.name}</span>
          <span className="text-[11px] text-slate-500 capitalize">{row.organization_type}</span>
        </div>
      ),
    },
    {
      key: "location",
      header: "Location",
      render: (row) => (
        <span className="text-slate-600">
          {[row.city, row.state].filter(Boolean).join(", ") || "India"}
        </span>
      ),
    },
    {
      key: "verification_status",
      header: "Verification",
      render: (row) => (
        <span
          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
            row.verification_status === "verified"
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-amber-50 text-amber-700 border-amber-200"
          }`}
        >
          {row.verification_status === "verified" ? "Verified Hospital ✓" : "Pending Verification"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Action",
      align: "right",
      render: (row) => (
        <div className="flex items-center justify-end gap-2">
          {row.verification_status !== "verified" ? (
            <button
              type="button"
              onClick={() => handleVerifyOrg(row.id, "verified")}
              className="rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700 shadow-xs"
            >
              Verify Org
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleVerifyOrg(row.id, "pending")}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs"
            >
              Revoke
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div>
        <h1 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
          Opportunities & Recruitment Control Plane
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Manage clinical job postings, internships, candidate pipelines, and verify recruiter organizations.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("jobs")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
            activeTab === "jobs"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          <Briefcase className="h-4 w-4" />
          <span>Job & Internship Postings ({jobs.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("orgs")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
            activeTab === "orgs"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          <Building className="h-4 w-4" />
          <span>Hospitals & Organizations ({orgs.length})</span>
        </button>
      </div>

      {/* Tables */}
      {activeTab === "jobs" ? (
        <AdminDataTable
          columns={jobColumns}
          data={jobs}
          isLoading={loading}
          onRefresh={fetchData}
          title="Clinical Opportunities"
          subtitle="All active and pending job listings"
        />
      ) : (
        <AdminDataTable
          columns={orgColumns}
          data={orgs}
          isLoading={loading}
          onRefresh={fetchData}
          title="Recruiting Healthcare Organizations"
          subtitle="Hospital profiles and institutional KYC status"
        />
      )}
    </div>
  );
}
