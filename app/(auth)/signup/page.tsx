import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthPage } from "@/modules/auth/components/AuthPage";

export const metadata: Metadata = {
  title: "Join Network | Create Verified Healthcare Account",
  description:
    "Register for your verified MedGlobalNetwork medical account. Connect with physicians, surgeons, physical therapists, and researchers globally.",
  alternates: {
    canonical: "https://mgn.life/signup",
  },
  openGraph: {
    title: "Join MedGlobalNetwork | Verified Clinician Community",
    description:
      "Register for your verified medical account to collaborate on cases, earn CME credits, and expand your professional clinical network.",
    url: "https://mgn.life/signup",
    siteName: "MedGlobalNetwork",
    images: [
      {
        url: "/auth-hero-3d.jpg",
        width: 1200,
        height: 630,
        alt: "Join MedGlobalNetwork",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Join MedGlobalNetwork | Verified Clinician Community",
    description:
      "Register for your verified medical account to collaborate on cases and earn CME credits.",
    images: ["/auth-hero-3d.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-[#faf9f8]" />}>
      <AuthPage defaultMode="signup" />
    </Suspense>
  );
}
