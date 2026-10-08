import type { Metadata } from "next";
import Link from "next/link";
import { FileText, ShieldAlert, Mail, ChevronRight, Clock } from "lucide-react";
import { SITE_URL, DPDP_OFFICER_INFO } from "@/lib/seo";
import { MGN_EMAILS } from "@/lib/contact-emails";

export const metadata: Metadata = {
  title: "Copyright & DMCA Takedown Policy | MedGlobalNetwork",
  description:
    "Official Copyright, DMCA and Intellectual Property Rights (IPR) notice and takedown procedure for MedGlobalNetwork (MGN).",
  alternates: {
    canonical: "https://mgn.life/dmca",
  },
  openGraph: {
    title: "Copyright & DMCA Policy | MedGlobalNetwork",
    description:
      "Procedure for authors, medical publishers, and copyright holders to report unauthorized content on MGN.",
    url: "https://mgn.life/dmca",
    siteName: "MedGlobalNetwork",
    type: "website",
  },
};

export default function DmcaPolicyPage() {
  return (
    <div className="min-h-screen bg-[#faf9f8] dark:bg-[#0d1117] text-[#171717] dark:text-[#f0f6fc] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#77716b] dark:text-[#8b949e]">
          <Link href="/" className="hover:text-[#0f4c81] dark:hover:text-[#58a6ff]">
            Home
          </Link>
          <ChevronRight className="size-3" />
          <span className="text-[#171717] dark:text-[#f0f6fc] font-semibold">Copyright & DMCA</span>
        </div>

        {/* Header */}
        <div className="border-b border-[#ded8d1] dark:border-[#30363d] pb-6">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 px-3 py-1 text-xs font-bold text-purple-800 dark:text-purple-400 mb-3">
            <FileText className="size-3.5" />
            <span>Digital Millennium Copyright Act & IT Rules 2021 Notice</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#171717] dark:text-[#f0f6fc]">
            Copyright & IPR Takedown Policy
          </h1>
          <p className="mt-2 text-xs text-[#77716b] dark:text-[#8b949e]">
            Last Updated: September 2026 | Safe Harbor & 36-Hour Notice Procedure
          </p>
        </div>

        {/* Content Body */}
        <div className="space-y-6 text-xs sm:text-sm text-[#5d5854] dark:text-[#8b949e] leading-relaxed">
          <section className="rounded-2xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-6 shadow-xs space-y-3">
            <h2 className="text-base font-bold text-[#171717] dark:text-[#f0f6fc]">1. Respect for Intellectual Property</h2>
            <p>
              MedGlobalNetwork respects the intellectual property rights of academic publishers, medical authors, researchers, and clinicians. In accordance with the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021 and the DMCA, we respond expeditiously to notices of alleged copyright infringement.
            </p>
          </section>

          <section className="rounded-2xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-6 shadow-xs space-y-3">
            <h2 className="text-base font-bold text-[#171717] dark:text-[#f0f6fc]">2. Filing a Copyright Infringement Notice</h2>
            <p>
              If you are a copyright owner or an authorized agent and believe that content on MGN infringes upon your copyright, please send a written notification including:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2">
              <li>Identification of the copyrighted work claimed to have been infringed (e.g. journal title, DOI, or book ISBN).</li>
              <li>The exact URL or link to the infringing material on MGN.</li>
              <li>Your physical/electronic signature and contact information (Name, Organization, Email, Phone).</li>
              <li>A statement that you have a good faith belief that the disputed use is not authorized by the copyright owner, its agent, or the law.</li>
              <li>A statement, under penalty of perjury, that the information in your notice is accurate.</li>
            </ul>
          </section>

          <section className="rounded-2xl border-2 border-purple-200 dark:border-purple-800 bg-purple-50/40 dark:bg-purple-950/20 p-6 shadow-xs space-y-3">
            <h2 className="text-base font-bold text-purple-950 dark:text-purple-200 flex items-center gap-2">
              <Mail className="size-4 text-purple-600" />
              <span>3. Designated Copyright / DMCA Agent Contact</span>
            </h2>
            <div className="space-y-1 text-xs">
              <p><strong>Designation:</strong> Intellectual Property & DMCA Compliance Officer</p>
              <p><strong>Organization:</strong> MedGlobalNetwork (MGN)</p>
              <p>
                <strong>Email:</strong>{" "}
                <a href={`mailto:${MGN_EMAILS.legal}`} className="font-bold text-[#0f4c81] dark:text-[#58a6ff] underline">
                  {MGN_EMAILS.legal}
                </a>{" "}
                (Cc: {MGN_EMAILS.privacy})
              </p>
              <p><strong>Turnaround Time:</strong> Review and takedown action within <strong>24 to 36 hours</strong>.</p>
            </div>
          </section>
        </div>

        {/* Footer Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-[#ded8d1] dark:border-[#30363d]">
          <Link
            href="/guidelines"
            className="text-xs font-semibold text-[#0f4c81] dark:text-[#58a6ff] hover:underline"
          >
            &larr; Community Guidelines
          </Link>
          <Link
            href="/terms"
            className="text-xs font-semibold text-[#0f4c81] dark:text-[#58a6ff] hover:underline"
          >
            Terms of Service &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
