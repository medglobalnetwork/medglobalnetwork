"use client";

import * as React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CourseCard } from "@/modules/learn/components/CourseCard";
import { LearnFilters } from "@/modules/learn/components/LearnFilters";
import { EmptyState } from "@/modules/network/components/EmptyState";
import { Course } from "@/modules/learn/types";

function CoursesCatalogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = React.useState(searchParams.get("query") || "");
  const [category, setCategory] = React.useState(searchParams.get("category") || "All");
  const [profession, setProfession] = React.useState(searchParams.get("profession") || "All");
  const [level, setLevel] = React.useState(searchParams.get("level") || "all_levels");
  const [isFreeOnly, setIsFreeOnly] = React.useState(searchParams.get("is_free") === "true");
  const [sort, setSort] = React.useState<string>(searchParams.get("sort") || "popular");

  const [courses, setCourses] = React.useState<Course[]>([]);
  const [total, setTotal] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(true);
  const [page, setPage] = React.useState(1);

  const fetchCourses = React.useCallback(async (targetPage = 1) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.set("query", query.trim());
      if (category !== "All") params.set("category", category);
      if (profession !== "All") params.set("profession", profession);
      if (level !== "all_levels") params.set("level", level);
      if (isFreeOnly) params.set("is_free", "true");
      params.set("sort", sort);
      params.set("page", String(targetPage));
      params.set("pageSize", "12");

      const res = await fetch(`/api/learn/courses?${params.toString()}`);
      const data = await res.json();
      if (res.ok && data.courses) {
        setCourses(data.courses);
        setTotal(data.total || 0);
        setPage(targetPage);
      }
    } catch (err) {
      console.error("Failed to load catalog:", err);
    } finally {
      setIsLoading(false);
    }
  }, [query, category, profession, level, isFreeOnly, sort]);

  React.useEffect(() => {
    fetchCourses(1);
  }, [fetchCourses]);

  return (
    <main className="min-h-screen bg-[#f5f5f4] pb-36 text-[#171717]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        {/* Header Row */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => router.push("/learn")}
                className="text-xs font-semibold text-[#1769c2] hover:underline"
              >
                ← Back to Learn Home
              </button>
            </div>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#171717]">
              Accredited Course Catalog
            </h1>
            <p className="text-xs text-[#77716b]">
              Discover clinical training modules, CME certifications, and medical workshops.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-[#77716b]">Sort By:</label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="rounded-xl border border-[#ded8d1] bg-white px-3 py-1.5 text-xs text-[#171717] focus:outline-none"
            >
              <option value="popular">🔥 Most Popular</option>
              <option value="newest">✨ Newest First</option>
              <option value="rating">★ Highest Rated</option>
              <option value="duration">⏱ Shortest Duration</option>
            </select>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="space-y-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by topic, condition, or instructor name..."
            className="h-11 w-full rounded-2xl border border-[#ded8d1] bg-white px-4 text-xs text-[#171717] shadow-2xs focus:border-[#1769c2] focus:outline-none focus:ring-2 focus:ring-[#1769c2]/20 sm:text-sm"
          />

          <LearnFilters
            selectedCategory={category}
            onSelectCategory={setCategory}
            selectedProfession={profession}
            onSelectProfession={setProfession}
            selectedLevel={level}
            onSelectLevel={setLevel}
            isFreeOnly={isFreeOnly}
            onToggleFreeOnly={() => setIsFreeOnly(!isFreeOnly)}
          />
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between text-xs text-[#77716b]">
          <span>
            Showing <strong className="text-[#171717]">{courses.length}</strong> of{" "}
            <strong className="text-[#171717]">{total}</strong> accredited courses
          </span>
        </div>

        {/* Courses Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 gap-2.5 sm:gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-64 rounded-2xl bg-white/70 animate-pulse border border-[#ded8d1]" />
            ))}
          </div>
        ) : courses.length > 0 ? (
          <div className="grid grid-cols-2 gap-2.5 sm:gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon="🔍"
            title="No matching courses found"
            description="Try changing your filters or searching for another medical topic or clinical condition."
            actionText="Clear All Filters"
            onAction={() => {
              setQuery("");
              setCategory("All");
              setProfession("All");
              setLevel("all_levels");
              setIsFreeOnly(false);
            }}
          />
        )}
      </div>
    </main>
  );
}

export default function CoursesCatalogPage() {
  return (
    <React.Suspense
      fallback={
        <main className="min-h-screen bg-[#f5f5f4] p-6">
          <div className="mx-auto max-w-7xl space-y-6 animate-pulse">
            <div className="h-16 rounded-2xl bg-white/70" />
            <div className="h-44 rounded-2xl bg-white/70" />
          </div>
        </main>
      }
    >
      <CoursesCatalogContent />
    </React.Suspense>
  );
}
