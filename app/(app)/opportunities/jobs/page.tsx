"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { JobCard } from "@/modules/opportunities/components/JobCard";
import { JobFilters } from "@/modules/opportunities/components/JobFilters";
import { EmptyState } from "@/modules/network/components/EmptyState";
import { Job } from "@/modules/opportunities/types";

function JobsCatalogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, isPending } = authClient.useSession();

  // Search & Filter state initialized from URL params
  const [query, setQuery] = React.useState(searchParams.get("query") || "");
  const [opportunityType, setOpportunityType] = React.useState(searchParams.get("opportunityType") || "All");
  const [profession, setProfession] = React.useState(searchParams.get("profession") || "All");
  const [specialization, setSpecialization] = React.useState(searchParams.get("specialization") || "All");
  const [employmentType, setEmploymentType] = React.useState(searchParams.get("employmentType") || "All");
  const [workMode, setWorkMode] = React.useState(searchParams.get("workMode") || "All");
  const [city, setCity] = React.useState(searchParams.get("city") || "");
  const [verifiedOnly, setVerifiedOnly] = React.useState(searchParams.get("verifiedOnly") === "true");
  const [sort, setSort] = React.useState(searchParams.get("sort") || "newest");
  const [page, setPage] = React.useState(1);

  const [jobs, setJobs] = React.useState<Job[]>([]);
  const [total, setTotal] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);

  const fetchJobs = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.set("query", query);
      if (opportunityType !== "All") params.set("opportunityType", opportunityType);
      if (profession !== "All") params.set("profession", profession);
      if (specialization !== "All") params.set("specialization", specialization);
      if (employmentType !== "All") params.set("employmentType", employmentType);
      if (workMode !== "All") params.set("workMode", workMode);
      if (city) params.set("city", city);
      if (verifiedOnly) params.set("verifiedOnly", "true");
      params.set("sort", sort);
      params.set("page", String(page));
      params.set("pageSize", "10");

      const res = await fetch(`/api/opportunities/jobs?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setJobs(data.jobs || []);
        setTotal(data.total || 0);
      }
    } catch (err) {
      console.error("Failed to load catalog jobs:", err);
    } finally {
      setIsLoading(false);
    }
  }, [query, opportunityType, profession, specialization, employmentType, workMode, city, verifiedOnly, sort, page]);

  React.useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleReset = () => {
    setQuery("");
    setOpportunityType("All");
    setProfession("All");
    setSpecialization("All");
    setEmploymentType("All");
    setWorkMode("All");
    setCity("");
    setVerifiedOnly(false);
    setSort("newest");
    setPage(1);
  };

  const totalPages = Math.ceil(total / 10);

  return (
    <main className="min-h-dvh bg-[#f5f5f4] pb-36 text-[#171717]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <button
              type="button"
              onClick={() => router.push("/opportunities")}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#1769c2] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1769c2] rounded"
            >
              <ArrowLeft className="size-3.5" /> Back to Opportunities Discovery
            </button>
            <h1 className="mt-1 text-2xl font-bold text-[#171717] text-balance">
              Healthcare Opportunities Catalog
            </h1>
            <p className="text-xs text-[#77716b] text-pretty">
              Showing {total} active openings across hospitals, clinics, and research networks
            </p>
          </div>

          {/* Sort & Filter Toggle */}
          <div className="flex items-center gap-3">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="h-10 rounded-xl border border-[#ded8d1] bg-white px-3 text-xs font-semibold text-[#171717] focus:outline-none"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="salary_desc">Sort: Highest Salary</option>
              <option value="popular">Sort: Most Applied</option>
              <option value="deadline">Sort: Application Deadline</option>
            </select>

            <button
              type="button"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#ded8d1] bg-white px-4 py-2 text-xs font-bold text-[#171717] hover:bg-[#faf9f8]"
            >
              <Filter className="h-3.5 w-3.5" /> Filters
            </button>
          </div>
        </div>

        {/* Search & Filter Component */}
        <JobFilters
          opportunityType={opportunityType}
          onSelectOpportunityType={(t) => { setOpportunityType(t); setPage(1); }}
          profession={profession}
          onSelectProfession={(p) => { setProfession(p); setPage(1); }}
          specialization={specialization}
          onSelectSpecialization={(s) => { setSpecialization(s); setPage(1); }}
          workMode={workMode}
          onSelectWorkMode={(m) => { setWorkMode(m); setPage(1); }}
          employmentType={employmentType}
          onSelectEmploymentType={(e) => { setEmploymentType(e); setPage(1); }}
          verifiedOnly={verifiedOnly}
          onToggleVerifiedOnly={() => { setVerifiedOnly(!verifiedOnly); setPage(1); }}
          onReset={handleReset}
        />

        {/* Listings Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-48 rounded-3xl bg-white/70 animate-pulse border border-[#ded8d1]" />
            ))}
          </div>
        ) : jobs.length > 0 ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-[#ded8d1] pt-6 text-xs font-semibold">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="inline-flex items-center gap-1 rounded-xl border border-[#ded8d1] bg-white px-4 py-2 text-[#5d5854] hover:bg-[#faf9f8] disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" /> Previous
                </button>

                <span className="text-[#77716b]">
                  Page <strong className="text-[#171717]">{page}</strong> of <strong>{totalPages}</strong>
                </span>

                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="inline-flex items-center gap-1 rounded-xl border border-[#ded8d1] bg-white px-4 py-2 text-[#5d5854] hover:bg-[#faf9f8] disabled:opacity-40"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        ) : (
          <EmptyState
            icon={<Briefcase className="h-10 w-10 text-[#77716b]" />}
            title="No matching opportunities found"
            description="Try loosening your specialty or location filters to see more clinical openings."
            actionText="Clear All Filters"
            onAction={handleReset}
          />
        )}
      </div>
    </main>
  );
}

export default function JobsCatalogPage() {
  return (
    <React.Suspense fallback={<div className="min-h-dvh bg-[#f5f5f4]" />}>
      <JobsCatalogContent />
    </React.Suspense>
  );
}
