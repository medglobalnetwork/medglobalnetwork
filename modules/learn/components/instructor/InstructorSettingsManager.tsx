"use client";

import * as React from "react";
import {
  Building2,
  CheckCircle2,
  CreditCard,
  GraduationCap,
  Mail,
  RefreshCw,
  Save,
  ShieldCheck,
  Stethoscope,
  User,
  Clock,
  FileCheck,
  AlertCircle,
} from "lucide-react";
import { InstructorProfileSettings } from "../../types";

export function InstructorSettingsManager() {
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const [settings, setSettings] = React.useState<InstructorProfileSettings>({
    id: "",
    user_id: "",
    name: "",
    email: "",
    designation: "",
    affiliation: "",
    registration_number: "",
    bio: "",
    office_hours: "",
    qualifications: "",
    credentials_doc_url: "",
    notify_email: true,
    notify_batch_activity: true,
    notify_test_submissions: true,
    payout_upi_id: "",
    payout_bank_name: "",
    payout_account_holder: "",
    payout_account_number: "",
    payout_ifsc_code: "",
    payout_currency: "INR",
  });

  const fetchSettings = React.useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/learn/instructor/profile", { credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load instructor profile settings");
      if (data.profile) {
        setSettings({
          ...data.profile,
          designation: data.profile.designation || "",
          affiliation: data.profile.affiliation || "",
          registration_number: data.profile.registration_number || "",
          bio: data.profile.bio || "",
          office_hours: data.profile.office_hours || "",
          qualifications: data.profile.qualifications || "",
          credentials_doc_url: data.profile.credentials_doc_url || "",
          payout_upi_id: data.profile.payout_upi_id || "",
          payout_bank_name: data.profile.payout_bank_name || "",
          payout_account_holder: data.profile.payout_account_holder || "",
          payout_account_number: data.profile.payout_account_number || "",
          payout_ifsc_code: data.profile.payout_ifsc_code || "",
          payout_currency: data.profile.payout_currency || "INR",
        });
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to load settings");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/learn/instructor/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update instructor settings");

      setSuccessMsg("Instructor profile and payout preferences saved successfully.");
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="size-8 animate-spin rounded-full border-2 border-[#0f4c81] border-t-transparent dark:border-[#58a6ff]" />
        <p className="text-xs font-semibold text-[#77716b] dark:text-[#8b949e]">
          Loading instructor profile & payout settings...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-[#ded8d1] pb-4 dark:border-[#30363d]">
        <div>
          <h2 className="text-lg font-black text-[#171717] dark:text-[#f0f6fc] flex items-center gap-2">
            <Stethoscope className="size-5 text-[#0f4c81] dark:text-[#58a6ff]" />
            Faculty Credentials & Settings
          </h2>
          <p className="text-xs text-[#77716b] dark:text-[#8b949e]">
            Configure medical designation, teaching qualifications, batch alert preferences, and payout account details.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchSettings}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#77716b] hover:text-[#171717] dark:text-[#8b949e] dark:hover:text-[#f0f6fc] transition cursor-pointer"
        >
          <RefreshCw className="size-3.5" />
          Refresh
        </button>
      </div>

      {successMsg && (
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-bold text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-300">
          <CheckCircle2 className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-bold text-red-800 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300">
          <AlertCircle className="size-4 shrink-0 text-red-600 dark:text-red-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* SECTION 1: PROFESSIONAL & TEACHING PROFILE */}
        <div className="rounded-3xl border border-[#ded8d1] bg-white p-6 shadow-xs dark:border-[#30363d] dark:bg-[#161b22] space-y-4">
          <h3 className="text-sm font-black text-[#171717] dark:text-[#f0f6fc] flex items-center gap-2">
            <GraduationCap className="size-4 text-[#0f4c81] dark:text-[#58a6ff]" />
            1. Medical & Academic Identity
          </h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-[#171717] dark:text-[#f0f6fc] mb-1">
                Medical Designation / Title *
              </label>
              <input
                type="text"
                required
                value={settings.designation || ""}
                onChange={(e) => setSettings({ ...settings, designation: e.target.value })}
                placeholder="e.g. Senior Consultant Neurologist & Clinical Professor"
                className="h-10 w-full rounded-xl border border-[#ded8d1] bg-white px-3 text-xs text-[#171717] focus:border-[#0f4c81] focus:outline-none dark:border-[#30363d] dark:bg-[#0d1117] dark:text-[#f0f6fc]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#171717] dark:text-[#f0f6fc] mb-1">
                Hospital / Institute Affiliation
              </label>
              <input
                type="text"
                value={settings.affiliation || ""}
                onChange={(e) => setSettings({ ...settings, affiliation: e.target.value })}
                placeholder="e.g. AIIMS New Delhi / Apollo Hospitals"
                className="h-10 w-full rounded-xl border border-[#ded8d1] bg-white px-3 text-xs text-[#171717] focus:border-[#0f4c81] focus:outline-none dark:border-[#30363d] dark:bg-[#0d1117] dark:text-[#f0f6fc]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-[#171717] dark:text-[#f0f6fc] mb-1">
                Medical Registration Number (MCI / NMC / State Council)
              </label>
              <input
                type="text"
                value={settings.registration_number || ""}
                onChange={(e) => setSettings({ ...settings, registration_number: e.target.value })}
                placeholder="e.g. NMC/MCI-2018/123456"
                className="h-10 w-full rounded-xl border border-[#ded8d1] bg-white px-3 text-xs text-[#171717] focus:border-[#0f4c81] focus:outline-none dark:border-[#30363d] dark:bg-[#0d1117] dark:text-[#f0f6fc]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#171717] dark:text-[#f0f6fc] mb-1">
                Office Hours / Student Availability
              </label>
              <input
                type="text"
                value={settings.office_hours || ""}
                onChange={(e) => setSettings({ ...settings, office_hours: e.target.value })}
                placeholder="e.g. Tuesdays & Thursdays 4:00 PM – 6:00 PM IST"
                className="h-10 w-full rounded-xl border border-[#ded8d1] bg-white px-3 text-xs text-[#171717] focus:border-[#0f4c81] focus:outline-none dark:border-[#30363d] dark:bg-[#0d1117] dark:text-[#f0f6fc]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#171717] dark:text-[#f0f6fc] mb-1">
              Qualifications & Fellowships
            </label>
            <input
              type="text"
              value={typeof settings.qualifications === "string" ? settings.qualifications : ""}
              onChange={(e) => setSettings({ ...settings, qualifications: e.target.value })}
              placeholder="e.g. MBBS, MD (Medicine), DM (Cardiology), FACC, FSCAI"
              className="h-10 w-full rounded-xl border border-[#ded8d1] bg-white px-3 text-xs text-[#171717] focus:border-[#0f4c81] focus:outline-none dark:border-[#30363d] dark:bg-[#0d1117] dark:text-[#f0f6fc]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#171717] dark:text-[#f0f6fc] mb-1">
              Instructor Biography & Clinical Focus
            </label>
            <textarea
              rows={3}
              value={settings.bio || ""}
              onChange={(e) => setSettings({ ...settings, bio: e.target.value })}
              placeholder="Provide a concise clinical and teaching background for your learners..."
              className="w-full rounded-xl border border-[#ded8d1] bg-white p-3 text-xs text-[#171717] focus:border-[#0f4c81] focus:outline-none dark:border-[#30363d] dark:bg-[#0d1117] dark:text-[#f0f6fc]"
            />
          </div>
        </div>

        {/* SECTION 2: NOTIFICATIONS & ALERT PREFERENCES */}
        <div className="rounded-3xl border border-[#ded8d1] bg-white p-6 shadow-xs dark:border-[#30363d] dark:bg-[#161b22] space-y-4">
          <h3 className="text-sm font-black text-[#171717] dark:text-[#f0f6fc] flex items-center gap-2">
            <Mail className="size-4 text-[#0f4c81] dark:text-[#58a6ff]" />
            2. Notification & Alert Preferences
          </h3>

          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notify_email}
                onChange={(e) => setSettings({ ...settings, notify_email: e.target.checked })}
                className="size-4 rounded border-[#ded8d1] text-[#0f4c81] focus:ring-[#0f4c81]"
              />
              <span className="text-xs font-semibold text-[#171717] dark:text-[#f0f6fc]">
                Email Digests (Course enrollments, completion milestones, and certificate verifications)
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notify_batch_activity}
                onChange={(e) => setSettings({ ...settings, notify_batch_activity: e.target.checked })}
                className="size-4 rounded border-[#ded8d1] text-[#0f4c81] focus:ring-[#0f4c81]"
              />
              <span className="text-xs font-semibold text-[#171717] dark:text-[#f0f6fc]">
                Batch Activity & Live Classroom Reminders (Upcoming scheduled batches and seat registrations)
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notify_test_submissions}
                onChange={(e) => setSettings({ ...settings, notify_test_submissions: e.target.checked })}
                className="size-4 rounded border-[#ded8d1] text-[#0f4c81] focus:ring-[#0f4c81]"
              />
              <span className="text-xs font-semibold text-[#171717] dark:text-[#f0f6fc]">
                Test Paper Submissions & Subjective Grading Alerts (When a student finishes an exam requiring evaluation)
              </span>
            </label>
          </div>
        </div>

        {/* SECTION 3: PAYOUT & BANKING SETTINGS */}
        <div className="rounded-3xl border border-[#ded8d1] bg-white p-6 shadow-xs dark:border-[#30363d] dark:bg-[#161b22] space-y-4">
          <h3 className="text-sm font-black text-[#171717] dark:text-[#f0f6fc] flex items-center gap-2">
            <CreditCard className="size-4 text-[#16804d] dark:text-emerald-400" />
            3. Payout & Honorarium Account (INR)
          </h3>
          <p className="text-xs text-[#77716b] dark:text-[#8b949e]">
            Direct monthly settlement for paid courses, batch subscriptions, and accredited certifications.
          </p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-[#171717] dark:text-[#f0f6fc] mb-1">
                UPI ID (Instant Settlement)
              </label>
              <input
                type="text"
                value={settings.payout_upi_id || ""}
                onChange={(e) => setSettings({ ...settings, payout_upi_id: e.target.value })}
                placeholder="e.g. doctorname@okhdfcbank or 9876543210@paytm"
                className="h-10 w-full rounded-xl border border-[#ded8d1] bg-white px-3 text-xs text-[#171717] focus:border-[#0f4c81] focus:outline-none dark:border-[#30363d] dark:bg-[#0d1117] dark:text-[#f0f6fc]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#171717] dark:text-[#f0f6fc] mb-1">
                Bank Account Holder Name
              </label>
              <input
                type="text"
                value={settings.payout_account_holder || ""}
                onChange={(e) => setSettings({ ...settings, payout_account_holder: e.target.value })}
                placeholder="Full name as printed on bank passbook"
                className="h-10 w-full rounded-xl border border-[#ded8d1] bg-white px-3 text-xs text-[#171717] focus:border-[#0f4c81] focus:outline-none dark:border-[#30363d] dark:bg-[#0d1117] dark:text-[#f0f6fc]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-bold text-[#171717] dark:text-[#f0f6fc] mb-1">
                Bank Name
              </label>
              <input
                type="text"
                value={settings.payout_bank_name || ""}
                onChange={(e) => setSettings({ ...settings, payout_bank_name: e.target.value })}
                placeholder="e.g. HDFC Bank, ICICI Bank, SBI"
                className="h-10 w-full rounded-xl border border-[#ded8d1] bg-white px-3 text-xs text-[#171717] focus:border-[#0f4c81] focus:outline-none dark:border-[#30363d] dark:bg-[#0d1117] dark:text-[#f0f6fc]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#171717] dark:text-[#f0f6fc] mb-1">
                Account Number
              </label>
              <input
                type="text"
                value={settings.payout_account_number || ""}
                onChange={(e) => setSettings({ ...settings, payout_account_number: e.target.value })}
                placeholder="e.g. 50100234567890"
                className="h-10 w-full rounded-xl border border-[#ded8d1] bg-white px-3 text-xs text-[#171717] focus:border-[#0f4c81] focus:outline-none dark:border-[#30363d] dark:bg-[#0d1117] dark:text-[#f0f6fc]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#171717] dark:text-[#f0f6fc] mb-1">
                IFSC Code
              </label>
              <input
                type="text"
                value={settings.payout_ifsc_code || ""}
                onChange={(e) => setSettings({ ...settings, payout_ifsc_code: e.target.value.toUpperCase() })}
                placeholder="e.g. HDFC0001234"
                className="h-10 w-full rounded-xl border border-[#ded8d1] bg-white px-3 text-xs text-[#171717] uppercase focus:border-[#0f4c81] focus:outline-none dark:border-[#30363d] dark:bg-[#0d1117] dark:text-[#f0f6fc]"
              />
            </div>
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-[#0f4c81] px-6 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#0c3c66] transition disabled:opacity-50 cursor-pointer"
          >
            <Save className="size-4" />
            <span>{saving ? "Saving Changes..." : "Save Instructor Settings"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
