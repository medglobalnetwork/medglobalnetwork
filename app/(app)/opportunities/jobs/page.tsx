import type { Metadata } from "next";
import { Suspense } from "react";
import JobsCatalogClient from "./JobsCatalogClient";
import { JsonLd } from "@/components/seo/JsonLd";
import { jobsPageSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Healthcare Opportunities & Medical Jobs",
  description:
    "Explore verified medical doctor jobs, clinical fellowships, hospital residencies, physiotherapy openings, and healthcare consulting roles on MedGlobalNetwork.",
  alternates: {
    canonical: "https://mgn.life/opportunities/jobs",
  },
  openGraph: {
    title: "Healthcare Opportunities & Medical Jobs | MGN",
    description:
      "Explore verified doctor jobs, clinical fellowships, hospital residencies, and healthcare openings across top hospitals.",
    url: "https://mgn.life/opportunities/jobs",
    siteName: "MedGlobalNetwork",
    images: [
      {
        url: "/auth-hero-3d.jpg",
        width: 1200,
        height: 630,
        alt: "MedGlobalNetwork Healthcare Jobs & Opportunities",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Healthcare Opportunities & Medical Jobs | MGN",
    description:
      "Explore verified doctor jobs, clinical fellowships, and hospital residencies on MedGlobalNetwork.",
    images: ["/auth-hero-3d.jpg"],
  },
};

export default function JobsPage() {
  return (
    <>
      <JsonLd schema={jobsPageSchema} />
      <Suspense fallback={<div className="min-h-screen bg-[#f5f5f4] p-8">Loading Opportunities...</div>}>
        <JobsCatalogClient />
      </Suspense>
    </>
  );
}
