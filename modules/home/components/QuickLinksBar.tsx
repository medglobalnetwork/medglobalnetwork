"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  Calendar,
  FlaskConical,
  GraduationCap,
  ShoppingBag,
  Sparkles,
  LayoutGrid,
} from "lucide-react";

// ============================================================
// Card Watermark Background Pattern (Matching Exact Reference Design)
// ============================================================

function CardWatermarkBg() {
  return (
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden rounded-[22px]">
      <svg
        viewBox="0 0 100 100"
        className="h-full w-full opacity-80 group-hover:opacity-100 transition-opacity duration-300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Subtle Background Starburst Rays radiating from top center */}
        <g stroke="#0f172a" strokeWidth="0.5" strokeOpacity="0.08" strokeLinecap="round">
          <line x1="50" y1="14" x2="26" y2="4" />
          <line x1="50" y1="14" x2="38" y2="2" />
          <line x1="50" y1="14" x2="50" y2="1" />
          <line x1="50" y1="14" x2="62" y2="2" />
          <line x1="50" y1="14" x2="74" y2="4" />
          <line x1="50" y1="14" x2="16" y2="12" />
          <line x1="50" y1="14" x2="84" y2="12" />
          <line x1="50" y1="14" x2="28" y2="28" />
          <line x1="50" y1="14" x2="72" y2="28" />
          <line x1="50" y1="14" x2="40" y2="40" />
          <line x1="50" y1="14" x2="60" y2="40" />
        </g>

        {/* Faint Structural Alignment Grid Lines */}
        <g stroke="#0f172a" strokeWidth="0.35" strokeOpacity="0.06">
          <line x1="10" y1="4" x2="10" y2="96" />
          <line x1="26" y1="4" x2="26" y2="96" />
          <line x1="74" y1="4" x2="74" y2="96" />
          <line x1="90" y1="4" x2="90" y2="96" />
          <line x1="4" y1="14" x2="96" y2="14" />
          <line x1="4" y1="32" x2="96" y2="32" />
          <line x1="4" y1="50" x2="96" y2="50" />
          <line x1="4" y1="68" x2="96" y2="68" />
          <line x1="4" y1="86" x2="96" y2="86" />
        </g>

        {/* Hollow Outlined Glyph Matrix (H, X, Ж, K) */}
        <g
          fill="none"
          stroke="#0f172a"
          strokeWidth="0.75"
          strokeOpacity="0.13"
          fontFamily="monospace, system-ui, -apple-system, sans-serif"
          fontWeight="900"
          fontSize="11"
          textAnchor="middle"
          dominantBaseline="central"
        >
          {/* Row 0 (Top) */}
          <text x="10" y="14">H</text>
          <text x="26" y="14">H</text>
          {/* Outlined Ж shape in center */}
          <path d="M42 9.5 v9 M38.5 10.5 l7 7 M38.5 17.5 l7 -7" strokeWidth="0.75" />
          <text x="58" y="14">K</text>
          <text x="74" y="14">H</text>
          <text x="90" y="14">H</text>

          {/* Row 1 */}
          <text x="10" y="32">X</text>
          <text x="26" y="32">H</text>
          <text x="74" y="32">H</text>
          <text x="90" y="32">X</text>

          {/* Row 2 */}
          <text x="10" y="50">H</text>
          <text x="26" y="50">H</text>
          <text x="74" y="50">H</text>
          <text x="90" y="50">H</text>

          {/* Row 3 */}
          <text x="10" y="68">X</text>
          <text x="26" y="68">H</text>
          <text x="74" y="68">H</text>
          <text x="90" y="68">X</text>

          {/* Row 4 (Bottom) */}
          <text x="10" y="86">H</text>
          <text x="26" y="86">H</text>
          <path d="M42 81.5 v9 M38.5 82.5 l7 7 M38.5 89.5 l7 -7" strokeWidth="0.75" />
          <text x="58" y="86">K</text>
          <text x="74" y="86">H</text>
          <text x="90" y="86">H</text>
        </g>
      </svg>
    </div>
  );
}

// ============================================================
// Icons8 Quick Link Icon Component (Deep Navy Monochrome)
// ============================================================

