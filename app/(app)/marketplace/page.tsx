"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  Sparkles,
  Stethoscope,
  Activity,
  BookOpen,
  FileCheck2,
  Bell,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

const UPCOMING_CATEGORIES = [
  {
    title: "Clinical & Diagnostic Equipment",
    description: "Authenticated medical diagnostic devices, stethoscopes, sensors, and clinical practice tools.",
    icon: Stethoscope,
    color: "#0f4c81",
    bg: "#eef5fc",
  },
  {
    title: "Rehab & Physiotherapy Tools",
    description: "Dry needling, electrotherapy, myofascial release tools, exercise equipment, and posture assessment gear.",
    icon: Activity,
    color: "#16804d",
    bg: "#eafaf1",
  },
  {
    title: "Academic Books & Clinical Protocols",
    description: "Peer-reviewed clinical guides, treatment protocols, research publications, and healthcare journals.",
    icon: BookOpen,
    color: "#4f46e5",
    bg: "#f0f0fe",
  },
  {
    title: "Practice & Consent Templates",
    description: "Standardized medical consent forms, clinical assessment templates, and compliance checklists.",
    icon: FileCheck2,
    color: "#d97706",
    bg: "#fef8ee",
  },
];

export default function MarketplacePage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [notified, setNotified] = React.useState(false);

  React.useEffect(() => {
    if (!isPending && !session) router.replace("/");
  }, [isPending, router, session]);

  if (isPending || !session) return <main className="min-h-dvh bg-white" />;

  const handleNotifyMe = () => {
    setNotified(true);
  };

  return (
    <main className="min-h-dvh bg-white pb-36 text-[#171717]">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Breadcrumb / Section Header */}
        <div className="mb-6 flex items-center gap-2 text-xs text-[#77716b]">
          <button
            type="button"
            onClick={() => router.push("/home")}
            className="hover:text-[#0f4c81] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f4c81] rounded"
          >
            Home
          </button>
          <span>/</span>
          <span className="text-[#171717] font-medium">Marketplace</span>
        </div>

        {/* Hero Card */}
        <div className="relative overflow-hidden rounded-3xl border border-[#e8e6e3] bg-white p-6 sm:p-10 shadow-xs mb-8">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#0f4c81]/20 bg-[#eef5fc] px-3 py-1 text-xs font-bold text-[#0f4c81] mb-4">
              <Sparkles className="size-3.5" />
              <span>Coming Soon</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#171717] text-balance">
              MGN Healthcare Marketplace
            </h1>

            <p className="mt-3 text-sm text-[#77716b] leading-relaxed text-pretty">
              A trusted, verified marketplace tailored for healthcare professionals. Discover authentic medical equipment, rehabilitation tools, academic publications, and clinical practice resources directly from certified manufacturers and distributors.
            </p>

            {/* Notification / Alert CTA */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              {notified ? (
                <div className="inline-flex items-center gap-2 rounded-xl bg-[#eafaf1] border border-[#16804d]/30 px-4 py-2 text-xs font-bold text-[#16804d]">
                  <ShieldCheck className="size-4" />
                  <span>You will be notified when Marketplace launches!</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleNotifyMe}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#0f4c81] px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#0c3c66] transition active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f4c81]"
                >
                  <Bell className="size-4" />
                  <span>Notify Me at Launch</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => router.push("/home")}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#ded8d1] bg-white px-4 py-2.5 text-xs font-semibold text-[#5d5854] hover:bg-[#faf9f8] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f4c81]"
              >
                <span>Back to Home</span>
                <ArrowRight className="size-3.5" />
              </button>
            </div>
          </div>

          {/* Background Decorative Graphic */}
          <div className="absolute right-4 -bottom-4 hidden sm:flex size-48 items-center justify-center rounded-full bg-[#f8f7f6] text-[#e8e6e3] select-none pointer-events-none opacity-80">
            <ShoppingBag className="size-24 stroke-[1.2] text-[#9c958f]/40" />
          </div>
        </div>

        {/* What to Expect / Upcoming Categories Grid */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#9c958f]">
            What to Expect in Marketplace
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {UPCOMING_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <div
                  key={cat.title}
                  className="rounded-2xl border border-[#e8e6e3] bg-white p-5 shadow-2xs transition hover:border-[#ded8d1]"
                >
                  <div
                    className="flex size-10 items-center justify-center rounded-xl mb-3.5"
                    style={{ background: cat.bg, color: cat.color }}
                  >
                    <Icon className="size-5 stroke-[2]" />
                  </div>

                  <h3 className="text-sm font-bold text-[#171717]">{cat.title}</h3>
                  <p className="mt-1 text-xs text-[#77716b] leading-relaxed text-pretty">
                    {cat.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Vendor Partner Notice Card */}
        <div className="mt-8 rounded-2xl border border-[#e8e6e3] bg-white p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-xs font-bold text-[#171717]">Are you a verified medical manufacturer or distributor?</h4>
            <p className="text-[11px] text-[#77716b] mt-0.5">
              Partner with MGN to showcase certified clinical products to verified healthcare professionals across India.
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.push("/opportunities")}
            className="shrink-0 rounded-xl border border-[#ded8d1] bg-white px-4 py-2 text-xs font-bold text-[#0f4c81] hover:bg-[#faf9f8] transition"
          >
            Partner With Us →
          </button>
        </div>

      </div>
    </main>
  );
}
