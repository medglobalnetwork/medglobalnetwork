"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { CurriculumAccordion } from "@/modules/learn/components/CurriculumAccordion";
import { StudentNavHeader } from "@/modules/learn/components/StudentNavHeader";
import { VerificationBadge } from "@/modules/network/components/VerificationBadge";
import { Course, CourseModule } from "@/modules/learn/types";

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const courseId = params?.courseId as string;

  const [course, setCourse] = React.useState<Course | null>(null);
  const [curriculum, setCurriculum] = React.useState<CourseModule[]>([]);
  const [activeTab, setActiveTab] = React.useState<"classes" | "overview" | "dpp" | "notices">("classes");
  const [isLoading, setIsLoading] = React.useState(true);
  const [isEnrolling, setIsEnrolling] = React.useState(false);

  const fetchDetails = React.useCallback(async () => {
    if (!courseId) return;
    setIsLoading(true);
    try {
      const [cRes, curRes] = await Promise.all([
        fetch(`/api/learn/courses/${courseId}`),
        fetch(`/api/learn/courses/${courseId}/curriculum`),
      ]);

      const cData = await cRes.json();
      const curData = await curRes.json();

      if (cRes.ok && cData.course) setCourse(cData.course);
      if (curRes.ok && curData.modules) setCurriculum(curData.modules);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  React.useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const handleEnroll = async () => {
    if (!session?.user) {
      router.push("/");
      return;
    }
    if (!course) return;

    // If already enrolled, go directly to first or last lesson
    if (course.user_enrolled) {
      const firstLesson = curriculum[0]?.lessons?.[0];
      if (firstLesson) {
        router.push(`/learn/lesson/${firstLesson.id}`);
      }
      return;
    }

    setIsEnrolling(true);
    try {
      const res = await fetch(`/api/learn/courses/${course.id}/enroll`, {
        method: "POST",
      });
      if (res.ok) {
        // Enrolled! Navigate to first lesson
        const curRes = await fetch(`/api/learn/courses/${course.id}/curriculum`);
        const curData = await curRes.json();
        const firstLesson = curData?.modules?.[0]?.lessons?.[0];
        if (firstLesson) {
          router.push(`/learn/lesson/${firstLesson.id}`);
        } else {
          fetchDetails();
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsEnrolling(false);
    }
  };

  if (isLoading || !course) {
    return (
      <main className="min-h-dvh bg-[#f5f5f4] p-6">
        <div className="mx-auto max-w-5xl space-y-6 animate-pulse">
          <div className="h-64 rounded-3xl bg-white/70" />
          <div className="h-40 rounded-3xl bg-white/70" />
        </div>
      </main>
    );
  }

  const instructor = course.instructor;
  const isVerified =
    instructor?.identity_verified ||
    instructor?.education_verified ||
    instructor?.registration_verified;

  return (
    <main className="min-h-dvh bg-[#f5f5f4] dark:bg-[#0d1117] pb-36 text-[#171717] dark:text-[#f0f6fc]">
      <StudentNavHeader activeTab="explore" />
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs font-semibold text-[#77716b]">
          <button type="button" onClick={() => router.push("/learn")} className="hover:text-[#1769c2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1769c2] rounded">
            Learn
          </button>
          <span>/</span>
          <button type="button" onClick={() => router.push("/learn/courses")} className="hover:text-[#1769c2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1769c2] rounded">
            Courses
          </button>
          <span>/</span>
          <span className="text-[#171717] truncate">{course.title}</span>
        </div>

        {/* 1. HERO HEADER CARD */}
        <div className="overflow-hidden rounded-3xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-6 shadow-sm sm:p-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Left 2 Cols: Details */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#eef5fc] dark:bg-[#1c2433] px-3 py-1 text-xs font-bold text-[#1769c2] dark:text-[#58a6ff]">
                  {course.category}
                </span>
                {course.profession && (
                  <span className="rounded-full bg-[#faf9f8] dark:bg-[#21262d] border border-[#ded8d1] dark:border-[#30363d] px-2.5 py-1 text-xs font-semibold text-[#5d5854] dark:text-[#8b949e]">
                    {course.profession}
                  </span>
                )}
                {course.certificate_enabled && (
                  <span className="rounded-full bg-[#ecfdf5] dark:bg-[#0d281e] px-2.5 py-1 text-xs font-bold text-[#047857] dark:text-[#2ea043]">
                    📜 Verified Certificate
                  </span>
                )}
              </div>

              <h1 className="text-2xl font-black text-[#171717] dark:text-[#f0f6fc] sm:text-3xl text-balance">
                {course.title}
              </h1>

              {course.short_description && (
                <p className="text-xs leading-relaxed text-[#5d5854] dark:text-[#8b949e] sm:text-sm text-pretty">
                  {course.short_description}
                </p>
              )}

              {/* Instructor Credentials Bar */}
              <div className="flex items-center gap-3 border-t border-[#f5f4f3] dark:border-[#21262d] pt-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#eef5fc] dark:bg-[#1c2433] text-xs font-bold text-[#1769c2] dark:text-[#58a6ff]">
                  {instructor?.image ? (
                    <img src={instructor.image} alt={instructor.name} className="h-full w-full object-cover" />
                  ) : (
                    instructor?.name?.slice(0, 2).toUpperCase() || "DR"
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-[#171717] dark:text-[#f0f6fc]">{instructor?.name}</span>
                    {isVerified && <VerificationBadge size="sm" />}
                  </div>
                  <p className="text-[11px] text-[#77716b] dark:text-[#8b949e]">
                    {instructor?.designation || instructor?.profession || "Lead Clinical Faculty"}
                    {instructor?.organization ? ` · ${instructor.organization}` : ""}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Col: CTA Box */}
            <div className="flex flex-col justify-between rounded-2xl border border-[#eef5fc] dark:border-[#30363d] bg-gradient-to-br from-[#faf9f8] to-[#f0f7ff] dark:from-[#161b22] dark:to-[#1a2332] p-5">
              <div className="space-y-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-xl font-extrabold text-[#15803d] dark:text-[#2ea043]">
                    {course.is_free ? "Free CME" : `₹${course.price}`}
                  </span>
                  <span className="text-xs font-semibold text-[#77716b] dark:text-[#8b949e]">
                    {course.enrollment_count} enrolled
                  </span>
                </div>

                <div className="space-y-2 text-xs text-[#5d5854] dark:text-[#8b949e] border-t border-[#ded8d1] dark:border-[#30363d] pt-3">
                  <div className="flex justify-between">
                    <span>⏱ Total Duration</span>
                    <strong className="text-[#171717] dark:text-[#f0f6fc]">{course.duration_minutes} mins</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>📊 Difficulty Level</span>
                    <strong className="text-[#171717] dark:text-[#f0f6fc] capitalize">{course.level.replace("_", " ")}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>🌐 Language</span>
                    <strong className="text-[#171717] dark:text-[#f0f6fc]">{course.language}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>📑 Syllabus</span>
                    <strong className="text-[#171717] dark:text-[#f0f6fc]">{course.module_count} Modules</strong>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleEnroll}
                disabled={isEnrolling}
                className="mt-6 w-full rounded-2xl bg-[#0f4c81] dark:bg-[#1f6feb] py-3 text-xs font-bold text-white shadow-md transition hover:bg-[#0c3c66] disabled:opacity-50 cursor-pointer"
              >
                {course.user_enrolled
                  ? `Resume Course (${course.user_progress}% done) →`
                  : isEnrolling
                  ? "Enrolling..."
                  : "Enroll in Course Free 🚀"}
              </button>
            </div>
          </div>
        </div>

        {/* 2. PW CLASSROOM TABS */}
        <div className="border-b border-[#ded8d1] dark:border-[#30363d] flex gap-2 overflow-x-auto no-scrollbar">
          {[
            { id: "classes", label: "📚 All Classes & Lectures" },
            { id: "dpp", label: "⚡ DPP & Practice Quizzes" },
            { id: "overview", label: "📌 Batch Overview" },
            { id: "notices", label: "📢 Announcements & Notices" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer shrink-0 ${
                activeTab === tab.id
                  ? "border-[#0f4c81] dark:border-[#58a6ff] text-[#0f4c81] dark:text-[#58a6ff]"
                  : "border-transparent text-[#77716b] hover:text-[#171717] dark:hover:text-[#f0f6fc]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: ALL CLASSES (SYLLABUS & LECTURES) */}
        {activeTab === "classes" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-black text-[#171717] dark:text-[#f0f6fc]">
                  Batch Curriculum & Lecture Schedule
                </h2>
                <p className="text-xs text-[#77716b] dark:text-[#8b949e]">
                  High-yield video masterclasses with downloadable class slides & notes
                </p>
              </div>
              <span className="text-xs font-bold text-[#0f4c81] dark:text-[#58a6ff] bg-[#eef5fc] dark:bg-[#1c2433] px-2.5 py-1 rounded-lg">
                {curriculum.length} Chapters
              </span>
            </div>

            <CurriculumAccordion
              modules={curriculum}
              isEnrolled={course.user_enrolled}
              onSelectLesson={(lesson) => router.push(`/learn/lesson/${lesson.id}`)}
            />
          </div>
        )}

        {/* TAB 2: DPP (DAILY PRACTICE PROBLEMS) & QUIZZES */}
        {activeTab === "dpp" && (
          <div className="space-y-4">
            <div>
              <h2 className="text-base sm:text-lg font-black text-[#171717] dark:text-[#f0f6fc]">
                Daily Practice Problems (DPP) & Chapter Quizzes
              </h2>
              <p className="text-xs text-[#77716b] dark:text-[#8b949e]">
                Reinforce high-yield clinical concepts right after every video lecture
              </p>
            </div>

            {curriculum.flatMap(m => m.lessons || []).filter(l => l.lesson_type === "quiz").length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {curriculum.flatMap(m => m.lessons || []).filter(l => l.lesson_type === "quiz").map((dpp, idx) => (
                  <div
                    key={dpp.id}
                    onClick={() => router.push(`/learn/lesson/${dpp.id}`)}
                    className="p-4 rounded-2xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] hover:border-[#0f4c81] cursor-pointer transition shadow-2xs space-y-2"
                  >
                    <div className="flex items-center justify-between text-[11px] font-bold text-[#0f4c81] dark:text-[#58a6ff]">
                      <span>DPP #{idx + 1}</span>
                      <span className="bg-amber-50 dark:bg-amber-950/40 text-amber-700 px-2 py-0.5 rounded">
                        Interactive Quiz
                      </span>
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-[#171717] dark:text-[#f0f6fc]">
                      {dpp.title}
                    </h4>
                    <div className="text-[11px] text-[#77716b] flex items-center justify-between pt-1">
                      <span>⏱ 15-20 Mins</span>
                      <span className="font-bold text-[#0f4c81]">Attempt DPP →</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center rounded-2xl border border-dashed border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] text-[#77716b]">
                <p className="text-xs font-semibold">DPPs are assigned automatically after watching each lecture.</p>
                <button
                  type="button"
                  onClick={() => setActiveTab("classes")}
                  className="mt-3 text-xs font-bold text-[#0f4c81] dark:text-[#58a6ff] hover:underline"
                >
                  View All Lectures →
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: BATCH OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {course.description && (
              <div className="rounded-3xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-6 shadow-xs sm:p-8 space-y-4">
                <h3 className="text-base font-bold text-[#171717] dark:text-[#f0f6fc]">About this Batch</h3>
                <div className="prose prose-sm max-w-none text-xs leading-relaxed text-[#5d5854] dark:text-[#8b949e] whitespace-pre-line sm:text-sm">
                  {course.description}
                </div>
              </div>
            )}

            <div className="rounded-3xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-6 space-y-3">
              <h3 className="text-sm font-bold text-[#171717] dark:text-[#f0f6fc]">What's Included in this Batch:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#5d5854] dark:text-[#8b949e]">
                <div className="p-3 rounded-xl bg-[#faf9f8] dark:bg-[#21262d] flex items-center gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>Full Syllabus Video Coverage with Unlimited Replays</span>
                </div>
                <div className="p-3 rounded-xl bg-[#faf9f8] dark:bg-[#21262d] flex items-center gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>Daily Practice Problems (DPP) with Video Explanations</span>
                </div>
                <div className="p-3 rounded-xl bg-[#faf9f8] dark:bg-[#21262d] flex items-center gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>Downloadable Class Handwritten Slides in PDF Format</span>
                </div>
                <div className="p-3 rounded-xl bg-[#faf9f8] dark:bg-[#21262d] flex items-center gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>MGN Clinical AI Doubt Solving Support 24x7</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: NOTICES */}
        {activeTab === "notices" && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-6 space-y-4">
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  Live Batch Updates
                </span>
              </div>
              <div className="space-y-3 border-l-2 border-[#0f4c81] pl-4">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-[#171717] dark:text-[#f0f6fc]">
                    Welcome to the Batch Orientation Session!
                  </h4>
                  <p className="text-xs text-[#77716b] dark:text-[#8b949e] mt-1">
                    Please ensure you have completed your profile and downloaded the weekly study planner from the Classroom tab.
                  </p>
                  <span className="text-[10px] text-[#a8a29e] block mt-1">Posted by Batch Coordinator</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
