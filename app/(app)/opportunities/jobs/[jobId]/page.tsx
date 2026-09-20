"use client";

import * as React from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { JobDetailView } from "@/modules/opportunities/components/JobDetailView";
import { Job } from "@/modules/opportunities/types";

function JobDetailPageContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const jobId = params?.jobId as string;
  const autoApply = searchParams.get("apply") === "true";

  const [job, setJob] = React.useState<Job | null>(null);
  const [similarJobs, setSimilarJobs] = React.useState<Job[]>([]);
  const [userProfile, setUserProfile] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!jobId) return;

    const load = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/opportunities/jobs/${jobId}`);
        const data = await res.json();
        if (res.ok && data.job) {
          setJob(data.job);
          setSimilarJobs(data.similarJobs || []);
        } else {
          setErrorMsg(data.error || "Job not found");
        }

        // Fetch user profile if logged in
        if (session?.user?.id) {
          const profRes = await fetch(`/api/network/profiles/${session.user.id}`);
          const profData = await profRes.json();
          if (profRes.ok && profData.profile) {
            setUserProfile(profData.profile);
          }
        }
      } catch (err: any) {
        setErrorMsg(err.message || "Failed to load job");
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [jobId, session?.user?.id]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#f5f5f4] p-6">
        <div className="mx-auto max-w-5xl space-y-6 animate-pulse">
          <div className="h-44 rounded-3xl bg-white/60" />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="h-96 rounded-3xl bg-white/60 lg:col-span-2" />
            <div className="h-64 rounded-3xl bg-white/60" />
          </div>
        </div>
      </main>
    );
  }

  if (errorMsg || !job) {
    return (
      <main className="min-h-screen bg-[#f5f5f4] p-8 text-center text-[#171717]">
        <div className="mx-auto max-w-md rounded-3xl border border-[#ded8d1] bg-white p-8 space-y-3">
          <h2 className="text-lg font-bold">Opportunity Not Found</h2>
          <p className="text-xs text-[#77716b]">
            This clinical opportunity may have expired or been filled.
          </p>
          <button
            type="button"
            onClick={() => router.push("/opportunities/jobs")}
            className="rounded-xl bg-[#1769c2] px-4 py-2 text-xs font-bold text-white"
          >
            Explore Other Openings
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f5f4] p-4 sm:p-8 pb-36 text-[#171717]">
      <JobDetailView
        job={job}
        similarJobs={similarJobs}
        currentUser={session?.user}
        userProfile={userProfile}
        autoOpenApply={autoApply}
      />
    </main>
  );
}

export default function JobDetailPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-[#f5f5f4]" />}>
      <JobDetailPageContent />
    </React.Suspense>
  );
}
