"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Search,
  SlidersHorizontal,
  X,
  BookOpen,
  Sparkles,
  ArrowLeft,
  ChevronDown,
  Clock,
  Award,
  Filter,
} from "lucide-react";
import { CourseCard } from "@/modules/learn/components/CourseCard";
import { Course } from "@/modules/learn/types";

export default function LearnExplorePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = React.useState(searchParams.get("query") || "");
  const [profession, setProfession] = React.useState(searchParams.get("profession") || "All");
  const [category, setCategory] = React.useState(searchParams.get("category") || "All");
  const [level, setLevel] = React.useState(searchParams.get("level") || "all_levels");
  const [format, setFormat] = React.useState(searchParams.get("format") || "all");
  const [duration, setDuration] = React.useState(searchParams.get("duration") || "all");
  const [pricing, setPricing] = React.useState(searchParams.get("pricing") || "all");
  const [cmeOnly, setCmeOnly] = React.useState(searchParams.get("cme") === "true");
  const [language, setLanguage] = React.useState(searchParams.get("language") || "All");
  const [sort, setSort] = React.useState(searchParams.get("sort") || "popular");

  const [courses, setCourses] = React.useState<Course[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = React.useState(false);

  const fetchCourses = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.set("query", query.trim());
      if (profession !== "All") params.set("profession", profession);
      if (category !== "All") params.set("category", category);
      if (level !== "all_levels") params.set("level", level);
      if (duration !== "all") params.set("duration", duration);
      if (pricing === "free") params.set("is_free", "true");
      if (cmeOnly) params.set("certificate_enabled", "true");
      if (language !== "All") params.set("language", language);
      params.set("sort", sort);
      params.set("pageSize", "24");

      const res = await fetch(`/api/learn/courses?${params.toString()}`);
      const data = await res.json();
      if (res.ok && Array.isArray(data.courses)) {
        setCourses(data.courses);
        setTotal(data.total || data.courses.length);
      }
    } catch (err) {
      console.error("Failed to load catalog:", err);
    } finally {
      setLoading(false);
    }
  }, [query, profession, category, level, duration, pricing, cmeOnly, language, sort]);

  React.useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleResetFilters = () => {
    setQuery("");
    setProfession("All");
    setCategory("All");
    setLevel("all_levels");
    setFormat("all");
    setDuration("all");
    setPricing("all");
    setCmeOnly(false);
    setLanguage("All");
    setSort("popular");
  };

  const hasActiveFilters =
    query.trim() !== "" ||
    profession !== "All" ||
    category !== "All" ||
    level !== "all_levels" ||
    format !== "all" ||
    duration !== "all" ||
    pricing !== "all" ||
    cmeOnly ||
    language !== "All";

  return (
    <div className="min-h-dvh bg-[#faf9f8] dark:bg-[#0d1117] pb-24 text-[#171717] dark:text-[#f0f6fc]">
      {/* Top Banner Header */}
      <div className="border-b border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] px-4 py-6 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#0f4c81] dark:text-[#58a6ff] mb-1">
                <Link href="/learn" className="hover:underline flex items-center gap-1">
                  <ArrowLeft className="size-3.5" /> Dashboard
                </Link>
                <span>/</span>
                <span>Explore Catalog</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-[#171717] dark:text-[#f0f6fc]">
                Global Medical Catalog & Discovery
              </h1>
              <p className="text-xs text-[#77716b] dark:text-[#8b949e]">
                Multi-dimensional discovery of accredited masterclasses, CME courses, and clinical tracks
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMobileFilterOpen(true)}
                className="inline-flex lg:hidden items-center gap-2 rounded-xl border border-[#ded8d1] dark:border-[#30363d] bg-[#f8f7f6] dark:bg-[#21262d] px-3.5 py-2 text-xs font-bold text-[#171717] dark:text-[#f0f6fc] cursor-pointer"
              >
                <Filter className="size-3.5" />
                <span>Filters {hasActiveFilters && "•"}</span>
              </button>

              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="rounded-xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#21262d] px-3 py-2 text-xs font-bold text-[#171717] dark:text-[#f0f6fc] focus:outline-none"
              >
                <option value="popular">🔥 Most Popular</option>
                <option value="newest">✨ Newest First</option>
                <option value="rating">★ Highest Rated</option>
                <option value="duration">⏱ Shortest Duration</option>
              </select>
            </div>
          </div>

          {/* Live Search Input */}
          <div className="mt-4 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#8a8784]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by topic, disease, drug, clinical faculty e.g. 'ECG', 'Rehab', 'Ultrasound'..."
              className="w-full rounded-2xl border border-[#ded8d1] dark:border-[#30363d] bg-[#f8f7f6] dark:bg-[#21262d] pl-10 pr-10 py-2.5 text-xs sm:text-sm text-[#171717] dark:text-[#f0f6fc] placeholder:text-[#8a8784] focus:border-[#0f4c81] focus:outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8a8784] hover:text-[#171717]"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Filter & Course Grid Layout */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block w-72 shrink-0 space-y-5 rounded-3xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-5 shadow-2xs">
            <div className="flex items-center justify-between border-b border-[#f0efee] dark:border-[#21262d] pb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#171717] dark:text-[#f0f6fc]">
                <SlidersHorizontal className="size-4 text-[#0f4c81]" />
                <span>Filters</span>
              </div>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-[11px] font-semibold text-[#0f4c81] dark:text-[#58a6ff] hover:underline cursor-pointer"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* 1. Profession */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#5d5854] dark:text-[#8b949e]">Target Profession</label>
              <select
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                className="w-full rounded-xl border border-[#ded8d1] dark:border-[#30363d] bg-[#f8f7f6] dark:bg-[#21262d] p-2 text-xs text-[#171717] dark:text-[#f0f6fc]"
              >
                <option value="All">All Healthcare Professions</option>
                <option value="Doctor">Doctors / MBBS / Specialists</option>
                <option value="Physiotherapist">Physiotherapists (BPT/MPT)</option>
                <option value="Dentist">Dentists (BDS/MDS)</option>
                <option value="Nurse">Nursing & Acute Care</option>
                <option value="Pharmacist">Pharmacists</option>
              </select>
            </div>

            {/* 2. Specialty / Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#5d5854] dark:text-[#8b949e]">Specialty / Discipline</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-[#ded8d1] dark:border-[#30363d] bg-[#f8f7f6] dark:bg-[#21262d] p-2 text-xs text-[#171717] dark:text-[#f0f6fc]"
              >
                <option value="All">All Specialties</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Physiotherapy">Physiotherapy & Rehab</option>
                <option value="Medicine">Internal Medicine</option>
                <option value="Orthopedics">Orthopedics & Sports</option>
                <option value="Critical Care">Critical Care & ICU</option>
                <option value="Neurology">Neurology</option>
                <option value="Emergency Medicine">Emergency Medicine</option>
                <option value="Clinical Research">Clinical Research & GCP</option>
              </select>
            </div>

            {/* 3. Skill Level */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#5d5854] dark:text-[#8b949e]">Skill Level</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full rounded-xl border border-[#ded8d1] dark:border-[#30363d] bg-[#f8f7f6] dark:bg-[#21262d] p-2 text-xs text-[#171717] dark:text-[#f0f6fc]"
              >
                <option value="all_levels">All Levels</option>
                <option value="beginner">Beginner / Student</option>
                <option value="intermediate">Intermediate / Resident</option>
                <option value="advanced">Advanced / Fellow</option>
              </select>
            </div>

            {/* 4. Duration */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#5d5854] dark:text-[#8b949e]">Duration</label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full rounded-xl border border-[#ded8d1] dark:border-[#30363d] bg-[#f8f7f6] dark:bg-[#21262d] p-2 text-xs text-[#171717] dark:text-[#f0f6fc]"
              >
                <option value="all">Any Duration</option>
                <option value="under_1h">&lt; 1 hour (Quick Pearls)</option>
                <option value="1h_3h">1 - 3 hours</option>
                <option value="3h_6h">3 - 6 hours</option>
                <option value="over_6h">6+ hours (Comprehensive)</option>
              </select>
            </div>

            {/* 5. Pricing */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#5d5854] dark:text-[#8b949e]">Pricing</label>
              <select
                value={pricing}
                onChange={(e) => setPricing(e.target.value)}
                className="w-full rounded-xl border border-[#ded8d1] dark:border-[#30363d] bg-[#f8f7f6] dark:bg-[#21262d] p-2 text-xs text-[#171717] dark:text-[#f0f6fc]"
              >
                <option value="all">All Courses</option>
                <option value="free">Free Courses Only</option>
                <option value="paid">Premium Masterclasses</option>
              </select>
            </div>

            {/* 6. CME Toggle */}
            <div className="pt-2 border-t border-[#f0efee] dark:border-[#21262d]">
              <label className="flex items-center gap-2 text-xs font-bold text-[#171717] dark:text-[#f0f6fc] cursor-pointer">
                <input
                  type="checkbox"
                  checked={cmeOnly}
                  onChange={(e) => setCmeOnly(e.target.checked)}
                  className="rounded text-[#0f4c81]"
                />
                <span>Accredited CME & Certificate</span>
              </label>
            </div>
          </aside>

          {/* Course Grid Results */}
          <main className="flex-1 w-full min-w-0">
            <div className="mb-4 flex items-center justify-between text-xs text-[#77716b] dark:text-[#8b949e]">
              <span>Showing <strong>{courses.length}</strong> masterclasses</span>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="font-semibold text-[#0f4c81] dark:text-[#58a6ff] hover:underline"
                >
                  Reset filters
                </button>
              )}
            </div>

            {loading ? (
              <div className="grid grid-cols-2 gap-3 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-64 rounded-2xl bg-[#e8e6e3] dark:bg-[#21262d] animate-pulse" />
                ))}
              </div>
            ) : courses.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {courses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-12 text-center">
                <BookOpen className="size-12 mx-auto text-[#8a8784] mb-3" />
                <h3 className="text-base font-bold text-[#171717] dark:text-[#f0f6fc]">
                  No matching courses found
                </h3>
                <p className="text-xs text-[#77716b] dark:text-[#8b949e] mt-1 max-w-sm mx-auto">
                  Try adjusting your keywords or clearing some filters to explore more topics.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="mt-5 rounded-xl bg-[#0f4c81] px-5 py-2.5 text-xs font-bold text-white shadow-xs cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
