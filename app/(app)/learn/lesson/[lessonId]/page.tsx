"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { LessonPlayer } from "@/modules/learn/components/LessonPlayer";
import { CurriculumAccordion } from "@/modules/learn/components/CurriculumAccordion";
import { QuizEngine } from "@/modules/learn/components/QuizEngine";
import { CourseLesson, CourseModule, Quiz } from "@/modules/learn/types";

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const lessonId = params?.lessonId as string;

  const [currentLesson, setCurrentLesson] = React.useState<CourseLesson | null>(null);
  const [curriculum, setCurriculum] = React.useState<CourseModule[]>([]);
  const [courseTitle, setCourseTitle] = React.useState<string>("");
  const [courseId, setCourseId] = React.useState<string>("");
  const [activeQuiz, setActiveQuiz] = React.useState<Quiz | null>(null);
  const [completedCertCode, setCompletedCertCode] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (!isPending && !session) router.replace("/");
  }, [isPending, router, session]);

  // Load lesson & course curriculum
  const loadLessonData = React.useCallback(async () => {
    if (!lessonId) return;
    setIsLoading(true);
    try {
      // Find lesson by fetching curriculum or course
      // Let's get lesson details via API or from course curriculum
      const res = await fetch(`/api/learn/courses`);
      // We can also directly query via curriculum
      // Let's find course from curriculum endpoint or lesson progress
      // We have lessonId, let's fetch course curriculum for the lesson
      const allRes = await fetch(`/api/learn/courses?pageSize=50`);
      const allData = await allRes.json();
      
      let foundCourseId: string | null = null;
      let foundLesson: CourseLesson | null = null;
      let foundCurriculum: CourseModule[] = [];

      for (const c of allData.courses || []) {
        const curRes = await fetch(`/api/learn/courses/${c.id}/curriculum`);
        const curData = await curRes.json();
        const mods: CourseModule[] = curData.modules || [];

        for (const m of mods) {
          const l = m.lessons?.find((item) => item.id === lessonId);
          if (l) {
            foundLesson = l;
            foundCourseId = c.id;
            setCourseTitle(c.title);
            foundCurriculum = mods;
            break;
          }
        }
        if (foundLesson) break;
      }

      if (foundLesson && foundCourseId) {
        setCurrentLesson(foundLesson);
        setCourseId(foundCourseId);
        setCurriculum(foundCurriculum);

        // Check if lesson has an attached quiz
        if (foundLesson.lesson_type === "quiz") {
          const qRes = await fetch(`/api/learn/quizzes/${foundLesson.id}`);
          const qData = await qRes.json();
          if (qRes.ok && qData.quiz) setActiveQuiz(qData.quiz);
        }
      }
    } catch (err) {
      console.error("Failed to load lesson:", err);
    } finally {
      setIsLoading(false);
    }
  }, [lessonId]);

  React.useEffect(() => {
    loadLessonData();
  }, [loadLessonData]);

  // Find flattened lesson list to determine previous and next lessons
  const allLessons: CourseLesson[] = React.useMemo(() => {
    const list: CourseLesson[] = [];
    for (const m of curriculum) {
      if (m.lessons) list.push(...m.lessons);
    }
    return list;
  }, [curriculum]);

  const currentIdx = allLessons.findIndex((l) => l.id === lessonId);
  const prevLesson = currentIdx > 0 ? allLessons[currentIdx - 1] : undefined;
  const nextLesson = currentIdx >= 0 && currentIdx < allLessons.length - 1 ? allLessons[currentIdx + 1] : undefined;

  const handleNextLesson = () => {
    if (nextLesson) {
      router.push(`/learn/lesson/${nextLesson.id}`);
    }
  };

  const handlePrevLesson = () => {
    if (prevLesson) {
      router.push(`/learn/lesson/${prevLesson.id}`);
    }
  };

  if (isLoading || !currentLesson) {
    return (
      <main className="min-h-dvh bg-[#f5f5f4] p-6">
        <div className="mx-auto max-w-7xl space-y-6 animate-pulse">
          <div className="h-12 rounded-2xl bg-white/70" />
          <div className="aspect-video w-full rounded-3xl bg-white/70" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-[#f5f5f4] pb-36 text-[#171717]">
      {/* 1. TOP PLAYER NAVBAR */}
      <div className="sticky top-0 z-40 border-b border-[#ded8d1] bg-white/95 px-4 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => router.push(`/learn/course/${courseId}`)}
              className="flex size-8 shrink-0 items-center justify-center rounded-xl border border-[#ded8d1] hover:bg-[#faf9f8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1769c2]"
            >
              ←
            </button>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-[#77716b]">{courseTitle}</p>
              <h1 className="truncate text-sm font-bold text-[#171717]">{currentLesson.title}</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => router.push(`/learn/course/${courseId}`)}
              className="rounded-xl border border-[#ded8d1] bg-white px-3 py-1.5 text-xs font-semibold text-[#5d5854] hover:bg-[#faf9f8]"
            >
              Course Overview
            </button>
          </div>
        </div>
      </div>

      {/* Completion Banner */}
      {completedCertCode && (
        <div className="bg-[#f0fdf4] border-b border-[#bbf7d0] px-4 py-3 text-center text-xs text-[#15803d]">
          <span>🎉 Course Completed! Your Accredited Certificate is ready. </span>
          <a
            href={`/verify/certificate/${completedCertCode}`}
            target="_blank"
            rel="noreferrer"
            className="font-bold underline"
          >
            View Verified Certificate →
          </a>
        </div>
      )}

      {/* 2. MAIN PLAYER GRID (Player 70% + Sidebar 30%) */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
          {/* Main Viewer Area */}
          <div className="w-full min-w-0 flex-1">
            {currentLesson.lesson_type === "quiz" && activeQuiz ? (
              <QuizEngine
                quiz={activeQuiz}
                onQuizFinished={(attempt, isComplete, code) => {
                  if (isComplete && code) setCompletedCertCode(code);
                }}
              />
            ) : (
              <LessonPlayer
                lesson={currentLesson}
                onCompleteLesson={loadLessonData}
                onNextLesson={handleNextLesson}
                onPrevLesson={handlePrevLesson}
                hasNext={Boolean(nextLesson)}
                hasPrev={Boolean(prevLesson)}
              />
            )}
          </div>

          {/* Curriculum Sidebar */}
          <aside className="w-full shrink-0 space-y-4 lg:w-84">
            <div className="rounded-2xl border border-[#ded8d1] bg-white p-4 shadow-2xs">
              <h3 className="text-xs font-bold uppercase text-[#171717] mb-3">
                Course Syllabus
              </h3>
              <CurriculumAccordion
                modules={curriculum}
                currentLessonId={currentLesson.id}
                isEnrolled={true}
                onSelectLesson={(l) => router.push(`/learn/lesson/${l.id}`)}
              />
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
