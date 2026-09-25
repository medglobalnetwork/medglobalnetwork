"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bookmark,
  Briefcase,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { JobCard } from "@/modules/opportunities/components/JobCard";
import { EmptyState } from "@/modules/network/components/EmptyState";
import { Job } from "@/modules/opportunities/types";

export default function SavedJobsPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const [savedJobs, setSavedJobs] = React.useState<Job[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (!isPending && !session) router.replace("/");
  }, [isPending, router, session]);

  React.useEffect(() => {
    if (!session?.user) return;

    const load = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/opportunities/saved");
        const data = await res.json();
        if (res.ok && data.savedJobs) {
          setSavedJobs(data.savedJobs);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [session?.user]);

  const handleSaveToggle = (jobId: string, isSaved: boolean) => {
    if (!isSaved) {
      setSavedJobs((prev) => prev.filter((j) => j.id !== jobId));
    }
  };

  if (isPending || !session) return <main className="min-h-dvh bg-[#f5f5f4]" />;

  return (
    <main className="min-h-dvh bg-[#f5f5f4] pb-36 text-[#171717]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        <div>
          <button
            type="button"
            onClick={() => router.push("/opportunities")}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#1769c2] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1769c2] rounded"
          >
            <ArrowLeft className="size-3.5" /> Back to Opportunities Discovery
          </button>
          <h1 className="mt-1 text-2xl font-bold text-[#171717] flex items-center gap-2 text-balance">
            <Bookmark className="size-6 text-[#1769c2]" /> Saved Opportunities ({savedJobs.length})
          </h1>
          <p className="text-xs text-[#77716b] text-pretty">
            Your bookmarked clinical openings, internships, and research fellowships.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-48 rounded-3xl bg-white/70 animate-pulse border border-[#ded8d1]" />
            ))}
          </div>
        ) : savedJobs.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {savedJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onSaveToggle={handleSaveToggle}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Bookmark className="h-10 w-10 text-[#77716b]" />}
            title="No saved opportunities yet"
            description="Bookmark clinical roles and fellowships to apply later or compare compensation packages."
            actionText="Browse Job Catalog"
            onAction={() => router.push("/opportunities/jobs")}
          />
        )}
      </div>
    </main>
  );
}
