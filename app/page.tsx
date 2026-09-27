"use client";

import * as React from "react";
import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LandingHeader } from "@/modules/landing/components/LandingHeader";
import { HeroSection } from "@/modules/landing/components/HeroSection";
import { PlatformFeaturesSection } from "@/modules/landing/components/PlatformFeaturesSection";
import { AudienceSection } from "@/modules/landing/components/AudienceSection";
import { StatsBanner } from "@/modules/landing/components/StatsBanner";
import { MobileAppSection } from "@/modules/landing/components/MobileAppSection";
import { CtaBanner } from "@/modules/landing/components/CtaBanner";
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
    <div className="min-h-dvh bg-white text-[#171717] dark:bg-[#0b0f17] dark:text-[#f0f6fc] flex flex-col selection:bg-[#0f4c81]/15 selection:text-[#0f4c81]">
      {/* 1. Header with Borderless Nav & Dropdowns */}
      <LandingHeader onOpenAuth={handleNavigateAuth} />

      {/* Main Content Sections */}
      <main className="flex-1">
        {/* 2. Hero Section */}
        <HeroSection onOpenAuth={handleNavigateAuth} />

        {/* 3. Platform Features ("Everything You Need. All in One Platform.") */}
        <PlatformFeaturesSection />

        {/* 4. Audience Grid ("Who Is MGN For?") */}
        <AudienceSection />

        {/* 5. Impact Stats Banner */}
        <StatsBanner />

        {/* 6. Mobile App Showcase */}
        <MobileAppSection />

        {/* 7. Bottom CTA Banner */}
        <CtaBanner onOpenAuth={handleNavigateAuth} />
      </main>

      {/* 8. Comprehensive Footer */}
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
