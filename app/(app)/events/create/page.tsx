// app/(app)/events/create/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  Plus,
  Trash2,
  Award,
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import { CreateEventInput, EventType, EventFormat } from "@/modules/events/domain/types";

export default function CreateEventPage() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [eligibility, setEligibility] = useState<{ eligible: boolean; reason?: string } | null>(null);
  const [checkingEligibility, setCheckingEligibility] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreateEventInput>({
    title: "",
    event_type: "conference",
    category: "General Healthcare",
    short_description: "",
    description: "",
    cover_url: "",
    start_time: "",
    end_time: "",
    timezone: "Asia/Kolkata",
    format: "online",
    venue_name: "",
    address: "",
    city: "",
    state: "",
    country: "India",
    online_meeting_url: "",
    online_meeting_platform: "Zoom",
    is_free: true,
    price: 0,
    currency: "INR",
    capacity: undefined,
    cme_credits: 0,
    cme_accreditation_body: "",
    certificate_enabled: true,
    requirements: [],
    tags: [],
    speakers: [],
    agenda: [],
  });

  useEffect(() => {
    fetch("/api/shared/eligibility?type=event")
      .then((r) => r.json())
      .then((d) => setEligibility(d))
      .catch(() => setEligibility({ eligible: false, reason: "Verification check failed." }))
      .finally(() => setCheckingEligibility(false));
  }, []);

  const handleAddSpeaker = () => {
    setFormData({
      ...formData,
      speakers: [
        ...(formData.speakers || []),
        { name: "", title: "", organization: "", topic: "", bio: "" },
      ],
    });
  };

  const handleRemoveSpeaker = (index: number) => {
    const updated = [...(formData.speakers || [])];
    updated.splice(index, 1);
    setFormData({ ...formData, speakers: updated });
  };

  const handleSpeakerChange = (index: number, field: string, value: string) => {
    const updated = [...(formData.speakers || [])];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, speakers: updated });
  };

  const handleAddAgenda = () => {
    setFormData({
      ...formData,
      agenda: [
        ...(formData.agenda || []),
        {
          title: "",
          speaker_name: "",
          start_time: formData.start_time || new Date().toISOString(),
          end_time: formData.end_time || new Date().toISOString(),
          description: "",
        },
      ],
    });
  };

  const handleRemoveAgenda = (index: number) => {
    const updated = [...(formData.agenda || [])];
    updated.splice(index, 1);
    setFormData({ ...formData, agenda: updated });
  };

  const handleAgendaChange = (index: number, field: string, value: string) => {
    const updated = [...(formData.agenda || [])];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, agenda: updated });
  };

  const handleSubmit = async (submitForReview: boolean) => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          submit_for_review: submitForReview,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create event");
      router.push(`/events/${data.event.id}`);
    } catch (err: any) {
      setError(err.message || "Failed to save event");
    } finally {
      setSubmitting(false);
    }
  };

  if (checkingEligibility) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-[#1769c2] border-t-transparent" />
        <p className="mt-3 text-xs text-[#5d5854]">Verifying organizer credentials...</p>
      </div>
    );
  }

  if (eligibility && !eligibility.eligible) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
          <ShieldAlert className="h-7 w-7" />
        </div>
        <h2 className="mt-4 text-lg font-bold text-[#171717]">Organizer Verification Required</h2>
        <p className="mt-2 text-xs leading-relaxed text-[#5d5854]">
          {eligibility.reason ||
            "To maintain high clinical quality on MedGlobalNetwork, only verified healthcare professionals and accredited organizations can create public events and CME workshops."}
        </p>

        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="/verify"
            className="rounded-xl bg-[#1769c2] px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#145ca8]"
          >
            Complete Professional Verification
          </Link>
          <Link
            href="/events"
            className="rounded-xl border border-[#ded8d1] bg-white px-4 py-2.5 text-xs font-semibold text-[#171717]"
          >
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/events"
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#5d5854] hover:text-[#171717]"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Events</span>
        </Link>
        <h1 className="mt-2 text-2xl font-black text-[#171717]">Organize Healthcare Event</h1>
        <p className="text-xs text-[#5d5854]">
          Publish CME conferences, clinical workshops, and academic webinars.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-800">
          {error}
        </div>
      )}

      {/* Progress Steps Bar */}
      <div className="mb-8 flex items-center justify-between border-b border-[#e8e6e3] pb-4">
        {[
          { num: 1, label: "Basic Information" },
          { num: 2, label: "Schedule & Venue" },
          { num: 3, label: "Speakers & Agenda" },
          { num: 4, label: "Ticketing & Certs" },
        ].map((s) => (
          <button
            key={s.num}
            type="button"
            onClick={() => setStep(s.num)}
            className={`flex items-center gap-2 text-xs font-bold ${
              step === s.num ? "text-[#1769c2]" : step > s.num ? "text-emerald-700" : "text-[#77716b]"
            }`}
          >
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] ${
                step === s.num
                  ? "bg-[#1769c2] text-white"
                  : step > s.num
                  ? "bg-emerald-600 text-white"
                  : "bg-[#f0efee] text-[#77716b]"
              }`}
            >
              {step > s.num ? "✓" : s.num}
            </span>
            <span className="hidden sm:inline">{s.label}</span>
          </button>
        ))}
      </div>

      {/* Step 1: Basic Information */}
      {step === 1 && (
        <div className="space-y-4 rounded-3xl border border-[#e8e6e3] bg-white p-6">
          <h2 className="text-sm font-bold text-[#171717]">Step 1: Event Fundamentals</h2>

          <div>
            <label className="text-xs font-semibold text-[#171717]">Event Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. 5th Annual Sports Rehabilitation & Ortho CME Conference"
              className="mt-1 w-full rounded-xl border border-[#ded8d1] p-3 text-xs focus:border-[#1769c2] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-[#171717]">Event Type *</label>
              <select
                value={formData.event_type}
                onChange={(e) => setFormData({ ...formData, event_type: e.target.value as EventType })}
                className="mt-1 w-full rounded-xl border border-[#ded8d1] p-3 text-xs focus:border-[#1769c2] focus:outline-none"
              >
                <option value="conference">Conference</option>
                <option value="cme">CME Workshop</option>
                <option value="workshop">Hands-On Workshop</option>
                <option value="webinar">Webinar</option>
                <option value="seminar">Seminar</option>
                <option value="symposium">Symposium</option>
                <option value="training">Clinical Training</option>
                <option value="meetup">Professional Meetup</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#171717]">Clinical Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="mt-1 w-full rounded-xl border border-[#ded8d1] p-3 text-xs focus:border-[#1769c2] focus:outline-none"
              >
                <option value="General Healthcare">General Healthcare</option>
                <option value="Physiotherapy & Rehab">Physiotherapy & Rehab</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Orthopedics">Orthopedics</option>
                <option value="Neurology">Neurology</option>
                <option value="Pediatrics">Pediatrics</option>
                <option value="Nursing & Critical Care">Nursing & Critical Care</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#171717]">Short Summary</label>
            <input
              type="text"
              value={formData.short_description || ""}
              onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
              placeholder="Brief 1-line hook for discovery feed"
              className="mt-1 w-full rounded-xl border border-[#ded8d1] p-3 text-xs focus:border-[#1769c2] focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#171717]">Complete Event Description *</label>
            <textarea
              rows={5}
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detailed overview, objectives, key takeaways, and speaker details..."
              className="mt-1 w-full rounded-xl border border-[#ded8d1] p-3 text-xs focus:border-[#1769c2] focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#171717]">Cover Image URL (Optional)</label>
            <input
              type="url"
              value={formData.cover_url || ""}
              onChange={(e) => setFormData({ ...formData, cover_url: e.target.value })}
              placeholder="https://..."
              className="mt-1 w-full rounded-xl border border-[#ded8d1] p-3 text-xs focus:border-[#1769c2] focus:outline-none"
            />
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="flex items-center gap-1 rounded-xl bg-[#1769c2] px-6 py-2.5 text-xs font-semibold text-white hover:bg-[#145ca8]"
            >
              <span>Next: Schedule & Venue</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Schedule & Venue */}
      {step === 2 && (
        <div className="space-y-4 rounded-3xl border border-[#e8e6e3] bg-white p-6">
          <h2 className="text-sm font-bold text-[#171717]">Step 2: Dates, Time & Location</h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-[#171717]">Start Date & Time *</label>
              <input
                type="datetime-local"
                required
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                className="mt-1 w-full rounded-xl border border-[#ded8d1] p-3 text-xs focus:border-[#1769c2] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#171717]">End Date & Time *</label>
              <input
                type="datetime-local"
                required
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                className="mt-1 w-full rounded-xl border border-[#ded8d1] p-3 text-xs focus:border-[#1769c2] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#171717]">Event Format *</label>
            <div className="mt-2 grid grid-cols-3 gap-3">
              {[
                { id: "online", label: "Online (Webinar)" },
                { id: "in_person", label: "In-Person" },
                { id: "hybrid", label: "Hybrid" },
              ].map((fmt) => (
                <button
                  key={fmt.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, format: fmt.id as EventFormat })}
                  className={`rounded-xl border p-3 text-center text-xs font-bold transition ${
                    formData.format === fmt.id
                      ? "border-[#1769c2] bg-[#eef5fc] text-[#1769c2]"
                      : "border-[#ded8d1] text-[#5d5854]"
                  }`}
                >
                  {fmt.label}
                </button>
              ))}
            </div>
          </div>

          {(formData.format === "in_person" || formData.format === "hybrid") && (
            <div className="space-y-3 rounded-2xl border border-[#f0efee] bg-[#fcfbfa] p-4">
              <h3 className="text-xs font-bold text-[#171717]">In-Person Venue Details</h3>
              <div>
                <label className="text-xs font-semibold text-[#171717]">Auditorium / Venue Name</label>
                <input
                  type="text"
                  value={formData.venue_name || ""}
                  onChange={(e) => setFormData({ ...formData, venue_name: e.target.value })}
                  placeholder="e.g. Main Auditorium, Medical College"
                  className="mt-1 w-full rounded-xl border border-[#ded8d1] bg-white p-2.5 text-xs focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#171717]">City *</label>
                  <input
                    type="text"
                    value={formData.city || ""}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="e.g. Indore / Mumbai / Delhi"
                    className="mt-1 w-full rounded-xl border border-[#ded8d1] bg-white p-2.5 text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#171717]">State</label>
                  <input
                    type="text"
                    value={formData.state || ""}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="e.g. Madhya Pradesh"
                    className="mt-1 w-full rounded-xl border border-[#ded8d1] bg-white p-2.5 text-xs focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {(formData.format === "online" || formData.format === "hybrid") && (
            <div className="space-y-3 rounded-2xl border border-[#f0efee] bg-[#fcfbfa] p-4">
              <h3 className="text-xs font-bold text-[#171717]">Online Video Meeting Information</h3>
              <div>
                <label className="text-xs font-semibold text-[#171717]">Meeting Platform</label>
                <input
                  type="text"
                  value={formData.online_meeting_platform || "Zoom"}
                  onChange={(e) => setFormData({ ...formData, online_meeting_platform: e.target.value })}
                  placeholder="Zoom / Google Meet / MS Teams"
                  className="mt-1 w-full rounded-xl border border-[#ded8d1] bg-white p-2.5 text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#171717]">Meeting URL / Joining Link</label>
                <input
                  type="url"
                  value={formData.online_meeting_url || ""}
                  onChange={(e) => setFormData({ ...formData, online_meeting_url: e.target.value })}
                  placeholder="https://zoom.us/j/..."
                  className="mt-1 w-full rounded-xl border border-[#ded8d1] bg-white p-2.5 text-xs focus:outline-none"
                />
              </div>
            </div>
          )}

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
              className="flex items-center gap-1 rounded-xl bg-[#1769c2] px-6 py-2.5 text-xs font-semibold text-white hover:bg-[#145ca8]"
            >
              <span>Next: Speakers & Agenda</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Speakers & Agenda */}
      {step === 3 && (
        <div className="space-y-6 rounded-3xl border border-[#e8e6e3] bg-white p-6">
          {/* Speakers */}
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#171717]">Keynote Speakers & Faculty</h2>
              <button
                type="button"
                onClick={handleAddSpeaker}
                className="flex items-center gap-1 text-xs font-bold text-[#1769c2] hover:underline"
              >
                <Plus className="h-4 w-4" />
                <span>Add Speaker</span>
              </button>
            </div>

            <div className="mt-3 space-y-3">
              {formData.speakers?.map((s, idx) => (
                <div key={idx} className="flex gap-2 rounded-2xl border border-[#ded8d1] p-3">
                  <div className="grid flex-1 grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Speaker Full Name *"
                      value={s.name}
                      onChange={(e) => handleSpeakerChange(idx, "name", e.target.value)}
                      className="rounded-lg border border-[#ded8d1] p-2 text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Title / Designation"
                      value={s.title || ""}
                      onChange={(e) => handleSpeakerChange(idx, "title", e.target.value)}
                      className="rounded-lg border border-[#ded8d1] p-2 text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Organization / Hospital"
                      value={s.organization || ""}
                      onChange={(e) => handleSpeakerChange(idx, "organization", e.target.value)}
                      className="rounded-lg border border-[#ded8d1] p-2 text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Keynote Topic"
                      value={s.topic || ""}
                      onChange={(e) => handleSpeakerChange(idx, "topic", e.target.value)}
                      className="rounded-lg border border-[#ded8d1] p-2 text-xs"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveSpeaker(idx)}
                    className="p-1 text-rose-500 hover:text-rose-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {(!formData.speakers || formData.speakers.length === 0) && (
                <p className="text-xs text-[#77716b]">No speakers added yet. Click &apos;Add Speaker&apos; above.</p>
              )}
            </div>
          </div>

          {/* Agenda */}
          <div className="border-t border-[#f0efee] pt-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#171717]">Agenda & Schedule</h2>
              <button
                type="button"
                onClick={handleAddAgenda}
                className="flex items-center gap-1 text-xs font-bold text-[#1769c2] hover:underline"
              >
                <Plus className="h-4 w-4" />
                <span>Add Agenda Item</span>
              </button>
            </div>

            <div className="mt-3 space-y-3">
              {formData.agenda?.map((item, idx) => (
                <div key={idx} className="flex gap-2 rounded-2xl border border-[#ded8d1] p-3">
                  <div className="grid flex-1 grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Session Title *"
                      value={item.title}
                      onChange={(e) => handleAgendaChange(idx, "title", e.target.value)}
                      className="col-span-2 rounded-lg border border-[#ded8d1] p-2 text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Speaker / Host"
                      value={item.speaker_name || ""}
                      onChange={(e) => handleAgendaChange(idx, "speaker_name", e.target.value)}
                      className="rounded-lg border border-[#ded8d1] p-2 text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Session Description"
                      value={item.description || ""}
                      onChange={(e) => handleAgendaChange(idx, "description", e.target.value)}
                      className="rounded-lg border border-[#ded8d1] p-2 text-xs"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveAgenda(idx)}
                    className="p-1 text-rose-500 hover:text-rose-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {(!formData.agenda || formData.agenda.length === 0) && (
                <p className="text-xs text-[#77716b]">No agenda items added yet. Click &apos;Add Agenda Item&apos; above.</p>
              )}
            </div>
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
              className="flex items-center gap-1 rounded-xl bg-[#1769c2] px-6 py-2.5 text-xs font-semibold text-white hover:bg-[#145ca8]"
            >
              <span>Next: Ticketing & Certs</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Ticketing, CME & Submission */}
      {step === 4 && (
        <div className="space-y-4 rounded-3xl border border-[#e8e6e3] bg-white p-6">
          <h2 className="text-sm font-bold text-[#171717]">Step 4: Ticketing, CME Credits & Certificates</h2>

          {/* Free / Paid */}
          <div>
            <label className="text-xs font-semibold text-[#171717]">Registration Pricing</label>
            <div className="mt-2 flex gap-4">
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="radio"
                  checked={formData.is_free}
                  onChange={() => setFormData({ ...formData, is_free: true, price: 0 })}
                />
                <span>Free Event</span>
              </label>
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="radio"
                  checked={!formData.is_free}
                  onChange={() => setFormData({ ...formData, is_free: false, price: 499 })}
                />
                <span>Paid Event</span>
              </label>
            </div>

            {!formData.is_free && (
              <div className="mt-3">
                <label className="text-xs font-semibold text-[#171717]">Price (INR ₹)</label>
                <input
                  type="number"
                  min="1"
                  value={formData.price || 0}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  className="mt-1 w-full rounded-xl border border-[#ded8d1] p-2.5 text-xs focus:outline-none"
                />
              </div>
            )}
          </div>

          <div>
            <label className="text-xs font-semibold text-[#171717]">Capacity (Leave blank for unlimited)</label>
            <input
              type="number"
              min="1"
              value={formData.capacity || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  capacity: e.target.value ? parseInt(e.target.value, 10) : undefined,
                })
              }
              placeholder="e.g. 150 seats"
              className="mt-1 w-full rounded-xl border border-[#ded8d1] p-2.5 text-xs focus:outline-none"
            />
          </div>

          {/* CME Credits */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-[#171717]">CME Credits (Hours)</label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={formData.cme_credits || 0}
                onChange={(e) => setFormData({ ...formData, cme_credits: parseFloat(e.target.value) || 0 })}
                placeholder="e.g. 4.0"
                className="mt-1 w-full rounded-xl border border-[#ded8d1] p-2.5 text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#171717]">Accreditation Body</label>
              <input
                type="text"
                value={formData.cme_accreditation_body || ""}
                onChange={(e) => setFormData({ ...formData, cme_accreditation_body: e.target.value })}
                placeholder="e.g. State Medical Council / IAP"
                className="mt-1 w-full rounded-xl border border-[#ded8d1] p-2.5 text-xs focus:outline-none"
              />
            </div>
          </div>

          {/* Certificate checkbox */}
          <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4">
            <label className="flex items-start gap-2.5 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={formData.certificate_enabled}
                onChange={(e) => setFormData({ ...formData, certificate_enabled: e.target.checked })}
                className="mt-0.5"
              />
              <div>
                <span className="font-bold text-[#171717]">Enable Verified Digital Certificate of Attendance</span>
                <p className="text-[11px] text-[#5d5854]">
                  Participants who attend will receive an verifiable MGN certificate with a unique code and verification link.
                </p>
              </div>
            </label>
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
                className="rounded-xl border border-[#ded8d1] bg-white px-4 py-2.5 text-xs font-semibold text-[#171717] hover:bg-[#f8f7f6]"
              >
                Save as Draft
              </button>

              <button
                type="button"
                disabled={submitting}
                onClick={() => handleSubmit(true)}
                className="rounded-xl bg-[#1769c2] px-6 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#145ca8] disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Submit for Review"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
