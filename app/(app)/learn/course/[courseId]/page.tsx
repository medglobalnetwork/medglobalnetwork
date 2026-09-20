"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { CurriculumAccordion } from "@/modules/learn/components/CurriculumAccordion";
import { VerificationBadge } from "@/modules/network/components/VerificationBadge";
import { Course, CourseModule } from "@/modules/learn/types";

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const courseId = params?.courseId as string;

  const [course, setCourse] = React.useState<Course | null>(null);
  const [curriculum, setCurriculum] = React.useState<CourseModule[]>([]);
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
      <main className="min-h-screen bg-[#f5f5f4] p-6">
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
    <main className="min-h-screen bg-[#f5f5f4] pb-36 text-[#171717]">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs font-semibold text-[#77716b]">
          <button type="button" onClick={() => router.push("/learn")} className="hover:text-[#1769c2]">
            Learn
          </button>
          <span>/</span>
          <button type="button" onClick={() => router.push("/learn/courses")} className="hover:text-[#1769c2]">
            Courses
          </button>
          <span>/</span>
          <span className="text-[#171717] truncate">{course.title}</span>
        </div>

        {/* 1. HERO HEADER CARD */}
        <div className="overflow-hidden rounded-3xl border border-[#ded8d1] bg-white p-6 shadow-sm sm:p-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Left 2 Cols: Details */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#eef5fc] px-3 py-1 text-xs font-bold text-[#1769c2]">
                  {course.category}
                </span>
                {course.profession && (
                  <span className="rounded-full bg-[#faf9f8] border border-[#ded8d1] px-2.5 py-1 text-xs font-semibold text-[#5d5854]">
                    {course.profession}
                  </span>
                )}
                {course.certificate_enabled && (
                  <span className="rounded-full bg-[#ecfdf5] px-2.5 py-1 text-xs font-bold text-[#047857]">
                    📜 Verified Certificate
                  </span>
                )}
              </div>

              <h1 className="text-2xl font-black tracking-tight text-[#171717] sm:text-3xl">
                {course.title}
              </h1>

              {course.short_description && (
                <p className="text-xs leading-relaxed text-[#5d5854] sm:text-sm">
                  {course.short_description}
                </p>
              )}

              {/* Instructor Credentials Bar */}
              <div className="flex items-center gap-3 border-t border-[#f5f4f3] pt-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#eef5fc] text-xs font-bold text-[#1769c2]">
                  {instructor?.image ? (
                    <img src={instructor.image} alt={instructor.name} className="h-full w-full object-cover" />
                  ) : (
                    instructor?.name?.slice(0, 2).toUpperCase() || "DR"
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-[#171717]">{instructor?.name}</span>
                    {isVerified && <VerificationBadge size="sm" />}
                  </div>
                  <p className="text-[11px] text-[#77716b]">
                    {instructor?.designation || instructor?.profession || "Lead Clinical Faculty"}
                    {instructor?.organization ? ` · ${instructor.organization}` : ""}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Col: CTA Box */}
            <div className="flex flex-col justify-between rounded-2xl border border-[#eef5fc] bg-gradient-to-br from-[#faf9f8] to-[#f0f7ff] p-5">
              <div className="space-y-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-xl font-extrabold text-[#15803d]">
                    {course.is_free ? "Free CME" : `₹${course.price}`}
                  </span>
                  <span className="text-xs font-semibold text-[#77716b]">
                    {course.enrollment_count} enrolled
                  </span>
                </div>

                <div className="space-y-2 text-xs text-[#5d5854] border-t border-[#ded8d1] pt-3">
                  <div className="flex justify-between">
                    <span>⏱ Total Duration</span>
                    <strong className="text-[#171717]">{course.duration_minutes} mins</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>📊 Difficulty Level</span>
                    <strong className="text-[#171717] capitalize">{course.level.replace("_", " ")}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>🌐 Language</span>
                    <strong className="text-[#171717]">{course.language}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>📑 Syllabus</span>
                    <strong className="text-[#171717]">{course.module_count} Modules</strong>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleEnroll}
                disabled={isEnrolling}
                className="mt-6 w-full rounded-2xl bg-[#1769c2] py-3 text-xs font-bold text-white shadow-md transition hover:bg-[#12569f] disabled:opacity-50"
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

        {/* 2. SYLLABUS & CURRICULUM */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#171717]">Course Syllabus</h2>
              <p className="text-xs text-[#77716b]">
                Structured clinical modules, video lectures, and assessments
              </p>
            </div>
            <span className="text-xs font-semibold text-[#77716b]">
              {curriculum.length} Modules
            </span>
          </div>

          <CurriculumAccordion
            modules={curriculum}
            isEnrolled={course.user_enrolled}
            onSelectLesson={(lesson) => router.push(`/learn/lesson/${lesson.id}`)}
          />
        </div>

        {/* 3. SYLLABUS DETAILS & REQUIREMENTS */}
        {course.description && (
          <div className="rounded-3xl border border-[#ded8d1] bg-white p-6 shadow-xs sm:p-8 space-y-4">
            <h3 className="text-base font-bold text-[#171717]">About this Clinical Course</h3>
            <div className="prose prose-sm max-w-none text-xs leading-relaxed text-[#5d5854] whitespace-pre-line sm:text-sm">
              {course.description}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
