import type { Metadata } from "next";
import { PricingPageClient } from "./PricingPageClient";

export const metadata: Metadata = {
  title: "Pricing Plans for Doctors & Healthcare Organizations",
  description:
    "Explore transparent MGN subscription tiers for individual practitioners, clinics, and hospital networks. Free verified doctor profiles, accredited CME coursework, and hospital talent recruiting.",
  alternates: {
    canonical: "https://mgn.life/pricing",
  },
  openGraph: {
    title: "Pricing Plans for Doctors & Healthcare Organizations | MGN",
    description:
      "Explore subscription plans for verified doctors, private practices, and hospital networks. Free verified registration, accredited CME courses, and recruitment tools.",
    url: "https://mgn.life/pricing",
    siteName: "MedGlobalNetwork",
    images: [
      {
        url: "/auth-hero-3d.jpg",
        width: 1200,
        height: 630,
        alt: "MGN Pricing and Membership Plans",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pricing Plans for Doctors & Healthcare Organizations | MGN",
    description:
      "Explore transparent subscription tiers for individual practitioners, clinics, and hospital networks.",
    images: ["/auth-hero-3d.jpg"],
  },
};

export default function PricingPage() {
  return <PricingPageClient />;
}
