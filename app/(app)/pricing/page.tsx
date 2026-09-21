"use client";

import * as React from "react";
import Link from "next/link";
import {
  Check,
  Sparkles,
  ShieldCheck,
  Building2,
  Stethoscope,
  GraduationCap,
  Users,
  Briefcase,
  Crown,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Plan {
  id: string;
  name: string;
  badge?: string;
  popular?: boolean;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  buttonText: string;
  buttonHref: string;
  buttonVariant: "primary" | "secondary" | "outline";
  features: string[];
  includesTitle: string;
  includedItems: string[];
}

const plans: Plan[] = [
  {
    id: "starter",
    name: "Clinician Starter",
    description: "Ideal for individual doctors, residents, and healthcare practitioners starting on MGN.",
    monthlyPrice: 0,
    yearlyPrice: 0,
    buttonText: "Join for Free",
    buttonHref: "/home",
    buttonVariant: "outline",
    features: [
      "Verified Healthcare Professional Badge",
      "Full access to Doctor Network & Feeds",
      "Enroll in Free CME Medical Courses",
      "Direct Peer-to-Peer Clinical Messaging",
    ],
    includesTitle: "Standard Access:",
    includedItems: [
      "1 Verified Profile",
      "Up to 50 monthly connections",
      "Community discussions & case studies",
      "Standard Job board applications",
    ],
  },
  {
    id: "pro",
    name: "Practice & Consultant",
    badge: "Most Popular",
    popular: true,
    description: "For active consultants, clinic owners, and medical specialists seeking top visibility and growth.",
    monthlyPrice: 29,
    yearlyPrice: 24,
    buttonText: "Upgrade to Pro",
    buttonHref: "/settings",
    buttonVariant: "primary",
    features: [
      "Priority Gold Verification Badge",
      "Unlimited CME Course Access & Certificates",
      "Featured Profile in Search & Recommendations",
      "Advanced Clinical Analytics & Reach Metrics",
    ],
    includesTitle: "Everything in Starter, plus:",
    includedItems: [
      "Unlimited Professional Connections",
      "Verified Instructor publishing tools",
      "Direct Recruiter inMail access",
      "Case study bookmarking & clinical storage",
      "Priority 24/7 Clinical Concierge Support",
    ],
  },
  {
    id: "enterprise",
    name: "Hospital & Institute",
    badge: "Enterprise",
    description: "Tailored for hospitals, medical colleges, research centers, and pharmaceutical networks.",
    monthlyPrice: 99,
    yearlyPrice: 79,
    buttonText: "Contact Enterprise",
    buttonHref: "mailto:enterprise@mgn.life",
    buttonVariant: "secondary",
    features: [
      "Multi-Department Staff Management",
      "Custom CME Course Creation & LMS Suite",
      "Hospital Job Posting & ATS Integration",
      "Institutional Verification & Verified Page",
    ],
    includesTitle: "Everything in Pro, plus:",
    includedItems: [
      "Multi-admin organization panel",
      "Unlimited job openings & candidate pipeline",
      "Custom accreditation certificate branding",
      "Dedicated account manager & SLA",
      "API & Clinical Data Export",
    ],
  },
];

export default function PricingPage() {
  const [isYearly, setIsYearly] = React.useState(true);

  return (
    <main className="min-h-screen bg-[#f8f7f6] pb-24 text-[#171717]">
      <div className="mx-auto max-w-[1440px] px-3 py-8 sm:px-6 lg:px-8">
        
        {/* Header Hero */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#1769c2]/20 bg-[#eef5fc] px-3.5 py-1 text-xs font-semibold text-[#1769c2] mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            Simple, Transparent Healthcare Plans
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#171717]">
            Plans designed for every stage of your medical career
          </h1>

          <p className="mt-3 text-sm sm:text-base text-[#77716b] max-w-xl mx-auto">
            Join thousands of verified doctors, healthcare professionals, and medical institutions growing together on MGN.life.
          </p>

          {/* Billing Switcher Toggle */}
          <div className="mt-8 flex justify-center">
            <div className="relative inline-flex items-center rounded-2xl border border-[#ded8d1] bg-white p-1.5 shadow-xs">
              <button
                type="button"
                onClick={() => setIsYearly(false)}
                className={cn(
                  "relative rounded-xl px-5 py-2 text-xs sm:text-sm font-semibold transition-all",
                  !isYearly
                    ? "bg-[#1769c2] text-white shadow-sm"
                    : "text-[#5d5854] hover:text-[#171717]"
                )}
              >
                Monthly Billing
              </button>

              <button
                type="button"
                onClick={() => setIsYearly(true)}
                className={cn(
                  "relative flex items-center gap-2 rounded-xl px-5 py-2 text-xs sm:text-sm font-semibold transition-all",
                  isYearly
                    ? "bg-[#1769c2] text-white shadow-sm"
                    : "text-[#5d5854] hover:text-[#171717]"
                )}
              >
                Yearly Billing
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                    isYearly
                      ? "bg-amber-400 text-slate-900"
                      : "bg-amber-100 text-amber-800"
                  )}
                >
                  Save 20%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => {
            const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;

            return (
              <div
                key={plan.id}
                className={cn(
                  "relative flex flex-col justify-between rounded-3xl border bg-white p-6 sm:p-7 transition-all duration-200",
                  plan.popular
                    ? "border-[#1769c2] ring-2 ring-[#1769c2]/20 shadow-xl"
                    : "border-[#e8e6e3] shadow-xs hover:border-[#ded8d1] hover:shadow-md"
                )}
              >
                {/* Popular / Enterprise Tag */}
                {plan.badge && (
                  <div className="absolute -top-3.5 right-6">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider shadow-xs",
                        plan.popular
                          ? "bg-gradient-to-r from-[#1769c2] to-[#0284c7] text-white"
                          : "bg-[#171717] text-white"
                      )}
                    >
                      {plan.popular && <Crown className="h-3.5 w-3.5" />}
                      {plan.badge}
                    </span>
                  </div>
                )}

                {/* Plan Info */}
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-[#171717]">
                    {plan.name}
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-[#77716b] min-h-[38px]">
                    {plan.description}
                  </p>

                  {/* Price */}
                  <div className="mt-6 flex items-baseline gap-1">
                    {price === 0 ? (
                      <span className="text-4xl font-extrabold text-[#171717]">Free</span>
                    ) : (
                      <>
                        <span className="text-4xl font-extrabold text-[#171717]">${price}</span>
                        <span className="text-xs sm:text-sm text-[#77716b]">
                          / clinician / month
                        </span>
                      </>
                    )}
                  </div>
                  {isYearly && price > 0 && (
                    <p className="mt-1 text-[11px] font-medium text-[#15803d]">
                      Billed annually (${price * 12}/yr)
                    </p>
                  )}

                  {/* Action Button */}
                  <div className="mt-6">
                    <Link
                      href={plan.buttonHref}
                      className={cn(
                        "flex w-full items-center justify-center rounded-2xl py-3 text-xs sm:text-sm font-semibold transition-all duration-150 shadow-xs",
                        plan.buttonVariant === "primary" &&
                          "bg-[#1769c2] text-white hover:bg-[#12569f] shadow-md shadow-[#1769c2]/20",
                        plan.buttonVariant === "secondary" &&
                          "bg-[#171717] text-white hover:bg-black",
                        plan.buttonVariant === "outline" &&
                          "border border-[#ded8d1] bg-white text-[#171717] hover:bg-[#f8f7f6]"
                      )}
                    >
                      {plan.buttonText}
                    </Link>
                  </div>

                  {/* Key Highlights */}
                  <div className="mt-8 border-t border-[#f0efee] pt-6">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#171717]">
                      {plan.includesTitle}
                    </h4>
                    <ul className="mt-4 space-y-3">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#eef5fc] text-[#1769c2] mt-0.5">
                            <Check className="h-3.5 w-3.5" />
                          </span>
                          <span className="text-xs sm:text-sm font-medium text-[#171717]">
                            {feature}
                          </span>
                        </li>
                      ))}
                      {plan.includedItems.map((item, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#f5f4f3] text-[#8a8784] mt-0.5">
                            <Check className="h-3 w-3" />
                          </span>
                          <span className="text-xs sm:text-sm text-[#77716b]">
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* FAQs & Trust Section */}
        <div className="mt-16 rounded-3xl border border-[#ded8d1] bg-white p-6 sm:p-10 max-w-4xl mx-auto shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="h-6 w-6 text-[#1769c2]" />
            <h2 className="text-xl font-bold text-[#171717]">Frequently Asked Questions</h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 mt-6">
            <div>
              <h3 className="text-sm font-semibold text-[#171717]">Is verification mandatory?</h3>
              <p className="mt-1 text-xs text-[#77716b] leading-relaxed">
                Verification is free for all medical professionals with valid Council/Registration numbers. Pro plans provide priority fast-track verification within 2 hours.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#171717]">Can I cancel or switch anytime?</h3>
              <p className="mt-1 text-xs text-[#77716b] leading-relaxed">
                Yes, you can upgrade, downgrade, or cancel your subscription at any time directly from your Account Settings.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#171717]">Are CME certificates accredited?</h3>
              <p className="mt-1 text-xs text-[#77716b] leading-relaxed">
                All certificates earned through accredited MGN courses come with unique verifiable QR codes and accreditation hashes compliant with medical council standards.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#171717]">Do you offer institutional invoicing?</h3>
              <p className="mt-1 text-xs text-[#77716b] leading-relaxed">
                Yes, hospitals and medical colleges on our Enterprise plan can pay via bank wire or PO with customized GST invoicing.
              </p>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
