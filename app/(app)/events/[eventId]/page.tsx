// app/(app)/events/[eventId]/page.tsx
"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar,
  MapPin,
  Video,
  Clock,
  CheckCircle2,
  Users,
  Award,
  Share2,
  Bookmark,
  AlertTriangle,
  ArrowLeft,
  CalendarPlus,
  X,
  ExternalLink,
} from "lucide-react";
import { EventRecord } from "@/modules/events/domain/types";

export default function EventDetailPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = use(params);
  const router = useRouter();

  const [event, setEvent] = useState<EventRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [showRegModal, setShowRegModal] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({
    hospital_or_college: "",
    designation: "",
    phone: "",
  });
  const [message, setMessage] = useState<string | null>(null);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/events/${eventId}`);
      if (res.ok) {
        const data = await res.json();
        setEvent(data);
      }
    } catch (err) {
      console.error("Error fetching event:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [eventId]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegistering(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/events/${eventId}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to register");
      }
      setShowRegModal(false);
      setMessage("Registration confirmed! This event has been added to your MGN Calendar.");
      fetchDetail();
    } catch (err: any) {
      setMessage(err.message || "Registration failed");
    } finally {
      setRegistering(false);
    }
  };

  const handleCancelRegistration = async () => {
    if (!confirm("Are you sure you want to cancel your registration?")) return;
    try {
      const res = await fetch(`/api/events/${eventId}/register`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchDetail();
        setMessage("Registration cancelled.");
      }
    } catch (err) {
      console.error("Error cancelling registration:", err);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12">
        <div className="h-64 animate-pulse rounded-3xl bg-[#f0efee]" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-[#171717]">Event not found</h2>
        <p className="mt-2 text-sm text-[#5d5854]">This event may have been cancelled or removed.</p>
        <Link
          href="/events"
          className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-[#1769c2] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to all events</span>
        </Link>
      </div>
    );
  }

  const startDate = new Date(event.start_time);
  const endDate = new Date(event.end_time);

  const formattedDate = startDate.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const formattedTime = `${startDate.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })} – ${endDate.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })} (${event.timezone || "IST"})`;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Back button */}
      <div className="mb-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5d5854] hover:text-[#171717]"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to events</span>
        </button>
      </div>

      {message && (
        <div className="mb-4 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-xs font-semibold text-blue-900">
          {message}
        </div>
      )}

      {/* Main Container */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left 2 Cols: Event Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cover & Badges */}
          <div className="relative h-64 sm:h-80 w-full overflow-hidden rounded-3xl bg-gradient-to-br from-[#1769c2]/10 via-[#059669]/10 to-[#7c3aed]/10">
            {event.cover_url ? (
              <img src={event.cover_url} alt={event.title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center">
                <Calendar className="mb-2 h-12 w-12 text-[#1769c2]" />
                <span className="text-sm font-bold uppercase tracking-wider text-[#5d5854]">
                  {event.category}
                </span>
              </div>
            )}

            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
              <span className="rounded-lg bg-white/95 px-3 py-1 text-xs font-bold text-[#1769c2] shadow-sm backdrop-blur-xs">
                {event.event_type.toUpperCase()}
              </span>
              {event.cme_credits && event.cme_credits > 0 ? (
                <span className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1 text-xs font-bold text-white shadow-sm">
                  <Award className="h-3.5 w-3.5" />
                  {event.cme_credits} CME Credits
                </span>
              ) : null}
            </div>
          </div>

          {/* Title & Short Summary */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#171717]">{event.title}</h1>
            {event.short_description && (
              <p className="mt-2 text-sm text-[#5d5854]">{event.short_description}</p>
            )}
          </div>

          {/* Organizer Dossier */}
          <div className="flex items-center gap-3 rounded-2xl border border-[#e8e6e3] bg-[#fcfbfa] p-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#1769c2]/10 text-base font-bold text-[#1769c2]">
              {event.organizer_image ? (
                <img src={event.organizer_image} alt="" className="h-full w-full rounded-full object-cover" />
              ) : (
                (event.organization_name || event.organizer_name || "M")[0]
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-[#171717]">
                  {event.organization_name || event.organizer_name || "Healthcare Institution"}
                </span>
                {(event.organization_verification === "verified" || event.organizer_verified) && (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-[#1769c2]" />
                )}
              </div>
              <p className="text-xs text-[#5d5854]">
                {event.organizer_profession ? `Organized by ${event.organizer_name} (${event.organizer_profession})` : "Verified Organizer on MedGlobalNetwork"}
              </p>
            </div>
          </div>

          {/* Detailed Description */}
          <div className="rounded-3xl border border-[#e8e6e3] bg-white p-6">
            <h2 className="text-base font-bold text-[#171717]">About This Event</h2>
            <div className="mt-3 text-sm leading-relaxed text-[#5d5854] whitespace-pre-line">
              {event.description}
            </div>

            {/* Prerequisites / Requirements */}
            {event.requirements && event.requirements.length > 0 && (
              <div className="mt-6 border-t border-[#f0efee] pt-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#171717]">
                  Requirements & Eligibility
                </h3>
                <ul className="mt-2 list-inside list-disc space-y-1 text-xs text-[#5d5854]">
                  {event.requirements.map((req, idx) => (
                    <li key={idx}>{req}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Speakers Section */}
          {event.speakers && event.speakers.length > 0 && (
            <div className="rounded-3xl border border-[#e8e6e3] bg-white p-6">
              <h2 className="text-base font-bold text-[#171717]">Distinguished Speakers</h2>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {event.speakers.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-start gap-3 rounded-2xl border border-[#f0efee] bg-[#fcfbfa] p-4"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1769c2]/10 text-xs font-bold text-[#1769c2]">
                      {s.avatar_url ? (
                        <img src={s.avatar_url} alt="" className="h-full w-full rounded-full object-cover" />
                      ) : (
                        s.name[0]
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-[#171717]">{s.name}</h4>
                      {s.title && <p className="text-[11px] font-medium text-[#5d5854]">{s.title}</p>}
                      {s.organization && <p className="text-[10px] text-[#77716b]">{s.organization}</p>}
                      {s.topic && (
                        <p className="mt-1 text-[11px] font-semibold text-[#1769c2]">
                          Topic: {s.topic}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Agenda Section */}
          {event.agenda && event.agenda.length > 0 && (
            <div className="rounded-3xl border border-[#e8e6e3] bg-white p-6">
              <h2 className="text-base font-bold text-[#171717]">Event Agenda</h2>
              <div className="mt-4 divide-y divide-[#f0efee]">
                {event.agenda.map((item) => (
                  <div key={item.id} className="py-3 first:pt-0 last:pb-0">
                    <div className="flex items-center justify-between text-xs font-semibold text-[#1769c2]">
                      <span>
                        {new Date(item.start_time).toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}{" "}
                        –{" "}
                        {new Date(item.end_time).toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </span>
                      {item.speaker_name && (
                        <span className="text-[11px] text-[#77716b]">{item.speaker_name}</span>
                      )}
                    </div>
                    <h4 className="mt-1 text-sm font-bold text-[#171717]">{item.title}</h4>
                    {item.description && (
                      <p className="mt-0.5 text-xs text-[#5d5854]">{item.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Col: Registration Card & Schedule */}
        <div className="space-y-6">
          <div className="sticky top-20 rounded-3xl border border-[#e8e6e3] bg-white p-6 shadow-sm">
            {/* Price */}
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-semibold text-[#77716b]">Registration Fee</span>
              <span className="text-2xl font-black text-[#171717]">
                {event.is_free ? <span className="text-emerald-600">Free</span> : `₹${event.price}`}
              </span>
            </div>

            {/* Registration CTA */}
            <div className="mt-5 space-y-2">
              {event.is_user_registered ? (
                <div className="space-y-2">
                  <div className="rounded-2xl bg-emerald-50 p-3 text-center text-xs font-bold text-emerald-800">
                    ✓ You are Registered for this Event
                  </div>
                  <Link
                    href="/calendar"
                    className="flex w-full items-center justify-center gap-1.5 rounded-2xl border border-[#ded8d1] bg-[#f8f7f6] py-2.5 text-xs font-semibold text-[#171717] hover:bg-white"
                  >
                    <CalendarPlus className="h-4 w-4 text-[#1769c2]" />
                    <span>View in MGN Calendar</span>
                  </Link>
                  <button
                    type="button"
                    onClick={handleCancelRegistration}
                    className="w-full text-center text-xs text-rose-600 hover:underline pt-1"
                  >
                    Cancel Registration
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowRegModal(true)}
                  className="w-full rounded-2xl bg-[#1769c2] py-3 text-sm font-bold text-white shadow-xs transition hover:bg-[#145ca8] active:scale-95"
                >
                  Register for Event
                </button>
              )}
            </div>

            {/* Date & Time details */}
            <div className="mt-6 space-y-3 border-t border-[#f0efee] pt-4 text-xs">
              <div className="flex items-start gap-3">
                <Calendar className="mt-0.5 h-4 w-4 text-[#77716b] shrink-0" />
                <div>
                  <p className="font-bold text-[#171717]">{formattedDate}</p>
                  <p className="text-[#5d5854]">{formattedTime}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                {event.format === "online" ? (
                  <Video className="mt-0.5 h-4 w-4 text-blue-600 shrink-0" />
                ) : (
                  <MapPin className="mt-0.5 h-4 w-4 text-rose-600 shrink-0" />
                )}
                <div>
                  <p className="font-bold text-[#171717]">
                    {event.format === "online" ? "Online Video Meeting" : event.venue_name || "In-Person Venue"}
                  </p>
                  <p className="text-[#5d5854]">
                    {event.format === "online"
                      ? "Meeting link will be shared after registration."
                      : `${event.address || ""}, ${event.city || ""}, ${event.state || ""}`}
                  </p>
                </div>
              </div>

              {event.capacity && (
                <div className="flex items-center gap-3">
                  <Users className="h-4 w-4 text-[#77716b] shrink-0" />
                  <p className="text-[#5d5854]">
                    <span className="font-bold text-[#171717]">{event.registered_count}</span> of{" "}
                    {event.capacity} seats filled
                  </p>
                </div>
              )}
            </div>

            {/* Verified Certificate Info */}
            {event.certificate_enabled && (
              <div className="mt-5 rounded-2xl bg-[#eef5fc] p-3 text-xs text-[#1769c2]">
                <p className="font-bold flex items-center gap-1">
                  <Award className="h-4 w-4" />
                  Verified Certificate Included
                </p>
                <p className="mt-0.5 text-[11px] text-[#5d5854]">
                  Earn an verifiable digital credential upon attending this event.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Registration Modal */}
      {showRegModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#171717]">Register for Event</h3>
              <button
                type="button"
                onClick={() => setShowRegModal(false)}
                className="rounded-full p-1 text-[#77716b] hover:bg-[#f0efee]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="mt-1 text-xs text-[#5d5854]">
              {event.title}
            </p>

            <form onSubmit={handleRegister} className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#171717]">Organization / Hospital / College</label>
                <input
                  type="text"
                  required
                  value={answers.hospital_or_college}
                  onChange={(e) => setAnswers({ ...answers, hospital_or_college: e.target.value })}
                  placeholder="e.g. AIIMS Delhi / Apollo Hospital"
                  className="mt-1 w-full rounded-xl border border-[#ded8d1] p-2.5 text-xs focus:border-[#1769c2] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#171717]">Designation / Specialty</label>
                <input
                  type="text"
                  required
                  value={answers.designation}
                  onChange={(e) => setAnswers({ ...answers, designation: e.target.value })}
                  placeholder="e.g. Consultant Physiotherapist / Resident"
                  className="mt-1 w-full rounded-xl border border-[#ded8d1] p-2.5 text-xs focus:border-[#1769c2] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#171717]">Contact Phone Number</label>
                <input
                  type="tel"
                  required
                  value={answers.phone}
                  onChange={(e) => setAnswers({ ...answers, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="mt-1 w-full rounded-xl border border-[#ded8d1] p-2.5 text-xs focus:border-[#1769c2] focus:outline-none"
                />
              </div>

              <div className="mt-6 flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRegModal(false)}
                  className="rounded-xl border border-[#ded8d1] px-4 py-2 text-xs font-semibold text-[#5d5854]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={registering}
                  className="rounded-xl bg-[#1769c2] px-5 py-2 text-xs font-semibold text-white transition hover:bg-[#145ca8] disabled:opacity-50"
                >
                  {registering ? "Confirming..." : "Confirm Registration"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
