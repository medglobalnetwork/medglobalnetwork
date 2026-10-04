import type { Metadata } from "next";
import { Suspense } from "react";
import EventsDiscoveryClient from "./EventsDiscoveryClient";
import { JsonLd } from "@/components/seo/JsonLd";
import { eventsPageSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Medical Conferences, CME Webinars & Clinical Symposia",
  description:
    "Discover upcoming healthcare conferences, accredited CME webinars, surgical workshops, and medical symposia on MedGlobalNetwork. Connect with specialists and earn verified CME credits.",
  alternates: {
    canonical: "https://mgn.life/events",
  },
  openGraph: {
    title: "Medical Conferences, CME Webinars & Clinical Symposia | MGN",
    description:
      "Discover upcoming healthcare conferences, accredited CME webinars, surgical workshops, and medical symposia on MedGlobalNetwork.",
    url: "https://mgn.life/events",
    siteName: "MedGlobalNetwork",
    images: [
      {
        url: "/auth-hero-3d.jpg",
        width: 1200,
        height: 630,
        alt: "MedGlobalNetwork Medical Events",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Medical Conferences, CME Webinars & Clinical Symposia | MGN",
    description:
      "Discover upcoming healthcare conferences, accredited CME webinars, and surgical workshops.",
    images: ["/auth-hero-3d.jpg"],
  },
};

export default function EventsPage() {
  return (
    <>
      <JsonLd schema={eventsPageSchema} />
      <Suspense fallback={<div className="min-h-screen bg-[#faf9f8] p-8">Loading Medical Events...</div>}>
        <EventsDiscoveryClient />
      </Suspense>
    </>
  );
}
