"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { LessonPlayer } from "@/modules/learn/components/LessonPlayer";
import { CurriculumAccordion } from "@/modules/learn/components/CurriculumAccordion";
import { QuizEngine } from "@/modules/learn/components/QuizEngine";
import { CourseLesson, CourseModule, Quiz } from "@/modules/learn/types";
import { ArrowLeft, Sparkles, BookOpen, ExternalLink, ShieldCheck } from "lucide-react";

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
      const res = await fetch(`/api/learn/lessons/${lessonId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.lesson) {
          setCurrentLesson(data.lesson);
          setCourseId(data.courseId);
          setCourseTitle(data.courseTitle);
          setCurriculum(data.curriculum || []);

          if (data.lesson.lesson_type === "quiz") {
            const qRes = await fetch(`/api/learn/quizzes/${data.lesson.id}`);
            if (qRes.ok) {
              const qData = await qRes.json();
              if (qData.quiz) setActiveQuiz(qData.quiz);
            }
          }
          return;
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

  const handleOpenAskAI = () => {
    if (typeof window !== "undefined" && currentLesson) {
      window.dispatchEvent(
        new CustomEvent("open-mgn-ask-ai", {
          detail: {
            courseId,
            courseTitle,
            lessonId: currentLesson.id,
            lessonTitle: currentLesson.title,
            lessonContent: currentLesson.content || currentLesson.description || undefined,
          },
        })
      );
    }
  };

  if (isLoading || !currentLesson) {
    return (
      <main className="min-h-dvh bg-[#faf9f8] dark:bg-[#0d1117] p-6">
        <div className="mx-auto max-w-7xl space-y-6 animate-pulse">
          <div className="h-12 rounded-2xl bg-[#e8e6e3] dark:bg-[#21262d]" />
          <div className="aspect-video w-full rounded-3xl bg-[#e8e6e3] dark:bg-[#21262d]" />
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-dvh bg-[#faf9f8] dark:bg-[#0d1117] text-[#171717] dark:text-[#f0f6fc]">
      {/* 1. IMMERSIVE TOP NAVBAR WITH BREADCRUMB */}
      <header className="sticky top-0 z-40 border-b border-[#ded8d1] dark:border-[#30363d] bg-white/95 dark:bg-[#161b22]/95 px-4 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href={`/learn/course/${courseId}`}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#ded8d1] dark:border-[#30363d] bg-[#f8f7f6] dark:bg-[#21262d] px-3 py-1.5 text-xs font-bold text-[#0f4c81] dark:text-[#58a6ff] hover:bg-[#eef5fc] transition shrink-0"
              title="Return to Course Curriculum"
            >
              <ArrowLeft className="size-3.5" />
              <span className="hidden sm:inline">Course Curriculum</span>
            </Link>

            <div className="min-w-0">
              <p className="truncate text-[11px] font-semibold text-[#77716b] dark:text-[#8b949e]">
                {courseTitle}
              </p>
              <h1 className="truncate text-xs sm:text-sm font-bold text-[#171717] dark:text-[#f0f6fc]">
                {currentLesson.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleOpenAskAI}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#0f4c81] to-[#1769c2] px-3 py-1.5 text-xs font-bold text-white hover:brightness-105 transition shadow-xs cursor-pointer"
            >
              <Sparkles className="size-3.5 text-amber-300" />
              <span className="hidden xs:inline">Ask AI</span>
            </button>

            <Link
              href={`/learn/course/${courseId}`}
              className="rounded-xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#21262d] px-3 py-1.5 text-xs font-semibold text-[#5d5854] dark:text-[#8b949e] hover:bg-[#faf9f8]"
            >
              Overview
            </Link>
          </div>
        </div>
      </header>

      {/* Completion Banner */}
      {completedCertCode && (
        <div className="bg-emerald-50 dark:bg-emerald-950/60 border-b border-emerald-200 dark:border-emerald-800 px-4 py-3 text-center text-xs text-emerald-800 dark:text-emerald-300 font-medium">
          <span>🎉 Course Completed! Your Accredited Certificate is ready. </span>
          <a
            href={`/verify/certificate/${completedCertCode}`}
            target="_blank"
            rel="noreferrer"
            className="font-bold underline ml-1 inline-flex items-center gap-1"
          >
            <span>View Verified Certificate</span>
            <ExternalLink className="size-3" />
          </a>
        </div>
      )}

      {/* 2. MAIN PLAYER GRID (Player 70% + Sidebar 30%) */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
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
                courseTitle={courseTitle}
                courseId={courseId}
                onCompleteLesson={loadLessonData}
                onNextLesson={handleNextLesson}
                onPrevLesson={handlePrevLesson}
                hasNext={Boolean(nextLesson)}
                hasPrev={Boolean(prevLesson)}
              />
            )}
          </div>

          {/* Curriculum Sidebar */}
          <aside className="w-full shrink-0 space-y-4 lg:w-80">
            <div className="rounded-3xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-4 shadow-xs">
              <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#171717] dark:text-[#f0f6fc]">
                  Course Curriculum
                </h3>
                <span className="text-[10px] text-[#77716b] dark:text-[#8b949e]">
                  {allLessons.length} lessons
                </span>
              </div>
              <CurriculumAccordion
                modules={curriculum}
                currentLessonId={currentLesson.id}
                isEnrolled={true}
                onSelectLesson={(l) => router.push(`/learn/lesson/${l.id}`)}
              />
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
