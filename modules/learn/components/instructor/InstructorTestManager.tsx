"use client";

import * as React from "react";
import {
  AlertCircle,
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  Edit,
  FileQuestion,
  GraduationCap,
  Plus,
  RefreshCw,
  Search,
  Stethoscope,
  Trash2,
  Users,
  XCircle,
} from "lucide-react";
import { Quiz, TestPaperSubmission } from "../../types";
import { TestPaperBuilderModal } from "./TestPaperBuilderModal";
import { TestSubmissionDetailModal } from "./TestSubmissionDetailModal";

export function InstructorTestManager() {
  const [subTab, setSubTab] = React.useState<"quizzes" | "submissions">("quizzes");
  const [loading, setLoading] = React.useState(true);
  const [quizzes, setQuizzes] = React.useState<any[]>([]);
  const [submissions, setSubmissions] = React.useState<TestPaperSubmission[]>([]);
  const [courses, setCourses] = React.useState<{ id: string; title: string }[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCourseFilter, setSelectedCourseFilter] = React.useState<string>("all");

  // Modals
  const [showBuilderModal, setShowBuilderModal] = React.useState(false);
  const [editingQuizId, setEditingQuizId] = React.useState<string | null>(null);
  const [evaluatingAttemptId, setEvaluatingAttemptId] = React.useState<string | null>(null);

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const [quizRes, subRes, courseRes] = await Promise.all([
        fetch("/api/learn/instructor/quizzes", { credentials: "include" }),
        fetch("/api/learn/instructor/submissions", { credentials: "include" }),
        fetch("/api/learn/instructor/courses", { credentials: "include" }),
      ]);

      const quizData = await quizRes.json();
      const subData = await subRes.json();
      const courseData = await courseRes.json();

      if (quizRes.ok) setQuizzes(quizData.quizzes || []);
      if (subRes.ok) setSubmissions(subData.submissions || []);
      if (courseRes.ok && Array.isArray(courseData.courses)) {
        setCourses(courseData.courses.map((c: any) => ({ id: c.id, title: c.title })));
      }
    } catch (err) {
      console.error("Failed to load tests & submissions:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Delete Quiz
  const handleDeleteQuiz = async (quizId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this test? All student submissions and answer sheets for this quiz will be deleted.")) return;
    try {
      const res = await fetch(`/api/learn/instructor/quizzes/${quizId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredQuizzes = quizzes.filter((q) => {
    const matchesSearch =
      !searchQuery.trim() ||
      q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.course_title?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCourse =
      selectedCourseFilter === "all" || q.course_id === selectedCourseFilter;
    return matchesSearch && matchesCourse;
  });

  const filteredSubmissions = submissions.filter((s) => {
    const matchesSearch =
      !searchQuery.trim() ||
      s.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.student_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.quiz_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.course_title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCourse =
      selectedCourseFilter === "all" || s.course_id === selectedCourseFilter;
    return matchesSearch && matchesCourse;
  });

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#ded8d1] pb-4 dark:border-[#30363d]">
        <div>
          <h2 className="text-lg font-black text-[#171717] dark:text-[#f0f6fc] flex items-center gap-2">
            <FileQuestion className="size-5 text-[#0f4c81] dark:text-[#58a6ff]" />
            Test Creation & Student Submissions Manager
          </h2>
          <p className="text-xs text-[#77716b] dark:text-[#8b949e]">
            Build clinical quizzes, MCQs, case vignette assessments, and manually evaluate subjective answer sheets.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchData}
            className="flex size-9 items-center justify-center rounded-xl border border-[#ded8d1] bg-white text-[#77716b] hover:text-[#171717] dark:border-[#30363d] dark:bg-[#161b22] dark:text-[#8b949e] dark:hover:text-[#f0f6fc] transition cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>

          <button
            type="button"
            onClick={() => {
              setEditingQuizId(null);
              setShowBuilderModal(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#0f4c81] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#0c3c66] transition cursor-pointer"
          >
            <Plus className="size-4" />
            <span>Create New Test</span>
          </button>
        </div>
      </div>

      {/* SUB-TABS */}
      <div className="flex items-center justify-between border-b border-[#ded8d1] pb-2 dark:border-[#30363d]">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSubTab("quizzes")}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
              subTab === "quizzes"
                ? "bg-[#0f4c81] text-white"
                : "border border-[#ded8d1] bg-white text-[#5d5854] hover:bg-[#f0efee] dark:border-[#30363d] dark:bg-[#161b22] dark:text-[#8b949e]"
            }`}
          >
            <FileQuestion className="size-3.5" />
            <span>Authored Tests ({quizzes.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab("submissions")}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
              subTab === "submissions"
                ? "bg-[#0f4c81] text-white"
                : "border border-[#ded8d1] bg-white text-[#5d5854] hover:bg-[#f0efee] dark:border-[#30363d] dark:bg-[#161b22] dark:text-[#8b949e]"
            }`}
          >
            <GraduationCap className="size-3.5" />
            <span>Student Submissions & Grading ({submissions.length})</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <div className="relative w-48 sm:w-64">
            <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-[#77716b] dark:text-[#8b949e]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tests or students..."
              className="h-8 w-full rounded-xl border border-[#ded8d1] bg-white pl-8 pr-3 text-xs text-[#171717] focus:border-[#0f4c81] focus:outline-none dark:border-[#30363d] dark:bg-[#161b22] dark:text-[#f0f6fc]"
            />
          </div>

          <select
            value={selectedCourseFilter}
            onChange={(e) => setSelectedCourseFilter(e.target.value)}
            className="h-8 rounded-xl border border-[#ded8d1] bg-white px-2 text-xs text-[#171717] dark:border-[#30363d] dark:bg-[#161b22] dark:text-[#f0f6fc]"
          >
            <option value="all">All Courses</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* CONTENT: TAB 1 (QUIZZES LIST) */}
      {subTab === "quizzes" && (
        <>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="size-8 animate-spin rounded-full border-2 border-[#0f4c81] border-t-transparent dark:border-[#58a6ff]" />
              <p className="text-xs font-semibold text-[#77716b] dark:text-[#8b949e]">
                Loading authored quizzes and exams...
              </p>
            </div>
          ) : filteredQuizzes.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-[#ded8d1] bg-white p-12 text-center dark:border-[#30363d] dark:bg-[#161b22]">
              <FileQuestion className="mx-auto size-10 text-[#77716b] opacity-40 mb-3 dark:text-[#8b949e]" />
              <h3 className="text-sm font-black text-[#171717] dark:text-[#f0f6fc]">
                {searchQuery ? "No matching tests found" : "No test assessments created yet"}
              </h3>
              <p className="mt-1 text-xs text-[#77716b] dark:text-[#8b949e] max-w-sm mx-auto">
                {searchQuery
                  ? "Try searching for another keyword or course."
                  : "Create clinical quizzes, accreditation exams, and case scenarios with customizable passing scores."}
              </p>
              {!searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingQuizId(null);
                    setShowBuilderModal(true);
                  }}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#0f4c81] px-4 py-2 text-xs font-bold text-white hover:bg-[#0c3c66] transition cursor-pointer"
                >
                  <Plus className="size-3.5" />
                  <span>Create First Test</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredQuizzes.map((quiz) => (
                <div
                  key={quiz.id}
                  className="flex flex-col justify-between rounded-3xl border border-[#ded8d1] bg-white p-5 shadow-xs transition hover:border-[#0f4c81]/40 dark:border-[#30363d] dark:bg-[#161b22]"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="rounded-md bg-[#eef5fc] px-2 py-0.5 text-[10px] font-bold text-[#0f4c81] dark:bg-[#1f2937] dark:text-[#58a6ff] uppercase">
                        {quiz.test_type || "QUIZ"}
                      </span>
                      <span className="text-[11px] font-bold text-[#16804d] dark:text-emerald-400">
                        Pass: {quiz.passing_score}%
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-black text-[#171717] dark:text-[#f0f6fc] line-clamp-1">
                        {quiz.title}
                      </h3>
                      <p className="text-[11px] font-semibold text-[#77716b] dark:text-[#8b949e] line-clamp-1">
                        {quiz.course_title}
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 rounded-2xl bg-[#fbfaf9] p-2.5 text-center dark:bg-[#0d1117]">
                      <div>
                        <div className="text-[10px] font-bold text-[#77716b] dark:text-[#8b949e]">
                          Questions
                        </div>
                        <div className="text-xs font-black text-[#171717] dark:text-[#f0f6fc]">
                          {quiz.question_count}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-[#77716b] dark:text-[#8b949e]">
                          Time Limit
                        </div>
                        <div className="text-xs font-black text-[#171717] dark:text-[#f0f6fc]">
                          {quiz.time_limit_minutes}m
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-[#77716b] dark:text-[#8b949e]">
                          Attempts
                        </div>
                        <div className="text-xs font-black text-[#0f4c81] dark:text-[#58a6ff]">
                          {quiz.attempt_count}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-[#f0efee] pt-3 mt-4 dark:border-[#21262d]">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingQuizId(quiz.id);
                        setShowBuilderModal(true);
                      }}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#0f4c81] dark:text-[#58a6ff] hover:underline"
                    >
                      <Edit className="size-3.5" />
                      <span>Edit Test</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleDeleteQuiz(quiz.id, e)}
                      className="rounded-lg p-1 text-[#77716b] hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 transition cursor-pointer"
                      title="Delete quiz"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* CONTENT: TAB 2 (SUBMISSIONS & EVALUATION) */}
      {subTab === "submissions" && (
        <>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="size-8 animate-spin rounded-full border-2 border-[#0f4c81] border-t-transparent dark:border-[#58a6ff]" />
              <p className="text-xs font-semibold text-[#77716b] dark:text-[#8b949e]">
                Loading student test submissions...
              </p>
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-[#ded8d1] bg-white p-12 text-center dark:border-[#30363d] dark:bg-[#161b22]">
              <GraduationCap className="mx-auto size-10 text-[#77716b] opacity-40 mb-3 dark:text-[#8b949e]" />
              <h3 className="text-sm font-black text-[#171717] dark:text-[#f0f6fc]">
                {searchQuery ? "No matching submissions found" : "No student attempts submitted yet"}
              </h3>
              <p className="mt-1 text-xs text-[#77716b] dark:text-[#8b949e] max-w-sm mx-auto">
                When enrolled students complete quizzes or clinical assessments, their answer sheets and scores will appear here for grading and evaluation.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-3xl border border-[#ded8d1] bg-white shadow-xs dark:border-[#30363d] dark:bg-[#161b22]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f0efee] dark:bg-[#21262d] font-bold text-[#171717] dark:text-[#f0f6fc]">
                  <tr>
                    <th className="p-3.5">Learner</th>
                    <th className="p-3.5">Test / Assessment</th>
                    <th className="p-3.5">Course</th>
                    <th className="p-3.5">Score</th>
                    <th className="p-3.5">Submitted On</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ded8d1] dark:divide-[#30363d]">
                  {filteredSubmissions.map((sub) => (
                    <tr
                      key={sub.id}
                      onClick={() => setEvaluatingAttemptId(sub.id)}
                      className="hover:bg-[#fbfaf9] dark:hover:bg-[#161b22]/80 cursor-pointer"
                    >
                      <td className="p-3.5">
                        <div className="font-bold text-[#171717] dark:text-[#f0f6fc]">
                          {sub.student_name}
                        </div>
                        <div className="text-[11px] text-[#77716b] dark:text-[#8b949e]">
                          {sub.student_email}
                        </div>
                      </td>

                      <td className="p-3.5">
                        <div className="font-bold text-[#171717] dark:text-[#f0f6fc]">
                          {sub.quiz_title}
                        </div>
                        <div className="text-[10px] text-[#77716b] dark:text-[#8b949e]">
                          Attempt #{sub.attempt_number}
                        </div>
                      </td>

                      <td className="p-3.5 text-[#5d5854] dark:text-[#8b949e]">
                        {sub.course_title}
                      </td>

                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`font-black ${
                              sub.passed ? "text-[#16804d] dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                            }`}
                          >
                            {sub.score}/{sub.total_questions} ({sub.percentage}%)
                          </span>
                        </div>
                      </td>

                      <td className="p-3.5 text-[#5d5854] dark:text-[#8b949e]">
                        {new Date(sub.submitted_at).toLocaleDateString()}{" "}
                        {new Date(sub.submitted_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </td>

                      <td className="p-3.5">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            sub.passed
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                              : "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400"
                          }`}
                        >
                          {sub.passed ? <CheckCircle2 className="size-3" /> : <XCircle className="size-3" />}
                          {sub.passed ? "PASSED" : "FAILED"}
                        </span>
                      </td>

                      <td className="p-3.5 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEvaluatingAttemptId(sub.id);
                          }}
                          className="inline-flex items-center gap-1 rounded-lg bg-[#0f4c81] px-3 py-1 text-[11px] font-bold text-white hover:bg-[#0c3c66] transition shadow-2xs"
                        >
                          <span>Review & Grade</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* TEST PAPER BUILDER MODAL */}
      <TestPaperBuilderModal
        quizId={editingQuizId}
        courses={courses}
        isOpen={showBuilderModal}
        onClose={() => {
          setShowBuilderModal(false);
          setEditingQuizId(null);
        }}
        onSaved={fetchData}
      />

      {/* SUBMISSION EVALUATION MODAL */}
      <TestSubmissionDetailModal
        attemptId={evaluatingAttemptId}
        isOpen={Boolean(evaluatingAttemptId)}
        onClose={() => setEvaluatingAttemptId(null)}
        onEvaluationComplete={fetchData}
      />
    </div>
  );
}
