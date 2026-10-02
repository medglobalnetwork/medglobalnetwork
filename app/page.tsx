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
import { authClient } from "@/lib/auth-client";
import { isNativePlatform } from "@/lib/native-mobile";

function BootScreen() {
  return (
    <div className="min-h-dvh bg-white dark:bg-[#0b0f17] flex items-center justify-center text-sm font-semibold text-[#0f4c81]">
      Loading MGN...
    </div>
  );
}

// Stable no-op subscription: native detection is a synchronous read, not a
// stream. useSyncExternalStore keeps SSR/hydration at `false` (so the website
// still server-renders the landing page) and swaps to the real client value
// immediately after mount, without a hydration mismatch.
const subscribeToNothing = () => () => {};

function LandingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isNative = React.useSyncExternalStore(subscribeToNothing, isNativePlatform, () => false);
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

  // The native app never shows the marketing landing page: an authenticated
  // session goes straight to the app home, everyone else to login. Explicit
  // auth params (OAuth bridge, ?auth=) still win so those flows are not
  // hijacked by the session redirect.
  useEffect(() => {
    if (!isNative || isSessionPending || hasAuthParams) return;
    router.replace(session?.user ? "/home" : "/login");
  }, [isNative, isSessionPending, hasAuthParams, session, router]);

  if (isNative) {
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
