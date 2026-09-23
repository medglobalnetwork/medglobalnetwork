// app/(app)/research/projects/create/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FlaskConical,
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2,
} from "lucide-react";
import { CreateResearchProjectInput } from "@/modules/research/domain/types";

export default function CreateResearchProjectPage() {
  const router = useRouter();

  const [eligibility, setEligibility] = useState<{ eligible: boolean; reason?: string } | null>(null);
  const [checkingEligibility, setCheckingEligibility] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreateResearchProjectInput>({
    title: "",
    research_area: "Physiotherapy & Biomechanics",
    abstract: "",
    methodology: "",
    research_questions: [""],
    required_skills: ["Clinical Assessment", "Statistical Analysis"],
    ethical_approval_number: "",
    funding_status: "unfunded",
  });

  useEffect(() => {
    fetch("/api/shared/eligibility?type=research")
      .then((r) => r.json())
      .then((d) => setEligibility(d))
      .catch(() => setEligibility({ eligible: false, reason: "Verification check failed." }))
      .finally(() => setCheckingEligibility(false));
  }, []);

  const handleAddQuestion = () => {
    setFormData({
      ...formData,
      research_questions: [...(formData.research_questions || []), ""],
    });
  };

  const handleQuestionChange = (index: number, val: string) => {
    const updated = [...(formData.research_questions || [])];
    updated[index] = val;
    setFormData({ ...formData, research_questions: updated });
  };

  const handleRemoveQuestion = (index: number) => {
    const updated = [...(formData.research_questions || [])];
    updated.splice(index, 1);
    setFormData({ ...formData, research_questions: updated });
  };

  const handleSubmit = async (submitForReview: boolean) => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/research/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          submit_for_review: submitForReview,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create project");
      router.push(`/research/projects/${data.project.id}`);
    } catch (err: any) {
      setError(err.message || "Failed to save project");
    } finally {
      setSubmitting(false);
    }
  };

  if (checkingEligibility) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-purple-700 border-t-transparent" />
        <p className="mt-3 text-xs text-[#5d5854]">Checking investigator eligibility...</p>
      </div>
    );
  }

  if (eligibility && !eligibility.eligible) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
          <ShieldAlert className="h-7 w-7" />
        </div>
        <h2 className="mt-4 text-lg font-bold text-[#171717]">Researcher Verification Required</h2>
        <p className="mt-2 text-xs leading-relaxed text-[#5d5854]">
          {eligibility.reason ||
            "Only verified healthcare professionals, researchers, and accredited institutions can initiate research projects on MedGlobalNetwork."}
        </p>

        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="/verify"
            className="rounded-xl bg-purple-700 px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-purple-800"
          >
            Complete Professional Verification
          </Link>
          <Link
            href="/research"
            className="rounded-xl border border-[#ded8d1] bg-white px-4 py-2.5 text-xs font-semibold text-[#171717]"
          >
            Back to Research
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <Link
          href="/research"
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#5d5854] hover:text-[#171717]"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Research</span>
        </Link>
        <h1 className="mt-2 text-2xl font-black text-[#171717]">Initiate Research Project</h1>
        <p className="text-xs text-[#5d5854]">
          Establish clinical trials, multi-center cohorts, and interdisciplinary healthcare studies.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-800">
          {error}
        </div>
      )}

      <div className="space-y-4 rounded-3xl border border-[#e8e6e3] bg-white p-6 sm:p-8">
        <div>
          <label className="text-xs font-semibold text-[#171717]">Project Title *</label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. Comparative Efficacy of Robotic Gait Training vs Manual Therapy in Post-Stroke Recovery"
            className="mt-1 w-full rounded-xl border border-[#ded8d1] p-3 text-xs focus:outline-none"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-[#171717]">Research Area / Specialty *</label>
          <select
            value={formData.research_area}
            onChange={(e) => setFormData({ ...formData, research_area: e.target.value })}
            className="mt-1 w-full rounded-xl border border-[#ded8d1] p-3 text-xs focus:outline-none"
          >
            <option value="Physiotherapy & Biomechanics">Physiotherapy & Biomechanics</option>
            <option value="Neuro-Rehabilitation">Neuro-Rehabilitation</option>
            <option value="Cardiology & Vascular">Cardiology & Vascular</option>
            <option value="Orthopedics & Sports Medicine">Orthopedics & Sports Medicine</option>
            <option value="Digital Health & AI">Digital Health & AI</option>
            <option value="Epidemiology & Public Health">Epidemiology & Public Health</option>
            <option value="Pharmacology & Therapeutics">Pharmacology & Therapeutics</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-[#171717]">Study Abstract *</label>
          <textarea
            rows={5}
            required
            value={formData.abstract}
            onChange={(e) => setFormData({ ...formData, abstract: e.target.value })}
            placeholder="Summarize the clinical hypothesis, study objectives, and anticipated outcomes..."
            className="mt-1 w-full rounded-xl border border-[#ded8d1] p-3 text-xs focus:outline-none"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-[#171717]">Methodology & Design</label>
          <textarea
            rows={4}
            value={formData.methodology || ""}
            onChange={(e) => setFormData({ ...formData, methodology: e.target.value })}
            placeholder="Study type (RCT, observational, cohort), sample size, inclusion/exclusion criteria..."
            className="mt-1 w-full rounded-xl border border-[#ded8d1] p-3 text-xs focus:outline-none"
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-[#171717]">Key Research Questions</label>
            <button
              type="button"
              onClick={handleAddQuestion}
              className="flex items-center gap-1 text-xs font-bold text-purple-700 hover:underline"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Question</span>
            </button>
          </div>

          <div className="mt-2 space-y-2">
            {formData.research_questions?.map((q, idx) => (
              <div key={idx} className="flex gap-2">
                <input
                  type="text"
                  placeholder={`Question ${idx + 1}`}
                  value={q}
                  onChange={(e) => handleQuestionChange(idx, e.target.value)}
                  className="flex-1 rounded-xl border border-[#ded8d1] p-2.5 text-xs focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveQuestion(idx)}
                  className="p-2 text-rose-500 hover:text-rose-700"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2">
          <div>
            <label className="text-xs font-semibold text-[#171717]">Ethics Approval Reference Number (Optional)</label>
            <input
              type="text"
              value={formData.ethical_approval_number || ""}
              onChange={(e) => setFormData({ ...formData, ethical_approval_number: e.target.value })}
              placeholder="e.g. IEC/2026/894"
              className="mt-1 w-full rounded-xl border border-[#ded8d1] p-2.5 text-xs focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#171717]">Funding Status</label>
            <select
              value={formData.funding_status || "unfunded"}
              onChange={(e) => setFormData({ ...formData, funding_status: e.target.value })}
              className="mt-1 w-full rounded-xl border border-[#ded8d1] p-2.5 text-xs focus:outline-none"
            >
              <option value="unfunded">Self-funded / Institutional</option>
              <option value="grant_funded">Grant Funded (ICMR / DST / International)</option>
              <option value="industry_sponsored">Industry Sponsored</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-6 border-t border-[#f0efee]">
          <button
            type="button"
            disabled={submitting}
            onClick={() => handleSubmit(false)}
            className="rounded-xl border border-[#ded8d1] bg-white px-5 py-2.5 text-xs font-semibold text-[#171717]"
          >
            Save Draft
          </button>

          <button
            type="button"
            disabled={submitting}
            onClick={() => handleSubmit(true)}
            className="rounded-xl bg-purple-700 px-6 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-purple-800 disabled:opacity-50"
          >
            {submitting ? "Initiating Project..." : "Publish & Recruit Collaborators"}
          </button>
        </div>
      </div>
    </div>
  );
}
