"use client";

import * as React from "react";
import { Quiz, QuizQuestion, QuizAttempt, SubmitQuizAnswerInput } from "../types";

interface QuizEngineProps {
  quiz: Quiz;
  onQuizFinished: (attempt: QuizAttempt, courseCompleted?: boolean, certCode?: string) => void;
  onClose?: () => void;
}

export function QuizEngine({ quiz, onQuizFinished, onClose }: QuizEngineProps) {
  const [currentIdx, setCurrentIdx] = React.useState(0);
  const [answers, setAnswers] = React.useState<Map<string, Set<string>>>(new Map());
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [attemptResult, setAttemptResult] = React.useState<QuizAttempt | null>(null);
  const [courseCompleted, setCourseCompleted] = React.useState(false);
  const [certCode, setCertCode] = React.useState<string | undefined>(undefined);

  const questions = quiz.questions || [];
  const currentQ: QuizQuestion | undefined = questions[currentIdx];

  const handleSelectOption = (questionId: string, optionId: string, isMultiple: boolean) => {
    setAnswers((prev) => {
      const next = new Map(prev);
      const set = next.get(questionId) || new Set<string>();

      if (isMultiple) {
        if (set.has(optionId)) set.delete(optionId);
        else set.add(optionId);
      } else {
        set.clear();
        set.add(optionId);
      }

      next.set(questionId, set);
      return next;
    });
  };

  const handleSubmitQuiz = async () => {
    setIsSubmitting(true);
    try {
      const payload: SubmitQuizAnswerInput[] = questions.map((q) => ({
        question_id: q.id,
        selected_option_ids: Array.from(answers.get(q.id) || []),
      }));

      const res = await fetch(`/api/learn/quizzes/${quiz.id}/attempt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: payload }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit quiz");

      setAttemptResult(data.attempt);
      setCourseCompleted(Boolean(data.courseCompleted));
      setCertCode(data.verificationCode);
      onQuizFinished(data.attempt, data.courseCompleted, data.verificationCode);
    } catch (err: any) {
      alert(err.message || "Failed to grade assessment");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (questions.length === 0) {
    return (
      <div className="rounded-2xl border border-[#ded8d1] bg-white p-6 text-center text-xs text-[#77716b]">
        No questions configured for this assessment yet.
      </div>
    );
  }

  // 1. RESULT SCREEN
  if (attemptResult) {
    return (
      <div className="rounded-3xl border border-[#ded8d1] bg-white p-8 text-center shadow-lg animate-in fade-in">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full text-3xl">
          {attemptResult.passed ? "🏆" : "📚"}
        </div>

        <h3 className="mt-4 text-xl font-bold text-[#171717]">
          {attemptResult.passed ? "Assessment Passed!" : "Review & Try Again"}
        </h3>
        <p className="mt-1 text-xs text-[#77716b]">
          Passing score requirement: {quiz.passing_score}%
        </p>

        {/* Score Summary Box */}
        <div className="my-6 grid grid-cols-3 gap-3 rounded-2xl bg-[#faf9f8] p-4 text-xs border border-[#f0efee]">
          <div>
            <p className="text-[10px] text-[#77716b] uppercase font-bold">Your Score</p>
            <p className="mt-1 text-lg font-extrabold text-[#1769c2]">{attemptResult.percentage}%</p>
          </div>
          <div>
            <p className="text-[10px] text-[#77716b] uppercase font-bold">Correct</p>
            <p className="mt-1 text-lg font-extrabold text-[#15803d]">
              {attemptResult.correct_answers}/{attemptResult.total_questions}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-[#77716b] uppercase font-bold">Attempt #</p>
            <p className="mt-1 text-lg font-extrabold text-[#5d5854]">{attemptResult.attempt_number}</p>
          </div>
        </div>

        {courseCompleted && certCode && (
          <div className="my-4 rounded-2xl border border-[#bbf7d0] bg-[#f0fdf4] p-4 text-xs text-[#15803d]">
            <p className="font-bold">🎉 Course Completed & Certificate Unlocked!</p>
            <p className="mt-0.5 text-[11px] text-[#166534]">
              Verification Code: <span className="font-mono font-bold">{certCode}</span>
            </p>
          </div>
        )}

        <div className="flex justify-center gap-3">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[#ded8d1] bg-white px-5 py-2.5 text-xs font-semibold text-[#171717] hover:bg-[#f8f7f6]"
            >
              Close
            </button>
          )}

          {!attemptResult.passed && (
            <button
              type="button"
              onClick={() => {
                setAttemptResult(null);
                setCurrentIdx(0);
                setAnswers(new Map());
              }}
              className="rounded-xl bg-[#1769c2] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#12569f]"
            >
              Retry Assessment
            </button>
          )}
        </div>
      </div>
    );
  }

  // 2. QUESTION SCREEN
  const currentSelected = answers.get(currentQ?.id || "") || new Set();
  const isLastQ = currentIdx === questions.length - 1;

  return (
    <div className="rounded-3xl border border-[#ded8d1] bg-white p-6 shadow-sm sm:p-8">
      {/* Header Progress */}
      <div className="flex items-center justify-between border-b border-[#f5f4f3] pb-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#1769c2]">
            Clinical Assessment
          </span>
          <h3 className="text-sm font-bold text-[#171717] sm:text-base">{quiz.title}</h3>
        </div>
        <span className="rounded-full bg-[#f8f7f6] px-3 py-1 text-xs font-bold text-[#5d5854]">
          Question {currentIdx + 1} of {questions.length}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="my-4 h-1.5 w-full overflow-hidden rounded-full bg-[#f0efee]">
        <div
          className="h-full rounded-full bg-[#1769c2] transition-all duration-300"
          style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question Text */}
      {currentQ && (
        <div className="my-6 space-y-4">
          <h4 className="text-base font-bold leading-snug text-[#171717]">
            {currentQ.question}
          </h4>
          {currentQ.question_type === "multiple" && (
            <p className="text-[11px] text-[#77716b]">
              💡 Multiple choices may apply. Select all correct answers.
            </p>
          )}

          {/* Options */}
          <div className="space-y-2.5 pt-2">
            {currentQ.options.map((opt) => {
              const isSelected = currentSelected.has(opt.id);
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() =>
                    handleSelectOption(
                      currentQ.id,
                      opt.id,
                      currentQ.question_type === "multiple"
                    )
                  }
                  className={`flex w-full items-center justify-between rounded-2xl border p-4 text-left text-xs sm:text-sm font-medium transition ${
                    isSelected
                      ? "border-[#1769c2] bg-[#eef5fc] text-[#1769c2] shadow-2xs"
                      : "border-[#ded8d1] bg-white text-[#171717] hover:border-[#cfc6be] hover:bg-[#faf9f8]"
                  }`}
                >
                  <span>{opt.option_text}</span>
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] ${
                      isSelected
                        ? "border-[#1769c2] bg-[#1769c2] text-white"
                        : "border-[#ded8d1]"
                    }`}
                  >
                    {isSelected ? "✓" : ""}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Navigation Footer */}
      <div className="flex items-center justify-between border-t border-[#f5f4f3] pt-5">
        <button
          type="button"
          onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
          disabled={currentIdx === 0}
          className="rounded-xl border border-[#ded8d1] px-4 py-2 text-xs font-semibold text-[#5d5854] hover:bg-[#f8f7f6] disabled:opacity-30"
        >
          ← Previous
        </button>

        {isLastQ ? (
          <button
            type="button"
            onClick={handleSubmitQuiz}
            disabled={isSubmitting}
            className="rounded-xl bg-[#1769c2] px-6 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#12569f] disabled:opacity-50"
          >
            {isSubmitting ? "Evaluating Answers..." : "Submit Assessment 🚀"}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setCurrentIdx((i) => Math.min(questions.length - 1, i + 1))}
            className="rounded-xl bg-[#1769c2] px-5 py-2 text-xs font-semibold text-white hover:bg-[#12569f]"
          >
            Next Question →
          </button>
        )}
      </div>
    </div>
  );
}
