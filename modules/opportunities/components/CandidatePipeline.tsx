"use client";

import * as React from "react";
import {
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  ExternalLink,
  Eye,
  FileText,
  GraduationCap,
  HelpCircle,
  Mail,
  MapPin,
  MessageSquare,
  MoreVertical,
  Phone,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  UserCheck,
  Video,
  X,
  XCircle,
} from "lucide-react";
import { ApplicationStatus, JobApplication } from "../types";

interface CandidatePipelineProps {
  jobTitle: string;
  applications: JobApplication[];
  onStatusChange: (applicationId: string, newStatus: ApplicationStatus, note?: string) => Promise<void>;
  onScheduleInterview: (applicationId: string, details: any) => Promise<void>;
}

const STAGES: { id: ApplicationStatus; label: string; bg: string; text: string }[] = [
  { id: "applied", label: "Applied", bg: "bg-slate-100", text: "text-slate-700" },
  { id: "under_review", label: "Under Review", bg: "bg-blue-50", text: "text-blue-700" },
  { id: "shortlisted", label: "Shortlisted", bg: "bg-amber-50", text: "text-amber-700" },
  { id: "interview", label: "Interview", bg: "bg-purple-50", text: "text-purple-700" },
  { id: "offer", label: "Offer Made", bg: "bg-emerald-50", text: "text-emerald-700" },
  { id: "hired", label: "Hired", bg: "bg-green-100", text: "text-green-800" },
  { id: "rejected", label: "Rejected", bg: "bg-rose-50", text: "text-rose-700" },
];

