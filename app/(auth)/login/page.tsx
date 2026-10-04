import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthPage } from "@/modules/auth/components/AuthPage";

export const metadata: Metadata = {
  title: "Sign In | Clinician Portal",
  description:
    "Sign in to your verified MedGlobalNetwork account. Access peer case discussions, accredited CME courses, clinical conferences, and professional medical tools.",
  alternates: {
    canonical: "https://mgn.life/login",
  },
  openGraph: {
    title: "Sign In to MedGlobalNetwork | Clinician Portal",
    description:
      "Access peer case discussions, accredited CME courses, clinical conferences, and professional medical tools.",
    url: "https://mgn.life/login",
    siteName: "MedGlobalNetwork",
    images: [
      {
        url: "/auth-hero-3d.jpg",
        width: 1200,
        height: 630,
        alt: "Sign In to MedGlobalNetwork",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sign In to MedGlobalNetwork | Clinician Portal",
    description:
      "Access peer case discussions, accredited CME courses, and clinical conferences.",
    images: ["/auth-hero-3d.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-[#faf9f8]" />}>
      <AuthPage defaultMode="signin" />
    </Suspense>
  );
}
