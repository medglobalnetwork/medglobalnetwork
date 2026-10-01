"use client";

import * as React from "react";
import {
  AlertCircle,
  Award,
  CheckCircle2,
  Clock,
  ExternalLink,
  GraduationCap,
  Save,
  Send,
  User,
  X,
  XCircle,
} from "lucide-react";
import { TestPaperSubmission, TestSubmissionAnswerDetail } from "../../types";

interface TestSubmissionDetailModalProps {
  attemptId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onEvaluationComplete?: () => void;
}

export function TestSubmissionDetailModal({
  attemptId,
  isOpen,
  onClose,
  onEvaluationComplete,
}: TestSubmissionDetailModalProps) {
  const [submission, setSubmission] = React.useState<TestPaperSubmission | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  // Evaluation Form State
  const [instructorFeedback, setInstructorFeedback] = React.useState("");
  const [questionGrades, setQuestionGrades] = React.useState<
    Record<string, { pointsAwarded: number; feedback: string; isCorrect: boolean }>
  >({});
  const [isSavingEvaluation, setIsSavingEvaluation] = React.useState(false);
  const [evalSuccess, setEvalSuccess] = React.useState(false);

  const fetchSubmission = React.useCallback(async () => {
    if (!attemptId) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/learn/instructor/submissions/${attemptId}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load submission");

      setSubmission(data.submission);
      setInstructorFeedback(data.submission.instructor_feedback || "");

      // Initialize question grades
      const initialGrades: Record<string, { pointsAwarded: number; feedback: string; isCorrect: boolean }> = {};
      if (Array.isArray(data.submission.answers)) {
        for (const ans of data.submission.answers) {
          initialGrades[ans.question_id] = {
            pointsAwarded: ans.points_awarded ?? (ans.is_correct ? (ans.max_points || 1) : 0),
            feedback: ans.feedback || "",
            isCorrect: ans.is_correct ?? false,
          };
        }
      }
      setQuestionGrades(initialGrades);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to fetch submission details");
    } finally {
      setLoading(false);
    }
  }, [attemptId]);

  React.useEffect(() => {
    if (isOpen && attemptId) {
      fetchSubmission();
    }
  }, [isOpen, attemptId, fetchSubmission]);

  if (!isOpen || !attemptId) return null;

  const handleGradeChange = (questionId: string, field: string, value: any) => {
    setQuestionGrades((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        [field]: value,
      },
    }));
  };

  const handleSaveEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingEvaluation(true);
    setEvalSuccess(false);

    try {
      const gradesPayload = Object.entries(questionGrades).map(([questionId, g]) => ({
        questionId,
        pointsAwarded: Number(g.pointsAwarded),
        feedback: g.feedback,
        isCorrect: g.isCorrect,
      }));

      const res = await fetch(`/api/learn/instructor/submissions/${attemptId}/evaluate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instructorFeedback,
          questionGrades: gradesPayload,
        }),
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save evaluation");

      setSubmission(data.submission);
      setEvalSuccess(true);
      if (onEvaluationComplete) onEvaluationComplete();
      setTimeout(() => setEvalSuccess(false), 4000);
    } catch (err: any) {
      alert(err.message || "Failed to save evaluation");
    } finally {
      setIsSavingEvaluation(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="flex h-[90vh] w-full max-w-4xl flex-col rounded-3xl border border-[#ded8d1] bg-white shadow-2xl dark:border-[#30363d] dark:bg-[#161b22] overflow-hidden">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-[#ded8d1] p-5 dark:border-[#30363d]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-[#eef5fc] px-2 py-0.5 text-[10px] font-bold text-[#0f4c81] dark:bg-[#1f2937] dark:text-[#58a6ff]">
                Test Submission # {submission?.attempt_number || 1}
              </span>
              <span className="text-xs font-semibold text-[#77716b] dark:text-[#8b949e]">
                {submission?.course_title}
              </span>
            </div>
            <h2 className="text-lg font-black text-[#171717] dark:text-[#f0f6fc]">
              {submission?.quiz_title || "Test Paper Evaluation"}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-[#77716b] hover:bg-[#f0efee] hover:text-[#171717] dark:text-[#8b949e] dark:hover:bg-[#21262d] dark:hover:text-[#f0f6fc] cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="size-8 animate-spin rounded-full border-2 border-[#0f4c81] border-t-transparent dark:border-[#58a6ff]" />
              <p className="text-xs font-semibold text-[#77716b] dark:text-[#8b949e]">
                Loading test submission details & answer sheet...
              </p>
            </div>
          ) : errorMsg || !submission ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-bold text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300">
              {errorMsg || "Submission not found"}
            </div>
          ) : (
            <>
              {/* STUDENT & SCORE SUMMARY BAR */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-4 rounded-2xl border border-[#ded8d1] bg-[#fbfaf9] p-4 dark:border-[#30363d] dark:bg-[#0d1117]">
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#77716b] dark:text-[#8b949e]">
                    Learner
                  </span>
                  <div className="font-bold text-xs text-[#171717] dark:text-[#f0f6fc]">
                    {submission.student_name}
                  </div>
                  <div className="text-[11px] text-[#77716b] dark:text-[#8b949e]">
                    {submission.student_email}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase text-[#77716b] dark:text-[#8b949e]">
                    Score / Result
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-black ${
                        submission.passed ? "text-[#16804d] dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {submission.score} / {submission.total_questions} ({submission.percentage}%)
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        submission.passed
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                          : "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300"
                      }`}
                    >
                      {submission.passed ? "PASSED" : "FAILED"}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase text-[#77716b] dark:text-[#8b949e]">
                    Submission Time
                  </span>
                  <div className="text-xs font-semibold text-[#171717] dark:text-[#f0f6fc]">
                    {new Date(submission.submitted_at).toLocaleDateString()}{" "}
                    {new Date(submission.submitted_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase text-[#77716b] dark:text-[#8b949e]">
                    Status
                  </span>
                  <div className="text-xs font-bold text-[#0f4c81] dark:text-[#58a6ff] capitalize">
                    {submission.status.replace("_", " ")}
                  </div>
                </div>
              </div>

              {evalSuccess && (
                <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs font-bold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                  <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Evaluation & Feedback saved successfully.</span>
                </div>
              )}

              {/* QUESTIONS & ANSWERS BREAKDOWN */}
              <div className="space-y-4">
                <h3 className="text-sm font-black text-[#171717] dark:text-[#f0f6fc]">
                  Question-by-Question Evaluation & Student Answers
                </h3>

                {submission.answers?.map((ans, idx) => {
                  const grade = questionGrades[ans.question_id] || {
                    pointsAwarded: ans.points_awarded ?? (ans.is_correct ? (ans.max_points || 1) : 0),
                    feedback: ans.feedback || "",
                    isCorrect: ans.is_correct ?? false,
                  };

                  return (
                    <div
                      key={ans.question_id}
                      className="rounded-2xl border border-[#ded8d1] bg-white p-4 shadow-2xs dark:border-[#30363d] dark:bg-[#161b22] space-y-3"
                    >
                      {/* Question Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="rounded-md bg-[#f0efee] px-2 py-0.5 text-[10px] font-bold text-[#5d5854] dark:bg-[#21262d] dark:text-[#8b949e]">
                              Q{idx + 1} • {ans.question_type.toUpperCase()}
                            </span>
                            {ans.is_correct === true ? (
                              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                                <CheckCircle2 className="size-3" /> Correct
                              </span>
                            ) : ans.is_correct === false ? (
                              <span className="inline-flex items-center gap-1 rounded-md bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-700 dark:bg-red-950/40 dark:text-red-400">
                                <XCircle className="size-3" /> Incorrect
                              </span>
                            ) : (
                              <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
                                Subjective Review
                              </span>
                            )}
                          </div>

                          {/* Clinical Case Vignette */}
                          {ans.case_vignette && (
                            <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3 text-xs text-blue-900 dark:border-blue-950 dark:bg-blue-950/30 dark:text-blue-200">
                              <span className="font-bold block mb-0.5">Clinical Case Scenario:</span>
                              {ans.case_vignette}
                            </div>
                          )}

                          <h4 className="text-xs font-bold text-[#171717] dark:text-[#f0f6fc]">
                            {ans.question_text}
                          </h4>
                        </div>

                        {/* Points Score Control */}
                        <div className="flex items-center gap-1.5 shrink-0 bg-[#fbfaf9] p-2 rounded-xl border border-[#ded8d1] dark:border-[#30363d] dark:bg-[#0d1117]">
                          <label className="text-[10px] font-bold text-[#77716b] dark:text-[#8b949e]">
                            Points:
                          </label>
                          <input
                            type="number"
                            step="0.5"
                            min="0"
                            max={ans.max_points || 5}
                            value={grade.pointsAwarded}
                            onChange={(e) =>
                              handleGradeChange(ans.question_id, "pointsAwarded", Number(e.target.value))
                            }
                            className="h-7 w-14 rounded-lg border border-[#ded8d1] bg-white px-2 text-xs font-bold text-center text-[#171717] dark:border-[#30363d] dark:bg-[#161b22] dark:text-[#f0f6fc]"
                          />
                          <span className="text-[10px] font-bold text-[#77716b] dark:text-[#8b949e]">
                            / {ans.max_points || 1}
                          </span>
                        </div>
                      </div>

                      {/* Options / Response Breakdown */}
                      {ans.question_type === "subjective" ? (
                        <div className="space-y-1.5 rounded-xl border border-[#ded8d1] bg-[#fbfaf9] p-3 text-xs dark:border-[#30363d] dark:bg-[#0d1117]">
                          <span className="font-bold text-[#171717] dark:text-[#f0f6fc]">
                            Student Response:
                          </span>
                          <p className="text-[#5d5854] dark:text-[#8b949e] whitespace-pre-wrap">
                            {ans.text_answer || "No written response provided."}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          {ans.options?.map((opt) => {
                            const isSelected = ans.selected_option_ids?.includes(opt.id);
                            const isCorrect = opt.is_correct;

                            return (
                              <div
                                key={opt.id}
                                className={`flex items-center justify-between rounded-xl border p-2.5 text-xs transition ${
                                  isCorrect && isSelected
                                    ? "border-emerald-500 bg-emerald-50/50 text-emerald-900 dark:border-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-200"
                                    : isSelected && !isCorrect
                                    ? "border-red-400 bg-red-50/50 text-red-900 dark:border-red-800 dark:bg-red-950/30 dark:text-red-200"
                                    : isCorrect
                                    ? "border-emerald-300 bg-emerald-50/20 text-emerald-800 dark:border-emerald-800 dark:text-emerald-300"
                                    : "border-[#ded8d1] text-[#5d5854] dark:border-[#30363d] dark:text-[#8b949e]"
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`flex size-4 items-center justify-center rounded-full text-[10px] font-bold ${
                                      isSelected
                                        ? "bg-[#0f4c81] text-white dark:bg-[#58a6ff]"
                                        : "border border-[#ded8d1] dark:border-[#30363d]"
                                    }`}
                                  >
                                    {isSelected ? "✓" : ""}
                                  </span>
                                  <span>{opt.option_text}</span>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] font-bold">
                                  {isSelected && <span className="text-[#0f4c81] dark:text-[#58a6ff]">Learner Answer</span>}
                                  {isCorrect && <span className="text-[#16804d] dark:text-emerald-400">Correct Choice</span>}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Explanation */}
                      {ans.explanation && (
                        <div className="text-[11px] text-[#77716b] dark:text-[#8b949e] italic border-l-2 border-[#0f4c81] pl-2.5">
                          Rationale: {ans.explanation}
                        </div>
                      )}

                      {/* Question Specific Feedback Input */}
                      <div>
                        <input
                          type="text"
                          value={grade.feedback}
                          onChange={(e) => handleGradeChange(ans.question_id, "feedback", e.target.value)}
                          placeholder="Feedback or rationale on this specific answer..."
                          className="h-8 w-full rounded-lg border border-[#ded8d1] bg-[#fbfaf9] px-2.5 text-[11px] text-[#171717] focus:border-[#0f4c81] focus:outline-none dark:border-[#30363d] dark:bg-[#0d1117] dark:text-[#f0f6fc]"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* INSTRUCTOR OVERALL FEEDBACK */}
              <div className="space-y-2 rounded-2xl border border-[#ded8d1] bg-white p-4 shadow-xs dark:border-[#30363d] dark:bg-[#161b22]">
                <label className="block text-xs font-bold text-[#171717] dark:text-[#f0f6fc]">
                  Overall Clinical Feedback & Test Evaluation Notes
                </label>
                <textarea
                  rows={3}
                  value={instructorFeedback}
                  onChange={(e) => setInstructorFeedback(e.target.value)}
                  placeholder="Provide comprehensive feedback, clinical takeaways, or recommendations for re-attempt..."
                  className="w-full rounded-xl border border-[#ded8d1] bg-white p-3 text-xs text-[#171717] focus:border-[#0f4c81] focus:outline-none dark:border-[#30363d] dark:bg-[#0d1117] dark:text-[#f0f6fc]"
                />
              </div>

              {/* SAVE BUTTON */}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-[#ded8d1] px-4 py-2 text-xs font-bold text-[#5d5854] hover:bg-[#f0efee] dark:border-[#30363d] dark:text-[#8b949e]"
                >
                  Close
                </button>

                <button
                  type="button"
                  onClick={handleSaveEvaluation}
                  disabled={isSavingEvaluation}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#0f4c81] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#0c3c66] transition disabled:opacity-50 cursor-pointer"
                >
                  <Save className="size-4" />
                  <span>{isSavingEvaluation ? "Saving Grade..." : "Submit Evaluation & Grade"}</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
