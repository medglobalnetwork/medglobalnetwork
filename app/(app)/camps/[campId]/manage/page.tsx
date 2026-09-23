// app/(app)/camps/[campId]/manage/page.tsx
"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Tent,
  Users,
  CheckCircle2,
  XCircle,
  Award,
  FileText,
  ArrowLeft,
  Stethoscope,
  Send,
} from "lucide-react";
import { CampRecord, CampVolunteerApplication } from "@/modules/camps/domain/types";

export default function CampManagePage({
  params,
}: {
  params: Promise<{ campId: string }>;
}) {
  const { campId } = use(params);
  const router = useRouter();

  const [camp, setCamp] = useState<CampRecord | null>(null);
  const [volunteers, setVolunteers] = useState<CampVolunteerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  // Post-camp report state
  const [reportData, setReportData] = useState({
    participants_screened: 0,
    volunteers_present: 0,
    professionals_present: 0,
    referrals_made: 0,
    services_delivered: [] as string[],
    key_findings_summary: "",
    challenges_and_feedback: "",
  });
  const [submittingReport, setSubmittingReport] = useState(false);

  const fetchManageData = async () => {
    try {
      setLoading(true);
      const [resCamp, resVol] = await Promise.all([
        fetch(`/api/camps/${campId}`),
        fetch(`/api/camps/${campId}/volunteer`),
      ]);

      if (resCamp.ok) {
        const d = await resCamp.json();
        setCamp(d);
        if (d.report) {
          setReportData({
            participants_screened: d.report.participants_screened || 0,
            volunteers_present: d.report.volunteers_present || 0,
            professionals_present: d.report.professionals_present || 0,
            referrals_made: d.report.referrals_made || 0,
            services_delivered: d.report.services_delivered || [],
            key_findings_summary: d.report.key_findings_summary || "",
            challenges_and_feedback: d.report.challenges_and_feedback || "",
          });
        }
      }

      if (resVol.ok) {
        const v = await resVol.json();
        setVolunteers(v.volunteers || []);
      }
    } catch (err) {
      console.error("Error loading manage data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchManageData();
  }, [campId]);

  const handleReviewVolunteer = async (volId: string, status: "approved" | "rejected") => {
    try {
      const res = await fetch(`/api/camps/${campId}/volunteer/${volId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "review", status }),
      });
      if (res.ok) {
        setMessage(`Volunteer status updated to ${status}.`);
        fetchManageData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAttendance = async (volId: string, attended: boolean) => {
    try {
      const res = await fetch(`/api/camps/${campId}/volunteer/${volId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "attendance", attended }),
      });
      if (res.ok) {
        setMessage(attended ? "Attendance marked and certificate issued!" : "Attendance cleared.");
        fetchManageData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingReport(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/camps/${campId}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reportData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit report");

      setMessage("Official post-camp outcome report submitted successfully!");
      fetchManageData();
    } catch (err: any) {
      setMessage(err.message || "Failed to submit report");
    } finally {
      setSubmittingReport(false);
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
    return <div className="p-8 text-center">Camp not found</div>;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <Link
          href={`/camps/${camp.id}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#5d5854] hover:text-[#171717]"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>View Public Camp Page</span>
        </Link>
        <h1 className="mt-2 text-2xl font-black text-[#171717]">Camp Management Dashboard</h1>
        <p className="text-xs text-[#5d5854]">
          Manage volunteer slots, track live attendance, and submit the final clinical outcome report.
        </p>
      </div>

      {message && (
        <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-900">
          {message}
        </div>
      )}

      {/* Volunteer Applicants Management */}
      <div className="mb-8 rounded-3xl border border-[#e8e6e3] bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#171717]">Volunteer Review & Attendance</h2>
            <p className="text-xs text-[#5d5854]">
              Approve applicants and verify attendance on the day of the camp.
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-800">
            {volunteers.length} Applicant{volunteers.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="mt-4 divide-y divide-[#f0efee]">
          {volunteers.length === 0 ? (
            <p className="py-6 text-center text-xs text-[#77716b]">
              No volunteer applications submitted yet for this camp.
            </p>
          ) : (
            volunteers.map((v) => (
              <div key={v.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-[#171717]">{v.user_name}</span>
                    <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                      {v.role_title}
                    </span>
                    <span className="text-[10px] font-medium text-[#77716b]">({v.user_profession || "Volunteer"})</span>
                  </div>
                  {v.application_note && (
                    <p className="mt-1 text-xs text-[#5d5854]">Note: &quot;{v.application_note}&quot;</p>
                  )}
                  <p className="mt-1 text-[11px] text-[#77716b]">Status: <span className="font-semibold text-[#171717] capitalize">{v.status}</span></p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {v.status === "pending" ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleReviewVolunteer(v.id, "approved")}
                        className="rounded-xl bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-800"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReviewVolunteer(v.id, "rejected")}
                        className="rounded-xl border border-rose-300 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50"
                      >
                        Decline
                      </button>
                    </>
                  ) : v.status === "approved" || v.status === "attended" ? (
                    <button
                      type="button"
                      onClick={() => handleMarkAttendance(v.id, !v.attended)}
                      className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
                        v.attended
                          ? "bg-emerald-100 text-emerald-800 font-bold"
                          : "border border-[#ded8d1] bg-white text-[#171717] hover:bg-[#f8f7f6]"
                      }`}
                    >
                      <CheckCircle2 className={`h-3.5 w-3.5 ${v.attended ? "text-emerald-700" : "text-[#77716b]"}`} />
                      <span>{v.attended ? "Attended (Cert Issued)" : "Mark Attended"}</span>
                    </button>
                  ) : (
                    <span className="text-xs text-rose-600">Declined</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Post-Camp Outcome Report Submission Form */}
      <div className="rounded-3xl border border-[#e8e6e3] bg-white p-6">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-emerald-700" />
          <h2 className="text-base font-bold text-[#171717]">Submit Post-Camp Outcome Report</h2>
        </div>
        <p className="mt-1 text-xs text-[#5d5854]">
          Submit the official outcome data after completing the camp to close the audit loop.
        </p>

        <form onSubmit={handleSubmitReport} className="mt-6 space-y-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <label className="text-xs font-semibold text-[#171717]">Patients Screened *</label>
              <input
                type="number"
                min="0"
                required
                value={reportData.participants_screened}
                onChange={(e) => setReportData({ ...reportData, participants_screened: parseInt(e.target.value, 10) || 0 })}
                className="mt-1 w-full rounded-xl border border-[#ded8d1] p-2.5 text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#171717]">Doctors/Physios Present</label>
              <input
                type="number"
                min="0"
                value={reportData.professionals_present}
                onChange={(e) => setReportData({ ...reportData, professionals_present: parseInt(e.target.value, 10) || 0 })}
                className="mt-1 w-full rounded-xl border border-[#ded8d1] p-2.5 text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#171717]">Volunteers Present</label>
              <input
                type="number"
                min="0"
                value={reportData.volunteers_present}
                onChange={(e) => setReportData({ ...reportData, volunteers_present: parseInt(e.target.value, 10) || 0 })}
                className="mt-1 w-full rounded-xl border border-[#ded8d1] p-2.5 text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#171717]">Referrals Made</label>
              <input
                type="number"
                min="0"
                value={reportData.referrals_made}
                onChange={(e) => setReportData({ ...reportData, referrals_made: parseInt(e.target.value, 10) || 0 })}
                className="mt-1 w-full rounded-xl border border-[#ded8d1] p-2.5 text-xs focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#171717]">Key Clinical Findings & Outcome Summary *</label>
            <textarea
              rows={4}
              required
              value={reportData.key_findings_summary}
              onChange={(e) => setReportData({ ...reportData, key_findings_summary: e.target.value })}
              placeholder="Summarize high blood pressure cases detected, physiotherapy exercises prescribed, community feedback..."
              className="mt-1 w-full rounded-xl border border-[#ded8d1] p-2.5 text-xs focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[#171717]">Challenges & Suggestions</label>
            <textarea
              rows={2}
              value={reportData.challenges_and_feedback}
              onChange={(e) => setReportData({ ...reportData, challenges_and_feedback: e.target.value })}
              placeholder="Logistics notes, equipment needs for subsequent camps..."
              className="mt-1 w-full rounded-xl border border-[#ded8d1] p-2.5 text-xs focus:outline-none"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={submittingReport}
              className="rounded-xl bg-emerald-700 px-6 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-800 disabled:opacity-50"
            >
              {submittingReport ? "Submitting Report..." : "Submit Outcome Report"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
