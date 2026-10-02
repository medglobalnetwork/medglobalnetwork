"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Award,
  Bookmark,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileQuestion,
  Filter,
  Flame,
  HelpCircle,
  Play,
  RotateCcw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Target,
  Timer,
  XCircle,
  Brain,
  FileText,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { StudentNavHeader } from "@/modules/learn/components/StudentNavHeader";
import {
  PracticeQuestion,
  PracticeAttempt,
  WeakTopicRecord,
  QuestionDifficulty,
} from "@/modules/learn/types";

type PracticeTab = "mcq" | "topic" | "weak_areas" | "mock_tests" | "attempts" | "saved";

export default function PracticeHubPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, isPending } = authClient.useSession();

  const [activeTab, setActiveTab] = React.useState<PracticeTab>("mcq");

  // Practice Setup State
  const [selectedSubject, setSelectedSubject] = React.useState<string>("Anatomy");
  const [selectedTopic, setSelectedTopic] = React.useState<string>("All");
  const [selectedDifficulty, setSelectedDifficulty] = React.useState<QuestionDifficulty>("medium");
  const [questionCount, setQuestionCount] = React.useState<number>(10);
  const [timeLimitMinutes, setTimeLimitMinutes] = React.useState<number>(15);

  // Active Test Runner State
  const [isTestActive, setIsTestActive] = React.useState(false);
  const [activeQuestions, setActiveQuestions] = React.useState<PracticeQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0);
  const [userAnswers, setUserAnswers] = React.useState<
    Map<string, { selectedOptionIds: string[]; isMarkedForReview: boolean }>
  >(new Map());
  const [secondsRemaining, setSecondsRemaining] = React.useState(0);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Result State
  const [completedResult, setCompletedResult] = React.useState<PracticeAttempt | null>(null);
  const [isReviewMode, setIsReviewMode] = React.useState(false);

  // History & Weak topics data
  const [weakTopicsList, setWeakTopicsList] = React.useState<WeakTopicRecord[]>([]);
  const [previousAttempts, setPreviousAttempts] = React.useState<PracticeAttempt[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  // Synchronize tab from URL params if present
  React.useEffect(() => {
    const tabParam = searchParams.get("tab") as PracticeTab;
    if (tabParam && ["mcq", "topic", "weak_areas", "mock_tests", "attempts", "saved"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
    const subjParam = searchParams.get("subject");
    if (subjParam) setSelectedSubject(subjParam);
    const topParam = searchParams.get("topic");
    if (topParam) setSelectedTopic(topParam);
  }, [searchParams]);

  React.useEffect(() => {
    if (!isPending && !session) router.replace("/");
  }, [isPending, router, session]);

  // Load Weak Topics & Attempts
  const loadData = React.useCallback(async () => {
    if (!session?.user) return;
    setIsLoading(true);
    try {
      const [weakRes, attRes] = await Promise.all([
        fetch("/api/learn/practice/weak-areas"),
        fetch("/api/learn/practice/attempts"),
      ]);

      if (weakRes.ok) {
        const d = await weakRes.json();
        setWeakTopicsList(d.weakTopics || []);
      }
      if (attRes.ok) {
        const d = await attRes.json();
        setPreviousAttempts(d.attempts || []);
      }
    } catch (err) {
      console.error("Failed to load practice data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [session?.user]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  // Timer Countdown Effect during Test
  React.useEffect(() => {
    if (!isTestActive || secondsRemaining <= 0) return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isTestActive, secondsRemaining]);

  // Start a new Practice Test
  const handleStartTest = async () => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams({
        subject: selectedSubject,
        topic: selectedTopic !== "All" ? selectedTopic : "",
        difficulty: selectedDifficulty !== "all" ? selectedDifficulty : "",
        limit: String(questionCount),
      });

      const res = await fetch(`/api/learn/practice/mcq?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.questions) && data.questions.length > 0) {
          setActiveQuestions(data.questions);
          setUserAnswers(new Map());
          setCurrentQuestionIndex(0);
          setSecondsRemaining(timeLimitMinutes * 60);
          setCompletedResult(null);
          setIsReviewMode(false);
          setIsTestActive(true);
        } else {
          alert("No questions found for the selected criteria. Please broaden your selection.");
        }
      }
    } catch (err) {
      console.error("Failed to start test:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Option selection
  const handleSelectOption = (questionId: string, optionId: string, isMultiple = false) => {
    const current = userAnswers.get(questionId) || { selectedOptionIds: [], isMarkedForReview: false };
    let newSelected: string[];

    if (isMultiple) {
      newSelected = current.selectedOptionIds.includes(optionId)
        ? current.selectedOptionIds.filter((id) => id !== optionId)
        : [...current.selectedOptionIds, optionId];
    } else {
      newSelected = [optionId];
    }

    const nextMap = new Map(userAnswers);
    nextMap.set(questionId, {
      ...current,
      selectedOptionIds: newSelected,
    });
    setUserAnswers(nextMap);
  };

  // Toggle Mark for Review
  const handleToggleReview = (questionId: string) => {
    const current = userAnswers.get(questionId) || { selectedOptionIds: [], isMarkedForReview: false };
    const nextMap = new Map(userAnswers);
    nextMap.set(questionId, {
      ...current,
      isMarkedForReview: !current.isMarkedForReview,
    });
    setUserAnswers(nextMap);
  };

  // Submit Active Test
  const handleSubmitTest = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const answersPayload = activeQuestions.map((q) => {
        const ans = userAnswers.get(q.id);
        return {
          question_id: q.id,
          selected_option_ids: ans?.selectedOptionIds || [],
          is_marked_for_review: ans?.isMarkedForReview || false,
        };
      });

      const totalTimeSpent = Math.max(timeLimitMinutes * 60 - secondsRemaining, 1);

      const res = await fetch("/api/learn/practice/mcq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "practice",
          subject: selectedSubject,
          topic: selectedTopic !== "All" ? selectedTopic : undefined,
          difficulty: selectedDifficulty,
          time_taken_seconds: totalTimeSpent,
          time_limit_minutes: timeLimitMinutes,
          answers: answersPayload,
        }),
      });

      if (res.ok) {
        const result: PracticeAttempt = await res.json();
        setCompletedResult(result);
        setIsTestActive(false);
        loadData(); // Refresh weak topics and history
      }
    } catch (err) {
      console.error("Failed to submit test:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format Timer
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // ─────────────────────────────────────────────
  // RENDER: LIVE TEST RUNNER VIEW
  // ─────────────────────────────────────────────
  if (isTestActive && activeQuestions.length > 0) {
    const curQ = activeQuestions[currentQuestionIndex];
    const curAnswer = userAnswers.get(curQ.id);

    return (
      <div className="min-h-screen bg-[#faf9f8] dark:bg-[#0d1117] text-[#171717] dark:text-[#f0f6fc] pb-24">
        {/* Test Header */}
        <div className="bg-white dark:bg-[#161b22] border-b border-[#e8e6e3] dark:border-[#30363d] sticky top-0 z-30 px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-[#0f4c81] dark:text-[#58a6ff]">
                {curQ.subject} → {curQ.topic}
              </span>
              <span className="hidden sm:inline text-xs text-[#77716b] dark:text-[#8b949e]">
                Question {currentQuestionIndex + 1} of {activeQuestions.length}
              </span>
            </div>

            {/* Timer & Submit */}
            <div className="flex items-center gap-3">
              <div
                className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-mono font-bold ${
                  secondsRemaining < 120
                    ? "bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 animate-pulse"
                    : "bg-[#f5f4f2] dark:bg-[#21262d] text-[#171717] dark:text-[#f0f6fc]"
                }`}
              >
                <Timer className="size-3.5" />
                <span>{formatTime(secondsRemaining)}</span>
              </div>

              <button
                type="button"
                onClick={handleSubmitTest}
                disabled={isSubmitting}
                className="px-4 py-1.5 bg-[#16804d] hover:bg-[#136a40] text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
              >
                {isSubmitting ? "Submitting..." : "Submit Test"}
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Question Area */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white dark:bg-[#161b22] border border-[#e8e6e3] dark:border-[#30363d] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
              {/* Question Meta & Tag */}
              <div className="flex items-center justify-between border-b border-[#f0efee] dark:border-[#21262d] pb-4">
                <div className="flex items-center gap-2">
                  <span className="size-7 rounded-lg bg-[#0f4c81] text-white flex items-center justify-center text-xs font-bold">
                    Q{currentQuestionIndex + 1}
                  </span>
                  <span className="text-[11px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-[#f0efee] dark:bg-[#21262d] text-[#5d5854] dark:text-[#8b949e]">
                    {curQ.difficulty} difficulty
                  </span>
                  {curQ.question_type === "clinical_scenario" && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                      Clinical Scenario
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleToggleReview(curQ.id)}
                  className={`flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-xl transition cursor-pointer ${
                    curAnswer?.isMarkedForReview
                      ? "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300"
                      : "text-[#77716b] hover:bg-[#f5f4f2] dark:hover:bg-[#21262d]"
                  }`}
                >
                  <Bookmark className="size-3.5" />
                  <span>{curAnswer?.isMarkedForReview ? "Marked for Review" : "Mark for Review"}</span>
                </button>
              </div>

              {/* Case Vignette if present */}
              {curQ.case_vignette && (
                <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 text-xs text-[#171717] dark:text-[#f0f6fc] leading-relaxed">
                  <span className="font-bold text-amber-800 dark:text-amber-300 block mb-1">
                    Clinical Vignette:
                  </span>
                  {curQ.case_vignette}
                </div>
              )}

              {/* Question Text */}
              <h2 className="text-base sm:text-lg font-bold text-[#171717] dark:text-[#f0f6fc] leading-relaxed">
                {curQ.question_text}
              </h2>

              {/* Options List */}
              <div className="space-y-3 pt-2">
                {curQ.options.map((opt, oIdx) => {
                  const isSelected = curAnswer?.selectedOptionIds.includes(opt.id);
                  const optionLetters = ["A", "B", "C", "D", "E"];

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() =>
                        handleSelectOption(
                          curQ.id,
                          opt.id,
                          curQ.question_type === "multiple"
                        )
                      }
                      className={`w-full flex items-start gap-3 p-4 rounded-2xl border text-left transition cursor-pointer ${
                        isSelected
                          ? "border-[#0f4c81] dark:border-[#58a6ff] bg-blue-50/60 dark:bg-blue-950/40 shadow-xs"
                          : "border-[#e8e6e3] dark:border-[#30363d] hover:bg-[#f8f7f6] dark:hover:bg-[#1c202a]"
                      }`}
                    >
                      <span
                        className={`size-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                          isSelected
                            ? "bg-[#0f4c81] text-white"
                            : "bg-[#f0efee] dark:bg-[#21262d] text-[#5d5854] dark:text-[#8b949e]"
                        }`}
                      >
                        {optionLetters[oIdx] || oIdx + 1}
                      </span>
                      <span className="text-xs sm:text-sm text-[#171717] dark:text-[#f0f6fc] font-medium leading-relaxed">
                        {opt.option_text}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Navigation buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-[#f0efee] dark:border-[#21262d]">
                <button
                  type="button"
                  onClick={() => setCurrentQuestionIndex((prev) => Math.max(prev - 1, 0))}
                  disabled={currentQuestionIndex === 0}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#f5f4f2] dark:bg-[#21262d] text-[#171717] dark:text-[#f0f6fc] disabled:opacity-40 transition cursor-pointer"
                >
                  <ChevronLeft className="size-4" /> Previous
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setCurrentQuestionIndex((prev) =>
                      Math.min(prev + 1, activeQuestions.length - 1)
                    )
                  }
                  disabled={currentQuestionIndex === activeQuestions.length - 1}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#0f4c81] text-white hover:bg-[#0d3f6c] disabled:opacity-40 transition cursor-pointer"
                >
                  Next <ChevronRight className="size-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Question Navigation Palette (Sidebar) */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-[#161b22] border border-[#e8e6e3] dark:border-[#30363d] rounded-3xl p-5 space-y-4">
              <h3 className="text-xs font-extrabold uppercase text-[#77716b] dark:text-[#8b949e]">
                Question Palette
              </h3>

              <div className="grid grid-cols-5 gap-2">
                {activeQuestions.map((q, idx) => {
                  const ans = userAnswers.get(q.id);
                  const isAnswered = ans && ans.selectedOptionIds.length > 0;
                  const isMarked = ans?.isMarkedForReview;
                  const isCurrent = idx === currentQuestionIndex;

                  let colorClass = "bg-[#f5f4f2] dark:bg-[#21262d] text-[#5d5854] dark:text-[#8b949e]";
                  if (isMarked) colorClass = "bg-amber-400 text-amber-950 font-bold";
                  else if (isAnswered) colorClass = "bg-[#16804d] text-white font-bold";

                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => setCurrentQuestionIndex(idx)}
                      className={`size-9 rounded-xl text-xs flex items-center justify-center transition cursor-pointer relative ${colorClass} ${
                        isCurrent ? "ring-2 ring-[#0f4c81] dark:ring-[#58a6ff]" : ""
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="text-[10px] space-y-1.5 pt-3 border-t border-[#f0efee] dark:border-[#21262d] text-[#77716b] dark:text-[#8b949e]">
                <div className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full bg-[#16804d]" /> Answered
                </div>
                <div className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full bg-amber-400" /> Marked for review
                </div>
                <div className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full bg-[#f0efee] dark:bg-[#21262d]" /> Unanswered
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // RENDER: RESULT & DETAILED BREAKDOWN VIEW
  // ─────────────────────────────────────────────
  if (completedResult) {
    return (
      <div className="min-h-screen bg-[#faf9f8] dark:bg-[#0d1117] text-[#171717] dark:text-[#f0f6fc] pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 space-y-6">
          {/* Result Card */}
          <div className="bg-white dark:bg-[#161b22] border border-[#e8e6e3] dark:border-[#30363d] rounded-3xl p-6 sm:p-8 shadow-sm text-center space-y-6">
            <div className="size-16 rounded-3xl bg-blue-50 dark:bg-blue-950 text-[#0f4c81] dark:text-[#58a6ff] flex items-center justify-center mx-auto">
              <Award className="size-8" />
            </div>

            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171717] dark:text-[#f0f6fc]">
                Practice Attempt Completed!
              </h1>
              <p className="text-xs text-[#77716b] dark:text-[#8b949e]">
                {completedResult.subject} • {completedResult.total_questions} Questions
              </p>
            </div>

            {/* Score Ring / Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl mx-auto pt-2">
              <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40">
                <span className="text-2xl font-extrabold text-[#0f4c81] dark:text-[#58a6ff]">
                  {completedResult.percentage}%
                </span>
                <p className="text-[11px] text-[#77716b] dark:text-[#8b949e] font-semibold mt-0.5">Accuracy</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40">
                <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  {completedResult.correct_count}
                </span>
                <p className="text-[11px] text-[#77716b] dark:text-[#8b949e] font-semibold mt-0.5">Correct</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/40">
                <span className="text-2xl font-extrabold text-rose-600 dark:text-rose-400">
                  {completedResult.incorrect_count}
                </span>
                <p className="text-[11px] text-[#77716b] dark:text-[#8b949e] font-semibold mt-0.5">Incorrect</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#f5f4f2] dark:bg-[#21262d] border border-[#e8e6e3] dark:border-[#30363d]">
                <span className="text-2xl font-extrabold text-[#5d5854] dark:text-[#8b949e]">
                  {completedResult.skipped_count}
                </span>
                <p className="text-[11px] text-[#77716b] dark:text-[#8b949e] font-semibold mt-0.5">Skipped</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCompletedResult(null)}
                className="px-5 py-2.5 rounded-xl bg-[#0f4c81] hover:bg-[#0d3f6c] text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                Start Another Session
              </button>
              <Link
                href="/learn/practice?tab=weak_areas"
                onClick={() => setCompletedResult(null)}
                className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#0f4c81] text-xs font-bold transition shadow-xs"
              >
                Practice Weak Areas
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // RENDER: PRACTICE DASHBOARD & SETUP
  // ─────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#faf9f8] dark:bg-[#0d1117] text-[#171717] dark:text-[#f0f6fc] pb-24">
      <StudentNavHeader activeTab="practice" />
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
                MCQ Practice & Assessment Engine
              </h1>
            </div>
            <p className="text-xs text-[#77716b] dark:text-[#8b949e] mt-1 ml-8">
              Adaptive clinical question sets, subject mock tests, and real-time weak topic remediation.
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-[#e8e6e3] dark:border-[#30363d] overflow-x-auto no-scrollbar pb-px">
          {[
            { id: "mcq", label: "MCQ Practice Hub" },
            { id: "weak_areas", label: "Weak Areas Remediation" },
            { id: "attempts", label: "Previous Attempts" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as PracticeTab)}
              className={`px-4 py-2.5 text-xs font-bold whitespace-nowrap border-b-2 transition cursor-pointer ${
                activeTab === tab.id
                  ? "border-[#0f4c81] text-[#0f4c81] dark:border-[#58a6ff] dark:text-[#58a6ff]"
                  : "border-transparent text-[#77716b] dark:text-[#8b949e] hover:text-[#171717] dark:hover:text-[#f0f6fc]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ───────────────────────────────────────────── */}
        {/* TAB 1: MCQ PRACTICE SETUP */}
        {/* ───────────────────────────────────────────── */}
        {activeTab === "mcq" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white dark:bg-[#161b22] border border-[#e8e6e3] dark:border-[#30363d] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
              <div className="space-y-1">
                <h2 className="text-base sm:text-lg font-bold text-[#171717] dark:text-[#f0f6fc]">
                  Customize Practice Session
                </h2>
                <p className="text-xs text-[#77716b] dark:text-[#8b949e]">
                  Select discipline, focus topic, difficulty, and question count to build an instant assessment.
                </p>
              </div>

              {/* Subject Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#5d5854] dark:text-[#8b949e]">
                  1. Choose Subject
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {["Anatomy", "Physiology", "Pharmacology", "Pathology"].map((subj) => (
                    <button
                      key={subj}
                      type="button"
                      onClick={() => setSelectedSubject(subj)}
                      className={`p-3 rounded-2xl border text-xs font-bold transition cursor-pointer text-center ${
                        selectedSubject === subj
                          ? "border-[#0f4c81] bg-blue-50 dark:bg-blue-950/40 text-[#0f4c81] dark:text-[#58a6ff]"
                          : "border-[#e8e6e3] dark:border-[#30363d] hover:bg-[#f8f7f6] dark:hover:bg-[#1c202a]"
                      }`}
                    >
                      {subj}
                    </button>
                  ))}
                </div>
              </div>

              {/* Topic Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#5d5854] dark:text-[#8b949e]">
                  2. Choose Topic
                </label>
                <div className="flex flex-wrap gap-2">
                  {["All", "Upper Limb", "Neuroanatomy", "Cardiovascular", "General Pathology", "Autonomic Pharmacology"].map((top) => (
                    <button
                      key={top}
                      type="button"
                      onClick={() => setSelectedTopic(top)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                        selectedTopic === top
                          ? "bg-[#0f4c81] text-white"
                          : "bg-[#f5f4f2] dark:bg-[#21262d] text-[#5d5854] dark:text-[#8b949e] hover:bg-[#e8e6e3] dark:hover:bg-[#30363d]"
                      }`}
                    >
                      {top}
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty & Count */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#5d5854] dark:text-[#8b949e]">
                    3. Difficulty
                  </label>
                  <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value as QuestionDifficulty)}
                    className="w-full bg-[#f8f7f6] dark:bg-[#21262d] border border-[#e8e6e3] dark:border-[#30363d] p-2.5 rounded-xl text-xs font-semibold focus:outline-none"
                  >
                    <option value="easy">Easy (Foundational)</option>
                    <option value="medium">Medium (Standard Clinical)</option>
                    <option value="hard">Hard (Advanced Vignettes)</option>
                    <option value="all">Mixed Difficulty</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#5d5854] dark:text-[#8b949e]">
                    4. Questions & Time Limit
                  </label>
                  <div className="flex items-center gap-2">
                    <select
                      value={questionCount}
                      onChange={(e) => {
                        const cnt = Number(e.target.value);
                        setQuestionCount(cnt);
                        setTimeLimitMinutes(Math.round(cnt * 1.5));
                      }}
                      className="w-1/2 bg-[#f8f7f6] dark:bg-[#21262d] border border-[#e8e6e3] dark:border-[#30363d] p-2.5 rounded-xl text-xs font-semibold focus:outline-none"
                    >
                      <option value={5}>5 Questions</option>
                      <option value={10}>10 Questions</option>
                      <option value={20}>20 Questions</option>
                      <option value={30}>30 Questions</option>
                    </select>

                    <span className="text-xs text-[#77716b] font-mono">
                      ~{timeLimitMinutes} min
                    </span>
                  </div>
                </div>
              </div>

              {/* Launch Button */}
              <div className="pt-4 border-t border-[#f0efee] dark:border-[#21262d]">
                <button
                  type="button"
                  onClick={handleStartTest}
                  disabled={isLoading}
                  className="w-full py-3 bg-[#0f4c81] hover:bg-[#0d3f6c] text-white text-sm font-bold rounded-2xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Play className="size-4 fill-white" /> Start Timed Practice Session
                </button>
              </div>
            </div>

            {/* Side Info Cards */}
            <div className="space-y-4">
              <div className="bg-gradient-to-tr from-amber-500/10 to-orange-500/10 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-300/40 rounded-3xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
                  <Target className="size-4" />
                  <span className="text-xs font-bold uppercase">Adaptive Engine</span>
                </div>
                <h3 className="text-sm font-bold text-[#171717] dark:text-[#f0f6fc]">
                  Real-time Weak Topic Detection
                </h3>
                <p className="text-xs text-[#77716b] dark:text-[#8b949e] leading-relaxed">
                  As you attempt questions, our engine tracks topic-level accuracy and recommends mind maps and targeted revision sets.
                </p>
              </div>

              <div className="bg-white dark:bg-[#161b22] border border-[#e8e6e3] dark:border-[#30363d] rounded-3xl p-5 space-y-3">
                <h3 className="text-xs font-bold uppercase text-[#77716b] dark:text-[#8b949e]">
                  Quick Practice Shortcuts
                </h3>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSubject("Anatomy");
                      setSelectedTopic("Upper Limb");
                      handleStartTest();
                    }}
                    className="w-full p-2.5 rounded-xl bg-[#f8f7f6] dark:bg-[#21262d] hover:bg-blue-50 dark:hover:bg-blue-950/40 text-left text-xs font-semibold flex items-center justify-between transition"
                  >
                    <span>Brachial Plexus 10-MCQ Rapid Drill</span>
                    <ArrowRight className="size-3.5 text-[#77716b]" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSubject("Anatomy");
                      setSelectedTopic("Neuroanatomy");
                      handleStartTest();
                    }}
                    className="w-full p-2.5 rounded-xl bg-[#f8f7f6] dark:bg-[#21262d] hover:bg-blue-50 dark:hover:bg-blue-950/40 text-left text-xs font-semibold flex items-center justify-between transition"
                  >
                    <span>Cranial Nerves Clinical Vignettes</span>
                    <ArrowRight className="size-3.5 text-[#77716b]" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ───────────────────────────────────────────── */}
        {/* TAB 2: WEAK AREAS REMEDIATION */}
        {/* ───────────────────────────────────────────── */}
        {activeTab === "weak_areas" && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-[#161b22] border border-[#e8e6e3] dark:border-[#30363d] rounded-3xl p-6 space-y-4">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                <Target className="size-5" />
                <h2 className="text-base font-bold text-[#171717] dark:text-[#f0f6fc]">
                  Weak Areas Remediation Plan
                </h2>
              </div>
              <p className="text-xs text-[#77716b] dark:text-[#8b949e]">
                Topics below are computed from your verified test submissions (&lt;65% accuracy). No simulated statistics are shown.
              </p>

              {weakTopicsList.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {weakTopicsList.map((wt, i) => (
                    <div
                      key={i}
                      className="border border-[#e8e6e3] dark:border-[#30363d] rounded-2xl p-5 space-y-3 bg-[#fdfdfd] dark:bg-[#1c202a]"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-bold text-[#171717] dark:text-[#f0f6fc]">
                            {wt.topic}
                          </span>
                          <p className="text-[11px] text-[#77716b] dark:text-[#8b949e]">
                            {wt.subject} • {wt.total_attempted} attempted
                          </p>
                        </div>
                        <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400">
                          {wt.accuracy}% accuracy
                        </span>
                      </div>

                      {/* Remediation Action Pills */}
                      <div className="flex flex-wrap gap-2 pt-2 border-t border-[#f0efee] dark:border-[#21262d]">
                        {wt.recommendations?.mind_map_id && (
                          <Link
                            href={`/learn/mind-maps?id=${wt.recommendations.mind_map_id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-xs font-semibold hover:bg-purple-100 transition"
                          >
                            <Brain className="size-3" /> Study Mind Map
                          </Link>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedSubject(wt.subject);
                            setSelectedTopic(wt.topic);
                            setActiveTab("mcq");
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold hover:bg-emerald-100 transition"
                        >
                          <Play className="size-3" /> Practice 20 MCQs
                        </button>
                        <Link
                          href={`/learn/notes?topic=${encodeURIComponent(wt.topic)}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-semibold hover:bg-blue-100 transition"
                        >
                          <FileText className="size-3" /> Revision Notes
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center space-y-2 border border-dashed border-[#e8e6e3] dark:border-[#30363d] rounded-2xl">
                  <p className="text-xs text-[#77716b] dark:text-[#8b949e]">
                    No weak areas detected yet! Take a practice session above to unlock adaptive performance insights.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ───────────────────────────────────────────── */}
        {/* TAB 3: PREVIOUS ATTEMPTS */}
        {/* ───────────────────────────────────────────── */}
        {activeTab === "attempts" && (
          <div className="bg-white dark:bg-[#161b22] border border-[#e8e6e3] dark:border-[#30363d] rounded-3xl p-6 space-y-4">
            <h2 className="text-base font-bold text-[#171717] dark:text-[#f0f6fc]">
              Your Attempt History
            </h2>

            {previousAttempts.length > 0 ? (
              <div className="space-y-3">
                {previousAttempts.map((att) => (
                  <div
                    key={att.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-[#e8e6e3] dark:border-[#30363d] gap-3"
                  >
                    <div>
                      <h3 className="text-sm font-bold text-[#171717] dark:text-[#f0f6fc]">
                        {att.subject} {att.topic ? `→ ${att.topic}` : ""}
                      </h3>
                      <p className="text-xs text-[#77716b] dark:text-[#8b949e] mt-0.5">
                        {new Date(att.submitted_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        • {att.total_questions} questions
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-sm font-extrabold text-[#0f4c81] dark:text-[#58a6ff]">
                        {att.score} / {att.total_questions} ({att.percentage}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-[#77716b] dark:text-[#8b949e]">
                No previous attempts recorded yet.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
