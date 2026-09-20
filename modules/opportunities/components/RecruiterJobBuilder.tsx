"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Building2,
  Check,
  CheckCircle2,
  IndianRupee,
  Layers,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import { CreateJobInput, Organization } from "../types";

interface RecruiterJobBuilderProps {
  organizations: Organization[];
}

export function RecruiterJobBuilder({ organizations }: RecruiterJobBuilderProps) {
  const router = useRouter();
  const [step, setStep] = React.useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  // Form State
  const [selectedOrgId, setSelectedOrgId] = React.useState(organizations[0]?.id || "");
  const [title, setTitle] = React.useState("");
  const [opportunityType, setOpportunityType] = React.useState<any>("job");
  const [employmentType, setEmploymentType] = React.useState<any>("full_time");
  const [workMode, setWorkMode] = React.useState<any>("onsite");
  const [city, setCity] = React.useState("Raipur");
  const [state, setState] = React.useState("Chhattisgarh");
  const [location, setLocation] = React.useState("");
  const [salaryMin, setSalaryMin] = React.useState(600000);
  const [salaryMax, setSalaryMax] = React.useState(1000000);
  const [salaryPeriod, setSalaryPeriod] = React.useState<any>("yearly");
  const [isSalaryVisible, setIsSalaryVisible] = React.useState(true);
  const [profession, setProfession] = React.useState("Physiotherapist");
  const [specialization, setSpecialization] = React.useState("Sports Rehabilitation");
  const [experienceMin, setExperienceMin] = React.useState(1);
  const [experienceMax, setExperienceMax] = React.useState(4);
  const [description, setDescription] = React.useState("");
  const [responsibilities, setResponsibilities] = React.useState("");
  const [requirements, setRequirements] = React.useState("");
  const [skillsInput, setSkillsInput] = React.useState("");
  const [benefitsInput, setBenefitsInput] = React.useState("");
  const [questions, setQuestions] = React.useState<{ id: string; question: string; required: boolean }[]>([]);
  const [newQuestionText, setNewQuestionText] = React.useState("");

  const handleAddQuestion = () => {
    if (!newQuestionText.trim()) return;
    setQuestions((prev) => [
      ...prev,
      { id: `q_${Date.now()}`, question: newQuestionText.trim(), required: true },
    ]);
    setNewQuestionText("");
  };

  const handleRemoveQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim() || !selectedOrgId) {
      setErrorMsg("Please fill all required fields");
      return;
    }
    setIsSubmitting(true);
    setErrorMsg(null);

    const skills = skillsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const benefits = benefitsInput
      .split("\n")
      .map((b) => b.trim())
      .filter(Boolean);

    const payload: CreateJobInput = {
      organization_id: selectedOrgId,
      title: title.trim(),
      opportunity_type: opportunityType,
      employment_type: employmentType,
      work_mode: workMode,
      city: city.trim(),
      state: state.trim(),
      location: location.trim() || undefined,
      salary_min: Number(salaryMin),
      salary_max: Number(salaryMax),
      salary_period: salaryPeriod,
      is_salary_visible: isSalaryVisible,
      profession,
      specialization,
      experience_min: Number(experienceMin),
      experience_max: Number(experienceMax),
      description: description.trim(),
      responsibilities: responsibilities.trim() || undefined,
      requirements: requirements.trim() || undefined,
      skills,
      benefits,
      application_questions: questions as any,
      status: "published",
    };

    try {
      const res = await fetch("/api/opportunities/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to publish job");

      router.push(`/opportunities/jobs/${data.slug || data.jobId}`);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to create job");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#ded8d1] pb-4">
        <div>
          <h1 className="text-xl font-bold text-[#171717]">Recruiter Opportunity Studio</h1>
          <p className="text-xs text-[#77716b]">
            Publish clinical openings, internships, and fellowships to verified healthcare peers
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-bold">
          <span className={`flex h-6 w-6 items-center justify-center rounded-full ${step === 1 ? "bg-[#1769c2] text-white" : "bg-[#eef5fc] text-[#1769c2]"}`}>
            1
          </span>
          <span className="text-[#ded8d1]">─</span>
          <span className={`flex h-6 w-6 items-center justify-center rounded-full ${step === 2 ? "bg-[#1769c2] text-white" : "bg-[#f0efee] text-[#77716b]"}`}>
            2
          </span>
          <span className="text-[#ded8d1]">─</span>
          <span className={`flex h-6 w-6 items-center justify-center rounded-full ${step === 3 ? "bg-[#1769c2] text-white" : "bg-[#f0efee] text-[#77716b]"}`}>
            3
          </span>
        </div>
      </div>

      {errorMsg && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-xs text-red-600">
          {errorMsg}
        </div>
      )}

      {/* ─────────────────────────────────────────────
          STEP 1: BASIC ROLE INFO
          ───────────────────────────────────────────── */}
      {step === 1 && (
        <div className="space-y-4 rounded-3xl border border-[#ded8d1] bg-white p-6 shadow-xs">
          <h2 className="text-sm font-bold text-[#171717]">Step 1: Role Overview & Hospital Profile</h2>

          <div>
            <label className="block text-xs font-bold text-[#171717] mb-1">
              Hiring Organization / Hospital *
            </label>
            <select
              value={selectedOrgId}
              onChange={(e) => setSelectedOrgId(e.target.value)}
              className="h-10 w-full rounded-xl border border-[#ded8d1] bg-white px-3 text-xs text-[#171717]"
            >
              {organizations.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name} ({o.organization_type})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#171717] mb-1">
              Opportunity Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Senior Sports Physiotherapist (Outpatient Rehab)"
              className="h-10 w-full rounded-xl border border-[#ded8d1] px-3.5 text-xs text-[#171717] focus:border-[#1769c2] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-bold text-[#171717] mb-1">Category Type</label>
              <select
                value={opportunityType}
                onChange={(e) => setOpportunityType(e.target.value)}
                className="h-10 w-full rounded-xl border border-[#ded8d1] bg-white px-3 text-xs"
              >
                <option value="job">Full Job Opening</option>
                <option value="clinical_internship">Clinical Internship</option>
                <option value="research_internship">Research Internship</option>
                <option value="fellowship">Clinical Fellowship</option>
                <option value="observership">Observership</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#171717] mb-1">Schedule</label>
              <select
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value)}
                className="h-10 w-full rounded-xl border border-[#ded8d1] bg-white px-3 text-xs"
              >
                <option value="full_time">Full Time</option>
                <option value="part_time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
                <option value="fellowship">Fellowship</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#171717] mb-1">Work Mode</label>
              <select
                value={workMode}
                onChange={(e) => setWorkMode(e.target.value)}
                className="h-10 w-full rounded-xl border border-[#ded8d1] bg-white px-3 text-xs"
              >
                <option value="onsite">On-site</option>
                <option value="hybrid">Hybrid</option>
                <option value="remote">Remote</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-[#171717] mb-1">Profession</label>
              <select
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                className="h-10 w-full rounded-xl border border-[#ded8d1] bg-white px-3 text-xs"
              >
                <option value="Physiotherapist">Physiotherapist</option>
                <option value="Doctor">Doctor / Physician</option>
                <option value="Surgeon">Surgeon</option>
                <option value="Nurse">Nurse</option>
                <option value="Researcher">Researcher</option>
                <option value="Pharmacist">Pharmacist</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#171717] mb-1">Specialization</label>
              <input
                type="text"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                placeholder="e.g. Sports Rehabilitation / Cardiology"
                className="h-10 w-full rounded-xl border border-[#ded8d1] px-3.5 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-[#171717] mb-1">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Raipur / Bengaluru"
                className="h-10 w-full rounded-xl border border-[#ded8d1] px-3.5 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#171717] mb-1">Specific Campus Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Apollo Medical Campus, Sector 4"
                className="h-10 w-full rounded-xl border border-[#ded8d1] px-3.5 text-xs"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={() => {
                if (!title.trim()) {
                  setErrorMsg("Please provide opportunity title");
                  return;
                }
                setErrorMsg(null);
                setStep(2);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#1769c2] px-6 py-2.5 text-xs font-bold text-white shadow-2xs hover:bg-[#12569f]"
            >
              Next: Clinical Scope & Salary <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────
          STEP 2: CLINICAL SCOPE, REQUIREMENTS & SALARY
          ───────────────────────────────────────────── */}
      {step === 2 && (
        <div className="space-y-4 rounded-3xl border border-[#ded8d1] bg-white p-6 shadow-xs">
          <h2 className="text-sm font-bold text-[#171717]">Step 2: Compensation, Clinical Scope & Skills</h2>

          {/* Salary Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-bold text-[#171717] mb-1">Min Salary (INR)</label>
              <input
                type="number"
                value={salaryMin}
                onChange={(e) => setSalaryMin(Number(e.target.value))}
                className="h-10 w-full rounded-xl border border-[#ded8d1] px-3 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#171717] mb-1">Max Salary (INR)</label>
              <input
                type="number"
                value={salaryMax}
                onChange={(e) => setSalaryMax(Number(e.target.value))}
                className="h-10 w-full rounded-xl border border-[#ded8d1] px-3 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#171717] mb-1">Frequency</label>
              <select
                value={salaryPeriod}
                onChange={(e) => setSalaryPeriod(e.target.value)}
                className="h-10 w-full rounded-xl border border-[#ded8d1] bg-white px-3 text-xs"
              >
                <option value="yearly">Yearly (LPA)</option>
                <option value="monthly">Monthly Stipend</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#171717] mb-1">Detailed Description *</label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Outline the department overview, patient volume, surgical/rehabilitation procedures..."
              className="w-full rounded-xl border border-[#ded8d1] p-3 text-xs text-[#171717]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#171717] mb-1">Clinical Responsibilities</label>
            <textarea
              rows={3}
              value={responsibilities}
              onChange={(e) => setResponsibilities(e.target.value)}
              placeholder="• Lead daily clinical assessments...\n• Perform manual therapy protocols..."
              className="w-full rounded-xl border border-[#ded8d1] p-3 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#171717] mb-1">Requirements & Degrees</label>
            <textarea
              rows={3}
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              placeholder="• BPT/MPT or MBBS with state medical council registration...\n• 2+ years clinical experience..."
              className="w-full rounded-xl border border-[#ded8d1] p-3 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#171717] mb-1">Skills (Comma separated)</label>
            <input
              type="text"
              value={skillsInput}
              onChange={(e) => setSkillsInput(e.target.value)}
              placeholder="Manual Therapy, ACL Rehabilitation, Dry Needling, Gait Analysis"
              className="h-10 w-full rounded-xl border border-[#ded8d1] px-3.5 text-xs"
            />
          </div>

          <div className="flex justify-between pt-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#ded8d1] bg-white px-4 py-2 text-xs font-semibold text-[#5d5854]"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </button>
            <button
              type="button"
              onClick={() => {
                if (!description.trim()) {
                  setErrorMsg("Please provide opportunity description");
                  return;
                }
                setErrorMsg(null);
                setStep(3);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#1769c2] px-6 py-2.5 text-xs font-bold text-white shadow-2xs hover:bg-[#12569f]"
            >
              Next: Screening Questions & Publish <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────
          STEP 3: SCREENING QUESTIONS & SUBMIT
          ───────────────────────────────────────────── */}
      {step === 3 && (
        <div className="space-y-4 rounded-3xl border border-[#ded8d1] bg-white p-6 shadow-xs">
          <h2 className="text-sm font-bold text-[#171717]">Step 3: Screening Questions & Final Review</h2>

          <div className="space-y-3 rounded-2xl border border-[#ded8d1] bg-[#faf9f8] p-4">
            <h3 className="text-xs font-bold text-[#171717]">Add Custom Screening Questions</h3>
            
            <div className="flex gap-2">
              <input
                type="text"
                value={newQuestionText}
                onChange={(e) => setNewQuestionText(e.target.value)}
                placeholder="e.g. Are you registered with State Physiotherapy Council?"
                className="h-10 flex-1 rounded-xl border border-[#ded8d1] bg-white px-3 text-xs"
              />
              <button
                type="button"
                onClick={handleAddQuestion}
                className="inline-flex items-center gap-1 rounded-xl bg-[#1769c2] px-4 text-xs font-bold text-white hover:bg-[#12569f]"
              >
                <Plus className="h-3.5 w-3.5" /> Add
              </button>
            </div>

            {questions.length > 0 && (
              <div className="space-y-2 pt-2">
                {questions.map((q, i) => (
                  <div key={q.id} className="flex items-center justify-between rounded-xl bg-white p-3 border border-[#ded8d1] text-xs">
                    <span>{i + 1}. {q.question}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveQuestion(q.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-[#171717] mb-1">
              Benefits & Offerings (One per line)
            </label>
            <textarea
              rows={3}
              value={benefitsInput}
              onChange={(e) => setBenefitsInput(e.target.value)}
              placeholder="Health Insurance\nCME Conference Allowance\nAnnual Bonus"
              className="w-full rounded-xl border border-[#ded8d1] p-3 text-xs"
            />
          </div>

          <div className="flex justify-between pt-4 border-t border-[#f5f4f3]">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#ded8d1] bg-white px-4 py-2 text-xs font-semibold text-[#5d5854]"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmit}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#15803d] px-7 py-2.5 text-xs font-bold text-white shadow-2xs hover:bg-[#166534] disabled:opacity-50"
            >
              {isSubmitting ? "Publishing Opening..." : (
                <>
                  <CheckCircle2 className="h-4 w-4" /> Publish to MGN Opportunities
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
