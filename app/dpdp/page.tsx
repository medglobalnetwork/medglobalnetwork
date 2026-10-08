import type { Metadata } from "next";
import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  UserCheck,
  FileCheck,
  AlertCircle,
  Mail,
  Scale,
  Clock,
  ExternalLink,
  ChevronRight,
  Download,
  Building,
} from "lucide-react";
import { DPDP_OFFICER_INFO, SITE_URL } from "@/lib/seo";
import { MGN_EMAILS } from "@/lib/contact-emails";

export const metadata: Metadata = {
  title: "DPDP Compliance, Privacy Notice & Grievance Redressal | MGN",
  description:
    "Official Digital Personal Data Protection (DPDP Act 2023) notice for MedGlobalNetwork. Learn about Data Principal rights, consent management, nominee appointment, and statutory grievance redressal.",
  alternates: {
    canonical: "https://mgn.life/dpdp",
  },
  openGraph: {
    title: "DPDP Compliance & Data Protection Notice | MedGlobalNetwork",
    description:
      "Understand your rights as a Data Principal under the Digital Personal Data Protection Act 2023 on MedGlobalNetwork.",
    url: "https://mgn.life/dpdp",
    siteName: "MedGlobalNetwork",
    type: "website",
  },
};

export default function DpdpNoticePage() {
  return (
    <div className="min-h-screen bg-[#faf9f8] dark:bg-[#0d1117] text-[#171717] dark:text-[#f0f6fc] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Breadcrumb / Back */}
        <div className="flex items-center gap-2 text-xs text-[#77716b] dark:text-[#8b949e]">
          <Link href="/" className="hover:text-[#0f4c81] dark:hover:text-[#58a6ff]">
            Home
          </Link>
          <ChevronRight className="size-3" />
          <span className="text-[#171717] dark:text-[#f0f6fc] font-semibold">DPDP Notice & Grievance</span>
        </div>

        {/* Hero Banner */}
        <div className="rounded-3xl bg-gradient-to-br from-[#0f4c81] via-[#125ca8] to-[#0c3c66] p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-white backdrop-blur-md border border-white/20">
              <ShieldCheck className="size-4 text-emerald-300" />
              <span>DPDP Act 2023 & DPDP Rules 2025 Statutory Notice</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Data Protection, Privacy Governance & Grievance Redressal
            </h1>
            <p className="text-sm sm:text-base text-blue-100 leading-relaxed">
              MedGlobalNetwork (MGN - https://mgn.life) operates as a Data Fiduciary committed to safeguarding personal and clinical professional data with the highest statutory compliance standards.
            </p>
          </div>
        </div>

        {/* Key Rights Grid */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-[#171717] dark:text-[#f0f6fc] flex items-center gap-2">
            <Scale className="size-5 text-[#0f4c81] dark:text-[#58a6ff]" />
            <span>Your Rights as a Data Principal</span>
          </h2>
          <p className="text-xs text-[#77716b] dark:text-[#8b949e]">
            Under Chapters II and III of the Digital Personal Data Protection Act, 2023, every verified clinician and user on MGN is entitled to the following actionable rights:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Right 1 */}
            <div className="rounded-2xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-5 shadow-xs space-y-2">
              <div className="flex items-center gap-2.5 text-[#0f4c81] dark:text-[#58a6ff]">
                <FileCheck className="size-5" />
                <h3 className="text-sm font-bold text-[#171717] dark:text-[#f0f6fc]">
                  1. Right to Access Information (Sec 11)
                </h3>
              </div>
              <p className="text-xs text-[#5d5854] dark:text-[#8b949e] leading-relaxed">
                You can obtain a summary of digital personal data being processed by MGN, the identities of all Data Fiduciaries/Processors with whom your data has been shared, and a complete downloadable JSON archive from your Account Settings.
              </p>
            </div>

            {/* Right 2 */}
            <div className="rounded-2xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-5 shadow-xs space-y-2">
              <div className="flex items-center gap-2.5 text-purple-600 dark:text-purple-400">
                <UserCheck className="size-5" />
                <h3 className="text-sm font-bold text-[#171717] dark:text-[#f0f6fc]">
                  2. Right to Nominate (Sec 14)
                </h3>
              </div>
              <p className="text-xs text-[#5d5854] dark:text-[#8b949e] leading-relaxed">
                You have the statutory right to appoint an authorized individual (nominee, legal heir, or clinical representative) who shall exercise your data rights in the event of death or medical incapacity via the MGN Privacy Settings.
              </p>
            </div>

            {/* Right 3 */}
            <div className="rounded-2xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-5 shadow-xs space-y-2">
              <div className="flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400">
                <Lock className="size-5" />
                <h3 className="text-sm font-bold text-[#171717] dark:text-[#f0f6fc]">
                  3. Right to Consent Withdrawal (Sec 6)
                </h3>
              </div>
              <p className="text-xs text-[#5d5854] dark:text-[#8b949e] leading-relaxed">
                You may withdraw consent for itemized processing activities (e.g., search engine indexing, hospital recruitment inquiries, or CME transcripts sharing) at any time through the 1-click toggle center in Privacy Settings.
              </p>
            </div>

            {/* Right 4 */}
            <div className="rounded-2xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-5 shadow-xs space-y-2">
              <div className="flex items-center gap-2.5 text-rose-600 dark:text-rose-400">
                <AlertCircle className="size-5" />
                <h3 className="text-sm font-bold text-[#171717] dark:text-[#f0f6fc]">
                  4. Right to Correction & Erasure (Sec 12 & 8(7))
                </h3>
              </div>
              <p className="text-xs text-[#5d5854] dark:text-[#8b949e] leading-relaxed">
                You can correct inaccurate personal credentials or trigger permanent account erasure. Personal records will be permanently erased except where retention is strictly mandated by medical or tax laws.
              </p>
            </div>
          </div>
        </div>

        {/* Statutory Grievance Redressal Section */}
        <div className="rounded-2xl border-2 border-[#0f4c81]/30 dark:border-[#388bfd]/30 bg-white dark:bg-[#161b22] p-6 sm:p-8 shadow-md space-y-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#0f4c81] dark:text-[#58a6ff]">
                Statutory Redressal Desk (Section 13)
              </span>
              <h2 className="text-xl font-bold text-[#171717] dark:text-[#f0f6fc]">
                Grievance Redressal & Data Protection Officer (DPO)
              </h2>
            </div>

            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              <Clock className="size-3.5" />
              <span>Response within 30 days guaranteed</span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-[#5d5854] dark:text-[#8b949e] leading-relaxed">
            If you have any questions, concerns, complaints regarding your personal data processing, or wish to report a potential privacy breach, please contact our designated Grievance Officer:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-[#faf9f8] dark:bg-[#0d1117] border border-[#ded8d1] dark:border-[#30363d] space-y-1">
              <p className="text-[10px] font-bold uppercase text-[#a09890] dark:text-[#8b949e]">Designation</p>
              <p className="font-bold text-sm text-[#171717] dark:text-[#f0f6fc]">Data Protection & Grievance Officer</p>
              <p className="text-[#77716b]">MedGlobalNetwork Legal & Compliance Team</p>
            </div>

            <div className="p-4 rounded-xl bg-[#faf9f8] dark:bg-[#0d1117] border border-[#ded8d1] dark:border-[#30363d] space-y-1">
              <p className="text-[10px] font-bold uppercase text-[#a09890] dark:text-[#8b949e]">Privacy & Grievance Email</p>
              <a
                href={`mailto:${MGN_EMAILS.privacy}`}
                className="font-bold text-sm text-[#0f4c81] dark:text-[#58a6ff] hover:underline block"
              >
                {MGN_EMAILS.privacy}
              </a>
              <p className="text-[#77716b]">Copy: {MGN_EMAILS.support}</p>
            </div>
          </div>

          <div className="text-xs text-[#77716b] dark:text-[#8b949e] bg-[#faf9f8] dark:bg-[#0d1117] p-4 rounded-xl border border-[#ded8d1] dark:border-[#30363d] space-y-1.5">
            <p className="font-semibold text-[#171717] dark:text-[#f0f6fc]">Escalation to Data Protection Board of India (DPBI):</p>
            <p>
              If your grievance is not redressed by our Grievance Officer within 30 days of filing, you have the right under Section 13(3) of the DPDP Act to submit an appeal to the Data Protection Board of India.
            </p>
          </div>
        </div>

        {/* Security & Safeguards Section */}
        <div className="rounded-2xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-[#171717] dark:text-[#f0f6fc]">
            Security Safeguards & Technical Measures (Section 8(5))
          </h3>
          <ul className="space-y-2 text-xs text-[#5d5854] dark:text-[#8b949e] list-disc list-inside">
            <li><strong>Encryption:</strong> All personal credentials, council numbers, and KYC files are encrypted at rest with AES-256 and in transit via TLS 1.3.</li>
            <li><strong>Role-Based Access Controls (RBAC):</strong> Verification documents are accessible solely to certified credentialing officers through signed, time-limited tokens.</li>
            <li><strong>72-Hour Breach Notification SOP:</strong> MGN maintains a protocol to notify affected Data Principals and the DPBI within 72 hours of any confirmed security incident.</li>
            <li><strong>Age Limitation:</strong> In accordance with Section 9, MGN is strictly restricted to verified adults (18+). No child data is processed.</li>
          </ul>
        </div>

        {/* Action Link Footer */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[#ded8d1] dark:border-[#30363d]">
          <Link
            href="/settings/privacy"
            className="inline-flex items-center gap-2 rounded-xl bg-[#0f4c81] dark:bg-[#1f6feb] px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#0c3c66] dark:hover:bg-[#1158c7] transition"
          >
            <Lock className="size-4" />
            <span>Open My Privacy & Consent Center</span>
          </Link>

          <Link
            href="/privacy"
            className="text-xs font-semibold text-[#0f4c81] dark:text-[#58a6ff] hover:underline"
          >
            View General Privacy Policy &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
