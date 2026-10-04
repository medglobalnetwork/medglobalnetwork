import type { Metadata } from "next";
import { Suspense } from "react";
import LearnExplorePage from "../explore/page";
import { JsonLd } from "@/components/seo/JsonLd";
import { coursesCatalogSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Accredited Medical CME Courses & Clinical Training",
  description:
    "Explore accredited Continuing Medical Education (CME) courses, surgical masterclasses, clinical case workshops, and certified programs for doctors and healthcare specialists on MedGlobalNetwork.",
  alternates: {
    canonical: "https://mgn.life/learn/courses",
  },
  openGraph: {
    title: "Accredited Medical CME Courses & Clinical Training | MGN",
    description:
      "Explore accredited Continuing Medical Education (CME) courses, surgical masterclasses, and certified medical programs.",
    url: "https://mgn.life/learn/courses",
    siteName: "MedGlobalNetwork",
    images: [
      {
        url: "/auth-hero-3d.jpg",
        width: 1200,
        height: 630,
        alt: "MedGlobalNetwork Accredited CME Courses",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Accredited Medical CME Courses & Clinical Training | MGN",
    description:
      "Explore accredited Continuing Medical Education (CME) courses, surgical masterclasses, and clinical certifications.",
    images: ["/auth-hero-3d.jpg"],
  },
};

export default function LearnCoursesPage() {
  return (
    <>
      <JsonLd schema={coursesCatalogSchema} />
      <Suspense fallback={<div className="min-h-screen bg-[#faf9f8] p-8">Loading Courses...</div>}>
        <LearnExplorePage />
      </Suspense>
    </>
  );
}
