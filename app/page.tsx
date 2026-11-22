"use client";

import * as React from "react";
import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LandingHeader } from "@/modules/landing/components/LandingHeader";
import { HeroSection } from "@/modules/landing/components/HeroSection";
import { PlatformFeaturesSection } from "@/modules/landing/components/PlatformFeaturesSection";
import { VerificationTrustSection } from "@/modules/landing/components/VerificationTrustSection";
import { AudienceSection } from "@/modules/landing/components/AudienceSection";
import { StatsBanner } from "@/modules/landing/components/StatsBanner";
import { MobileAppSection } from "@/modules/landing/components/MobileAppSection";
import { CtaBanner } from "@/modules/landing/components/CtaBanner";
import { LandingFooter } from "@/modules/landing/components/LandingFooter";
import { authClient } from "@/lib/auth-client";
import { isNativePlatform } from "@/lib/native-mobile";
import { isPwaInstalled } from "@/lib/pwa-permissions";

function BootScreen() {
  return (
    <div className="min-h-dvh bg-white flex flex-col items-center justify-center select-none">
      <div className="flex flex-col items-center justify-center space-y-5 px-6 animate-in fade-in duration-300">
        <div className="relative flex items-center justify-center">
          <div className="absolute -inset-6 rounded-full bg-[#0f4c81]/5 blur-2xl animate-pulse" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="Med Global Network"
            className="h-16 w-auto sm:h-20 object-contain drop-shadow-xs animate-pulse"
          />
        </div>
        <div className="text-center space-y-1">
          <h1 className="text-base font-extrabold tracking-tight text-[#0f4c81]">
            MedGlobalNetwork
          </h1>
          <p className="text-[11px] font-semibold text-[#77716b] tracking-wider uppercase">
            Healthcare Professional Ecosystem
          </p>
        </div>
        <div className="w-36 h-1 bg-[#f0ede8] rounded-full overflow-hidden mt-3">
          <div className="h-full bg-gradient-to-r from-[#0f4c81] via-[#16804d] to-[#0f4c81] rounded-full animate-indeterminate" />
        </div>
      </div>
    </div>
  );
}

// Stable no-op subscription: native/pwa detection is a synchronous read, not a
// stream. useSyncExternalStore keeps SSR/hydration at `false` (so the website
// still server-renders the landing page) and swaps to the real client value
// immediately after mount, without a hydration mismatch.
const subscribeToNothing = () => () => {};

function LandingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isNative = React.useSyncExternalStore(subscribeToNothing, isNativePlatform, () => false);
  const isPwa = React.useSyncExternalStore(
    subscribeToNothing,
    () => isPwaInstalled() || searchParams?.get("source") === "pwa",
    () => false
  );
  const isAppMode = isNative || isPwa;
  const { data: session, isPending: isSessionPending } = authClient.useSession();

  const bridgeToken = searchParams?.get("bridge_token");
  const error = searchParams?.get("error");
  const authAction = searchParams?.get("auth");
  const hasAuthParams = Boolean(bridgeToken || error || authAction);

  // If OAuth bridge_token, error, or explicit auth request is passed, route to dedicated login/signup page
  useEffect(() => {
    if (bridgeToken || error) {
      const target = `/login?${searchParams.toString()}`;
      router.replace(target);
    } else if (authAction === "signup") {
      router.push("/signup");
    } else if (authAction === "signin" || authAction === "login") {
      router.push("/login");
    }
  }, [searchParams, router, bridgeToken, error, authAction]);

  // The native app and PWA never show the marketing landing page: an authenticated
  // session goes straight to /home, unauthenticated goes straight to /login.
  // Logged-in users on browser also go straight to /home.
  useEffect(() => {
    if (isSessionPending || hasAuthParams) return;

    if (isAppMode) {
      router.replace(session?.user ? "/home" : "/login");
      return;
    }

    if (session?.user) {
      router.replace("/home");
    }
  }, [isAppMode, isSessionPending, hasAuthParams, session, router]);

  if (isAppMode || (session?.user && !hasAuthParams)) {
    return <BootScreen />;
  }

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

        {/* 4. Verification Flow with Framer AnimatedPath ("How MGN Guarantees 100% Medical Authenticity") */}
        <VerificationTrustSection onOpenAuth={handleNavigateAuth} />

        {/* 5. Audience Grid ("Who Is MGN For?") */}
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
