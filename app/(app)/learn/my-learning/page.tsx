"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  Bookmark,
  CheckCircle2,
  Clock,
  Filter,
  GraduationCap,
  PlayCircle,
  Search,
  ShieldCheck,
  Sparkles,
  Layers,
  ChevronDown,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { StudentNavHeader } from "@/modules/learn/components/StudentNavHeader";
import { CourseEnrollment, Course } from "@/modules/learn/types";

type FilterType = "all" | "in_progress" | "not_started" | "completed" | "live" | "saved" | "free" | "paid";
type SortType = "recently_accessed" | "progress" | "recently_enrolled" | "alphabetical";

export default function MyLearningPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const [enrollments, setEnrollments] = React.useState<CourseEnrollment[]>([]);
  const [savedCourses, setSavedCourses] = React.useState<Course[]>([]);
  const [filter, setFilter] = React.useState<FilterType>("all");
  const [sort, setSort] = React.useState<SortType>("recently_accessed");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (!isPending && !session) router.replace("/");
  }, [isPending, router, session]);

  React.useEffect(() => {
    if (!session?.user) return;

    const loadData = async () => {
      setIsLoading(true);
      try {
        const [myRes, savedRes] = await Promise.all([
          fetch("/api/learn/my-learning"),
          fetch("/api/learn/bookmarks"),
        ]);

        if (myRes.ok) {
          const data = await myRes.json();
          const allEnrollments = [
            ...(data.inProgress || []),
            ...(data.completed || []),
          ];
          setEnrollments(allEnrollments);
        }

        if (savedRes.ok) {
          const savedData = await savedRes.json();
          setSavedCourses(savedData.courses || []);
        }
      } catch (err) {
        console.error("Failed to load enrolled courses:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [session?.user]);

  // Filter and sort items
  const filteredEnrollments = React.useMemo(() => {
    let list = [...enrollments];

    if (filter === "in_progress") {
      list = list.filter((e) => e.progress_percentage > 0 && e.progress_percentage < 100);
    } else if (filter === "not_started") {
      list = list.filter((e) => e.progress_percentage === 0);
    } else if (filter === "completed") {
      list = list.filter((e) => e.progress_percentage >= 100);
    } else if (filter === "free") {
      list = list.filter((e) => e.course?.is_free);
    } else if (filter === "paid") {
      list = list.filter((e) => !e.course?.is_free);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (e) =>
          e.course?.title?.toLowerCase().includes(q) ||
          e.course?.category?.toLowerCase().includes(q)
      );
    }

    if (sort === "progress") {
      list.sort((a, b) => b.progress_percentage - a.progress_percentage);
    } else if (sort === "recently_enrolled") {
      list.sort((a, b) => new Date(b.enrolled_at).getTime() - new Date(a.enrolled_at).getTime());
    } else if (sort === "alphabetical") {
      list.sort((a, b) => (a.course?.title || "").localeCompare(b.course?.title || ""));
    } else {
      // Default: recently accessed
      list.sort(
        (a, b) =>
          new Date(b.last_accessed_at || 0).getTime() -
          new Date(a.last_accessed_at || 0).getTime()
      );
    }

    return list;
  }, [enrollments, filter, sort, searchQuery]);

  return (
    <div className="min-h-screen bg-[#faf9f8] dark:bg-[#0d1117] text-[#171717] dark:text-[#f0f6fc] pb-24">
      <StudentNavHeader activeTab="my-learning" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Link
                href="/learn"
                className="p-1.5 rounded-xl hover:bg-[#f0efee] dark:hover:bg-[#21262d] text-[#77716b] dark:text-[#8b949e] transition"
              >
                <ArrowLeft className="size-4" />
              </Link>
              <h1 className="text-2xl font-extrabold text-[#171717] dark:text-[#f0f6fc]">
                My Enrolled Courses
              </h1>
            </div>
            <p className="text-xs text-[#77716b] dark:text-[#8b949e] mt-1 ml-8">
              Track your coursework progress, resume lessons, and earn accredited medical certificates.
            </p>
          </div>

          <Link
            href="/learn/explore"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0f4c81] hover:bg-[#0d3f6c] text-white text-xs font-bold transition shadow-xs self-start sm:self-auto"
          >
            Explore Catalog <ArrowRight className="size-3.5" />
          </Link>
        </div>

        {/* Filters and Search Bar */}
        <div className="bg-white dark:bg-[#161b22] border border-[#e8e6e3] dark:border-[#30363d] rounded-2xl p-4 shadow-2xs space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#9c958f]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search your enrolled courses..."
                className="w-full bg-[#f8f7f6] dark:bg-[#21262d] border border-transparent focus:border-[#0f4c81] pl-9 pr-3 py-2 rounded-xl text-xs font-medium focus:outline-none"
              />
            </div>

            {/* Sorting Dropdown */}
            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              <span className="text-xs text-[#77716b] dark:text-[#8b949e]">Sort by:</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortType)}
                className="bg-[#f8f7f6] dark:bg-[#21262d] border border-[#e8e6e3] dark:border-[#30363d] text-xs font-semibold px-3 py-1.5 rounded-xl focus:outline-none"
              >
                <option value="recently_accessed">Recently Accessed</option>
                <option value="progress">Highest Progress</option>
                <option value="recently_enrolled">Recently Enrolled</option>
                <option value="alphabetical">Alphabetical</option>
              </select>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 border-t border-[#f0efee] dark:border-[#21262d] pt-3">
            {[
              { id: "all", label: "All Courses" },
              { id: "in_progress", label: "In Progress" },
              { id: "not_started", label: "Not Started" },
              { id: "completed", label: "Completed" },
              { id: "free", label: "Free" },
              { id: "paid", label: "Paid" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id as FilterType)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  filter === tab.id
                    ? "bg-[#0f4c81] text-white"
                    : "bg-[#f5f4f2] dark:bg-[#21262d] text-[#5d5854] dark:text-[#8b949e] hover:bg-[#e8e6e3] dark:hover:bg-[#30363d]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Courses Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-white dark:bg-[#161b22] border border-[#e8e6e3] dark:border-[#30363d] rounded-2xl h-56 animate-pulse"
              />
            ))}
          </div>
        ) : filteredEnrollments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredEnrollments.map((enrollment) => {
              const course = enrollment.course;
              const isCompleted = enrollment.progress_percentage >= 100;

              return (
                <div
                  key={enrollment.id}
                  className="bg-white dark:bg-[#161b22] border border-[#e8e6e3] dark:border-[#30363d] rounded-2xl overflow-hidden shadow-2xs hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    {/* Thumbnail Image Header */}
                    <div className="h-36 bg-gradient-to-tr from-[#0f4c81] to-[#1c6eb8] relative overflow-hidden">
                      {course?.thumbnail ? (
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center opacity-25">
                          <GraduationCap className="size-16 text-white" />
                        </div>
                      )}
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold uppercase">
                          {course?.category || "Medical"}
                        </span>
                      </div>
                      {isCompleted && (
                        <div className="absolute top-3 right-3 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                          <CheckCircle2 className="size-3" /> Completed
                        </div>
                      )}
                    </div>

                    {/* Body */}
                    <div className="p-4 space-y-3">
                      <div>
                        <h3 className="text-sm font-bold text-[#171717] dark:text-[#f0f6fc] line-clamp-1">
                          {course?.title || "Medical Course"}
                        </h3>
                        <p className="text-[11px] text-[#77716b] dark:text-[#8b949e] flex items-center gap-1 mt-0.5">
                          <ShieldCheck className="size-3 text-blue-500" />
                          <span>Verified Faculty</span>
                        </p>
                      </div>

                      {/* Progress Bar & Status */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] font-bold">
                          <span className="text-[#5d5854] dark:text-[#8b949e]">Progress</span>
                          <span className="text-[#0f4c81] dark:text-[#58a6ff]">
                            {enrollment.progress_percentage}%
                          </span>
                        </div>
                        <div className="w-full bg-[#f0efee] dark:bg-[#21262d] h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              isCompleted
                                ? "bg-[#16804d] dark:bg-[#2ea043]"
                                : "bg-[#0f4c81] dark:text-[#58a6ff]"
                            }`}
                            style={{ width: `${Math.max(enrollment.progress_percentage, 5)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="p-4 pt-0 border-t border-[#f0efee] dark:border-[#21262d] mt-2 flex items-center justify-between">
                    <span className="text-[11px] text-[#77716b] dark:text-[#8b949e] truncate max-w-[140px]">
                      {isCompleted ? "Course finished" : "Next: Continue study"}
                    </span>
                    <Link
                      href={
                        enrollment.last_lesson_id
                          ? `/learn/lesson/${enrollment.last_lesson_id}`
                          : `/learn/course/${enrollment.course_id}`
                      }
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0f4c81] hover:bg-[#0d3f6c] text-white text-xs font-bold transition shadow-xs"
                    >
                      {isCompleted ? "Review" : "Continue Learning"} <ArrowRight className="size-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white dark:bg-[#161b22] border border-[#e8e6e3] dark:border-[#30363d] rounded-2xl p-12 text-center space-y-3">
            <div className="size-14 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-[#0f4c81] dark:text-[#58a6ff] flex items-center justify-center mx-auto">
              <BookOpen className="size-7" />
            </div>
            <h3 className="text-base font-bold text-[#171717] dark:text-[#f0f6fc]">
              No Courses Match Your Filter
            </h3>
            <p className="text-xs text-[#77716b] dark:text-[#8b949e] max-w-sm mx-auto">
              Explore medical specializations, clinical skills, and board prep courses to enroll today.
            </p>
            <Link
              href="/learn/explore"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0f4c81] hover:bg-[#0d3f6c] text-white text-xs font-bold transition shadow-xs mt-2"
            >
              Browse Catalog
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
