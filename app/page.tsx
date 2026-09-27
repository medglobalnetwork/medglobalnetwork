"use client";

import * as React from "react";
import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LandingHeader } from "@/modules/landing/components/LandingHeader";
import { HeroSection } from "@/modules/landing/components/HeroSection";
import { EcosystemSection } from "@/modules/landing/components/EcosystemSection";
import { CliniciansShowcase } from "@/modules/landing/components/CliniciansShowcase";
import { VerificationTrustSection } from "@/modules/landing/components/VerificationTrustSection";
import { SpecialtiesGrid } from "@/modules/landing/components/SpecialtiesGrid";
import { LandingFooter } from "@/modules/landing/components/LandingFooter";

function LandingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // If OAuth bridge_token, error, or explicit auth request is passed, route to dedicated login/signup page
  useEffect(() => {
    const bridgeToken = searchParams?.get("bridge_token");
    const error = searchParams?.get("error");
    const authAction = searchParams?.get("auth");

    if (bridgeToken || error) {
      const target = `/login?${searchParams.toString()}`;
      router.replace(target);
    } else if (authAction === "signup") {
      router.push("/signup");
    } else if (authAction === "signin" || authAction === "login") {
      router.push("/login");
    }
  }, [searchParams, router]);

  const handleNavigateAuth = (mode: "signin" | "signup" = "signin") => {
    if (mode === "signup") {
      router.push("/signup");
    } else {
      router.push("/login");
    }
  };

  return (
    <div className="min-h-dvh bg-white text-[#171717] flex flex-col selection:bg-[#0f4c81]/15 selection:text-[#0f4c81]">
      {/* 1. Header */}
      <LandingHeader onOpenAuth={handleNavigateAuth} />

      {/* 2. Hero Section with Interactive Mockup */}
      <main className="flex-1">
        <HeroSection onOpenAuth={handleNavigateAuth} />

        {/* 3. Healthcare Ecosystem (6 Core Pillars) */}
        <EcosystemSection onOpenAuth={handleNavigateAuth} />

        {/* 4. Verified Clinicians & Network Showcase */}
        <CliniciansShowcase onOpenAuth={handleNavigateAuth} />

        {/* 5. License Verification & Trust Process */}
        <VerificationTrustSection onOpenAuth={handleNavigateAuth} />

        {/* 6. Medical Specialties Hubs */}
        <SpecialtiesGrid onOpenAuth={handleNavigateAuth} />
      </main>

      {/* 7. Comprehensive Healthcare Footer */}
      <LandingFooter onOpenAuth={handleNavigateAuth} />
    </div>
  );
}

export default function LandingPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-white flex items-center justify-center text-sm font-semibold text-[#0f4c81]">Loading MGN.life...</div>}>
      <LandingContent />
    </Suspense>
  );
}

