"use client";

import * as React from "react";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Briefcase,
  Building2,
  CheckCircle2,
  FileCheck2,
  FileText,
  GraduationCap,
  HelpCircle,
  Loader2,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Upload,
  UserCheck,
  X,
} from "lucide-react";
import { Job } from "../types";

interface ApplicationModalProps {
  job: Job;
  user: any;
  userProfile: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (applicationId: string) => void;
}

export function ApplicationModal({
  job,
  user,
  userProfile,
  isOpen,
  onClose,
  onSuccess,
}: ApplicationModalProps) {
  const [step, setStep] = React.useState<1 | 2 | 3>(1);
  const [resumeType, setResumeType] = React.useState<"profile_generated" | "uploaded">("profile_generated");
  const [resumeUrl, setResumeUrl] = React.useState("");
  const [coverLetter, setCoverLetter] = React.useState("");
  const [answers, setAnswers] = React.useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  if (!isOpen) return null;

  const questions = job.application_questions || [];

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/opportunities/jobs/${job.id}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resume_type: resumeType,
          resume_url: resumeType === "uploaded" ? resumeUrl.trim() : undefined,
          cover_letter: coverLetter.trim() || undefined,
          answers,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit application");
      }

      onSuccess(data.applicationId);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit application");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-[#ded8d1] bg-white shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#ded8d1] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eef5fc] text-[#1769c2]">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#171717] sm:text-base">
                Apply for {job.title}
              </h2>
              <p className="text-xs text-[#77716b]">
                {job.organization?.name} · {job.city || "India"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#77716b] hover:bg-[#f0efee] hover:text-[#171717]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-between border-b border-[#f5f4f3] bg-[#faf9f8] px-6 py-2.5 text-xs font-semibold text-[#77716b]">
          <div className="flex items-center gap-2">
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                step >= 1 ? "bg-[#1769c2] text-white" : "bg-[#ded8d1] text-white"
              }`}
            >
              1
            </span>
            <span className={step === 1 ? "font-bold text-[#1769c2]" : ""}>Profile Credentials</span>
          </div>

          <span className="text-[#ded8d1]">─</span>

          <div className="flex items-center gap-2">
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                step >= 2 ? "bg-[#1769c2] text-white" : "bg-[#ded8d1] text-white"
              }`}
            >
              2
            </span>
            <span className={step === 2 ? "font-bold text-[#1769c2]" : ""}>Resume & CV</span>
          </div>

          <span className="text-[#ded8d1]">─</span>

          <div className="flex items-center gap-2">
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                step >= 3 ? "bg-[#1769c2] text-white" : "bg-[#ded8d1] text-white"
              }`}
            >
              3
            </span>
            <span className={step === 3 ? "font-bold text-[#1769c2]" : ""}>Questions & Submit</span>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {errorMsg && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-600">
              {errorMsg}
            </div>
          )}

          {/* ─────────────────────────────────────────────
              STEP 1: VERIFY MGN CANONICAL IDENTITY
              ───────────────────────────────────────────── */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-[#dbeafe] bg-[#f0f7ff] p-4 text-xs text-[#1e40af]">
                <p className="flex items-center gap-1.5 font-bold">
                  <ShieldCheck className="h-4 w-4 text-[#1769c2]" /> Canonical MGN Professional Identity
                </p>
                <p className="mt-1 leading-relaxed">
                  Your verified medical credentials, primary degrees, and council registration will be automatically transmitted to the hospital hiring board.
                </p>
              </div>

              {/* Candidate Info Card */}
              <div className="rounded-2xl border border-[#ded8d1] bg-white p-4 space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-[#f5f4f3] pb-3">
                  <div>
                    <h3 className="font-bold text-[#171717] text-sm">{user?.name}</h3>
                    <p className="text-[#77716b]">{user?.email}</p>
                  </div>
                  <span className="rounded-full bg-[#ecfdf5] px-2.5 py-0.5 text-[10px] font-bold text-[#047857]">
                    Verified Member
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[#77716b]">Primary Degree</label>
                    <p className="font-semibold text-[#171717]">{userProfile?.primary_degree || "MBBS / BPT / Nursing Graduate"}</p>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[#77716b]">Specialization</label>
                    <p className="font-semibold text-[#171717]">{userProfile?.specialization || "Clinical Practice"}</p>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[#77716b]">Council Registration</label>
                    <p className="font-semibold text-[#171717]">{userProfile?.registration_number || "Verified on file"}</p>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[#77716b]">Clinical Experience</label>
                    <p className="font-semibold text-[#171717]">{userProfile?.experience_years ? `${userProfile.experience_years} Years` : "Early Career / Resident"}</p>
                  </div>
                </div>

                {userProfile?.skills && userProfile.skills.length > 0 && (
                  <div className="border-t border-[#f5f4f3] pt-2">
                    <label className="block text-[10px] font-bold uppercase text-[#77716b] mb-1">Clinical Skills</label>
                    <div className="flex flex-wrap gap-1">
                      {userProfile.skills.map((s: string) => (
                        <span key={s} className="rounded-md bg-[#f0efee] px-2 py-0.5 text-[10px] font-medium text-[#5d5854]">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────
              STEP 2: RESUME SELECTION
              ───────────────────────────────────────────── */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#77716b]">
                Select Your Submission Resume
              </h3>

              {/* Option A: MGN Generated Profile Resume */}
              <div
                onClick={() => setResumeType("profile_generated")}
                className={`cursor-pointer rounded-2xl border p-4 transition ${
                  resumeType === "profile_generated"
                    ? "border-[#1769c2] bg-[#f0f7ff]"
                    : "border-[#ded8d1] bg-white hover:border-[#1769c2]"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1769c2] text-white">
                      <FileCheck2 className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#171717] text-xs sm:text-sm">
                        Auto-Generated MGN Clinical Resume
                      </h4>
                      <p className="text-[11px] text-[#77716b]">
                        Includes verified education, medical council credentials, CME certificates, and publications.
                      </p>
                    </div>
                  </div>
                  <input
                    type="radio"
                    checked={resumeType === "profile_generated"}
                    onChange={() => setResumeType("profile_generated")}
                    className="h-4 w-4 text-[#1769c2]"
                  />
                </div>
              </div>

              {/* Option B: Uploaded / External Resume Link */}
              <div
                onClick={() => setResumeType("uploaded")}
                className={`cursor-pointer rounded-2xl border p-4 transition ${
                  resumeType === "uploaded"
                    ? "border-[#1769c2] bg-[#f0f7ff]"
                    : "border-[#ded8d1] bg-white hover:border-[#1769c2]"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f0efee] text-[#5d5854]">
                      <Upload className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#171717] text-xs sm:text-sm">
                        Upload Custom CV / PDF Link
                      </h4>
                      <p className="text-[11px] text-[#77716b]">
                        Provide a direct link to your hosted PDF resume or portfolio.
                      </p>
                    </div>
                  </div>
                  <input
                    type="radio"
                    checked={resumeType === "uploaded"}
                    onChange={() => setResumeType("uploaded")}
                    className="h-4 w-4 text-[#1769c2]"
                  />
                </div>

                {resumeType === "uploaded" && (
                  <div className="mt-3 border-t border-[#dbeafe] pt-3">
                    <input
                      type="url"
                      value={resumeUrl}
                      onChange={(e) => setResumeUrl(e.target.value)}
                      placeholder="https://drive.google.com/file/... or https://your-cv.pdf"
                      className="h-9 w-full rounded-xl border border-[#ded8d1] bg-white px-3 text-xs text-[#171717] focus:border-[#1769c2] focus:outline-none"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────
              STEP 3: COVER LETTER & SCREENING QUESTIONS
              ───────────────────────────────────────────── */}
          {step === 3 && (
            <div className="space-y-4">
              {/* Screening Questions (if required by employer) */}
              {questions.length > 0 && (
                <div className="space-y-3 rounded-2xl border border-[#ded8d1] bg-[#faf9f8] p-4">
                  <h3 className="text-xs font-bold text-[#171717] flex items-center gap-1.5">
                    <HelpCircle className="h-3.5 w-3.5 text-[#1769c2]" /> Employer Screening Questions
                  </h3>

                  {questions.map((q, i) => (
                    <div key={q.id || i} className="space-y-1">
                      <label className="block text-xs font-semibold text-[#171717]">
                        {q.question} {q.required && <span className="text-red-500">*</span>}
                      </label>
                      <input
                        type="text"
                        required={q.required}
                        value={answers[q.id] || ""}
                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                        placeholder="Your response..."
                        className="h-9 w-full rounded-xl border border-[#ded8d1] bg-white px-3 text-xs text-[#171717] focus:border-[#1769c2] focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Cover Letter */}
              <div>
                <label className="block text-xs font-bold text-[#171717] mb-1">
                  Optional Note to Hiring Committee
                </label>
                <textarea
                  rows={4}
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Share any specific clinical rotations, research experience, or immediate availability..."
                  className="w-full rounded-xl border border-[#ded8d1] p-3 text-xs text-[#171717] focus:border-[#1769c2] focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-between border-t border-[#ded8d1] bg-[#faf9f8] px-6 py-4">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((prev) => (prev - 1) as any)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#ded8d1] bg-white px-4 py-2 text-xs font-semibold text-[#5d5854] hover:bg-[#f0efee]"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[#ded8d1] bg-white px-4 py-2 text-xs font-semibold text-[#5d5854] hover:bg-[#f0efee]"
            >
              Cancel
            </button>
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep((prev) => (prev + 1) as any)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#1769c2] px-5 py-2 text-xs font-bold text-white shadow-2xs hover:bg-[#12569f]"
            >
              Next Step <ArrowRight className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmit}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#15803d] px-6 py-2.5 text-xs font-bold text-white shadow-2xs hover:bg-[#166534] disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Submitting...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" /> Submit Application
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
