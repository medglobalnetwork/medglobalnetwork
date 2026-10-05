import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Inter, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { OfflineScreen } from "@/components/OfflineScreen";
import { PwaRegister } from "@/components/PwaRegister";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#0f4c81",
};

import { JsonLd } from "@/components/seo/JsonLd";
import {
  medicalOrganizationSchema,
  webSiteSchema,
  globalFaqSchema,
  SITE_URL,
} from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Med Global Network (MGN) — Official Healthcare Professional Network & CME Platform",
    template: "%s | Med Global Network (MGN)",
  },
  description:
    "Official Med Global Network (MGN - mgn.life) platform. Connect with verified doctors, surgeons, physical therapists, and researchers. Access accredited CME courses, clinical case studies, medical conferences, health camps, and healthcare jobs.",
  keywords: [
    "Med Global Network",
    "MedGlobalNetwork",
    "MGN",
    "MGN.life",
    "mgn life",
    "med global network login",
    "med global network official",
    "medical network",
    "verified doctors",
    "CME courses",
    "healthcare jobs",
    "medical camps",
    "clinical case discussions",
    "surgery webinars",
    "medical research collaboration",
    "physiotherapy rehabilitation",
    "telemedicine",
    "medical directory",
    "hospital recruitment",
    "doctor social network",
    "physician networking",
    "medical conferences",
  ],
  authors: [{ name: "MedGlobalNetwork Editorial & Medical Advisory Board", url: SITE_URL }],
  creator: "MedGlobalNetwork",
  publisher: "MedGlobalNetwork",
  category: "Health & Medicine",
  classification: "Medical Network & Healthcare Education",
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "Med Global Network",
    title: "Med Global Network (MGN) — Healthcare Professional Network & CME Platform",
    description:
      "Global verified network connecting doctors, surgeons, physical therapists, and researchers on Med Global Network (MGN).",
    images: [
      {
        url: "/auth-hero-3d.jpg",
        width: 1200,
        height: 630,
        alt: "Med Global Network Healthcare Professional Ecosystem",
      },
      {
        url: "/icon-512.png",
        width: 512,
        height: 512,
        alt: "Med Global Network Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@MedGlobalNet",
    creator: "@MedGlobalNet",
    title: "Med Global Network (MGN) — Healthcare Professional Network & CME Platform",
    description:
      "Global verified social and continuous medical learning ecosystem connecting healthcare professionals, doctors, surgeons, physical therapists, and researchers.",
    images: ["/auth-hero-3d.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MGN",
  },
  icons: {
    icon: "/icon-192.png",
    apple: "/icon-192.png",
  },
  verification: {
    google:
      process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ||
      process.env.GOOGLE_SITE_VERIFICATION ||
      "",
    other: {
      "msvalidate.01":
        process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION ||
        process.env.BING_SITE_VERIFICATION ||
        "",
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${plusJakartaSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <JsonLd schema={[medicalOrganizationSchema, webSiteSchema, globalFaqSchema]} />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem('mgn_theme');var t=s||'light';var d=t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(d){document.documentElement.classList.add('dark');document.documentElement.style.colorScheme='dark';}else{document.documentElement.classList.remove('dark');document.documentElement.style.colorScheme='light';}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-[#faf9f8] dark:bg-[#0d1117] text-[#171717] dark:text-[#f0f6fc] antialiased selection:bg-[#0f4c81]/15 selection:text-[#0f4c81]">
        <ThemeProvider>
          <OfflineScreen />
          <PwaRegister />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
