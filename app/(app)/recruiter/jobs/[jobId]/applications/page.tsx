"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Briefcase,
  Building2,
  CheckCircle2,
  Download,
  Filter,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Users,
} from "lucide-react";
import { CandidatePipeline } from "@/modules/opportunities/components/CandidatePipeline";
import { ApplicationStatus, JobApplication } from "@/modules/opportunities/types";

export default function RecruiterJobApplicationsPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params?.jobId as string;

  const [loading, setLoading] = React.useState(true);
  const [job, setJob] = React.useState<any>(null);
  const [applications, setApplications] = React.useState<JobApplication[]>([]);
  const [pipelineCounts, setPipelineCounts] = React.useState<any>(null);
  const [error, setError] = React.useState<string | null>(null);

  const fetchApplications = React.useCallback(async () => {
    if (!jobId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/opportunities/recruiter/jobs/${jobId}/applications`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to load candidate applications");
      }
      const data = await res.json();
      setJob(data.job);
      setApplications(data.applications || []);
      setPipelineCounts(data.pipelineCounts);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load applications");
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  React.useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleStatusChange = async (
    applicationId: string,
    newStatus: ApplicationStatus,
    note?: string
  ) => {
    try {
      const res = await fetch(`/api/opportunities/recruiter/applications/${applicationId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, note }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update candidate status");
      }

      // Optimistically update local list
      setApplications((prev) =>
        prev.map((app) => (app.id === applicationId ? { ...app, status: newStatus } : app))
      );
    } catch (err: any) {
      alert(err.message || "Could not update candidate status");
      throw err;
    }
  };

  const handleScheduleInterview = async (
    applicationId: string,
    details: { scheduled_at: string; meeting_link?: string; notes?: string }
  ) => {
    try {
      const res = await fetch(`/api/opportunities/recruiter/applications/${applicationId}/interview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(details),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to schedule interview");
      }

      const data = await res.json();
      setApplications((prev) =>
        prev.map((app) =>
          app.id === applicationId
            ? { ...app, status: "interview", interview_details: data.interview_details }
            : app
        )
      );
    } catch (err: any) {
      alert(err.message || "Could not schedule interview");
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-[#1769c2]" />
        <p className="mt-3 text-xs font-semibold text-[#77716b]">
          Loading Candidate Dossiers & Pipeline...
        </p>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-center">
          <p className="font-bold text-rose-800">{error || "Job not found"}</p>
          <div className="mt-4 flex justify-center gap-3">
            <Link
              href="/recruiter"
              className="rounded-xl border border-[#ded8d1] bg-white px-4 py-2 text-xs font-bold text-[#171717]"
            >
              Back to Recruiter Studio
            </Link>
            <button
              onClick={fetchApplications}
              className="rounded-xl bg-[#1769c2] px-4 py-2 text-xs font-bold text-white"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/recruiter"
            className="inline-flex items-center gap-1 text-xs font-bold text-[#77716b] hover:text-[#171717] mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Recruiter Studio
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-[#171717]">
              {job.title}
            </h1>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ${
                job.status === "active"
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-amber-50 text-amber-700"
              }`}
            >
              {job.status}
            </span>
          </div>
          <p className="mt-1 text-xs text-[#77716b]">
            {job.org_name} · Recruiter Candidate Pipeline & Clinical Dossier Review
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fetchApplications()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#ded8d1] bg-white px-3.5 py-2 text-xs font-bold text-[#5d5854] shadow-2xs hover:bg-[#faf9f8]"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
          <Link
            href={`/opportunities/jobs/${job.id}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#ded8d1] bg-white px-3.5 py-2 text-xs font-bold text-[#1769c2] shadow-2xs hover:bg-[#eef5fc]"
          >
            View Public Listing →
          </Link>
        </div>
      </div>

      {/* Candidate Pipeline Interface */}
      <CandidatePipeline
        jobTitle={job.title}
        applications={applications}
        onStatusChange={handleStatusChange}
        onScheduleInterview={handleScheduleInterview}
      />
    </div>
  );
}
