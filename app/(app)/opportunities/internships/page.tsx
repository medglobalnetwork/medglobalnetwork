"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Briefcase,
  GraduationCap,
  PlusCircle,
  Search,
  Sparkles,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { JobCard } from "@/modules/opportunities/components/JobCard";
import { EmptyState } from "@/modules/network/components/EmptyState";
import { Job } from "@/modules/opportunities/types";

export default function InternshipsPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const [activeTab, setActiveTab] = React.useState<string>("all");
  const [internships, setInternships] = React.useState<Job[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (!isPending && !session) router.replace("/");
  }, [isPending, router, session]);

  React.useEffect(() => {
    if (!session?.user) return;

    const load = async () => {
      setIsLoading(true);
      try {
        let typeFilter = "internship";
        if (activeTab === "clinical") typeFilter = "clinical_internship";
        else if (activeTab === "fellowship") typeFilter = "fellowship";
        else if (activeTab === "observership") typeFilter = "observership";

        const res = await fetch(`/api/opportunities/jobs?opportunityType=${typeFilter}&pageSize=20`);
        const data = await res.json();
        if (res.ok && data.jobs) {
          setInternships(data.jobs);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [activeTab, session?.user]);

  if (isPending || !session) return <main className="min-h-screen bg-[#f5f5f4]" />;

  return (
    <main className="min-h-screen bg-[#f5f5f4] pb-36 text-[#171717]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
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
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#171717] flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-[#1769c2]" /> Clinical Internships, Rotations & Fellowships
            </h1>
            <p className="text-xs text-[#77716b]">
              Accredited hospital internships, hands-on clinical observerships, and super-specialty fellowships.
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push("/recruiter/jobs/create")}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#1769c2] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#12569f]"
          >
            <PlusCircle className="h-3.5 w-3.5" /> Post an Internship
          </button>
        </div>

        {/* Tab Filter Selector */}
        <div className="flex gap-2 border-b border-[#ded8d1] pb-2">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
              activeTab === "all" ? "bg-[#1769c2] text-white" : "bg-white text-[#5d5854] hover:bg-[#faf9f8]"
            }`}
          >
            All Training Opportunities
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("clinical")}
            className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
              activeTab === "clinical" ? "bg-[#1769c2] text-white" : "bg-white text-[#5d5854] hover:bg-[#faf9f8]"
            }`}
          >
            Clinical Internships
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("fellowship")}
            className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
              activeTab === "fellowship" ? "bg-[#1769c2] text-white" : "bg-white text-[#5d5854] hover:bg-[#faf9f8]"
            }`}
          >
            Fellowships
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("observership")}
            className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
              activeTab === "observership" ? "bg-[#1769c2] text-white" : "bg-white text-[#5d5854] hover:bg-[#faf9f8]"
            }`}
          >
            Observerships
          </button>
        </div>

        {/* Listings */}
        {isLoading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-48 rounded-3xl bg-white/70 animate-pulse border border-[#ded8d1]" />
            ))}
          </div>
        ) : internships.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {internships.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<GraduationCap className="h-10 w-10 text-[#77716b]" />}
            title="No internships found in this category"
            description="Check back soon or explore full-time clinical openings across our verified hospital network."
            actionText="Explore All Jobs"
            onAction={() => router.push("/opportunities/jobs")}
          />
        )}
      </div>
    </main>
  );
}