export function CandidatePipeline({
  jobTitle,
  applications,
  onStatusChange,
  onScheduleInterview,
}: CandidatePipelineProps) {
  const [activeStage, setActiveStage] = React.useState<string>("all");
  const [selectedApp, setSelectedApp] = React.useState<JobApplication | null>(null);
  const [interviewModalApp, setInterviewModalApp] = React.useState<JobApplication | null>(null);
  const [interviewTime, setInterviewTime] = React.useState("");
  const [interviewLink, setInterviewLink] = React.useState("");
  const [interviewNotes, setInterviewNotes] = React.useState("");
  const [isUpdating, setIsUpdating] = React.useState(false);

  const filteredApps = activeStage === "all"
    ? applications
    : applications.filter((a) => a.status === activeStage);

  const handleStageTransition = async (appId: string, newStatus: ApplicationStatus) => {
    setIsUpdating(true);
    try {
      await onStatusChange(appId, newStatus);
      if (selectedApp && selectedApp.id === appId) {
        setSelectedApp((prev: any) => (prev ? { ...prev, status: newStatus } : null));
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!interviewModalApp || !interviewTime) return;
    setIsUpdating(true);
    try {
      await onScheduleInterview(interviewModalApp.id, {
        scheduled_at: interviewTime,
        meeting_link: interviewLink.trim() || undefined,
        notes: interviewNotes.trim() || undefined,
      });
      setInterviewModalApp(null);
      setInterviewTime("");
      setInterviewLink("");
      setInterviewNotes("");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Stage Tab Bar */}
      <div className="flex gap-1.5 overflow-x-auto rounded-2xl border border-[#ded8d1] bg-white p-2 shadow-2xs">
        <button
          type="button"
          onClick={() => setActiveStage("all")}
          className={`shrink-0 rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeStage === "all"
              ? "bg-[#1769c2] text-white shadow-xs"
              : "text-[#77716b] hover:bg-[#faf9f8] hover:text-[#171717]"
          }`}
        >
          All Candidates ({applications.length})
        </button>

        {STAGES.map((s) => {
          const count = applications.filter((a) => a.status === s.id).length;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setActiveStage(s.id)}
              className={`shrink-0 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                activeStage === s.id
                  ? "bg-[#1769c2] text-white shadow-xs"
                  : "text-[#77716b] hover:bg-[#faf9f8] hover:text-[#171717]"
              }`}
            >
              {s.label} ({count})
            </button>
          );
        })}
      </div>

      {/* 2. Candidate Cards Grid */}
      {filteredApps.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[#ded8d1] bg-white p-12 text-center">
          <p className="text-sm font-bold text-[#171717]">No candidates in this stage</p>
          <p className="mt-1 text-xs text-[#77716b]">
            Candidates who apply or get moved to this stage will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredApps.map((app) => {
            const candidate = app.applicant;
            const currentStageInfo = STAGES.find((s) => s.id === app.status);

            return (
              <div
                key={app.id}
                onClick={() => setSelectedApp(app)}
                className="group flex cursor-pointer flex-col justify-between rounded-3xl border border-[#ded8d1] bg-white p-5 shadow-2xs transition hover:border-[#1769c2] hover:shadow-sm"
              >
                <div>
                  {/* Candidate Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {candidate?.user?.image ? (
                        <img
                          src={candidate.user.image}
                          alt={candidate.user.name}
                          className="h-12 w-12 rounded-full object-cover border border-[#ded8d1]"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#eef5fc] text-sm font-bold text-[#1769c2]">
                          {candidate?.user?.name ? candidate.user.name.slice(0, 2).toUpperCase() : "DR"}
                        </div>
                      )}

                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-sm text-[#171717] group-hover:text-[#1769c2]">
                            {candidate?.user?.name || "Healthcare Professional"}
                          </h4>
                          {candidate?.identity_verified && (
                            <ShieldCheck className="h-4 w-4 fill-[#1769c2]/15 text-[#1769c2]" />
                          )}
                        </div>
                        <p className="text-xs text-[#77716b]">
                          {candidate?.primary_degree || candidate?.profession || "Medical Graduate"}
                        </p>
                      </div>
                    </div>

                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${currentStageInfo?.bg} ${currentStageInfo?.text}`}>
                      {currentStageInfo?.label}
                    </span>
                  </div>

                  {/* Credentials / Experience Meta */}
                  <div className="mt-4 space-y-1.5 border-t border-[#f5f4f3] pt-3 text-xs text-[#5d5854]">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-3.5 w-3.5 text-[#1769c2]" />
                      <span>{candidate?.specialization || "Clinical Practice"}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Stethoscope className="h-3.5 w-3.5 text-[#1769c2]" />
                      <span>{candidate?.experience_years ? `${candidate.experience_years} Years Exp` : "Resident / Junior"}</span>
                    </div>

                    {candidate?.registration_number && (
                      <div className="text-[11px] font-mono text-[#77716b]">
                        Reg: {candidate.registration_number}
                      </div>
                    )}
                  </div>

                  {/* Skills tags */}
                  {candidate?.skills && candidate.skills.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {candidate.skills.slice(0, 3).map((skill: string) => (
                        <span key={skill} className="rounded-md bg-[#faf9f8] px-2 py-0.5 text-[10px] font-medium text-[#77716b]">
                          {skill}
                        </span>
                      ))}
                      {candidate.skills.length > 3 && (
                        <span className="text-[10px] text-[#a8a29e]">+{candidate.skills.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Footer Actions */}
                <div className="mt-5 flex items-center justify-between border-t border-[#f5f4f3] pt-3 text-xs">
                  <span className="text-[11px] text-[#77716b]">
                    Applied {new Date(app.applied_at).toLocaleDateString()}
                  </span>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedApp(app);
                    }}
                    className="font-bold text-[#1769c2] hover:underline"
                  >
                    View Dossier →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─────────────────────────────────────────────
          3. CANDIDATE DOSSIER DRAWER / MODAL
          ───────────────────────────────────────────── */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-[#ded8d1] bg-white shadow-2xl">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-[#ded8d1] px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eef5fc] text-[#1769c2] font-bold">
                  {selectedApp.applicant?.user?.name ? selectedApp.applicant.user.name.slice(0, 2).toUpperCase() : "DR"}
                </div>
                <div>
                  <h3 className="font-bold text-[#171717] text-base flex items-center gap-1.5">
                    {selectedApp.applicant?.user?.name}
                    {selectedApp.applicant?.identity_verified && (
                      <ShieldCheck className="h-4 w-4 fill-[#1769c2]/15 text-[#1769c2]" />
                    )}
                  </h3>
                  <p className="text-xs text-[#77716b]">
                    Applied for {jobTitle} · {new Date(selectedApp.applied_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-[#77716b] hover:bg-[#f0efee]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
              {/* Pipeline Transition Bar */}
              <div className="rounded-2xl border border-[#dbeafe] bg-[#f0f7ff] p-4">
                <h4 className="font-bold text-[#1e40af] uppercase tracking-wider text-[11px] mb-2">
                  Update Candidate Stage
                </h4>
                <div className="flex flex-wrap gap-2">
                  {STAGES.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      disabled={isUpdating || selectedApp.status === s.id}
                      onClick={() => handleStageTransition(selectedApp.id, s.id)}
                      className={`rounded-xl px-3 py-1.5 text-xs font-bold transition disabled:opacity-50 ${
                        selectedApp.status === s.id
                          ? "bg-[#1769c2] text-white shadow-xs"
                          : "border border-[#ded8d1] bg-white text-[#5d5854] hover:bg-[#faf9f8] hover:text-[#1769c2]"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setInterviewModalApp(selectedApp);
                      setSelectedApp(null);
                    }}
                    className="inline-flex items-center gap-1 rounded-xl bg-purple-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-purple-700"
                  >
                    <Video className="h-3.5 w-3.5" /> Schedule Interview
                  </button>
                </div>
              </div>

              {/* Verified Clinical Credentials */}
              <div className="rounded-2xl border border-[#ded8d1] p-4 space-y-3">
                <h4 className="font-bold text-[#171717] text-sm">Verified Clinical Credentials</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-[#77716b]">Primary Degree</label>
                    <p className="font-semibold text-[#171717]">{selectedApp.applicant?.primary_degree || "MBBS / BPT Graduate"}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-[#77716b]">Specialization</label>
                    <p className="font-semibold text-[#171717]">{selectedApp.applicant?.specialization || "Clinical Practice"}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-[#77716b]">State Medical Council Registration</label>
                    <p className="font-semibold text-[#171717]">{selectedApp.applicant?.registration_number || "Verified in registry"}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-[#77716b]">Current Location</label>
                    <p className="font-semibold text-[#171717]">{selectedApp.applicant?.city ? `${selectedApp.applicant.city}, ${selectedApp.applicant.state || "India"}` : "India"}</p>
                  </div>
                </div>
              </div>

              {/* Resume / CV */}
              <div className="rounded-2xl border border-[#ded8d1] p-4 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-[#171717]">Candidate Resume</h4>
                  <p className="text-[#77716b]">
                    {selectedApp.resume_type === "profile_generated"
                      ? "Official MGN Accredited Clinical Dossier"
                      : "Candidate Uploaded External CV"}
                  </p>
                </div>

                {selectedApp.resume_url ? (
                  <a
                    href={selectedApp.resume_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#1769c2] px-4 py-2 text-xs font-bold text-white hover:bg-[#12569f]"
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> View Uploaded CV
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={() => window.open(`/profile/${selectedApp.applicant_id}`, "_blank")}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#1769c2] px-4 py-2 text-xs font-bold text-white hover:bg-[#12569f]"
                  >
                    <UserCheck className="h-3.5 w-3.5" /> View Full Profile
                  </button>
                )}
              </div>

              {/* Cover Letter */}
              {selectedApp.cover_letter && (
                <div className="rounded-2xl border border-[#ded8d1] p-4 space-y-2">
                  <h4 className="font-bold text-[#171717]">Candidate Statement / Cover Letter</h4>
                  <p className="whitespace-pre-line leading-relaxed text-[#44403c]">
                    {selectedApp.cover_letter}
                  </p>
                </div>
              )}

              {/* Screening Answers */}
              {selectedApp.answers && Object.keys(selectedApp.answers).length > 0 && (
                <div className="rounded-2xl border border-[#ded8d1] p-4 space-y-3">
                  <h4 className="font-bold text-[#171717] flex items-center gap-1.5">
                    <HelpCircle className="h-3.5 w-3.5 text-[#1769c2]" /> Screening Question Responses
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(selectedApp.answers).map(([qid, ans]) => (
                      <div key={qid} className="rounded-xl bg-[#faf9f8] p-2.5">
                        <span className="block font-bold text-[#171717]">{qid}:</span>
                        <p className="mt-0.5 text-[#44403c]">{String(ans)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Interview Details if scheduled */}
              {selectedApp.interview_details && (
                <div className="rounded-2xl border border-purple-200 bg-purple-50 p-4 space-y-2 text-purple-900">
                  <h4 className="font-bold flex items-center gap-1.5">
                    <Video className="h-4 w-4 text-purple-700" /> Scheduled Interview
                  </h4>
                  <p>
                    Date & Time: <strong>{new Date(selectedApp.interview_details.scheduled_at).toLocaleString()}</strong>
                  </p>
                  {selectedApp.interview_details.meeting_link && (
                    <p>
                      Meeting Link:{" "}
                      <a href={selectedApp.interview_details.meeting_link} target="_blank" rel="noreferrer" className="underline font-bold">
                        {selectedApp.interview_details.meeting_link}
                      </a>
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────
          4. SCHEDULE INTERVIEW MODAL
          ───────────────────────────────────────────── */}
      {interviewModalApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <form
            onSubmit={handleSaveInterview}
            className="w-full max-w-md rounded-3xl border border-[#ded8d1] bg-white p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-[#ded8d1] pb-3">
              <h3 className="font-bold text-[#171717] flex items-center gap-2">
                <Video className="h-4 w-4 text-purple-600" /> Schedule Candidate Interview
              </h3>
              <button
                type="button"
                onClick={() => setInterviewModalApp(null)}
                className="text-[#77716b] hover:text-[#171717]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#171717] mb-1">
                Interview Date & Time *
              </label>
              <input
                type="datetime-local"
                required
                value={interviewTime}
                onChange={(e) => setInterviewTime(e.target.value)}
                className="h-10 w-full rounded-xl border border-[#ded8d1] px-3 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#171717] mb-1">
                Video Meeting Link (Google Meet / Zoom / MS Teams)
              </label>
              <input
                type="url"
                value={interviewLink}
                onChange={(e) => setInterviewLink(e.target.value)}
                placeholder="https://meet.google.com/xyz-abc-def"
                className="h-10 w-full rounded-xl border border-[#ded8d1] px-3 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#171717] mb-1">
                Instructions for Candidate
              </label>
              <textarea
                rows={3}
                value={interviewNotes}
                onChange={(e) => setInterviewNotes(e.target.value)}
                placeholder="Please keep clinical case reports ready for presentation..."
                className="w-full rounded-xl border border-[#ded8d1] p-3 text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#f5f4f3]">
              <button
                type="button"
                onClick={() => setInterviewModalApp(null)}
                className="rounded-xl border border-[#ded8d1] bg-white px-4 py-2 text-xs font-semibold text-[#5d5854]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUpdating || !interviewTime}
                className="rounded-xl bg-purple-600 px-5 py-2 text-xs font-bold text-white hover:bg-purple-700 disabled:opacity-50"
              >
                {isUpdating ? "Scheduling..." : "Schedule & Notify Candidate"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
