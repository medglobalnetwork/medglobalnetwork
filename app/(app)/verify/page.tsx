"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Calendar,
  Tent,
  FlaskConical,
  Award,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

export default function VerificationHubPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [profile, setProfile] = React.useState<any>(null);
  const [onboardingData, setOnboardingData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!isPending && !session) {
      router.replace("/");
      return;
    }

    if (session?.user?.id) {
      Promise.all([
        fetch(`/api/network/profiles/${session.user.id}`, { credentials: "include" })
          .then((r) => r.json())
          .catch(() => null),
        fetch("/api/onboarding", { credentials: "include" })
          .then((r) => r.json())
          .catch(() => null),
      ])
        .then(([profileRes, onboardingRes]) => {
          if (profileRes?.data) setProfile(profileRes.data);
          if (onboardingRes) setOnboardingData(onboardingRes);
        })
        .finally(() => setLoading(false));
    }
  }, [session, isPending, router]);

  if (isPending || loading) {
    return (
      <main className="min-h-dvh bg-[#faf9f8] p-6">
        <div className="mx-auto max-w-4xl space-y-4 animate-pulse">
          <div className="h-32 rounded-2xl bg-white border border-[#e8e6e3]" />
          <div className="h-64 rounded-2xl bg-white border border-[#e8e6e3]" />
        </div>
      </main>
    );
  }

  const isVerified = Boolean(
    profile?.registration_verified ||
    profile?.identity_verified ||
    onboardingData?.identity?.verification_status === "APPROVED"
  );

  const status = onboardingData?.identity?.verification_status || (isVerified ? "APPROVED" : "NOT_SUBMITTED");

  return (
    <main className="min-h-dvh bg-[#faf9f8] pb-24 text-[#171717]">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="space-y-2 border-b border-[#e8e6e3] pb-6">
          <div className="flex items-center gap-2.5">
            <div className="flex size-10 items-center justify-center rounded-xl bg-[#eef5fc] text-[#1769c2]">
              <ShieldCheck className="size-6 stroke-[2.2]" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#171717] text-balance">
                Professional Credential Verification
              </h1>
              <p className="text-xs sm:text-sm text-[#77716b] text-pretty">
                Ensure safety, trust, and regulatory compliance across the Med Global Network clinical ecosystem.
              </p>
            </div>
          </div>
        </div>

        {/* Current Status Card */}
        <div className="rounded-2xl border border-[#e8e6e3] bg-white p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase text-[#77716b]">
                Current Verification Status
              </span>
              <div className="flex items-center gap-2">
                {status === "APPROVED" ? (
                  <>
                    <CheckCircle2 className="size-5 text-emerald-600" />
                    <span className="text-base font-bold text-emerald-700">Verified Practitioner</span>
                  </>
                ) : status === "SUBMITTED" || status === "UNDER_REVIEW" ? (
                  <>
                    <Clock className="size-5 text-blue-600 animate-spin" />
                    <span className="text-base font-bold text-[#1769c2]">Under Administrative Review</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="size-5 text-amber-600" />
                    <span className="text-base font-bold text-amber-700">Standard Member (Unverified)</span>
                  </>
                )}
              </div>
              <p className="text-xs text-[#5d5854] text-pretty pt-1">
                {status === "APPROVED"
                  ? "Your medical council registration and degree certificates are verified. You have full access to CME hosting, health camps, and research studies."
                  : status === "SUBMITTED" || status === "UNDER_REVIEW"
                  ? "Our clinical compliance committee is validating your registration details against state medical council registries. Reviews take 24–48 hours."
                  : "Submit your state council registration number and degree credentials to unlock CME event hosting, health camps, and clinical research."}
              </p>
            </div>

            <div className="shrink-0">
              {status === "APPROVED" ? (
                <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-2 text-xs font-bold text-emerald-800 flex items-center gap-2">
                  <ShieldCheck className="size-4" />
                  Credentials Active
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => router.push(status === "SUBMITTED" ? "/onboarding/status" : "/onboarding")}
                  className="rounded-xl bg-[#1769c2] px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#12569f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1769c2] focus-visible:ring-offset-2 transition"
                >
                  {status === "SUBMITTED" ? "View Review Status" : "Submit Verification"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Verification Privileges Grid */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-[#171717] text-balance">
            Privileges Unlocked with Clinical Verification
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-[#e8e6e3] bg-white p-4 space-y-2">
              <div className="flex size-9 items-center justify-center rounded-lg bg-[#eef5fc] text-[#1769c2]">
                <Calendar className="size-5" />
              </div>
              <h3 className="text-xs font-bold text-[#171717]">Accredited CME & Event Hosting</h3>
              <p className="text-[11px] text-[#77716b] text-pretty">
                Host official medical webinars, conferences, and issue verified CME certificates to participating clinicians.
              </p>
            </div>

            <div className="rounded-xl border border-[#e8e6e3] bg-white p-4 space-y-2">
              <div className="flex size-9 items-center justify-center rounded-lg bg-[#eef5fc] text-[#1769c2]">
                <Tent className="size-5" />
              </div>
              <h3 className="text-xs font-bold text-[#171717]">Health Camps & Medical Outreach</h3>
              <p className="text-[11px] text-[#77716b] text-pretty">
                Organize screening camps, coordinate volunteer doctors, and manage clinical outreach programs.
              </p>
            </div>

            <div className="rounded-xl border border-[#e8e6e3] bg-white p-4 space-y-2">
              <div className="flex size-9 items-center justify-center rounded-lg bg-[#eef5fc] text-[#1769c2]">
                <FlaskConical className="size-5" />
              </div>
              <h3 className="text-xs font-bold text-[#171717]">Clinical Research & Co-Authoring</h3>
              <p className="text-[11px] text-[#77716b] text-pretty">
                Publish study protocols, recruit co-investigators, and collaborate on multi-center medical research.
              </p>
            </div>

            <div className="rounded-xl border border-[#e8e6e3] bg-white p-4 space-y-2">
              <div className="flex size-9 items-center justify-center rounded-lg bg-[#eef5fc] text-[#1769c2]">
                <Award className="size-5" />
              </div>
              <h3 className="text-xs font-bold text-[#171717]">Verified Clinician Badge</h3>
              <p className="text-[11px] text-[#77716b] text-pretty">
                Display the official blue shield badge on your profile and professional communications to establish trust.
              </p>
            </div>
          </div>
        </div>

        {/* Verification Process FAQ / Information */}
        <div className="rounded-2xl border border-[#e8e6e3] bg-[#faf9f8] p-5 space-y-3">
          <h3 className="text-xs font-bold text-[#171717]">Verification Requirements</h3>
          <ul className="space-y-2 text-xs text-[#5d5854]">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="size-4 text-[#1769c2] shrink-0 mt-0.5" />
              <span>Valid Medical Council Registration Number (e.g. State Medical Council, NMC, DCI, or equivalent)</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="size-4 text-[#1769c2] shrink-0 mt-0.5" />
              <span>Scanned copy of primary medical qualification degree or certificate</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="size-4 text-[#1769c2] shrink-0 mt-0.5" />
              <span>Official government photo identity document matching your practitioner profile</span>
            </li>
          </ul>
          <div className="pt-2">
            <Link
              href="/create"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1769c2] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1769c2] rounded"
            >
              Back to Creation Center <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
