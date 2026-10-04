import type { Metadata } from "next";
import { Suspense } from "react";
import CreateHubClient from "./CreateHubClient";

export const metadata: Metadata = {
  title: "Creation Center — Publish Medical Cases, Events, Jobs & Camps",
  description:
    "Unified creation hub on MedGlobalNetwork. Publish clinical case studies, host accredited CME conferences, list healthcare vacancies, coordinate community health camps, and initiate medical research.",
  alternates: {
    canonical: "https://mgn.life/create",
  },
  openGraph: {
    title: "Creation Center | MedGlobalNetwork",
    description:
      "Publish clinical cases, host accredited CME webinars, list healthcare job openings, coordinate medical camps, and start research studies.",
    url: "https://mgn.life/create",
    siteName: "MedGlobalNetwork",
    images: [
      {
        url: "/auth-hero-3d.jpg",
        width: 1200,
        height: 630,
        alt: "MedGlobalNetwork Creation Center",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Creation Center | MedGlobalNetwork",
    description:
      "Publish clinical case studies, host CME conferences, post jobs, and coordinate health camps.",
    images: ["/auth-hero-3d.jpg"],
  },
};

export default function CreatePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#faf9f8] p-8">Loading Creation Center...</div>}>
      <CreateHubClient />
    </Suspense>
  );
}
