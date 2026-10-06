import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, Lock, Mail, Clock, ChevronRight, ExternalLink } from "lucide-react";
import { DPDP_OFFICER_INFO, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Privacy Policy & DPDP Data Protection | MGN",
  description:
    "MedGlobalNetwork (MGN) Privacy Policy detailing data collection, processing grounds, clinician confidentiality, and compliance with the Digital Personal Data Protection Act (DPDP Act, 2023).",
  alternates: {
    canonical: "https://mgn.life/privacy",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#faf9f8] dark:bg-[#0d1117] text-[#171717] dark:text-[#f0f6fc] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#77716b] dark:text-[#8b949e]">
          <Link href="/" className="hover:text-[#0f4c81] dark:hover:text-[#58a6ff]">
            Home
          </Link>
          <ChevronRight className="size-3" />
          <span className="text-[#171717] dark:text-[#f0f6fc] font-semibold">Privacy Policy</span>
        </div>

        {/* Header */}
        <div className="border-b border-[#ded8d1] dark:border-[#30363d] pb-6">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 px-3 py-1 text-xs font-bold text-[#0f4c81] dark:text-[#58a6ff] mb-3">
            <ShieldCheck className="size-3.5" />
            <span>DPDP Act 2023 & Clinical Confidentiality Standards</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#171717] dark:text-[#f0f6fc]">
            Privacy Policy & Data Governance
          </h1>
          <p className="mt-2 text-xs text-[#77716b] dark:text-[#8b949e]">
            Last Updated: September 2026 | Effective Date: Immediate
          </p>
        </div>

        {/* Content Body */}
        <div className="space-y-6 text-xs sm:text-sm text-[#5d5854] dark:text-[#8b949e] leading-relaxed">
          <section className="rounded-2xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-6 shadow-xs space-y-3">
            <h2 className="text-base font-bold text-[#171717] dark:text-[#f0f6fc]">1. Introduction & Data Fiduciary Role</h2>
            <p>
              MedGlobalNetwork (&quot;MGN&quot;, &quot;we&quot;, &quot;us&quot;, &quot;platform&quot;, accessible at{" "}
              <a href="https://mgn.life" className="text-[#0f4c81] dark:text-[#58a6ff] underline">
                https://mgn.life
              </a>
              ) operates as a Data Fiduciary under the Digital Personal Data Protection Act, 2023 (DPDP Act) of India. We provide a continuous medical education, peer consultation, healthcare events, and clinical career network for verified medical practitioners and researchers.
            </p>
          </section>

          <section className="rounded-2xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-6 shadow-xs space-y-3">
            <h2 className="text-base font-bold text-[#171717] dark:text-[#f0f6fc]">2. Personal Data We Collect</h2>
            <ul className="list-disc list-inside space-y-1.5 pl-2">
              <li><strong>Identity & Account Data:</strong> Full name, professional email address, contact phone number, and account credentials.</li>
              <li><strong>Clinical & Credential Data:</strong> Medical council registration number, issuing state/national medical council, primary medical degrees, specialty, and hospital/institutional affiliations.</li>
              <li><strong>Verification Records:</strong> Scanned copies of medical licenses and government identity documents (stored encrypted and accessed strictly for credential validation).</li>
              <li><strong>Academic & CME Records:</strong> Course progress, assessment scores, earned CME credits, and digital certificates.</li>
              <li><strong>Platform Interactions:</strong> Case discussion posts, comments, connections, event registrations, and community memberships.</li>
            </ul>
          </section>

          <section className="rounded-2xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-6 shadow-xs space-y-3">
            <h2 className="text-base font-bold text-[#171717] dark:text-[#f0f6fc]">3. Lawful Grounds for Processing (Section 4 & 7)</h2>
            <p>We process personal digital data strictly based on:</p>
            <ul className="list-disc list-inside space-y-1.5 pl-2">
              <li><strong>Explicit Consent:</strong> Provided by you during registration and customizable via the <Link href="/settings/privacy" className="text-[#0f4c81] dark:text-[#58a6ff] font-semibold underline">Privacy & Consent Center</Link>.</li>
              <li><strong>Legitimate Professional Uses:</strong> Verification against official medical council registries to maintain a safe, fraud-free clinical environment.</li>
              <li><strong>Statutory Compliance:</strong> Issuance of CME credit transcripts and regulatory reporting.</li>
            </ul>
          </section>

          <section className="rounded-2xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-6 shadow-xs space-y-3">
            <h2 className="text-base font-bold text-[#171717] dark:text-[#f0f6fc]">4. Data Principal Rights (Sections 11–14)</h2>
            <p>Every registered user on MGN has the right to:</p>
            <ul className="list-disc list-inside space-y-1.5 pl-2">
              <li><strong>Right to Access (Sec 11):</strong> Download a complete JSON archive of your personal records at any time from Settings.</li>
              <li><strong>Right to Correction & Erasure (Sec 12):</strong> Update inaccurate information or permanently delete your account.</li>
              <li><strong>Right to Nominate (Sec 14):</strong> Appoint a legal or clinical nominee in your settings to manage data in case of incapacity.</li>
              <li><strong>Right to Withdraw Consent (Sec 6):</strong> Toggle itemized permissions off with instant server-side effect.</li>
            </ul>
          </section>

          <section className="rounded-2xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-6 shadow-xs space-y-3">
            <h2 className="text-base font-bold text-[#171717] dark:text-[#f0f6fc]">5. Statutory Grievance Redressal (Section 13)</h2>
            <p>
              In compliance with Section 13 of the DPDP Act and DPDP Rules 2025, our designated Grievance Officer investigates and resolves all privacy concerns within a maximum statutory period of <strong>30 calendar days</strong>.
            </p>
            <div className="p-3.5 bg-[#faf9f8] dark:bg-[#0d1117] rounded-xl border border-[#ded8d1] dark:border-[#30363d] text-xs space-y-1">
              <p><strong>Grievance Officer:</strong> {DPDP_OFFICER_INFO.officerName}</p>
              <p><strong>Email:</strong> <a href={`mailto:${DPDP_OFFICER_INFO.email}`} className="text-[#0f4c81] dark:text-[#58a6ff] underline">{DPDP_OFFICER_INFO.email}</a></p>
              <p><strong>Escalation:</strong> If unresolved within 30 days, users may submit an appeal to the Data Protection Board of India (DPBI).</p>
            </div>
          </section>
        </div>

        {/* Footer Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-[#ded8d1] dark:border-[#30363d]">
          <Link
            href="/dpdp"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0f4c81] dark:text-[#58a6ff] hover:underline"
          >
            <span>View Full DPDP Compliance & Grievance Notice</span>
            <ExternalLink className="size-3.5" />
          </Link>
          <Link
            href="/terms"
            className="text-xs text-[#77716b] dark:text-[#8b949e] hover:text-[#171717] dark:hover:text-[#f0f6fc]"
          >
            Terms of Service &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
