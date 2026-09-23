// app/(app)/camps/[campId]/page.tsx
"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Tent,
  MapPin,
  Calendar,
  Users,
  CheckCircle2,
  Stethoscope,
  HeartHandshake,
  Award,
  ArrowLeft,
  X,
  FileText,
  Building,
} from "lucide-react";
import { CampRecord, CampRequiredRole } from "@/modules/camps/domain/types";

export default function CampDetailPage({
  params,
}: {
  params: Promise<{ campId: string }>;
}) {
  const { campId } = use(params);
  const router = useRouter();

  const [camp, setCamp] = useState<CampRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<CampRequiredRole | null>(null);
  const [volunteerNote, setVolunteerNote] = useState("");
  const [applyingVolunteer, setApplyingVolunteer] = useState(false);
  const [showVolunteerModal, setShowVolunteerModal] = useState(false);
  const [showParticipantModal, setShowParticipantModal] = useState(false);

  // Participant Form
  const [participantForm, setParticipantForm] = useState({
    name: "",
    phone: "",
    age: "",
    gender: "Male",
    notes: "",
  });
  const [registeringParticipant, setRegisteringParticipant] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const fetchCamp = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/camps/${campId}`);
      if (res.ok) {
        const data = await res.json();
        setCamp(data);
      }
    } catch (err) {
      console.error("Error loading camp:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCamp();
  }, [campId]);

  const handleApplyVolunteer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;
    setApplyingVolunteer(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/camps/${campId}/volunteer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roleId: selectedRole.id,
          applicationNote: volunteerNote,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit volunteer application");

      setShowVolunteerModal(false);
      setMessage("Volunteer application submitted! The camp organizer has been notified for review.");
      fetchCamp();
    } catch (err: any) {
      setMessage(err.message || "Volunteer application failed");
    } finally {
      setApplyingVolunteer(false);
    }
  };

  const handleRegisterParticipant = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisteringParticipant(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/camps/${campId}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participantName: participantForm.name,
          participantPhone: participantForm.phone,
          participantAge: participantForm.age,
          participantGender: participantForm.gender,
          notes: participantForm.notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to register participant");

      setShowParticipantModal(false);
      setMessage(`Registration confirmed! Registration #${data.registration.registration_number}`);
      fetchCamp();
    } catch (err: any) {
      setMessage(err.message || "Participant registration failed");
    } finally {
      setRegisteringParticipant(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12">
        <div className="h-64 animate-pulse rounded-3xl bg-[#f0efee]" />
      </div>
    );
  }

  if (!camp) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-[#171717]">Camp not found</h2>
        <p className="mt-2 text-sm text-[#5d5854]">This healthcare camp may have concluded or been removed.</p>
        <Link
          href="/camps"
          className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to all camps</span>
        </Link>
      </div>
    );
  }

  const startDate = new Date(camp.start_date);
  const endDate = new Date(camp.end_date);
  const formattedDates = `${startDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })} – ${endDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })}`;

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
          <span>Back to Camps</span>
        </button>
      </div>

      {message && (
        <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-900">
          {message}
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left 2 Cols: Camp Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cover Header */}
          <div className="relative h-64 sm:h-80 w-full overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600/15 via-teal-600/10 to-blue-600/10">
            {camp.cover_url ? (
              <img src={camp.cover_url} alt={camp.title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center">
                <Tent className="mb-2 h-14 w-14 text-emerald-700" />
                <span className="text-sm font-bold uppercase tracking-wider text-emerald-900">
                  {camp.camp_type.replace(/_/g, " ")}
                </span>
              </div>
            )}

            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
              <span className="rounded-lg bg-white/95 px-3 py-1 text-xs font-bold text-emerald-800 shadow-sm backdrop-blur-xs capitalize">
                {camp.camp_type.replace(/_/g, " ")}
              </span>
              <span className="rounded-lg bg-emerald-700 px-3 py-1 text-xs font-bold text-white shadow-sm capitalize">
                Status: {camp.status}
              </span>
            </div>
          </div>

          {/* Title & Scope */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#171717]">{camp.title}</h1>
            <p className="mt-2 text-sm leading-relaxed text-[#5d5854]">{camp.description}</p>
          </div>

          {/* Organizer Dossier */}
          <div className="flex items-center gap-3 rounded-2xl border border-[#e8e6e3] bg-[#fcfbfa] p-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-base font-bold text-emerald-800">
              {(camp.organization_name || camp.organizer_name || "M")[0]}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-[#171717]">
                  {camp.organization_name || camp.organizer_name || "Healthcare Institution"}
                </span>
                {(camp.organization_verification === "verified" || camp.organizer_verified) && (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                )}
              </div>
              <p className="text-xs text-[#5d5854]">
                Verified Healthcare Camp Organizer on MedGlobalNetwork
              </p>
            </div>
          </div>

          {/* Healthcare Services Delivered */}
          <div className="rounded-3xl border border-[#e8e6e3] bg-white p-6">
            <h2 className="text-base font-bold text-[#171717]">Services Provided at Camp</h2>
            <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {camp.services.map((service, idx) => (
                <div key={idx} className="flex items-center gap-2 rounded-xl bg-emerald-50/60 p-2.5 text-xs font-medium text-emerald-900">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-700" />
                  <span>{service}</span>
                </div>
              ))}
            </div>

            {camp.target_population && (
              <div className="mt-4 border-t border-[#f0efee] pt-3 text-xs text-[#5d5854]">
                <span className="font-semibold text-[#171717]">Target Population: </span>
                <span>{camp.target_population}</span>
              </div>
            )}
          </div>

          {/* Required Professionals & Volunteer Slots */}
          <div className="rounded-3xl border border-[#e8e6e3] bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-[#171717]">Volunteer & Professional Slots</h2>
                <p className="text-xs text-[#5d5854]">
                  Verified doctors, physiotherapists, nurses, and volunteers can apply.
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {camp.required_roles && camp.required_roles.length > 0 ? (
                camp.required_roles.map((role) => {
                  const slotsLeft = Math.max(0, role.slots_needed - (role.slots_filled || 0));
                  const isApplied = camp.user_volunteer_role_id === role.id;

                  return (
                    <div
                      key={role.id}
                      className="flex flex-col justify-between gap-3 rounded-2xl border border-[#ded8d1] bg-[#fcfbfa] p-4 sm:flex-row sm:items-center"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-[#171717]">{role.role_title}</h4>
                          {role.is_professional && (
                            <span className="rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800">
                              Verified Professional Required
                            </span>
                          )}
                        </div>
                        {role.description && (
                          <p className="mt-1 text-xs text-[#5d5854]">{role.description}</p>
                        )}
                        <p className="mt-1 text-[11px] font-semibold text-emerald-700">
                          {role.slots_filled || 0} filled · {slotsLeft} slot{slotsLeft > 1 ? "s" : ""} remaining
                        </p>
                      </div>

                      <div>
                        {isApplied ? (
                          <span className="inline-block rounded-xl bg-emerald-100 px-4 py-2 text-xs font-bold text-emerald-800">
                            Applied ({camp.user_volunteer_status})
                          </span>
                        ) : slotsLeft > 0 ? (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedRole(role);
                              setShowVolunteerModal(true);
                            }}
                            className="rounded-xl bg-emerald-700 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-800"
                          >
                            Apply for Slot
                          </button>
                        ) : (
                          <span className="text-xs text-[#77716b]">Slot Filled</span>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-[#77716b]">General volunteer participation.</p>
              )}
            </div>
          </div>

          {/* Post-Camp Outcome Report (if available) */}
          {camp.report && (
            <div className="rounded-3xl border border-emerald-200 bg-emerald-50/50 p-6">
              <div className="flex items-center gap-2 text-emerald-900">
                <FileText className="h-5 w-5 text-emerald-700" />
                <h3 className="text-base font-bold">Official Camp Outcome Report</h3>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-3 text-center">
                <div className="rounded-xl bg-white p-3 shadow-xs">
                  <p className="text-xl font-black text-emerald-800">{camp.report.participants_screened}</p>
                  <p className="text-[11px] text-[#77716b]">Screened</p>
                </div>
                <div className="rounded-xl bg-white p-3 shadow-xs">
                  <p className="text-xl font-black text-emerald-800">{camp.report.professionals_present}</p>
                  <p className="text-[11px] text-[#77716b]">Doctors & Physios</p>
                </div>
                <div className="rounded-xl bg-white p-3 shadow-xs">
                  <p className="text-xl font-black text-emerald-800">{camp.report.referrals_made || 0}</p>
                  <p className="text-[11px] text-[#77716b]">Referrals Made</p>
                </div>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-[#5d5854]">
                {camp.report.key_findings_summary}
              </p>
            </div>
          )}
        </div>

        {/* Right Col: Camp Meta & Participant Registration */}
        <div className="space-y-6">
          <div className="sticky top-20 rounded-3xl border border-[#e8e6e3] bg-white p-6 shadow-sm">
            <h3 className="text-sm font-bold text-[#171717]">Camp Information</h3>

            <div className="mt-4 space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <Calendar className="mt-0.5 h-4 w-4 text-emerald-700 shrink-0" />
                <div>
                  <p className="font-bold text-[#171717]">Dates & Duration</p>
                  <p className="text-[#5d5854]">{formattedDates}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 text-rose-600 shrink-0" />
                <div>
                  <p className="font-bold text-[#171717]">{camp.venue_name}</p>
                  <p className="text-[#5d5854]">{camp.address}, {camp.city}, {camp.state}</p>
                </div>
              </div>

              {camp.expected_beneficiaries > 0 && (
                <div className="flex items-center gap-3">
                  <Users className="h-4 w-4 text-emerald-700 shrink-0" />
                  <p className="text-[#5d5854]">
                    Estimated capacity: {camp.expected_beneficiaries} beneficiaries
                  </p>
                </div>
              )}
            </div>

            {/* CTAs */}
            <div className="mt-6 space-y-2.5">
              {camp.is_user_participant ? (
                <div className="rounded-2xl bg-emerald-100 p-3 text-center text-xs font-bold text-emerald-900">
                  ✓ You are registered as a participant / patient
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowParticipantModal(true)}
                  className="w-full rounded-2xl bg-emerald-700 py-3 text-xs font-bold text-white shadow-xs hover:bg-emerald-800 active:scale-95"
                >
                  Register as Beneficiary / Participant
                </button>
              )}

              {camp.certificate_enabled && (
                <div className="rounded-2xl bg-emerald-50 p-3 text-center text-[11px] font-semibold text-emerald-800">
                  <Award className="mx-auto mb-1 h-4 w-4 text-emerald-700" />
                  Verified Healthcare Outreach Certificate issued to attending volunteers
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Volunteer Application Modal */}
      {showVolunteerModal && selectedRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#171717]">Apply as Camp Volunteer</h3>
              <button
                type="button"
                onClick={() => setShowVolunteerModal(false)}
                className="rounded-full p-1 text-[#77716b] hover:bg-[#f0efee]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-3 rounded-2xl bg-emerald-50 p-3 text-xs text-emerald-900">
              <p className="font-bold">Role: {selectedRole.role_title}</p>
              {selectedRole.is_professional && (
                <p className="mt-0.5 text-[11px]">
                  Requires active verified MGN Healthcare Professional identity.
                </p>
              )}
            </div>

            <form onSubmit={handleApplyVolunteer} className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#171717]">
                  Clinical experience / Volunteer Note
                </label>
                <textarea
                  rows={3}
                  required
                  value={volunteerNote}
                  onChange={(e) => setVolunteerNote(e.target.value)}
                  placeholder="Brief note to organizer regarding your clinical specialization and availability..."
                  className="mt-1 w-full rounded-xl border border-[#ded8d1] p-2.5 text-xs focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowVolunteerModal(false)}
                  className="rounded-xl border border-[#ded8d1] px-4 py-2 text-xs font-semibold text-[#5d5854]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={applyingVolunteer}
                  className="rounded-xl bg-emerald-700 px-5 py-2 text-xs font-semibold text-white hover:bg-emerald-800 disabled:opacity-50"
                >
                  {applyingVolunteer ? "Submitting..." : "Submit Volunteer Application"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Participant Registration Modal */}
      {showParticipantModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#171717]">Camp Participant Registration</h3>
              <button
                type="button"
                onClick={() => setShowParticipantModal(false)}
                className="rounded-full p-1 text-[#77716b] hover:bg-[#f0efee]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterParticipant} className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#171717]">Full Name *</label>
                <input
                  type="text"
                  required
                  value={participantForm.name}
                  onChange={(e) => setParticipantForm({ ...participantForm, name: e.target.value })}
                  placeholder="Patient or attendee name"
                  className="mt-1 w-full rounded-xl border border-[#ded8d1] p-2.5 text-xs focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#171717]">Phone Number</label>
                  <input
                    type="tel"
                    value={participantForm.phone}
                    onChange={(e) => setParticipantForm({ ...participantForm, phone: e.target.value })}
                    placeholder="+91..."
                    className="mt-1 w-full rounded-xl border border-[#ded8d1] p-2.5 text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#171717]">Age</label>
                  <input
                    type="number"
                    value={participantForm.age}
                    onChange={(e) => setParticipantForm({ ...participantForm, age: e.target.value })}
                    placeholder="e.g. 45"
                    className="mt-1 w-full rounded-xl border border-[#ded8d1] p-2.5 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowParticipantModal(false)}
                  className="rounded-xl border border-[#ded8d1] px-4 py-2 text-xs font-semibold text-[#5d5854]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={registeringParticipant}
                  className="rounded-xl bg-emerald-700 px-5 py-2 text-xs font-semibold text-white hover:bg-emerald-800 disabled:opacity-50"
                >
                  {registeringParticipant ? "Registering..." : "Confirm Registration"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
