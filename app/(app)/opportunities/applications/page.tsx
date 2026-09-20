"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  MapPin,
  ShieldCheck,
  Video,
  XCircle,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { EmptyState } from "@/modules/network/components/EmptyState";
import { JobApplication } from "@/modules/opportunities/types";

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; icon: any }> = {
  applied: { label: "Applied", bg: "bg-slate-100", text: "text-slate-700", icon: Clock },
  under_review: { label: "Under Review", bg: "bg-blue-50", text: "text-blue-700", icon: Clock },
  shortlisted: { label: "Shortlisted", bg: "bg-amber-50", text: "text-amber-700", icon: CheckCircle2 },
  interview: { label: "Interview Scheduled", bg: "bg-purple-50", text: "text-purple-700", icon: Video },
  offer: { label: "Job Offer Received", bg: "bg-emerald-50", text: "text-emerald-700", icon: CheckCircle2 },
  hired: { label: "Hired", bg: "bg-green-100", text: "text-green-800", icon: CheckCircle2 },
  rejected: { label: "Application Not Selected", bg: "bg-rose-50", text: "text-rose-700", icon: XCircle },
  withdrawn: { label: "Withdrawn", bg: "bg-stone-100", text: "text-stone-600", icon: XCircle },
};

export default function MyApplicationsPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const [applications, setApplications] = React.useState<JobApplication[]>([]);
  const [counts, setCounts] = React.useState<any>({});
  const [activeFilter, setActiveFilter] = React.useState("all");
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (!isPending && !session) router.replace("/");
  }, [isPending, router, session]);

  const loadApplications = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/opportunities/applications");
      const data = await res.json();
      if (res.ok) {
        setApplications(data.applications || []);
        setCounts(data.counts || {});
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (session?.user) {
      loadApplications();
    }
  }, [loadApplications, session?.user]);

  const handleWithdraw = async (applicationId: string) => {
    if (!confirm("Are you sure you want to withdraw your application?")) return;
    try {
      const res = await fetch("/api/opportunities/applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId, action: "withdraw" }),
      });
      if (res.ok) {
        loadApplications();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = activeFilter === "all"
    ? applications
    : applications.filter((a) => a.status === activeFilter);

  if (isPending || !session) return <main className="min-h-screen bg-[#f5f5f4]" />;

  return (
    <main className="min-h-screen bg-[#f5f5f4] pb-36 text-[#171717]">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <button
              type="button"
              onClick={() => router.push("/opportunities")}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#1769c2] hover:underline"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Opportunities Discovery
            </button>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#171717]">
              My Applications & Candidate Status
            </h1>
            <p className="text-xs text-[#77716b]">
              Track your real-time recruitment pipeline across hospital hiring committees.
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push("/opportunities/jobs")}
            className="rounded-xl bg-[#1769c2] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#12569f]"
          >
            + Apply for More Roles
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1.5 overflow-x-auto border-b border-[#ded8d1] pb-2">
          {[
            { id: "all", label: `All Applications (${counts.all || 0})` },
            { id: "applied", label: `Applied (${counts.applied || 0})` },
            { id: "shortlisted", label: `Shortlisted (${counts.shortlisted || 0})` },
            { id: "interview", label: `Interviews (${counts.interview || 0})` },
            { id: "offer", label: `Offers (${counts.offer || 0})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveFilter(tab.id)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
                activeFilter === tab.id
                  ? "bg-[#1769c2] text-white"
                  : "bg-white text-[#5d5854] hover:bg-[#faf9f8]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Application Cards List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-36 rounded-3xl bg-white/70 animate-pulse border border-[#ded8d1]" />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="space-y-4">
            {filtered.map((app) => {
              const job = app.job;
              const org = job?.organization;
              const config = STATUS_CONFIG[app.status] || STATUS_CONFIG.applied;
              const StatusIcon = config.icon;

              return (
                <div
                  key={app.id}
                  className="overflow-hidden rounded-3xl border border-[#ded8d1] bg-white p-5 shadow-2xs transition hover:shadow-xs"
                >
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div className="flex items-start gap-3.5">
                      {org?.logo_url ? (
                        <img
                          src={org.logo_url}
                          alt={org.name}
                          className="h-12 w-12 rounded-2xl object-cover border border-[#ded8d1]"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef5fc] font-bold text-[#1769c2]">
                          {org?.name ? org.name.slice(0, 2).toUpperCase() : <Building2 className="h-6 w-6" />}
                        </div>
                      )}

                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold text-[#77716b]">{org?.name}</span>
                          {org?.verification_status === "verified" && (
                            <ShieldCheck className="h-3.5 w-3.5 fill-[#1769c2]/15 text-[#1769c2]" />
                          )}
                        </div>

                        <h3
                          onClick={() => router.push(`/opportunities/jobs/${job?.slug || job?.id}`)}
                          className="cursor-pointer text-base font-bold text-[#171717] hover:text-[#1769c2]"
                        >
                          {job?.title}
                        </h3>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-[#77716b]">
                          <span>{job?.city || "India"}</span>
                          <span>·</span>
                          <span>Applied on {new Date(app.applied_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${config.bg} ${config.text}`}>
                        <StatusIcon className="h-3.5 w-3.5" /> {config.label}
                      </span>
                    </div>
                  </div>

                  {/* Interview Information Banner if active */}
                  {app.interview_details && (
                    <div className="mt-4 rounded-2xl border border-purple-200 bg-purple-50 p-3.5 text-xs text-purple-900 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                      <div>
                        <p className="font-bold flex items-center gap-1.5">
                          <Video className="h-4 w-4 text-purple-700" /> Interview Scheduled
                        </p>
                        <p className="mt-0.5">
                          {new Date(app.interview_details.scheduled_at).toLocaleString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>

                      {app.interview_details.meeting_link && (
                        <a
                          href={app.interview_details.meeting_link}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded-xl bg-purple-700 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-purple-800"
                        >
                          <ExternalLink className="h-3.5 w-3.5" /> Join Video Interview
                        </a>
                      )}
                    </div>
                  )}

                  {/* Footer controls */}
                  <div className="mt-4 flex items-center justify-between border-t border-[#f5f4f3] pt-3 text-xs">
                    <button
                      type="button"
                      onClick={() => router.push(`/opportunities/jobs/${job?.slug || job?.id}`)}
                      className="font-bold text-[#1769c2] hover:underline"
                    >
                      View Original Job Post →
                    </button>

                    {!["withdrawn", "hired", "rejected"].includes(app.status) && (
                      <button
                        type="button"
                        onClick={() => handleWithdraw(app.id)}
                        className="text-[11px] font-semibold text-[#77716b] hover:text-red-600 hover:underline"
                      >
                        Withdraw Application
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={<Briefcase className="h-10 w-10 text-[#77716b]" />}
            title="No applications in this category"
            description="Apply for clinical roles, internships, and fellowships to track recruitment stages here."
            actionText="Explore Opportunities"
            onAction={() => router.push("/opportunities/jobs")}
          />
        )}
      </div>
    </main>
  );
}
