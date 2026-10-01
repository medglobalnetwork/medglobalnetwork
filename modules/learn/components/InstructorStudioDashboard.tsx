"use client";

import * as React from "react";
import Link from "next/link";
import {
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileQuestion,
  GraduationCap,
  Layers,
  Plus,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  TrendingUp,
  UserCheck,
  Users,
  Video,
  Folder,
} from "lucide-react";
import { InstructorCourseOverviewItem } from "../lib/learn-db";
import { InstructorCourseRosterModal } from "./InstructorCourseRosterModal";
import { InstructorCourseSetupManager } from "./instructor/InstructorCourseSetupManager";
import { InstructorBatchesManager } from "./instructor/InstructorBatchesManager";
import { InstructorTestManager } from "./instructor/InstructorTestManager";
import { InstructorSettingsManager } from "./instructor/InstructorSettingsManager";
import { TeacherResourceManager } from "./resources/TeacherResourceManager";

export type InstructorStudioTab =
  | "courses"
  | "setup"
  | "batches"
  | "tests"
  | "resources"
  | "settings";

export function InstructorStudioDashboard() {
  const [activeTab, setActiveTab] = React.useState<InstructorStudioTab>("courses");
  const [editingCourseId, setEditingCourseId] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [summary, setSummary] = React.useState<{
    totalCourses: number;
    totalEnrolled: number;
    totalCompleted: number;
    totalCertificatesIssued: number;
    overallCompletionRate: number;
  }>({
    totalCourses: 0,
    totalEnrolled: 0,
    totalCompleted: 0,
    totalCertificatesIssued: 0,
    overallCompletionRate: 0,
  });
  const [courses, setCourses] = React.useState<InstructorCourseOverviewItem[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCourseForRoster, setSelectedCourseForRoster] = React.useState<string | null>(null);

  const fetchInstructorData = React.useCallback(() => {
    setLoading(true);
    setError(null);
    fetch("/api/learn/instructor/courses", { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to load instructor courses");
        }
        return res.json();
      })
      .then((data) => {
        setSummary(data.summary);
        setCourses(data.courses || []);
      })
      .catch((err: any) => {
        setError(err.message || "Failed to load courses");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  React.useEffect(() => {
    fetchInstructorData();
  }, [fetchInstructorData]);

  const filteredCourses = courses.filter(
    (c) =>
      !searchQuery.trim() ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.profession && c.profession.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#ded8d1] pb-6 dark:border-[#30363d]">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eef5fc] px-3 py-1 text-xs font-bold text-[#0f4c81] dark:bg-[#1f2937] dark:text-[#58a6ff]">
              <GraduationCap className="size-4" />
              Faculty & Instructor Workspace
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-black text-[#171717] sm:text-3xl dark:text-[#f0f6fc]">
            MGN Instructor Studio
          </h1>
          <p className="mt-1 text-xs text-[#77716b] sm:text-sm dark:text-[#8b949e]">
            Manage courses, cohort batches, folder curriculums, exams, and verified certificates.
          </p>
        </div>

        {/* Quick Action */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setEditingCourseId(null);
              setActiveTab("setup");
            }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#0f4c81] px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#0c3c66] transition cursor-pointer"
          >
            <Plus className="size-4" />
            <span>Create New Course</span>
          </button>
        </div>
      </div>

      {/* OVERVIEW STATS CARDS */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {/* Total Courses */}
        <div className="rounded-3xl border border-[#ded8d1] bg-white p-5 shadow-xs dark:border-[#30363d] dark:bg-[#161b22]">
          <div className="flex items-center justify-between text-[#0f4c81] dark:text-[#58a6ff]">
            <span className="text-xs font-bold">Total Courses</span>
            <BookOpen className="size-4" />
          </div>
          <p className="mt-2 text-2xl font-black text-[#171717] sm:text-3xl dark:text-[#f0f6fc]">
            {summary.totalCourses}
          </p>
          <p className="mt-1 text-[11px] text-[#77716b] dark:text-[#8b949e]">Authored by you</p>
        </div>

        {/* Total Enrolled Students */}
        <div className="rounded-3xl border border-[#ded8d1] bg-white p-5 shadow-xs dark:border-[#30363d] dark:bg-[#161b22]">
          <div className="flex items-center justify-between text-[#0f4c81] dark:text-[#58a6ff]">
            <span className="text-xs font-bold">Enrolled Learners</span>
            <Users className="size-4" />
          </div>
          <p className="mt-2 text-2xl font-black text-[#171717] sm:text-3xl dark:text-[#f0f6fc]">
            {summary.totalEnrolled}
          </p>
          <p className="mt-1 text-[11px] text-[#77716b] dark:text-[#8b949e]">Across all courses</p>
        </div>

        {/* Completed Students */}
        <div className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-xs dark:border-emerald-950 dark:bg-[#161b22]">
          <div className="flex items-center justify-between text-[#16804d] dark:text-emerald-400">
            <span className="text-xs font-bold">Course Completions</span>
            <CheckCircle2 className="size-4" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#16804d] sm:text-3xl dark:text-emerald-400">
              {summary.totalCompleted}
            </span>
            <span className="text-xs font-bold text-[#77716b] dark:text-[#8b949e]">
              ({summary.overallCompletionRate}%)
            </span>
          </div>
          <p className="mt-1 text-[11px] text-[#77716b] dark:text-[#8b949e]">Students finished</p>
        </div>

        {/* Certificates Issued */}
        <div className="rounded-3xl border border-amber-100 bg-white p-5 shadow-xs dark:border-amber-950 dark:bg-[#161b22]">
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-400">
            <span className="text-xs font-bold">Certificates Issued</span>
            <Award className="size-4" />
          </div>
          <p className="mt-2 text-2xl font-black text-amber-600 sm:text-3xl dark:text-amber-400">
            {summary.totalCertificatesIssued}
          </p>
          <p className="mt-1 text-[11px] text-[#77716b] dark:text-[#8b949e]">Verified credentials</p>
        </div>
      </div>

      {/* MASTER STUDIO NAVIGATION TABS */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-[#ded8d1] pb-3 dark:border-[#30363d] no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab("courses")}
          className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold whitespace-nowrap transition cursor-pointer ${
            activeTab === "courses"
              ? "bg-[#0f4c81] text-white shadow-xs"
              : "border border-[#ded8d1] bg-white text-[#5d5854] hover:bg-[#f0efee] dark:border-[#30363d] dark:bg-[#161b22] dark:text-[#8b949e] dark:hover:bg-[#21262d]"
          }`}
        >
          <BookOpen className="size-3.5" />
          <span>My Courses & Learners ({summary.totalCourses})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setEditingCourseId(null);
            setActiveTab("setup");
          }}
          className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold whitespace-nowrap transition cursor-pointer ${
            activeTab === "setup"
              ? "bg-[#0f4c81] text-white shadow-xs"
              : "border border-[#ded8d1] bg-white text-[#5d5854] hover:bg-[#f0efee] dark:border-[#30363d] dark:bg-[#161b22] dark:text-[#8b949e] dark:hover:bg-[#21262d]"
          }`}
        >
          <Folder className="size-3.5" />
          <span>Course Setup & Folders</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("batches")}
          className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold whitespace-nowrap transition cursor-pointer ${
            activeTab === "batches"
              ? "bg-[#0f4c81] text-white shadow-xs"
              : "border border-[#ded8d1] bg-white text-[#5d5854] hover:bg-[#f0efee] dark:border-[#30363d] dark:bg-[#161b22] dark:text-[#8b949e] dark:hover:bg-[#21262d]"
          }`}
        >
          <Layers className="size-3.5" />
          <span>Cohort Batches & Live Classes</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("tests")}
          className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold whitespace-nowrap transition cursor-pointer ${
            activeTab === "tests"
              ? "bg-[#0f4c81] text-white shadow-xs"
              : "border border-[#ded8d1] bg-white text-[#5d5854] hover:bg-[#f0efee] dark:border-[#30363d] dark:bg-[#161b22] dark:text-[#8b949e] dark:hover:bg-[#21262d]"
          }`}
        >
          <FileQuestion className="size-3.5" />
          <span>Tests, MCQs & Submissions</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("resources")}
          className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold whitespace-nowrap transition cursor-pointer ${
            activeTab === "resources"
              ? "bg-[#0f4c81] text-white shadow-xs"
              : "border border-[#ded8d1] bg-white text-[#5d5854] hover:bg-[#f0efee] dark:border-[#30363d] dark:bg-[#161b22] dark:text-[#8b949e] dark:hover:bg-[#21262d]"
          }`}
        >
          <Folder className="size-3.5" />
          <span>Resource & Media Library (R2)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("settings")}
          className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold whitespace-nowrap transition cursor-pointer ${
            activeTab === "settings"
              ? "bg-[#0f4c81] text-white shadow-xs"
              : "border border-[#ded8d1] bg-white text-[#5d5854] hover:bg-[#f0efee] dark:border-[#30363d] dark:bg-[#161b22] dark:text-[#8b949e] dark:hover:bg-[#21262d]"
          }`}
        >
          <Settings className="size-3.5" />
          <span>Faculty Profile & Payout</span>
        </button>
      </div>

      {/* TAB 1: COURSES & STUDENT PERFORMANCE */}
      {activeTab === "courses" && (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[#171717] dark:text-[#f0f6fc]">
                Authored Courses & Performance
              </h2>
              <button
                type="button"
                onClick={fetchInstructorData}
                className="flex size-7 items-center justify-center rounded-lg text-[#77716b] hover:bg-[#f0efee] hover:text-[#171717] transition dark:text-[#8b949e] dark:hover:bg-[#21262d] dark:hover:text-[#f0f6fc] cursor-pointer"
                title="Refresh courses"
              >
                <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
              </button>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-[#77716b] dark:text-[#8b949e]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search courses..."
                className="h-9 w-full rounded-xl border border-[#ded8d1] bg-white pl-8 pr-3 text-xs text-[#171717] focus:border-[#0f4c81] focus:outline-none dark:border-[#30363d] dark:bg-[#161b22] dark:text-[#f0f6fc]"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="size-8 animate-spin rounded-full border-2 border-[#0f4c81] border-t-transparent dark:border-[#58a6ff]" />
              <p className="text-xs font-semibold text-[#77716b] dark:text-[#8b949e]">
                Loading your instructor courses and learner stats...
              </p>
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-center text-xs font-semibold text-red-600 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
              {error}
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-[#ded8d1] bg-white p-12 text-center shadow-xs dark:border-[#30363d] dark:bg-[#161b22]">
              <GraduationCap className="mx-auto size-12 text-[#77716b] opacity-40 mb-3 dark:text-[#8b949e]" />
              <h3 className="text-base font-black text-[#171717] dark:text-[#f0f6fc]">
                {searchQuery ? "No matching courses" : "You have not published any courses yet"}
              </h3>
              <p className="mt-1 text-xs text-[#77716b] dark:text-[#8b949e] max-w-md mx-auto">
                {searchQuery
                  ? "Try searching for another keyword or course title."
                  : "Create clinical coursework, video modules, and accredited training programs for doctors, physiotherapists, and healthcare professionals."}
              </p>
              {!searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingCourseId(null);
                    setActiveTab("setup");
                  }}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#0f4c81] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#0c3c66] transition shadow-xs cursor-pointer"
                >
                  <Plus className="size-4" />
                  <span>Create Your First Course</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredCourses.map((course) => (
                <div
                  key={course.id}
                  className="flex flex-col gap-5 rounded-3xl border border-[#ded8d1] bg-white p-5 shadow-xs transition hover:border-[#0f4c81]/40 sm:flex-row sm:items-center sm:justify-between dark:border-[#30363d] dark:bg-[#161b22]"
                >
                  {/* Course Details */}
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="rounded-md bg-[#eef5fc] px-2 py-0.5 text-[10px] font-bold text-[#0f4c81] dark:bg-[#1f2937] dark:text-[#58a6ff]">
                        {course.category}
                      </span>
                      {course.certificate_enabled ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                          <Award className="size-3" />
                          Certificate Enabled
                        </span>
                      ) : (
                        <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                          No Certificate
                        </span>
                      )}
                      <span className="text-[10px] text-[#77716b] dark:text-[#8b949e]">
                        Created {new Date(course.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="text-base font-black text-[#171717] dark:text-[#f0f6fc] truncate">
                      {course.title}
                    </h3>

                    {/* Completion & Student Stats */}
                    <div className="flex items-center gap-4 text-xs font-semibold text-[#5d5854] dark:text-[#8b949e] flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <Users className="size-3.5 text-[#0f4c81] dark:text-[#58a6ff]" />
                        <span>
                          <strong className="text-[#171717] dark:text-[#f0f6fc]">
                            {course.total_enrolled}
                          </strong>{" "}
                          Enrolled
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="size-3.5 text-[#16804d] dark:text-emerald-400" />
                        <span>
                          <strong className="text-[#16804d] dark:text-emerald-400">
                            {course.completed_count}
                          </strong>{" "}
                          Completed ({course.completion_rate}%)
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Clock className="size-3.5 text-[#77716b] dark:text-[#8b949e]" />
                        <span>
                          <strong className="text-[#171717] dark:text-[#f0f6fc]">
                            {course.in_progress_count}
                          </strong>{" "}
                          In Progress
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Award className="size-3.5 text-amber-600 dark:text-amber-400" />
                        <span>
                          <strong className="text-amber-600 dark:text-amber-400">
                            {course.certificates_issued_count}
                          </strong>{" "}
                          Certificates
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 shrink-0 border-t border-[#f0efee] pt-3 sm:border-0 sm:pt-0 dark:border-[#21262d] flex-wrap sm:flex-nowrap">
                    {/* Edit Curriculum & Setup */}
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCourseId(course.id);
                        setActiveTab("setup");
                      }}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-[#ded8d1] bg-white px-3 py-2 text-xs font-bold text-[#171717] hover:bg-[#f0efee] transition dark:border-[#30363d] dark:bg-[#161b22] dark:text-[#f0f6fc] cursor-pointer"
                    >
                      <Folder className="size-3.5" />
                      <span>Edit Curriculum</span>
                    </button>

                    {/* View Students & Certificates Button */}
                    <button
                      type="button"
                      onClick={() => setSelectedCourseForRoster(course.id)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#0f4c81] px-4 py-2 text-xs font-bold text-white hover:bg-[#0c3c66] transition shadow-2xs cursor-pointer"
                    >
                      <Users className="size-3.5" />
                      <span>Learners & Certificates</span>
                    </button>

                    {/* View Course Link */}
                    <Link
                      href={`/learn/course/${course.id}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 rounded-xl border border-[#ded8d1] bg-white px-3 py-2 text-xs font-bold text-[#171717] hover:bg-[#f0efee] transition dark:border-[#30363d] dark:bg-[#161b22] dark:text-[#f0f6fc] dark:hover:bg-[#21262d]"
                    >
                      <span>Preview</span>
                      <ExternalLink className="size-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: COURSE SETUP & HIERARCHICAL FOLDERS */}
      {activeTab === "setup" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setActiveTab("courses");
                fetchInstructorData();
              }}
              className="text-xs font-bold text-[#0f4c81] dark:text-[#58a6ff] hover:underline cursor-pointer"
            >
              ← Back to My Courses & Learners
            </button>
          </div>

          <InstructorCourseSetupManager
            initialCourseId={editingCourseId}
            onFinished={() => {
              setActiveTab("courses");
              fetchInstructorData();
            }}
          />
        </div>
      )}

      {/* TAB 3: BATCHES & LIVE CLASS TIMINGS */}
      {activeTab === "batches" && <InstructorBatchesManager />}

      {/* TAB 4: TESTS, MCQS & SUBMISSIONS */}
      {activeTab === "tests" && <InstructorTestManager />}

      {/* TAB 5: MULTI-FORMAT RESOURCE LIBRARY (R2) */}
      {activeTab === "resources" && (
        <div className="space-y-4">
          <TeacherResourceManager isInstructor={true} />
        </div>
      )}

      {/* TAB 6: INSTRUCTOR PROFILE & PAYOUT SETTINGS */}
      {activeTab === "settings" && <InstructorSettingsManager />}

      {/* Roster & Certificates Modal */}
      <InstructorCourseRosterModal
        courseId={selectedCourseForRoster}
        isOpen={Boolean(selectedCourseForRoster)}
        onClose={() => {
          setSelectedCourseForRoster(null);
          fetchInstructorData();
        }}
      />
    </div>
  );
}
