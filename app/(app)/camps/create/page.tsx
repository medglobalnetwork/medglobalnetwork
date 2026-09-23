// app/(app)/camps/create/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Tent,
  Plus,
  Trash2,
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import { CreateCampInput, CampType } from "@/modules/camps/domain/types";

const COMMON_SERVICES = [
  "General Physician Consultation",
  "Physiotherapy & Musculoskeletal Assessment",
  "Blood Pressure & Vitals Screening",
  "Blood Sugar / Glucose Testing",
  "Eye & Vision Screening",
  "Dental Examination",
  "Pediatric Growth Monitoring",
  "Rehabilitation & Posture Check",
  "Free Essential Medicine Distribution",
];

export default function CreateCampPage() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [eligibility, setEligibility] = useState<{ eligible: boolean; reason?: string } | null>(null);
  const [checkingEligibility, setCheckingEligibility] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreateCampInput>({
    title: "",
    camp_type: "health_screening",
    description: "",
    cover_url: "",
    start_date: "",
    end_date: "",
    venue_name: "",
    address: "",
    city: "",
    state: "",
    country: "India",
    target_population: "Local community & senior citizens",
    expected_beneficiaries: 100,
    participant_capacity: undefined,
    services: ["Blood Pressure & Vitals Screening", "Physiotherapy & Musculoskeletal Assessment"],
    guidelines: "",
    certificate_enabled: true,
    required_roles: [
      { role_title: "Physiotherapist", is_professional: true, slots_needed: 3, description: "Posture and musculoskeletal assessment" },
      { role_title: "Doctor / General Physician", is_professional: true, slots_needed: 2, description: "General clinical examination" },
      { role_title: "General Volunteer", is_professional: false, slots_needed: 4, description: "Registration and patient guidance" },
    ],
  });

  useEffect(() => {
    fetch("/api/shared/eligibility?type=camp")
      .then((r) => r.json())
      .then((d) => setEligibility(d))
      .catch(() => setEligibility({ eligible: false, reason: "Verification check failed." }))
      .finally(() => setCheckingEligibility(false));
  }, []);

  const handleToggleService = (service: string) => {
    if (formData.services.includes(service)) {
      setFormData({ ...formData, services: formData.services.filter((s) => s !== service) });
    } else {
      setFormData({ ...formData, services: [...formData.services, service] });
    }
  };

  const handleAddRole = () => {
    setFormData({
      ...formData,
      required_roles: [
        ...(formData.required_roles || []),
        { role_title: "", is_professional: true, slots_needed: 1, description: "" },
      ],
    });
  };

  const handleRemoveRole = (index: number) => {
    const updated = [...(formData.required_roles || [])];
    updated.splice(index, 1);
    setFormData({ ...formData, required_roles: updated });
  };

  const handleRoleChange = (index: number, field: string, value: any) => {
    const updated = [...(formData.required_roles || [])];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, required_roles: updated });
  };

  const handleSubmit = async (submitForReview: boolean) => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/camps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          submit_for_review: submitForReview,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create medical camp");
      router.push(`/camps/${data.camp.id}`);
    } catch (err: any) {
      setError(err.message || "Failed to organize camp");
    } finally {
      setSubmitting(false);
    }
  };

  if (checkingEligibility) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-emerald-700 border-t-transparent" />
        <p className="mt-3 text-xs text-[#5d5854]">Checking organizer eligibility...</p>
      </div>
    );
  }

  if (eligibility && !eligibility.eligible) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
          <ShieldAlert className="h-7 w-7" />
        </div>
        <h2 className="mt-4 text-lg font-bold text-[#171717]">Healthcare Organizer Verification Required</h2>
        <p className="mt-2 text-xs leading-relaxed text-[#5d5854]">
          {eligibility.reason ||
            "To safeguard public health, only verified healthcare professionals and verified healthcare organizations (hospitals, clinics, NGOs, colleges) can organize medical camps."}
        </p>

        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="/verify"
            className="rounded-xl bg-emerald-700 px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-800"
          >
            Complete Professional Verification
          </Link>
          <Link
            href="/camps"
            className="rounded-xl border border-[#ded8d1] bg-white px-4 py-2.5 text-xs font-semibold text-[#171717]"
          >
            Back to Camps
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <Link
          href="/camps"
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#5d5854] hover:text-[#171717]"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Camps</span>
        </Link>
        <h1 className="mt-2 text-2xl font-black text-[#171717]">Organize a Medical Camp</h1>
        <p className="text-xs text-[#5d5854]">
          Coordinate outreach camps, recruit verified professional volunteers, and track clinical impact.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-800">
          {error}
        </div>
      )}

      {/* Progress Steps */}
      <div className="mb-8 flex items-center justify-between border-b border-[#e8e6e3] pb-4">
        {[
          { num: 1, label: "Camp Overview" },
          { num: 2, label: "Services Delivered" },
          { num: 3, label: "Volunteer Roles" },
          { num: 4, label: "Review & Publish" },
        ].map((s) => (
          <button
            key={s.num}
            type="button"
            onClick={() => setStep(s.num)}
            className={`flex items-center gap-2 text-xs font-bold ${
              step === s.num ? "text-emerald-700" : step > s.num ? "text-emerald-800" : "text-[#77716b]"
            }`}
          >
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] ${
                step === s.num
                  ? "bg-emerald-700 text-white"
                  : step > s.num
                  ? "bg-emerald-800 text-white"
                  : "bg-[#f0efee] text-[#77716b]"
              }`}
            >
              {step > s.num ? "✓" : s.num}
            </span>
            <span className="hidden sm:inline">{s.label}</span>
          </button>
        ))}
      </div>

      {/* Step 1: Camp Overview & Venue */}
      {step === 1 && (
        <div className="space-y-4 rounded-3xl border border-[#e8e6e3] bg-white p-6">
          <h2 className="text-sm font-bold text-[#171717]">Step 1: Camp Focus & Venue</h2>

          <div>
            <label className="text-xs font-semibold text-[#171717]">Camp Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Free Community Health & Physiotherapy Screening Camp"
              className="mt-1 w-full rounded-xl border border-[#ded8d1] p-3 text-xs focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-[#171717]">Camp Type *</label>
              <select
                value={formData.camp_type}
                onChange={(e) => setFormData({ ...formData, camp_type: e.target.value as CampType })}
                className="mt-1 w-full rounded-xl border border-[#ded8d1] p-3 text-xs focus:outline-none"
              >
                <option value="health_screening">Health Screening Camp</option>
                <option value="physiotherapy">Physiotherapy & Rehab Camp</option>
                <option value="rehabilitation">Rehabilitation Camp</option>
                <option value="rural_health">Rural Health Outreach</option>
                <option value="awareness">Preventive Health & Awareness</option>
                <option value="blood_donation">Blood Donation Camp</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#171717]">Target Population</label>
              <input
                type="text"
                value={formData.target_population || ""}
                onChange={(e) => setFormData({ ...formData, target_population: e.target.value })}
                placeholder="e.g. Elderly & rural residents"
                className="mt-1 w-full rounded-xl border border-[#ded8d1] p-3 text-xs focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-[#171717]">Start Date & Time *</label>
              <input
                type="datetime-local"
                required
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="mt-1 w-full rounded-xl border border-[#ded8d1] p-3 text-xs focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#171717]">End Date & Time *</label>
              <input
                type="datetime-local"
                required
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="mt-1 w-full rounded-xl border border-[#ded8d1] p-3 text-xs focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-3 rounded-2xl border border-[#f0efee] bg-[#fcfbfa] p-4">
            <h3 className="text-xs font-bold text-[#171717]">Physical Venue Location</h3>
            <div>
              <label className="text-xs font-semibold text-[#171717]">Venue / Community Center Name *</label>
              <input
                type="text"
                required
                value={formData.venue_name}
                onChange={(e) => setFormData({ ...formData, venue_name: e.target.value })}
                placeholder="e.g. Community Hall, Ward 12"
                className="mt-1 w-full rounded-xl border border-[#ded8d1] bg-white p-2.5 text-xs focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[#171717]">Address *</label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Street / Landmark"
                  className="mt-1 w-full rounded-xl border border-[#ded8d1] bg-white p-2.5 text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#171717]">City *</label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="e.g. Indore"
                  className="mt-1 w-full rounded-xl border border-[#ded8d1] bg-white p-2.5 text-xs focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#171717]">Description & Clinical Purpose *</label>
            <textarea
              rows={4}
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Outline the camp mission, screening goals, and patient care workflow..."
              className="mt-1 w-full rounded-xl border border-[#ded8d1] p-3 text-xs focus:outline-none"
            />
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="flex items-center gap-1 rounded-xl bg-emerald-700 px-6 py-2.5 text-xs font-semibold text-white hover:bg-emerald-800"
            >
              <span>Next: Services Offered</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Services */}
      {step === 2 && (
        <div className="space-y-4 rounded-3xl border border-[#e8e6e3] bg-white p-6">
          <h2 className="text-sm font-bold text-[#171717]">Step 2: Healthcare Services Delivered</h2>
          <p className="text-xs text-[#5d5854]">
            Select all clinical screening tests and patient care services that will be provided.
          </p>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {COMMON_SERVICES.map((srv) => {
              const selected = formData.services.includes(srv);
              return (
                <button
                  key={srv}
                  type="button"
                  onClick={() => handleToggleService(srv)}
                  className={`flex items-center gap-2 rounded-xl border p-3 text-left text-xs font-semibold transition ${
                    selected
                      ? "border-emerald-700 bg-emerald-50 text-emerald-900"
                      : "border-[#ded8d1] text-[#5d5854] hover:bg-[#f8f7f6]"
                  }`}
                >
                  <div
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                      selected ? "border-emerald-700 bg-emerald-700 text-white" : "border-[#ded8d1]"
                    }`}
                  >
                    {selected && "✓"}
                  </div>
                  <span>{srv}</span>
                </button>
              );
            })}
          </div>

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="rounded-xl border border-[#ded8d1] px-5 py-2.5 text-xs font-semibold text-[#5d5854]"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="flex items-center gap-1 rounded-xl bg-emerald-700 px-6 py-2.5 text-xs font-semibold text-white hover:bg-emerald-800"
            >
              <span>Next: Volunteer Slots</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Volunteer Roles */}
      {step === 3 && (
        <div className="space-y-4 rounded-3xl border border-[#e8e6e3] bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[#171717]">Step 3: Required Professionals & Volunteer Slots</h2>
              <p className="text-xs text-[#5d5854]">
                Define how many verified doctors, physiotherapists, and general volunteers are needed.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddRole}
              className="flex items-center gap-1 text-xs font-bold text-emerald-700 hover:underline"
            >
              <Plus className="h-4 w-4" />
              <span>Add Role</span>
            </button>
          </div>

          <div className="space-y-3">
            {formData.required_roles?.map((role, idx) => (
              <div key={idx} className="flex gap-2 rounded-2xl border border-[#ded8d1] bg-[#fcfbfa] p-3">
                <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-3">
                  <input
                    type="text"
                    placeholder="Role Title (e.g. Physiotherapist) *"
                    value={role.role_title}
                    onChange={(e) => handleRoleChange(idx, "role_title", e.target.value)}
                    className="rounded-lg border border-[#ded8d1] bg-white p-2 text-xs"
                  />
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-[#77716b]">Slots:</label>
                    <input
                      type="number"
                      min="1"
                      value={role.slots_needed}
                      onChange={(e) => handleRoleChange(idx, "slots_needed", parseInt(e.target.value, 10) || 1)}
                      className="w-20 rounded-lg border border-[#ded8d1] bg-white p-2 text-xs"
                    />
                  </div>
                  <label className="flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={role.is_professional}
                      onChange={(e) => handleRoleChange(idx, "is_professional", e.target.checked)}
                    />
                    <span className="font-semibold">Requires Verified Healthcare Professional</span>
                  </label>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveRole(idx)}
                  className="p-1 text-rose-500 hover:text-rose-700"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="rounded-xl border border-[#ded8d1] px-5 py-2.5 text-xs font-semibold text-[#5d5854]"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setStep(4)}
              className="flex items-center gap-1 rounded-xl bg-emerald-700 px-6 py-2.5 text-xs font-semibold text-white hover:bg-emerald-800"
            >
              <span>Next: Review & Submit</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Review & Submit */}
      {step === 4 && (
        <div className="space-y-4 rounded-3xl border border-[#e8e6e3] bg-white p-6">
          <h2 className="text-sm font-bold text-[#171717]">Step 4: Certificate Settings & Submission</h2>

          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
            <label className="flex items-start gap-2.5 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={formData.certificate_enabled}
                onChange={(e) => setFormData({ ...formData, certificate_enabled: e.target.checked })}
                className="mt-0.5"
              />
              <div>
                <span className="font-bold text-[#171717]">Enable Verified Healthcare Service Certificates</span>
                <p className="text-[11px] text-[#5d5854]">
                  Volunteers who attend and serve at this camp will receive verifiable digital certificates.
                </p>
              </div>
            </label>
          </div>

          <div className="rounded-2xl border border-[#f0efee] bg-[#fcfbfa] p-4 text-xs space-y-1.5">
            <p className="font-bold text-[#171717]">Camp Summary:</p>
            <p className="text-[#5d5854]"><span className="font-semibold">Title:</span> {formData.title}</p>
            <p className="text-[#5d5854]"><span className="font-semibold">Venue:</span> {formData.venue_name}, {formData.city}</p>
            <p className="text-[#5d5854]"><span className="font-semibold">Services:</span> {formData.services.join(", ")}</p>
          </div>

          <div className="flex justify-between pt-6 border-t border-[#f0efee]">
            <button
              type="button"
              onClick={() => setStep(3)}
              className="rounded-xl border border-[#ded8d1] px-5 py-2.5 text-xs font-semibold text-[#5d5854]"
            >
              Back
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleSubmit(false)}
                className="rounded-xl border border-[#ded8d1] bg-white px-4 py-2.5 text-xs font-semibold text-[#171717]"
              >
                Save Draft
              </button>

              <button
                type="button"
                disabled={submitting}
                onClick={() => handleSubmit(true)}
                className="rounded-xl bg-emerald-700 px-6 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-800 disabled:opacity-50"
              >
                {submitting ? "Publishing..." : "Publish Medical Camp"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
