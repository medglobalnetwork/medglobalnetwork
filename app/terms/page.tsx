import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, FileText, ChevronRight, ExternalLink } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service | MedGlobalNetwork",
  description:
    "Terms of Service governing the use of the MedGlobalNetwork (MGN) medical professional network, CME courses, and clinical collaboration platform.",
  alternates: {
    canonical: "https://mgn.life/terms",
  },
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-[#faf9f8] dark:bg-[#0d1117] text-[#171717] dark:text-[#f0f6fc] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#77716b] dark:text-[#8b949e]">
          <Link href="/" className="hover:text-[#0f4c81] dark:hover:text-[#58a6ff]">
            Home
          </Link>
          <ChevronRight className="size-3" />
          <span className="text-[#171717] dark:text-[#f0f6fc] font-semibold">Terms of Service</span>
        </div>

        {/* Header */}
        <div className="border-b border-[#ded8d1] dark:border-[#30363d] pb-6">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 px-3 py-1 text-xs font-bold text-[#0f4c81] dark:text-[#58a6ff] mb-3">
            <FileText className="size-3.5" />
            <span>Professional Network Terms</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#171717] dark:text-[#f0f6fc]">
            Terms of Service
          </h1>
          <p className="mt-2 text-xs text-[#77716b] dark:text-[#8b949e]">
            Last Updated: September 2026 | Effective Date: Immediate
          </p>
        </div>

        {/* Content Body */}
        <div className="space-y-6 text-xs sm:text-sm text-[#5d5854] dark:text-[#8b949e] leading-relaxed">
          <section className="rounded-2xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-6 shadow-xs space-y-3">
            <h2 className="text-base font-bold text-[#171717] dark:text-[#f0f6fc]">1. Eligibility & Age Limitation (18+)</h2>
            <p>
              MedGlobalNetwork is strictly designed and intended for individuals aged <strong>18 years or older</strong> who are licensed medical practitioners, surgeons, physical therapists, nurses, clinical researchers, healthcare students, or authorized healthcare organizations. By registering, you confirm that you meet this eligibility threshold.
            </p>
          </section>

          <section className="rounded-2xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-6 shadow-xs space-y-3">
            <h2 className="text-base font-bold text-[#171717] dark:text-[#f0f6fc]">2. Professional Credentialing & Verification</h2>
            <p>
              Users seeking the &quot;Verified Clinician&quot; badge must submit accurate Medical Council registration details and valid supporting documents. Providing falsified licenses or impersonating medical professionals is strictly prohibited and results in immediate account termination, audit reporting, and referral to relevant medical boards.
            </p>
          </section>

          <section className="rounded-2xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-6 shadow-xs space-y-3">
            <h2 className="text-base font-bold text-[#171717] dark:text-[#f0f6fc]">3. Patient Privacy & De-Identification Standards</h2>
            <p>
              When sharing clinical case studies, medical imagery, or surgical videos, users are strictly required to ensure complete patient de-identification in accordance with medical ethics and privacy laws. No Protected Health Information (PHI) or identifiable patient details may be posted without explicit written patient authorization.
            </p>
          </section>

          <section className="rounded-2xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-6 shadow-xs space-y-3">
            <h2 className="text-base font-bold text-[#171717] dark:text-[#f0f6fc]">4. Continuing Medical Education (CME) & Assessments</h2>
            <p>
              CME credit certificates awarded on MGN reflect completed course modules and passing grades on clinical assessments. Credits are issued in partnership with recognized academic bodies. Sharing test solutions or cheating on assessments will void issued certificates.
            </p>
          </section>

          <section className="rounded-2xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-6 shadow-xs space-y-3">
            <h2 className="text-base font-bold text-[#171717] dark:text-[#f0f6fc]">5. Governing Law & Dispute Resolution</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of India. For privacy and personal data matters, disputes are subject to the jurisdiction of the Data Protection Board of India (DPBI) and courts of New Delhi, India.
            </p>
          </section>
        </div>

        {/* Footer Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-[#ded8d1] dark:border-[#30363d]">
          <Link
            href="/privacy"
            className="text-xs font-semibold text-[#0f4c81] dark:text-[#58a6ff] hover:underline"
          >
            &larr; View Privacy Policy
          </Link>
          <Link
            href="/dpdp"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0f4c81] dark:text-[#58a6ff] hover:underline"
          >
            <span>DPDP Notice & Grievance Desk</span>
            <ExternalLink className="size-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
