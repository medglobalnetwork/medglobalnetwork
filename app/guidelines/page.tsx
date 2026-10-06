import type { Metadata } from "next";
import Link from "next/link";
import { Users, ShieldAlert, Award, HeartHandshake, ChevronRight, CheckCircle2, XCircle } from "lucide-react";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Community & Clinical Guidelines | MedGlobalNetwork",
  description:
    "Official Code of Conduct, peer consultation ethics, content moderation rules, and professional standards for healthcare practitioners on MedGlobalNetwork.",
  alternates: {
    canonical: "https://mgn.life/guidelines",
  },
  openGraph: {
    title: "Community & Clinical Guidelines | MedGlobalNetwork",
    description:
      "Standards of professional conduct, academic integrity, and respectful peer consultation on MedGlobalNetwork.",
    url: "https://mgn.life/guidelines",
    siteName: "MedGlobalNetwork",
    type: "website",
  },
};

export default function CommunityGuidelinesPage() {
  return (
    <div className="min-h-screen bg-[#faf9f8] dark:bg-[#0d1117] text-[#171717] dark:text-[#f0f6fc] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#77716b] dark:text-[#8b949e]">
          <Link href="/" className="hover:text-[#0f4c81] dark:hover:text-[#58a6ff]">
            Home
          </Link>
          <ChevronRight className="size-3" />
          <span className="text-[#171717] dark:text-[#f0f6fc] font-semibold">Community Guidelines</span>
        </div>

        {/* Header */}
        <div className="border-b border-[#ded8d1] dark:border-[#30363d] pb-6">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 px-3 py-1 text-xs font-bold text-[#0f4c81] dark:text-[#58a6ff] mb-3">
            <Users className="size-3.5" />
            <span>Professional Code of Conduct</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#171717] dark:text-[#f0f6fc]">
            Community & Clinical Guidelines
          </h1>
          <p className="mt-2 text-xs text-[#77716b] dark:text-[#8b949e]">
            Last Updated: September 2026 | Upholding Clinical Rigor & Collegial Respect
          </p>
        </div>

        {/* Pillars of MGN Community */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 p-5 space-y-3">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
              <CheckCircle2 className="size-4 text-emerald-600" />
              <span>What We Encourage (Do&apos;s)</span>
            </div>
            <ul className="space-y-2 text-xs text-emerald-950 dark:text-emerald-200">
              <li>✓ Evidence-based clinical discussions citing reputable peer-reviewed journals.</li>
              <li>✓ Thoughtful second opinions and inter-disciplinary peer consultations (e.g. Surgery + Physiotherapy).</li>
              <li>✓ Constructive academic feedback and mentorship to junior doctors and medical students.</li>
              <li>✓ Organizing free preventive screening camps and community health drives.</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 p-5 space-y-3">
            <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 font-bold text-sm">
              <XCircle className="size-4 text-rose-600" />
              <span>Zero-Tolerance Violations (Don&apos;ts)</span>
            </div>
            <ul className="space-y-2 text-xs text-rose-950 dark:text-rose-200">
              <li>✗ Posting identifiable patient records, unblurred faces, or unconsented clinical videos.</li>
              <li>✗ Promoting unscientific cures, pseudoscience, or unauthorized pharmaceutical MLM schemes.</li>
              <li>✗ Impersonating licensed physicians or uploading fraudulent medical council credentials.</li>
              <li>✗ Distributing copyrighted medical books, paid test banks, or pirated course materials.</li>
            </ul>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="space-y-6 text-xs sm:text-sm text-[#5d5854] dark:text-[#8b949e] leading-relaxed">
          <section className="rounded-2xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-6 shadow-xs space-y-3">
            <h2 className="text-base font-bold text-[#171717] dark:text-[#f0f6fc]">1. Scientific Integrity & Attribution</h2>
            <p>
              When sharing medical research summaries, clinical trial data, or meta-analyses, always cite original DOIs, authors, and publishing journals. Plagiarism or misrepresenting research findings will lead to post removal and reputation score deduction.
            </p>
          </section>

          <section className="rounded-2xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-6 shadow-xs space-y-3">
            <h2 className="text-base font-bold text-[#171717] dark:text-[#f0f6fc]">2. Commercial Conflicts of Interest (COI)</h2>
            <p>
              Clinicians presenting pharmaceutical findings, device evaluations, or industry-sponsored webinars must explicitly disclose any financial affiliations, consultancy roles, or grants received from medical device or pharmaceutical manufacturers.
            </p>
          </section>

          <section className="rounded-2xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-6 shadow-xs space-y-3">
            <h2 className="text-base font-bold text-[#171717] dark:text-[#f0f6fc]">3. Reporting Violations & Safe Harbor Moderation</h2>
            <p>
              To report any abusive content, patient confidentiality breach, or impersonation, click the &quot;Report&quot; button on any post or email our Trust & Safety Team at{" "}
              <a href="mailto:safety@mgn.life" className="font-semibold text-[#0f4c81] dark:text-[#58a6ff] underline">
                safety@mgn.life
              </a>
              . Reports are reviewed by human medical moderators within 24 hours.
            </p>
          </section>
        </div>

        {/* Footer Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-[#ded8d1] dark:border-[#30363d]">
          <Link
            href="/disclaimer"
            className="text-xs font-semibold text-[#0f4c81] dark:text-[#58a6ff] hover:underline"
          >
            &larr; Medical Disclaimer
          </Link>
          <Link
            href="/dmca"
            className="text-xs font-semibold text-[#0f4c81] dark:text-[#58a6ff] hover:underline"
          >
            Copyright & DMCA Policy &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
