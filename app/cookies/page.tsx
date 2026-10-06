import type { Metadata } from "next";
import Link from "next/link";
import { Cookie, ShieldCheck, Lock, ChevronRight } from "lucide-react";
import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Cookie Policy | MedGlobalNetwork",
  description:
    "Learn how MedGlobalNetwork (MGN) uses cookies and local storage for authentication, security sessions, and user theme preferences.",
  alternates: {
    canonical: "https://mgn.life/cookies",
  },
  openGraph: {
    title: "Cookie Policy | MedGlobalNetwork",
    description:
      "Understand cookie usage and privacy safeguards on MedGlobalNetwork.",
    url: "https://mgn.life/cookies",
    siteName: "MedGlobalNetwork",
    type: "website",
  },
};

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-[#faf9f8] dark:bg-[#0d1117] text-[#171717] dark:text-[#f0f6fc] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#77716b] dark:text-[#8b949e]">
          <Link href="/" className="hover:text-[#0f4c81] dark:hover:text-[#58a6ff]">
            Home
          </Link>
          <ChevronRight className="size-3" />
          <span className="text-[#171717] dark:text-[#f0f6fc] font-semibold">Cookie Policy</span>
        </div>

        {/* Header */}
        <div className="border-b border-[#ded8d1] dark:border-[#30363d] pb-6">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-3 py-1 text-xs font-bold text-amber-800 dark:text-amber-400 mb-3">
            <Cookie className="size-3.5" />
            <span>DPDP & Transparent Tracking Notice</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#171717] dark:text-[#f0f6fc]">
            Cookie Policy
          </h1>
          <p className="mt-2 text-xs text-[#77716b] dark:text-[#8b949e]">
            Last Updated: September 2026 | Minimalist & Zero Third-Party Advertising Cookies
          </p>
        </div>

        {/* Table of Cookies */}
        <div className="space-y-6 text-xs sm:text-sm text-[#5d5854] dark:text-[#8b949e] leading-relaxed">
          <section className="rounded-2xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-6 shadow-xs space-y-3">
            <h2 className="text-base font-bold text-[#171717] dark:text-[#f0f6fc]">1. What Cookies We Use</h2>
            <p>
              MedGlobalNetwork utilizes essential first-party cookies and local storage keys exclusively to provide authenticated healthcare session management and user interface state:
            </p>

            <div className="overflow-x-auto pt-2">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#ded8d1] dark:border-[#30363d] text-[#171717] dark:text-[#f0f6fc] font-bold">
                    <th className="py-2.5 pr-4">Cookie / Storage Key</th>
                    <th className="py-2.5 pr-4">Type</th>
                    <th className="py-2.5 pr-4">Purpose</th>
                    <th className="py-2.5">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0ece9] dark:divide-[#21262d]">
                  <tr>
                    <td className="py-2.5 pr-4 font-mono font-bold text-[#0f4c81] dark:text-[#58a6ff]">better-auth.session_token</td>
                    <td className="py-2.5 pr-4">Essential / HttpOnly</td>
                    <td className="py-2.5 pr-4">Secure authentication and active clinician session validation.</td>
                    <td className="py-2.5">30 Days</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 font-mono font-bold text-[#0f4c81] dark:text-[#58a6ff]">mgn_theme</td>
                    <td className="py-2.5 pr-4">Functional (LocalStorage)</td>
                    <td className="py-2.5 pr-4">Saves your preferred UI theme (Light, Dark, or System Auto).</td>
                    <td className="py-2.5">Persistent</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 font-mono font-bold text-[#0f4c81] dark:text-[#58a6ff]">mgn_avatar_*</td>
                    <td className="py-2.5 pr-4">Functional (LocalStorage)</td>
                    <td className="py-2.5 pr-4">Fast client-side rendering of updated profile pictures.</td>
                    <td className="py-2.5">Persistent</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-2xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-6 shadow-xs space-y-3">
            <h2 className="text-base font-bold text-[#171717] dark:text-[#f0f6fc]">2. No Third-Party Ad Trackers</h2>
            <p>
              In accordance with our strict clinical confidentiality commitment, MedGlobalNetwork <strong>does not</strong> deploy third-party advertising cookies, cross-site pixel trackers, or commercial data brokers.
            </p>
          </section>

          <section className="rounded-2xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-6 shadow-xs space-y-3">
            <h2 className="text-base font-bold text-[#171717] dark:text-[#f0f6fc]">3. Managing Cookie Settings</h2>
            <p>
              You can control and delete cookies through your web browser settings. Please note that disabling essential authentication cookies will prevent you from signing in to your verified MGN profile.
            </p>
          </section>
        </div>

        {/* Footer Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-[#ded8d1] dark:border-[#30363d]">
          <Link
            href="/privacy"
            className="text-xs font-semibold text-[#0f4c81] dark:text-[#58a6ff] hover:underline"
          >
            &larr; Privacy Policy
          </Link>
          <Link
            href="/settings/privacy"
            className="text-xs font-semibold text-[#0f4c81] dark:text-[#58a6ff] hover:underline"
          >
            Open Privacy & Consent Center &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
