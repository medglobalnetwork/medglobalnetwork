import type { Metadata } from "next";
import Link from "next/link";
import { CreditCard, RefreshCw, CheckCircle2, Clock, ChevronRight, Mail } from "lucide-react";
import { SITE_URL, DPDP_OFFICER_INFO } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy | MedGlobalNetwork",
  description:
    "Official Refund, Cancellation and Billing Policy for MedGlobalNetwork (MGN) CME courses, medical masterclasses, event tickets, and enterprise subscriptions.",
  alternates: {
    canonical: "https://mgn.life/refund",
  },
  openGraph: {
    title: "Refund & Cancellation Policy | MedGlobalNetwork",
    description:
      "Transparent cancellation and refund guidelines for CME courses, conference registrations, and hospital subscriptions on MGN.",
    url: "https://mgn.life/refund",
    siteName: "MedGlobalNetwork",
    type: "website",
  },
};

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-[#faf9f8] dark:bg-[#0d1117] text-[#171717] dark:text-[#f0f6fc] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#77716b] dark:text-[#8b949e]">
          <Link href="/" className="hover:text-[#0f4c81] dark:hover:text-[#58a6ff]">
            Home
          </Link>
          <ChevronRight className="size-3" />
          <span className="text-[#171717] dark:text-[#f0f6fc] font-semibold">Refund Policy</span>
        </div>

        {/* Header */}
        <div className="border-b border-[#ded8d1] dark:border-[#30363d] pb-6">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-3 py-1 text-xs font-bold text-emerald-800 dark:text-emerald-400 mb-3">
            <RefreshCw className="size-3.5" />
            <span>Consumer Protection (E-Commerce) Rules Compliant</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#171717] dark:text-[#f0f6fc]">
            Refund & Cancellation Policy
          </h1>
          <p className="mt-2 text-xs text-[#77716b] dark:text-[#8b949e]">
            Last Updated: September 2026 | Governing: Courses, Event Tickets & Subscriptions
          </p>
        </div>

        {/* Policy Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="rounded-2xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-5 shadow-xs space-y-2">
            <div className="size-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-[#0f4c81] dark:text-[#58a6ff] flex items-center justify-center font-bold">
              7D
            </div>
            <p className="font-bold text-sm text-[#171717] dark:text-[#f0f6fc]">CME Course Guarantee</p>
            <p className="text-[#5d5854] dark:text-[#8b949e]">
              Full refund within 7 days if less than 20% of coursework has been consumed and no certificate issued.
            </p>
          </div>

          <div className="rounded-2xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-5 shadow-xs space-y-2">
            <div className="size-8 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
              EV
            </div>
            <p className="font-bold text-sm text-[#171717] dark:text-[#f0f6fc]">Medical Event Tickets</p>
            <p className="text-[#5d5854] dark:text-[#8b949e]">
              100% refund up to 7 days before event start. 50% refund between 3 to 7 days prior to conference.
            </p>
          </div>

          <div className="rounded-2xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-5 shadow-xs space-y-2">
            <div className="size-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              1-C
            </div>
            <p className="font-bold text-sm text-[#171717] dark:text-[#f0f6fc]">Subscriptions</p>
            <p className="text-[#5d5854] dark:text-[#8b949e]">
              Cancel anytime from Billing Settings. Access remains active through the end of the paid billing cycle.
            </p>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="space-y-6 text-xs sm:text-sm text-[#5d5854] dark:text-[#8b949e] leading-relaxed">
          <section className="rounded-2xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-6 shadow-xs space-y-3">
            <h2 className="text-base font-bold text-[#171717] dark:text-[#f0f6fc]">1. Continuing Medical Education (CME) Courses</h2>
            <p>
              We want healthcare professionals to have complete confidence in our academic offerings. If you purchase an accredited CME module or surgical masterclass and find it unsatisfactory, you may request a 100% refund within <strong>7 calendar days</strong> of purchase, provided:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>You have completed less than 20% of total video/module content.</li>
              <li>You have not taken the final CME certification assessment or claimed digital credit badges.</li>
            </ul>
          </section>

          <section className="rounded-2xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-6 shadow-xs space-y-3">
            <h2 className="text-base font-bold text-[#171717] dark:text-[#f0f6fc]">2. Conferences, Webinars & Camp Tickets</h2>
            <p>For paid medical conferences, surgical workshops, and webinars:</p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li><strong>Cancellation &gt; 7 days before event:</strong> 100% refund (minus standard payment gateway processing fee).</li>
              <li><strong>Cancellation 3 to 7 days before event:</strong> 50% refund.</li>
              <li><strong>Cancellation &lt; 72 hours before event:</strong> Non-refundable due to reserved clinical venue and speaker allocations.</li>
              <li><strong>Event Postponement or Cancellation by Organizer:</strong> 100% full refund issued automatically.</li>
            </ul>
          </section>

          <section className="rounded-2xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-6 shadow-xs space-y-3">
            <h2 className="text-base font-bold text-[#171717] dark:text-[#f0f6fc]">3. Refund Processing Time & Payment Method</h2>
            <p>
              Approved refunds are credited back to the original payment source (Credit/Debit Card, UPI, Net Banking, or Wallet) within <strong>5 to 7 business days</strong> in compliance with Reserve Bank of India (RBI) payment settlement standards.
            </p>
          </section>

          <section className="rounded-2xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-6 shadow-xs space-y-3">
            <h2 className="text-base font-bold text-[#171717] dark:text-[#f0f6fc]">4. How to Request a Refund</h2>
            <p>
              To initiate a cancellation or refund request, please email our billing helpdesk at{" "}
              <a href="mailto:billing@mgn.life" className="font-semibold text-[#0f4c81] dark:text-[#58a6ff] underline">
                billing@mgn.life
              </a>{" "}
              or{" "}
              <a href={`mailto:${DPDP_OFFICER_INFO.supportEmail}`} className="font-semibold text-[#0f4c81] dark:text-[#58a6ff] underline">
                {DPDP_OFFICER_INFO.supportEmail}
              </a>{" "}
              with your registered email address, transaction ID, and reason for cancellation.
            </p>
          </section>
        </div>

        {/* Footer Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-[#ded8d1] dark:border-[#30363d]">
          <Link
            href="/pricing"
            className="text-xs font-semibold text-[#0f4c81] dark:text-[#58a6ff] hover:underline"
          >
            &larr; View Membership Plans
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
