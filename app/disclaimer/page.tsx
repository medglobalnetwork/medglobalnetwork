import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, ShieldCheck, Stethoscope, FileText, ChevronRight, ExternalLink } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { SITE_URL, SITE_NAME } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Medical & Clinical Disclaimer | MedGlobalNetwork",
  description:
    "Official Medical and Clinical Disclaimer for MedGlobalNetwork (MGN). Peer-to-peer professional networking, clinical case discussions, patient de-identification, and no doctor-patient relationship terms.",
  alternates: {
    canonical: "https://mgn.life/disclaimer",
  },
  openGraph: {
    title: "Medical & Clinical Disclaimer | MedGlobalNetwork",
    description:
      "Important clinical and medical notices regarding peer discussions, case reviews, and continuing education on MedGlobalNetwork.",
    url: "https://mgn.life/disclaimer",
    siteName: "MedGlobalNetwork",
    type: "website",
  },
};

const disclaimerSchema = {
  "@context": "https://schema.org",
  "@type": "MedicalWebPage",
  name: "Medical & Clinical Disclaimer",
  url: `${SITE_URL}/disclaimer`,
  description:
    "Statutory medical disclaimer outlining peer consultation boundaries, patient de-identification compliance, and absence of direct doctor-patient relationships.",
  publisher: {
    "@type": "MedicalOrganization",
    name: SITE_NAME,
    url: SITE_URL,
  },
};

export default function MedicalDisclaimerPage() {
  return (
    <div className="min-h-screen bg-[#faf9f8] dark:bg-[#0d1117] text-[#171717] dark:text-[#f0f6fc] py-12 px-4 sm:px-6 lg:px-8">
      <JsonLd schema={disclaimerSchema} />
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#77716b] dark:text-[#8b949e]">
          <Link href="/" className="hover:text-[#0f4c81] dark:hover:text-[#58a6ff]">
            Home
          </Link>
          <ChevronRight className="size-3" />
          <span className="text-[#171717] dark:text-[#f0f6fc] font-semibold">Medical Disclaimer</span>
        </div>

        {/* Header */}
        <div className="border-b border-[#ded8d1] dark:border-[#30363d] pb-6">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-3 py-1 text-xs font-bold text-amber-800 dark:text-amber-400 mb-3">
            <AlertTriangle className="size-3.5" />
            <span>Healthcare Professional Network Notice</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#171717] dark:text-[#f0f6fc]">
            Medical & Clinical Disclaimer
          </h1>
          <p className="mt-2 text-xs text-[#77716b] dark:text-[#8b949e]">
            Last Updated: September 2026 | Governing: All Clinical Posts, CME Courses & Case Discussions
          </p>
        </div>

        {/* Disclaimer Highlights */}
        <div className="rounded-2xl bg-amber-500/10 border border-amber-300 dark:border-amber-800/60 p-5 space-y-2">
          <p className="text-xs sm:text-sm font-bold text-amber-900 dark:text-amber-300">
            ⚠️ Important Notice for General Public & Patients:
          </p>
          <p className="text-xs text-amber-950 dark:text-amber-200 leading-relaxed">
            MedGlobalNetwork (MGN - https://mgn.life) is an exclusive academic, educational, and professional network for verified healthcare professionals. Nothing on this website constitutes direct patient medical advice, clinical diagnosis, or a doctor-patient relationship. In a medical emergency, call your local emergency medical number (e.g. 112 / 108) or visit the nearest hospital emergency room immediately.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-6 text-xs sm:text-sm text-[#5d5854] dark:text-[#8b949e] leading-relaxed">
          <section className="rounded-2xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-6 shadow-xs space-y-3">
            <h2 className="text-base font-bold text-[#171717] dark:text-[#f0f6fc] flex items-center gap-2">
              <Stethoscope className="size-4 text-[#0f4c81] dark:text-[#58a6ff]" />
              <span>1. Absence of Doctor-Patient Relationship</span>
            </h2>
            <p>
              Interactions, comments, case presentations, and collaborative posts published on MedGlobalNetwork do not establish a physician-patient or clinician-patient relationship. Content is shared strictly for peer education, clinical research exploration, and Continuing Medical Education (CME) among qualified practitioners.
            </p>
          </section>

          <section className="rounded-2xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-6 shadow-xs space-y-3">
            <h2 className="text-base font-bold text-[#171717] dark:text-[#f0f6fc] flex items-center gap-2">
              <ShieldCheck className="size-4 text-emerald-600" />
              <span>2. Mandatory Patient De-Identification (HIPAA / DISHA / NMC Code)</span>
            </h2>
            <p>
              All members sharing clinical case studies, X-rays, MRI scans, histological slides, or surgical video clips are strictly obligated by professional code of conduct to ensure 100% de-identification of patient records:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>No patient names, addresses, phone numbers, or social media identifiers.</li>
              <li>No visible facial features or recognizable biometric markings without prior written ethical consent.</li>
              <li>No institutional Medical Record Numbers (MRNs), admission numbers, or exact dates of birth.</li>
            </ul>
          </section>

          <section className="rounded-2xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-6 shadow-xs space-y-3">
            <h2 className="text-base font-bold text-[#171717] dark:text-[#f0f6fc]">3. Independent Clinical Judgment</h2>
            <p>
              Medical science evolves rapidly. While authors and course instructors on MGN strive to present evidence-based practices, clinical decisions must always be tailored to the individual patient&apos;s history, diagnostic workup, and localized clinical protocols. MedGlobalNetwork and its editorial contributors assume no liability for treatment decisions made based on platform content.
            </p>
          </section>

          <section className="rounded-2xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-6 shadow-xs space-y-3">
            <h2 className="text-base font-bold text-[#171717] dark:text-[#f0f6fc]">4. Off-Label & Investigational Therapies</h2>
            <p>
              Certain discussions and research preprints may reference investigational devices or off-label pharmaceutical uses not yet approved by regulatory bodies (such as CDSCO, US FDA, or EMA). Practitioners are responsible for verifying regulatory approval and prescribing information before applying novel interventions in clinical practice.
            </p>
          </section>
        </div>

        {/* Footer Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-[#ded8d1] dark:border-[#30363d]">
          <Link
            href="/terms"
            className="text-xs font-semibold text-[#0f4c81] dark:text-[#58a6ff] hover:underline"
          >
            &larr; Terms of Service
          </Link>
          <Link
            href="/guidelines"
            className="text-xs font-semibold text-[#0f4c81] dark:text-[#58a6ff] hover:underline"
          >
            Community & Clinical Guidelines &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
