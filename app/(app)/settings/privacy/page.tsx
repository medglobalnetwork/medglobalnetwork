"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import {
  ShieldCheck,
  UserCheck,
  Download,
  AlertTriangle,
  Mail,
  Phone,
  FileText,
  CheckCircle2,
  Trash2,
  Loader2,
  Lock,
  ExternalLink,
  Info,
  HelpCircle,
} from "lucide-react";
import { DPDP_OFFICER_INFO } from "@/modules/dpdp/lib/dpdp-db";

interface ConsentItem {
  key: string;
  title: string;
  description: string;
  category: string;
  defaultGranted: boolean;
}

interface NomineeData {
  id: string;
  full_name: string;
  relationship: string;
  email: string;
  phone: string | null;
  identity_proof_type: string | null;
  identity_proof_number: string | null;
  notes: string | null;
  created_at: string;
}

export default function PrivacySettingsPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  // Consents state
  const [consentItems, setConsentItems] = React.useState<ConsentItem[]>([]);
  const [consents, setConsents] = React.useState<Record<string, boolean>>({});
  const [loadingConsents, setLoadingConsents] = React.useState(true);
  const [updatingKey, setUpdatingKey] = React.useState<string | null>(null);

  // Nominee state
  const [nominee, setNominee] = React.useState<NomineeData | null>(null);
  const [loadingNominee, setLoadingNominee] = React.useState(true);
  const [isEditingNominee, setIsEditingNominee] = React.useState(false);
  const [savingNominee, setSavingNominee] = React.useState(false);
  const [deletingNominee, setDeletingNominee] = React.useState(false);
  const [nomineeSuccess, setNomineeSuccess] = React.useState<string | null>(null);
  const [nomineeError, setNomineeError] = React.useState<string | null>(null);

  // Nominee form fields
  const [fullName, setFullName] = React.useState("");
  const [relationship, setRelationship] = React.useState("Spouse");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [idType, setIdType] = React.useState("National ID / Aadhaar / Passport");
  const [idNumber, setIdNumber] = React.useState("");
  const [notes, setNotes] = React.useState("");

  // Data Export state
  const [exporting, setExporting] = React.useState(false);
  const [exportSuccess, setExportSuccess] = React.useState(false);

  // Fetch Consents
  React.useEffect(() => {
    if (!session?.user) return;
    fetch("/api/user/consent")
      .then((res) => res.json())
      .then((data) => {
        if (data.items) setConsentItems(data.items);
        if (data.consents) setConsents(data.consents);
      })
      .catch((err) => console.error("Error fetching consents:", err))
      .finally(() => setLoadingConsents(false));
  }, [session?.user]);

  // Fetch Nominee
  React.useEffect(() => {
    if (!session?.user) return;
    fetch("/api/user/nominee")
      .then((res) => res.json())
      .then((data) => {
        if (data.nominee) {
          setNominee(data.nominee);
          setFullName(data.nominee.full_name);
          setRelationship(data.nominee.relationship);
          setEmail(data.nominee.email);
          setPhone(data.nominee.phone || "");
          setIdType(data.nominee.identity_proof_type || "National ID / Aadhaar / Passport");
          setIdNumber(data.nominee.identity_proof_number || "");
          setNotes(data.nominee.notes || "");
        }
      })
      .catch((err) => console.error("Error fetching nominee:", err))
      .finally(() => setLoadingNominee(false));
  }, [session?.user]);

  const handleToggleConsent = async (key: string, currentValue: boolean) => {
    const newValue = !currentValue;
    setConsents((prev) => ({ ...prev, [key]: newValue }));
    setUpdatingKey(key);

    try {
      const res = await fetch("/api/user/consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ consent_key: key, granted: newValue }),
      });
      if (!res.ok) {
        // Rollback
        setConsents((prev) => ({ ...prev, [key]: currentValue }));
      }
    } catch (err) {
      console.error(err);
      setConsents((prev) => ({ ...prev, [key]: currentValue }));
    } finally {
      setUpdatingKey(null);
    }
  };

  const handleSaveNominee = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingNominee(true);
    setNomineeError(null);
    setNomineeSuccess(null);

    try {
      const res = await fetch("/api/user/nominee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName,
          relationship,
          email,
          phone,
          identity_proof_type: idType,
          identity_proof_number: idNumber,
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save nominee");
      }

      setNominee(data.nominee);
      setIsEditingNominee(false);
      setNomineeSuccess("Nominee saved successfully under DPDP Act Section 14.");
      setTimeout(() => setNomineeSuccess(null), 4000);
    } catch (err: any) {
      setNomineeError(err.message || "Failed to save nominee");
    } finally {
      setSavingNominee(false);
    }
  };

  const handleDeleteNominee = async () => {
    if (!confirm("Are you sure you want to remove your designated nominee?")) return;
    setDeletingNominee(true);
    try {
      const res = await fetch("/api/user/nominee", { method: "DELETE" });
      if (res.ok) {
        setNominee(null);
        setFullName("");
        setEmail("");
        setPhone("");
        setIdNumber("");
        setNotes("");
        setIsEditingNominee(false);
        setNomineeSuccess("Nominee removed successfully.");
        setTimeout(() => setNomineeSuccess(null), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingNominee(false);
    }
  };

  const handleDownloadData = async () => {
    setExporting(true);
    try {
      const res = await fetch("/api/user/export-data");
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `mgn-personal-data-export-${session?.user?.id?.slice(0, 8) || "user"}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 5000);
    } catch (err) {
      console.error("Data export error:", err);
      alert("Failed to export data. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  if (isPending || !session) {
    return <div className="min-h-dvh bg-[#faf9f8] dark:bg-[#0d1117]" />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#171717] dark:text-[#f0f6fc]">
              Privacy & DPDP Governance
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
              <ShieldCheck className="size-3" />
              DPDP Act Compliant
            </span>
          </div>
          <p className="mt-1 text-xs text-[#77716b] dark:text-[#8b949e]">
            Manage granular consent permissions, appoint a legal/clinical nominee, and exercise your data rights.
          </p>
        </div>

        <Link
          href="/dpdp"
          className="inline-flex items-center gap-1.5 rounded-xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] px-3.5 py-2 text-xs font-bold text-[#0f4c81] dark:text-[#58a6ff] hover:bg-[#f8f7f6] dark:hover:bg-[#21262d] transition shadow-2xs"
        >
          <span>View DPDP Notice & Redressal</span>
          <ExternalLink className="size-3.5" />
        </Link>
      </div>

      {/* SECTION 1: Granular Consent Center */}
      <div className="rounded-2xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between gap-3 border-b border-[#f0ece9] dark:border-[#21262d] pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-[#0f4c81] dark:text-[#58a6ff] flex items-center justify-center">
              <Lock className="size-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#171717] dark:text-[#f0f6fc]">
                Itemized Consent Preferences (Section 6)
              </h2>
              <p className="text-[11px] text-[#77716b] dark:text-[#8b949e]">
                Under the DPDP Act, you have full control to grant or withdraw consent for specific data uses.
              </p>
            </div>
          </div>
        </div>

        {loadingConsents ? (
          <div className="py-8 flex items-center justify-center gap-2 text-xs text-[#77716b]">
            <Loader2 className="size-4 animate-spin text-[#0f4c81]" />
            Loading consent preferences...
          </div>
        ) : (
          <div className="space-y-4">
            {consentItems.map((item) => {
              const isGranted = consents[item.key] ?? item.defaultGranted;
              const isUpdating = updatingKey === item.key;
              return (
                <div
                  key={item.key}
                  className="flex items-start justify-between gap-4 p-3.5 rounded-xl border border-[#f0ece9] dark:border-[#21262d] bg-[#faf9f8] dark:bg-[#0d1117] transition hover:border-[#ded8d1] dark:hover:border-[#30363d]"
                >
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-[#171717] dark:text-[#f0f6fc]">{item.title}</p>
                    <p className="text-[11px] text-[#77716b] dark:text-[#8b949e] max-w-xl">{item.description}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleConsent(item.key, isGranted)}
                    disabled={isUpdating}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      isGranted ? "bg-[#0f4c81] dark:bg-[#1f6feb]" : "bg-slate-300 dark:bg-slate-700"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        isGranted ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 2: Right to Nominate (Section 14) */}
      <div className="rounded-2xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-5 sm:p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f0ece9] dark:border-[#21262d] pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <UserCheck className="size-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#171717] dark:text-[#f0f6fc]">
                Right to Nominate (Section 14 & Rule 14(4))
              </h2>
              <p className="text-[11px] text-[#77716b] dark:text-[#8b949e]">
                Appoint an individual authorized to exercise your data rights in the event of death or incapacity.
              </p>
            </div>
          </div>

          {nominee && !isEditingNominee && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsEditingNominee(true)}
                className="rounded-xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] px-3 py-1.5 text-xs font-semibold text-[#171717] dark:text-[#f0f6fc] hover:bg-[#faf9f8] transition"
              >
                Edit Nominee
              </button>
              <button
                type="button"
                onClick={handleDeleteNominee}
                disabled={deletingNominee}
                className="rounded-xl border border-rose-200 bg-rose-50 dark:bg-rose-950/40 px-3 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition"
              >
                {deletingNominee ? "Removing..." : "Remove"}
              </button>
            </div>
          )}
        </div>

        {nomineeSuccess && (
          <div className="mb-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-3 text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
            {nomineeSuccess}
          </div>
        )}

        {loadingNominee ? (
          <div className="py-6 flex items-center justify-center gap-2 text-xs text-[#77716b]">
            <Loader2 className="size-4 animate-spin text-purple-600" />
            Checking nominee records...
          </div>
        ) : nominee && !isEditingNominee ? (
          <div className="rounded-xl bg-[#faf9f8] dark:bg-[#0d1117] border border-[#f0ece9] dark:border-[#21262d] p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#a09890] dark:text-[#8b949e]">
                  Nominee Full Name
                </p>
                <p className="mt-0.5 text-sm font-bold text-[#171717] dark:text-[#f0f6fc]">{nominee.full_name}</p>
              </div>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#a09890] dark:text-[#8b949e]">
                  Relationship
                </p>
                <p className="mt-0.5 text-sm font-medium text-[#171717] dark:text-[#f0f6fc]">{nominee.relationship}</p>
              </div>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#a09890] dark:text-[#8b949e]">
                  Nominee Email
                </p>
                <p className="mt-0.5 text-sm font-medium text-[#171717] dark:text-[#f0f6fc]">{nominee.email}</p>
              </div>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#a09890] dark:text-[#8b949e]">
                  Nominee Contact Phone
                </p>
                <p className="mt-0.5 text-sm font-medium text-[#171717] dark:text-[#f0f6fc]">
                  {nominee.phone || "Not provided"}
                </p>
              </div>

              {nominee.identity_proof_type && (
                <div className="sm:col-span-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[#a09890] dark:text-[#8b949e]">
                    Designation / Identity Ref
                  </p>
                  <p className="mt-0.5 text-xs text-[#5d5854] dark:text-[#8b949e]">
                    {nominee.identity_proof_type} {nominee.identity_proof_number ? `(${nominee.identity_proof_number})` : ""}
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSaveNominee} className="space-y-4">
            {nomineeError && (
              <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 flex items-center gap-2">
                <AlertTriangle className="size-4 shrink-0 text-rose-600" />
                {nomineeError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#171717] dark:text-[#f0f6fc] mb-1">
                  Nominee Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Dr. Ananya Sharma"
                  className="w-full rounded-xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#0d1117] p-2.5 text-xs text-[#171717] dark:text-[#f0f6fc] focus:border-[#0f4c81] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#171717] dark:text-[#f0f6fc] mb-1">
                  Relationship *
                </label>
                <select
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  className="w-full rounded-xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#0d1117] p-2.5 text-xs text-[#171717] dark:text-[#f0f6fc] focus:border-[#0f4c81] focus:outline-none"
                >
                  <option value="Spouse">Spouse</option>
                  <option value="Child">Son / Daughter</option>
                  <option value="Parent">Parent</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Legal Heir / Representative">Legal Heir / Representative</option>
                  <option value="Clinical Partner / Co-Director">Clinical Partner / Co-Director</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#171717] dark:text-[#f0f6fc] mb-1">
                  Nominee Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nominee@example.com"
                  className="w-full rounded-xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#0d1117] p-2.5 text-xs text-[#171717] dark:text-[#f0f6fc] focus:border-[#0f4c81] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#171717] dark:text-[#f0f6fc] mb-1">
                  Nominee Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full rounded-xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#0d1117] p-2.5 text-xs text-[#171717] dark:text-[#f0f6fc] focus:border-[#0f4c81] focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#171717] dark:text-[#f0f6fc] mb-1">
                  Identity / Reference Details (Optional)
                </label>
                <input
                  type="text"
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                  placeholder="e.g. Government ID reference or verified relationship notes"
                  className="w-full rounded-xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#0d1117] p-2.5 text-xs text-[#171717] dark:text-[#f0f6fc] focus:border-[#0f4c81] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              {nominee && (
                <button
                  type="button"
                  onClick={() => setIsEditingNominee(false)}
                  className="rounded-xl border border-[#ded8d1] px-4 py-2 text-xs font-semibold text-[#5d5854]"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={savingNominee}
                className="inline-flex items-center gap-2 rounded-xl bg-[#0f4c81] px-5 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-[#0c3c66] disabled:opacity-50"
              >
                {savingNominee ? <Loader2 className="size-3.5 animate-spin" /> : <CheckCircle2 className="size-3.5" />}
                <span>{savingNominee ? "Saving Nominee..." : "Appoint & Save Nominee"}</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* SECTION 3: Right to Access & Data Portability (Section 11) */}
      <div className="rounded-2xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-[#171717] dark:text-[#f0f6fc]">
                Right to Access & Data Export (Section 11)
              </h2>
            </div>
            <p className="text-xs text-[#77716b] dark:text-[#8b949e] max-w-xl">
              Download a complete machine-readable copy of your profile, verification statuses, CME transcripts, event registrations, and clinical posts.
            </p>
          </div>

          <button
            type="button"
            onClick={handleDownloadData}
            disabled={exporting}
            className="inline-flex items-center justify-center gap-2 shrink-0 rounded-xl bg-[#0f4c81] dark:bg-[#1f6feb] px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#0c3c66] dark:hover:bg-[#1158c7] transition disabled:opacity-50 cursor-pointer"
          >
            {exporting ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
            <span>{exporting ? "Compiling Archive..." : "Download My Data (JSON)"}</span>
          </button>
        </div>

        {exportSuccess && (
          <p className="mt-3 text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="size-4" />
            Your data export has been downloaded successfully.
          </p>
        )}
      </div>

      {/* SECTION 4: Grievance Redressal & DPO (Section 13) */}
      <div className="rounded-2xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-5 sm:p-6 shadow-xs">
        <div className="flex items-center gap-3 border-b border-[#f0ece9] dark:border-[#21262d] pb-4 mb-4">
          <div className="size-9 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <HelpCircle className="size-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#171717] dark:text-[#f0f6fc]">
              Data Protection Officer & Grievance Redressal (Section 13)
            </h2>
            <p className="text-[11px] text-[#77716b] dark:text-[#8b949e]">
              Statutory grievance redressal mechanism with guaranteed resolution timeline.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="rounded-xl bg-[#faf9f8] dark:bg-[#0d1117] p-3.5 border border-[#f0ece9] dark:border-[#21262d]">
            <p className="text-[10px] font-bold uppercase text-[#a09890] dark:text-[#8b949e]">Grievance Officer</p>
            <p className="mt-1 font-semibold text-[#171717] dark:text-[#f0f6fc]">{DPDP_OFFICER_INFO.officerName}</p>
            <p className="text-[11px] text-[#77716b]">{DPDP_OFFICER_INFO.organization}</p>
          </div>

          <div className="rounded-xl bg-[#faf9f8] dark:bg-[#0d1117] p-3.5 border border-[#f0ece9] dark:border-[#21262d]">
            <p className="text-[10px] font-bold uppercase text-[#a09890] dark:text-[#8b949e]">Official Email</p>
            <a
              href={`mailto:${DPDP_OFFICER_INFO.email}`}
              className="mt-1 block font-semibold text-[#0f4c81] dark:text-[#58a6ff] hover:underline"
            >
              {DPDP_OFFICER_INFO.email}
            </a>
            <p className="text-[11px] text-[#77716b]">Monitored daily</p>
          </div>

          <div className="rounded-xl bg-[#faf9f8] dark:bg-[#0d1117] p-3.5 border border-[#f0ece9] dark:border-[#21262d]">
            <p className="text-[10px] font-bold uppercase text-[#a09890] dark:text-[#8b949e]">Resolution Period</p>
            <p className="mt-1 font-semibold text-emerald-700 dark:text-emerald-400">Within 30 Calendar Days</p>
            <p className="text-[11px] text-[#77716b]">DPDP Rules 2025 Standard</p>
          </div>
        </div>
      </div>
    </div>
  );
}
