import type { Metadata } from "next";
import { Suspense } from "react";
import CampsDiscoveryClient from "./CampsDiscoveryClient";
import { JsonLd } from "@/components/seo/JsonLd";
import { campsPageSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Community Health Camps, Screenings & Rural Outreach",
  description:
    "Find, organize, and volunteer for free medical camps, preventive health screenings, physiotherapy rehabilitation drives, and rural healthcare outreach on MedGlobalNetwork.",
  alternates: {
    canonical: "https://mgn.life/camps",
  },
  openGraph: {
    title: "Community Health Camps, Screenings & Rural Outreach | MGN",
    description:
      "Find, organize, and volunteer for free medical camps, preventive health screenings, physiotherapy rehabilitation drives, and rural healthcare outreach.",
    url: "https://mgn.life/camps",
    siteName: "MedGlobalNetwork",
    images: [
      {
        url: "/auth-hero-3d.jpg",
        width: 1200,
        height: 630,
        alt: "MedGlobalNetwork Community Health Camps",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Community Health Camps, Screenings & Rural Outreach | MGN",
    description:
      "Find, organize, and volunteer for free medical camps and healthcare screenings.",
    images: ["/auth-hero-3d.jpg"],
  },
};

export default function CampsPage() {
  return (
    <>
      <JsonLd schema={campsPageSchema} />
      <Suspense fallback={<div className="min-h-screen bg-[#faf9f8] p-8">Loading Medical Camps...</div>}>
        <CampsDiscoveryClient />
      </Suspense>
    </>
  );
}