function Icons8QuickIcon({
  iconId,
  fallback,
  className = "h-8 w-8 sm:h-11 sm:w-11",
}: {
  iconId?: string;
  fallback: React.ReactNode;
  className?: string;
}) {
  const [error, setError] = React.useState(false);

  if (!iconId || error) {
    return (
      <div className={`${className} flex items-center justify-center text-[#0f172a] transition-transform duration-200 group-hover:scale-110`}>
        {fallback}
      </div>
    );
  }

  // Icons8 fluent-systems-regular in deep midnight navy #0F172A (retina size=96)
  const url = `https://img.icons8.com/?id=${iconId}&format=png&size=96&color=0F172A`;

  return (
    <img
      src={url}
      alt=""
      className={`${className} object-contain transition-transform duration-200 group-hover:scale-110 select-none`}
      onError={() => setError(true)}
      loading="lazy"
    />
  );
}

// ============================================================
// Data Structure
// ============================================================

interface QuickLinkCard {
  id: string;
  title: string;
  href: string;
  iconId?: string;
  fallbackIcon: React.ReactNode;
}

export function QuickLinksBar() {
  const router = useRouter();

  const cards: QuickLinkCard[] = [
    {
      id: "network",
      title: "Network",
      href: "/network",
      iconId: "SKiePQ8wY2FG",
      fallbackIcon: (
        <svg viewBox="0 0 24 24" className="h-full w-full" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <circle cx="4" cy="8" r="2" /><circle cx="20" cy="8" r="2" />
          <circle cx="4" cy="16" r="2" /><circle cx="20" cy="16" r="2" />
          <circle cx="12" cy="4" r="2" /><circle cx="12" cy="20" r="2" />
          <line x1="6" y1="9" x2="9.5" y2="10.8" /><line x1="18" y1="9" x2="14.5" y2="10.8" />
          <line x1="6" y1="15" x2="9.5" y2="13.2" /><line x1="18" y1="15" x2="14.5" y2="13.2" />
          <line x1="12" y1="6" x2="12" y2="9" /><line x1="12" y1="18" x2="12" y2="15" />
        </svg>
      ),
    },
    {
      id: "learn",
      title: "Learn",
      href: "/learn",
      iconId: "AvANlXOxUB6Z",
      fallbackIcon: <GraduationCap className="h-full w-full stroke-[1.9]" />,
    },
    {
      id: "jobs",
      title: "Jobs",
      href: "/opportunities/jobs",
      iconId: "IOkzpfWnUztj",
      fallbackIcon: <Briefcase className="h-full w-full stroke-[1.9]" />,
    },
    {
      id: "events",
      title: "Events",
      href: "/events",
      iconId: "vwGXRtPWrZSn",
      fallbackIcon: <Calendar className="h-full w-full stroke-[1.9]" />,
    },
    {
      id: "camps",
      title: "Camps",
      href: "/camps",
      fallbackIcon: (
        <svg viewBox="0 0 24 24" className="h-full w-full" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 10.5L12 3l9 7.5V20a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-9.5z" />
          <path d="M9 22V13a3 3 0 0 1 6 0v9" />
        </svg>
      ),
    },
    {
      id: "research",
      title: "Research",
      href: "/research",
      iconId: "9ZmP1ylpYlqn",
      fallbackIcon: <FlaskConical className="h-full w-full stroke-[1.9]" />,
    },
    {
      id: "marketplace",
      title: "Marketplace",
      href: "/marketplace",
      iconId: "VksxHreSn4ck",
      fallbackIcon: <ShoppingBag className="h-full w-full stroke-[1.9]" />,
    },
    {
      id: "ai-assistant",
      title: "AI Assistant",
      href: "#ai-assistant-section",
      iconId: "YxCw7An8DYqf",
      fallbackIcon: <Sparkles className="h-full w-full stroke-[1.9]" />,
    },
  ];

  const handleClick = (href: string) => {
    if (href.startsWith("#")) {
      const el = document.querySelector(href);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      router.push(href);
    }
  };

  return (
    <div className="relative rounded-3xl border border-[#e8ecf2] bg-white p-4 sm:p-6 lg:p-7 shadow-2xs overflow-hidden">
      {/* 1. SECTION HEADER (Matching Exact Reference Image) */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5 sm:mb-6">
        <div className="flex items-start gap-3.5 sm:gap-4">
          {/* Left: MGN Caduceus Crest Logo */}
          <div className="flex flex-col items-center justify-center shrink-0 pt-0.5">
            <img
              src="/logo.png"
              alt="MGN"
              className="h-12 sm:h-14 w-auto object-contain"
            />
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#0f172a]">
              Quick <span className="text-[#1769c2]">Links</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#64748b] mt-1 font-medium leading-relaxed max-w-xl">
              Explore opportunities, learning, and connectivity across the vast healthcare ecosystem.
            </p>
            <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f0f6ff] text-[#1769c2] border border-[#dbeafe] text-[11px] font-bold shadow-2xs">
              <LayoutGrid className="h-3 w-3 stroke-[2.5]" />
              <span>Healthcare Ecosystem</span>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. DESKTOP VIEW: 4 WHITE SQUARE CARDS PER ROW (8 items = 2 rows) */}
      {/* ============================================================ */}
      <div className="hidden md:grid md:grid-cols-4 gap-3.5 sm:gap-4">
        {cards.map((card) => (
          <div
            key={card.id}
            onClick={() => handleClick(card.href)}
            className="group relative aspect-square flex flex-col items-center justify-center rounded-[22px] border border-[#e2e8f0] bg-white p-4 sm:p-5 text-center transition-all duration-200 hover:-translate-y-1 hover:border-[#1769c2]/50 hover:shadow-lg active:scale-95 shadow-[0_2px_8px_rgba(0,0,0,0.03)] cursor-pointer overflow-hidden"
          >
            {/* Card Background Watermark Pattern */}
            <CardWatermarkBg />

            {/* Centered Icon without background box */}
            <div className="relative z-10 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center">
              <Icons8QuickIcon
                iconId={card.iconId}
                fallback={card.fallbackIcon}
                className="h-10 w-10 sm:h-12 sm:w-12"
              />
            </div>

            {/* Title */}
            <h3 className="relative z-10 text-sm sm:text-base font-bold text-[#0f172a] group-hover:text-[#1769c2] transition-colors mt-3 tracking-tight truncate w-full">
              {card.title}
            </h3>

            {/* Open link */}
            <span className="relative z-10 text-xs font-medium text-[#64748b] group-hover:text-[#1769c2] flex items-center justify-center gap-1 mt-1 transition-colors">
              <span>Open</span>
              <span className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
            </span>
          </div>
        ))}
      </div>

      {/* ============================================================ */}
      {/* 3. MOBILE VIEW: 3 WHITE SQUARE CARDS PER ROW (9 slots = 3x3)  */}
      {/* ============================================================ */}
      <div className="grid grid-cols-3 gap-2 sm:gap-2.5 md:hidden">
        {cards.map((card) => (
          <div
            key={card.id}
            onClick={() => handleClick(card.href)}
            className="group relative aspect-square flex flex-col items-center justify-center rounded-[20px] border border-[#e2e8f0] bg-white p-2 sm:p-2.5 text-center transition-all duration-200 active:scale-95 hover:border-[#1769c2]/50 shadow-[0_2px_8px_rgba(0,0,0,0.03)] cursor-pointer overflow-hidden"
          >
            {/* Card Background Watermark Pattern */}
            <CardWatermarkBg />

            {/* Centered Icon without background box */}
            <div className="relative z-10 flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center">
              <Icons8QuickIcon
                iconId={card.iconId}
                fallback={card.fallbackIcon}
                className="h-7 w-7 sm:h-8 sm:w-8"
              />
            </div>

            {/* Title */}
            <h3 className="relative z-10 text-[11px] sm:text-xs font-bold text-[#0f172a] group-hover:text-[#1769c2] truncate w-full tracking-tight transition-colors mt-1.5">
              {card.title}
            </h3>

            {/* Open link */}
            <span className="relative z-10 text-[9px] font-medium text-[#64748b] group-hover:text-[#1769c2] flex items-center justify-center gap-0.5 mt-0.5 transition-colors">
              <span>Open</span>
              <span className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
            </span>
          </div>
        ))}

        {/* 9th Slot: Subtle Placeholder Card with Sparkle (matching reference image) */}
        <div className="aspect-square flex flex-col items-center justify-center rounded-[20px] border border-[#e2e8f0] bg-[#fafafa]/80 p-2 text-center select-none">
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center text-slate-300">
            <Sparkles className="h-6 w-6 stroke-[1.2]" />
          </div>
          <span className="text-[10px] font-medium text-slate-400 mt-1.5 opacity-60">
            MGN
          </span>
        </div>
      </div>
    </div>
  );
}
