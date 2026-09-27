"use client";

import * as React from "react";
import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { LandingHeader } from "@/modules/landing/components/LandingHeader";
import { HeroSection } from "@/modules/landing/components/HeroSection";
import { EcosystemSection } from "@/modules/landing/components/EcosystemSection";
import { CliniciansShowcase } from "@/modules/landing/components/CliniciansShowcase";
import { VerificationTrustSection } from "@/modules/landing/components/VerificationTrustSection";
import { SpecialtiesGrid } from "@/modules/landing/components/SpecialtiesGrid";
import { LandingFooter } from "@/modules/landing/components/LandingFooter";
import { AuthModal } from "@/modules/landing/components/AuthModal";

function LandingContent() {
  const searchParams = useSearchParams();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"signin" | "signup">("signin");

  // Automatically open auth modal if error or bridge_token is in URL
  useEffect(() => {
    const bridgeToken = searchParams?.get("bridge_token");
    const error = searchParams?.get("error");
    const authAction = searchParams?.get("auth");

    if (bridgeToken || error || authAction) {
      setAuthModalMode(authAction === "signup" ? "signup" : "signin");
      setAuthModalOpen(true);
    }
  }, [searchParams]);

  const handleOpenAuth = (mode: "signin" | "signup" = "signin") => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const handleCloseAuth = () => {
    setAuthModalOpen(false);
  };

  return (
    <div className="min-h-dvh bg-white text-[#171717] flex flex-col selection:bg-[#0f4c81]/15 selection:text-[#0f4c81]">
      {/* 1. Header */}
      <LandingHeader onOpenAuth={handleOpenAuth} />

      {/* 2. Hero Section with Interactive Mockup */}
      <main className="flex-1">
        <HeroSection onOpenAuth={handleOpenAuth} />

        {/* 3. Healthcare Ecosystem (6 Core Pillars) */}
        <EcosystemSection onOpenAuth={handleOpenAuth} />

        {/* 4. Verified Clinicians & Network Showcase */}
        <CliniciansShowcase onOpenAuth={handleOpenAuth} />

        {/* 5. License Verification & Trust Process */}
        <VerificationTrustSection onOpenAuth={handleOpenAuth} />

        {/* 6. Medical Specialties Hubs */}
        <SpecialtiesGrid onOpenAuth={handleOpenAuth} />
      </main>

      {/* 7. Comprehensive Healthcare Footer */}
      <LandingFooter onOpenAuth={handleOpenAuth} />

      {/* 8. Full-Featured Interactive Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authModalMode}
        onClose={handleCloseAuth}
      />
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
