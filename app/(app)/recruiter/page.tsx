"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  Building2,
  CheckCircle2,
  ChevronRight,
  Plus,
  PlusCircle,
  ShieldCheck,
  Users,
  Video,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Job, Organization } from "@/modules/opportunities/types";

export default function RecruiterPortalPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const [organizations, setOrganizations] = React.useState<Organization[]>([]);
  const [jobs, setJobs] = React.useState<Job[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (!isPending && !session) router.replace("/");
  }, [isPending, router, session]);

  React.useEffect(() => {
    if (!session?.user) return;

    const load = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/opportunities/recruiter/jobs");
        const data = await res.json();
        if (res.ok) {
          setOrganizations(data.organizations || []);
          setJobs(data.jobs || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [session?.user]);

  if (isPending || !session) return <main className="min-h-dvh bg-[#f5f5f4]" />;

  return (
    <main className="min-h-dvh bg-[#f5f5f4] pb-36 text-[#171717]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-[#171717] text-balance">
              Hospital & Recruiter Studio
            </h1>
            <p className="text-xs text-[#77716b] text-pretty">
              Manage healthcare job openings, review verified medical candidates, and schedule interviews.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => router.push("/recruiter/jobs/create")}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#1769c2] px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#12569f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1769c2]"
            >
              <PlusCircle className="size-4" /> Post New Opportunity
            </button>
          </div>
        </div>

        {/* Managed Organizations Grid */}
        {organizations.length > 0 && (
          <div className="rounded-3xl border border-[#ded8d1] bg-white p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-[#171717] flex items-center gap-2">
              <Building2 className="h-4 w-4 text-[#1769c2]" /> Your Managed Healthcare Organizations
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {organizations.map((org: any) => (
                <div
                  key={org.id}
                  className="rounded-2xl border border-[#f5f4f3] bg-[#faf9f8] p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eef5fc] font-bold text-[#1769c2]">
                      {org.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-xs text-[#171717]">{org.name}</h3>
                      <span className="text-[10px] font-semibold text-[#77716b] uppercase">Role: {org.role}</span>
                    </div>
                  </div>

                  <span className="rounded-full bg-[#ecfdf5] px-2.5 py-0.5 text-[10px] font-bold text-[#047857]">
                    {org.verification_status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Posted Jobs & Candidate Pipelines */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#171717]">
              Active Job Postings & Candidate Pipelines ({jobs.length})
            </h2>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-28 rounded-3xl bg-white/70 animate-pulse border border-[#ded8d1]" />
              ))}
            </div>
          ) : jobs.length > 0 ? (
            <div className="space-y-3">
              {jobs.map((job: any) => (
                <div
                  key={job.id}
                  onClick={() => router.push(`/recruiter/jobs/${job.id}/applications`)}
                  className="group flex cursor-pointer flex-col justify-between gap-4 rounded-3xl border border-[#ded8d1] bg-white p-5 shadow-2xs transition hover:border-[#1769c2] hover:shadow-xs sm:flex-row sm:items-center"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-[#77716b]">{job.organization?.name}</span>
                      <span className="rounded-full bg-[#f5f4f3] px-2 py-0.5 text-[10px] font-bold uppercase text-[#5d5854]">
                        {job.status}
                      </span>
                    </div>
                    <h3 className="mt-1 font-bold text-base text-[#171717] group-hover:text-[#1769c2]">
                      {job.title}
                    </h3>
                    <p className="text-xs text-[#77716b]">
                      {job.city} · {job.employment_type.replace("_", " ")} · Posted on {new Date(job.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Stats Pill */}
                  <div className="flex items-center gap-4">
                    <div className="text-center rounded-2xl bg-[#eef5fc] px-4 py-2 text-xs">
                      <span className="block font-black text-sm text-[#1769c2]">{job.total_applications || 0}</span>
                      <span className="text-[10px] font-semibold text-[#77716b]">Applicants</span>
                    </div>

                    <div className="text-center rounded-2xl bg-[#f0fdf4] px-4 py-2 text-xs">
                      <span className="block font-black text-sm text-[#15803d]">{job.interview_applications || 0}</span>
                      <span className="text-[10px] font-semibold text-[#77716b]">Interviews</span>
                    </div>

                    <ChevronRight className="h-5 w-5 text-[#77716b] group-hover:text-[#1769c2]" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-[#ded8d1] bg-white p-12 text-center space-y-3">
              <Briefcase className="mx-auto h-10 w-10 text-[#77716b]" />
              <h3 className="font-bold text-[#171717]">No jobs posted yet</h3>
              <p className="text-xs text-[#77716b]">
                Create your first clinical job or internship to start receiving verified applications.
              </p>
              <button
                type="button"
                onClick={() => router.push("/recruiter/jobs/create")}
                className="rounded-xl bg-[#1769c2] px-5 py-2 text-xs font-bold text-white hover:bg-[#12569f]"
              >
                + Post New Opening
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
