"use client";

import * as React from "react";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  FileQuestion,
  GraduationCap,
  Layers,
  Plus,
  Save,
  Stethoscope,
  Trash2,
  X,
} from "lucide-react";

interface TestPaperBuilderModalProps {
  quizId?: string | null;
  courses: { id: string; title: string }[];
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

interface QuestionFormState {
  id?: string;
  question: string;
  question_type: "single" | "multiple" | "case_study" | "subjective";
  case_vignette?: string;
  explanation?: string;
  points: number;
  options: { id?: string; option_text: string; is_correct: boolean }[];
}

export function TestPaperBuilderModal({
  quizId,
  courses,
  isOpen,
  onClose,
  onSaved,
}: TestPaperBuilderModalProps) {
  const [courseId, setCourseId] = React.useState(courses[0]?.id || "");
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [testType, setTestType] = React.useState<"quiz" | "exam" | "clinical_case_study">("quiz");
  const [passingScore, setPassingScore] = React.useState(70);
  const [timeLimitMinutes, setTimeLimitMinutes] = React.useState(30);
  const [maxAttempts, setMaxAttempts] = React.useState(3);
  const [status, setStatus] = React.useState("published");

  const [questions, setQuestions] = React.useState<QuestionFormState[]>([
    {
      question: "",
      question_type: "single",
      points: 1,
      options: [
        { option_text: "", is_correct: true },
        { option_text: "", is_correct: false },
        { option_text: "", is_correct: false },
        { option_text: "", is_correct: false },
      ],
    },
  ]);

  const [loading, setLoading] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  // Load existing quiz data if editing
  React.useEffect(() => {
    if (quizId && isOpen) {
      setLoading(true);
      fetch(`/api/learn/instructor/quizzes/${quizId}`, { credentials: "include" })
        .then((res) => res.json())
        .then((data) => {
          if (data.quiz) {
            setCourseId(data.quiz.course_id);
            setTitle(data.quiz.title);
            setDescription(data.quiz.description || "");
            setTestType(data.quiz.test_type || "quiz");
            setPassingScore(data.quiz.passing_score || 70);
            setTimeLimitMinutes(data.quiz.time_limit_minutes || 30);
            setMaxAttempts(data.quiz.max_attempts || 3);
            setStatus(data.quiz.status || "published");
            if (Array.isArray(data.quiz.questions) && data.quiz.questions.length > 0) {
              setQuestions(
                data.quiz.questions.map((q: any) => ({
                  id: q.id,
                  question: q.question,
                  question_type: q.question_type || "single",
                  case_vignette: q.case_vignette || "",
                  explanation: q.explanation || "",
                  points: q.points || 1,
                  options: (q.options || []).map((o: any) => ({
                    id: o.id,
                    option_text: o.option_text,
                    is_correct: Boolean(o.is_correct),
                  })),
                }))
              );
            }
          }
        })
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    } else if (isOpen) {
      setTitle("");
      setDescription("");
      setTestType("quiz");
      setPassingScore(70);
      setTimeLimitMinutes(30);
      setMaxAttempts(3);
      if (courses.length > 0 && !courseId) setCourseId(courses[0].id);
      setQuestions([
        {
          question: "",
          question_type: "single",
          points: 1,
          options: [
            { option_text: "", is_correct: true },
            { option_text: "", is_correct: false },
            { option_text: "", is_correct: false },
            { option_text: "", is_correct: false },
          ],
        },
      ]);
    }
  }, [quizId, isOpen, courses]);

  if (!isOpen) return null;

  // Add Question
  const handleAddQuestion = (type: "single" | "multiple" | "case_study" | "subjective" = "single") => {
    setQuestions((prev) => [
      ...prev,
      {
        question: "",
        question_type: type,
        case_vignette: type === "case_study" ? "" : undefined,
        points: type === "subjective" ? 5 : 1,
        options:
          type === "subjective"
            ? []
            : [
                { option_text: "", is_correct: true },
                { option_text: "", is_correct: false },
                { option_text: "", is_correct: false },
                { option_text: "", is_correct: false },
              ],
      },
    ]);
  };

  // Remove Question
  const handleRemoveQuestion = (idx: number) => {
    if (questions.length <= 1) return;
    setQuestions((prev) => prev.filter((_, i) => i !== idx));
  };

  // Update Question Field
  const handleUpdateQuestion = (idx: number, field: string, val: any) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === idx ? { ...q, [field]: val } : q))
    );
  };

  // Add Option to Question
  const handleAddOption = (qIdx: number) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIdx
          ? {
              ...q,
              options: [...q.options, { option_text: "", is_correct: false }],
            }
          : q
      )
    );
  };

  // Remove Option from Question
  const handleRemoveOption = (qIdx: number, optIdx: number) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIdx
          ? {
              ...q,
              options: q.options.filter((_, oi) => oi !== optIdx),
            }
          : q
      )
    );
  };

  // Update Option Text or Correctness
  const handleUpdateOption = (qIdx: number, optIdx: number, field: "option_text" | "is_correct", val: any) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIdx) return q;

        if (field === "is_correct" && q.question_type === "single") {
          // In single-choice, selecting one option unselects all others
          return {
            ...q,
            options: q.options.map((opt, oi) => ({
              ...opt,
              is_correct: oi === optIdx,
            })),
          };
        }

        return {
          ...q,
          options: q.options.map((opt, oi) =>
            oi === optIdx ? { ...opt, [field]: val } : opt
          ),
        };
      })
    );
  };

  // Submit Test
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg("Test Title is required");
      return;
    }
    if (!courseId) {
      setErrorMsg("Please select a course to attach this test to");
      return;
    }

    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) {
        setErrorMsg(`Question #${i + 1} text is empty`);
        return;
      }
      if (q.question_type !== "subjective") {
        if (!q.options || q.options.length < 2) {
          setErrorMsg(`Question #${i + 1} needs at least 2 options`);
          return;
        }
        if (!q.options.some((o) => o.is_correct)) {
          setErrorMsg(`Question #${i + 1} has no correct option selected`);
          return;
        }
      }
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const payload = {
        courseId,
        title: title.trim(),
        description: description.trim() || undefined,
        testType,
        passingScore: Number(passingScore),
        timeLimitMinutes: Number(timeLimitMinutes),
        maxAttempts: Number(maxAttempts),
        status,
        questions: questions.map((q) => ({
          question: q.question.trim(),
          question_type: q.question_type,
          case_vignette: q.case_vignette?.trim() || undefined,
          explanation: q.explanation?.trim() || undefined,
          points: Number(q.points) || 1,
          options: q.options.map((o) => ({
            option_text: o.option_text.trim(),
            is_correct: Boolean(o.is_correct),
          })),
        })),
      };

      const url = quizId
        ? `/api/learn/instructor/quizzes/${quizId}`
        : "/api/learn/instructor/quizzes";
      const method = quizId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save test paper");

      onSaved();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save test");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="flex h-[92vh] w-full max-w-4xl flex-col rounded-3xl border border-[#ded8d1] bg-white shadow-2xl dark:border-[#30363d] dark:bg-[#161b22] overflow-hidden">
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between border-b border-[#ded8d1] p-5 dark:border-[#30363d]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-[#eef5fc] px-2 py-0.5 text-[10px] font-bold text-[#0f4c81] dark:bg-[#1f2937] dark:text-[#58a6ff]">
                Quiz & Clinical Exam Studio
              </span>
            </div>
            <h2 className="text-lg font-black text-[#171717] dark:text-[#f0f6fc]">
              {quizId ? "Edit Test Assessment" : "Build New Clinical Quiz & Exam Paper"}
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

        {/* MODAL BODY */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {errorMsg && (
            <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-3 text-xs font-bold text-red-800 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300">
              <AlertCircle className="size-4 text-red-600 dark:text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 1. TEST CONFIGURATION */}
            <div className="rounded-2xl border border-[#ded8d1] bg-[#fbfaf9] p-4 dark:border-[#30363d] dark:bg-[#0d1117] space-y-3">
              <h3 className="text-xs font-bold text-[#171717] dark:text-[#f0f6fc] flex items-center gap-1.5">
                <GraduationCap className="size-3.5 text-[#0f4c81] dark:text-[#58a6ff]" />
                1. Test Settings & Assessment Parameters
              </h3>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-[#171717] dark:text-[#f0f6fc] mb-1">
                    Course Attachment *
                  </label>
                  <select
                    required
                    value={courseId}
                    onChange={(e) => setCourseId(e.target.value)}
                    className="h-9 w-full rounded-xl border border-[#ded8d1] bg-white px-3 text-xs text-[#171717] dark:border-[#30363d] dark:bg-[#161b22] dark:text-[#f0f6fc]"
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#171717] dark:text-[#f0f6fc] mb-1">
                    Assessment Type
                  </label>
                  <select
                    value={testType}
                    onChange={(e: any) => setTestType(e.target.value)}
                    className="h-9 w-full rounded-xl border border-[#ded8d1] bg-white px-3 text-xs text-[#171717] dark:border-[#30363d] dark:bg-[#161b22] dark:text-[#f0f6fc]"
                  >
                    <option value="quiz">Module Quiz / Practice Test</option>
                    <option value="exam">Final Accreditation Exam</option>
                    <option value="clinical_case_study">Clinical Case Assessment</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#171717] dark:text-[#f0f6fc] mb-1">
                  Test Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. ACL Diagnostic & Physical Examination Assessment"
                  className="h-9 w-full rounded-xl border border-[#ded8d1] bg-white px-3 text-xs text-[#171717] dark:border-[#30363d] dark:bg-[#161b22] dark:text-[#f0f6fc]"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#171717] dark:text-[#f0f6fc] mb-1">
                    Passing Score (%)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={passingScore}
                    onChange={(e) => setPassingScore(Number(e.target.value))}
                    className="h-9 w-full rounded-xl border border-[#ded8d1] bg-white px-3 text-xs text-[#171717] dark:border-[#30363d] dark:bg-[#161b22] dark:text-[#f0f6fc]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#171717] dark:text-[#f0f6fc] mb-1">
                    Time Limit (Mins)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="300"
                    value={timeLimitMinutes}
                    onChange={(e) => setTimeLimitMinutes(Number(e.target.value))}
                    className="h-9 w-full rounded-xl border border-[#ded8d1] bg-white px-3 text-xs text-[#171717] dark:border-[#30363d] dark:bg-[#161b22] dark:text-[#f0f6fc]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#171717] dark:text-[#f0f6fc] mb-1">
                    Max Attempts
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={maxAttempts}
                    onChange={(e) => setMaxAttempts(Number(e.target.value))}
                    className="h-9 w-full rounded-xl border border-[#ded8d1] bg-white px-3 text-xs text-[#171717] dark:border-[#30363d] dark:bg-[#161b22] dark:text-[#f0f6fc]"
                  />
                </div>
              </div>
            </div>

            {/* 2. QUESTIONS BUILDER */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-[#171717] dark:text-[#f0f6fc] flex items-center gap-1.5">
                  <FileQuestion className="size-3.5 text-[#0f4c81] dark:text-[#58a6ff]" />
                  2. Questions & Clinical Case Scenarios ({questions.length})
                </h3>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => handleAddQuestion("single")}
                    className="inline-flex items-center gap-1 rounded-lg border border-[#ded8d1] bg-white px-2.5 py-1 text-[11px] font-bold text-[#171717] hover:bg-[#f0efee] dark:border-[#30363d] dark:bg-[#161b22] dark:text-[#f0f6fc]"
                  >
                    <Plus className="size-3" /> Single MCQ
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAddQuestion("multiple")}
                    className="inline-flex items-center gap-1 rounded-lg border border-[#ded8d1] bg-white px-2.5 py-1 text-[11px] font-bold text-[#171717] hover:bg-[#f0efee] dark:border-[#30363d] dark:bg-[#161b22] dark:text-[#f0f6fc]"
                  >
                    <Plus className="size-3" /> Multi-Select
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAddQuestion("case_study")}
                    className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-[#0f4c81] hover:bg-blue-100 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-300"
                  >
                    <Stethoscope className="size-3" /> Case Scenario
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAddQuestion("subjective")}
                    className="inline-flex items-center gap-1 rounded-lg border border-[#ded8d1] bg-white px-2.5 py-1 text-[11px] font-bold text-[#171717] hover:bg-[#f0efee] dark:border-[#30363d] dark:bg-[#161b22] dark:text-[#f0f6fc]"
                  >
                    <Plus className="size-3" /> Subjective / Short Answer
                  </button>
                </div>
              </div>

              {questions.map((q, qIdx) => (
                <div
                  key={qIdx}
                  className="rounded-2xl border border-[#ded8d1] bg-white p-4 shadow-2xs dark:border-[#30363d] dark:bg-[#161b22] space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-[#f0efee] pb-2 dark:border-[#21262d]">
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-[#0f4c81] px-2 py-0.5 text-[10px] font-bold text-white dark:bg-[#58a6ff] dark:text-black">
                        Q{qIdx + 1}
                      </span>
                      <select
                        value={q.question_type}
                        onChange={(e: any) => handleUpdateQuestion(qIdx, "question_type", e.target.value)}
                        className="h-7 rounded-lg border border-[#ded8d1] bg-white px-2 text-[11px] font-bold text-[#171717] dark:border-[#30363d] dark:bg-[#0d1117] dark:text-[#f0f6fc]"
                      >
                        <option value="single">Single Choice (MCQ)</option>
                        <option value="multiple">Multiple Choice (Multi-Select)</option>
                        <option value="case_study">Clinical Case Scenario</option>
                        <option value="subjective">Subjective / Short Answer</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] font-bold text-[#77716b] dark:text-[#8b949e]">Points:</span>
                        <input
                          type="number"
                          min="1"
                          max="20"
                          value={q.points}
                          onChange={(e) => handleUpdateQuestion(qIdx, "points", Number(e.target.value))}
                          className="h-6 w-12 rounded border border-[#ded8d1] bg-white px-1 text-center text-xs font-bold text-[#171717] dark:border-[#30363d] dark:bg-[#0d1117] dark:text-[#f0f6fc]"
                        />
                      </div>

                      {questions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveQuestion(qIdx)}
                          className="rounded p-1 text-[#77716b] hover:bg-red-50 hover:text-red-600 transition cursor-pointer"
                          title="Delete Question"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Case Vignette Text (for case_study type) */}
                  {q.question_type === "case_study" && (
                    <div>
                      <label className="block text-[11px] font-bold text-blue-900 dark:text-blue-300 mb-1">
                        Clinical Case Vignette / Patient Profile
                      </label>
                      <textarea
                        rows={2}
                        value={q.case_vignette || ""}
                        onChange={(e) => handleUpdateQuestion(qIdx, "case_vignette", e.target.value)}
                        placeholder="A 28-year-old female athlete presents 48 hours post knee twisting injury during a soccer match with acute effusion..."
                        className="w-full rounded-xl border border-blue-200 bg-blue-50/40 p-2.5 text-xs text-[#171717] dark:border-blue-900 dark:bg-blue-950/20 dark:text-[#f0f6fc]"
                      />
                    </div>
                  )}

                  {/* Question Prompt */}
                  <div>
                    <input
                      type="text"
                      required
                      value={q.question}
                      onChange={(e) => handleUpdateQuestion(qIdx, "question", e.target.value)}
                      placeholder="Enter question prompt (e.g. Which clinical test exhibits the highest sensitivity for acute ACL disruption?)"
                      className="h-9 w-full rounded-xl border border-[#ded8d1] bg-white px-3 text-xs font-semibold text-[#171717] focus:border-[#0f4c81] focus:outline-none dark:border-[#30363d] dark:bg-[#0d1117] dark:text-[#f0f6fc]"
                    />
                  </div>

                  {/* Options List */}
                  {q.question_type !== "subjective" && (
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-[#77716b] dark:text-[#8b949e]">
                          Options (Click radio / checkbox to select correct answer)
                        </span>
                        <button
                          type="button"
                          onClick={() => handleAddOption(qIdx)}
                          className="text-[11px] font-bold text-[#0f4c81] hover:underline dark:text-[#58a6ff]"
                        >
                          + Add Option
                        </button>
                      </div>

                      {q.options.map((opt, optIdx) => (
                        <div key={optIdx} className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateOption(qIdx, optIdx, "is_correct", !opt.is_correct)
                            }
                            className={`flex size-6 items-center justify-center rounded-lg border text-xs font-bold transition cursor-pointer ${
                              opt.is_correct
                                ? "border-emerald-600 bg-emerald-600 text-white"
                                : "border-[#ded8d1] bg-white text-[#77716b] hover:border-[#0f4c81] dark:border-[#30363d] dark:bg-[#0d1117]"
                            }`}
                            title={opt.is_correct ? "Correct Choice" : "Mark as Correct"}
                          >
                            {opt.is_correct ? "✓" : ""}
                          </button>

                          <input
                            type="text"
                            required
                            value={opt.option_text}
                            onChange={(e) =>
                              handleUpdateOption(qIdx, optIdx, "option_text", e.target.value)
                            }
                            placeholder={`Option ${optIdx + 1}`}
                            className="h-8 flex-1 rounded-xl border border-[#ded8d1] bg-white px-3 text-xs text-[#171717] dark:border-[#30363d] dark:bg-[#0d1117] dark:text-[#f0f6fc]"
                          />

                          {q.options.length > 2 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveOption(qIdx, optIdx)}
                              className="text-[#77716b] hover:text-red-600 p-1"
                            >
                              <X className="size-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Explanation Field */}
                  <div>
                    <input
                      type="text"
                      value={q.explanation || ""}
                      onChange={(e) => handleUpdateQuestion(qIdx, "explanation", e.target.value)}
                      placeholder="Clinical Explanation / Evidence Rationale (Shown to students post-submission)..."
                      className="h-8 w-full rounded-xl border border-dashed border-[#ded8d1] bg-[#fbfaf9] px-3 text-[11px] text-[#5d5854] dark:border-[#30363d] dark:bg-[#0d1117] dark:text-[#8b949e]"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* MODAL FOOTER */}
            <div className="flex items-center justify-between border-t border-[#ded8d1] pt-4 dark:border-[#30363d]">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-[#ded8d1] px-4 py-2 text-xs font-bold text-[#5d5854] hover:bg-[#f0efee] dark:border-[#30363d] dark:text-[#8b949e]"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#0f4c81] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#0c3c66] transition shadow-xs disabled:opacity-50 cursor-pointer"
              >
                <Save className="size-4" />
                <span>{isSubmitting ? "Saving Assessment..." : "Publish Test Assessment"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
