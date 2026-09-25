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
} from "lucide-react";

// ============================================================
// Card Watermark Background Pattern (Matching Exact Reference Design)
// ============================================================

function CardWatermarkBg() {
  return (
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden rounded-[inherit]">
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="h-full w-full opacity-85 group-hover:opacity-100 transition-opacity duration-300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Subtle Background Starburst Rays radiating from top center */}
        <g stroke="#0f172a" strokeWidth="0.5" strokeOpacity="0.08" strokeLinecap="round">
          <line x1="50" y1="12" x2="0" y2="0" />
          <line x1="50" y1="12" x2="25" y2="0" />
          <line x1="50" y1="12" x2="50" y2="0" />
          <line x1="50" y1="12" x2="75" y2="0" />
          <line x1="50" y1="12" x2="100" y2="0" />
          <line x1="50" y1="12" x2="0" y2="25" />
          <line x1="50" y1="12" x2="100" y2="25" />
          <line x1="50" y1="12" x2="0" y2="50" />
          <line x1="50" y1="12" x2="100" y2="50" />
          <line x1="50" y1="12" x2="0" y2="75" />
          <line x1="50" y1="12" x2="100" y2="75" />
          <line x1="50" y1="12" x2="0" y2="100" />
          <line x1="50" y1="12" x2="25" y2="100" />
          <line x1="50" y1="12" x2="50" y2="100" />
          <line x1="50" y1="12" x2="75" y2="100" />
          <line x1="50" y1="12" x2="100" y2="100" />
        </g>

        {/* Full-bleed Structural Alignment Grid Lines */}
        <g stroke="#0f172a" strokeWidth="0.35" strokeOpacity="0.07">
          <line x1="8" y1="0" x2="8" y2="100" />
          <line x1="24" y1="0" x2="24" y2="100" />
          <line x1="40" y1="0" x2="40" y2="100" />
          <line x1="60" y1="0" x2="60" y2="100" />
          <line x1="76" y1="0" x2="76" y2="100" />
          <line x1="92" y1="0" x2="92" y2="100" />
          <line x1="0" y1="10" x2="100" y2="10" />
          <line x1="0" y1="28" x2="100" y2="28" />
          <line x1="0" y1="46" x2="100" y2="46" />
          <line x1="0" y1="64" x2="100" y2="64" />
          <line x1="0" y1="82" x2="100" y2="82" />
          <line x1="0" y1="94" x2="100" y2="94" />
        </g>

        {/* Full-bleed Hollow Outlined Glyph Matrix (M, G, N Monogram covering entire card) */}
        <g
          fill="none"
          stroke="#0f172a"
          strokeWidth="0.75"
          strokeOpacity="0.13"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="900"
          fontSize="10"
          textAnchor="middle"
          dominantBaseline="central"
        >
          {/* Row 0 (Top edge) */}
          <text x="8" y="10">M</text>
          <text x="24" y="10">G</text>
          <text x="40" y="10">N</text>
          <text x="60" y="10">M</text>
          <text x="76" y="10">G</text>
          <text x="92" y="10">N</text>

          {/* Row 1 */}
          <text x="8" y="28">N</text>
          <text x="24" y="28">M</text>
          <text x="40" y="28">G</text>
          <text x="60" y="28">N</text>
          <text x="76" y="28">M</text>
          <text x="92" y="28">G</text>

          {/* Row 2 */}
          <text x="8" y="46">G</text>
          <text x="24" y="46">N</text>
          <text x="40" y="46">M</text>
          <text x="60" y="46">G</text>
          <text x="76" y="46">N</text>
          <text x="92" y="46">M</text>

          {/* Row 3 */}
          <text x="8" y="64">M</text>
          <text x="24" y="64">G</text>
          <text x="40" y="64">N</text>
          <text x="60" y="64">M</text>
          <text x="76" y="64">G</text>
          <text x="92" y="64">N</text>

          {/* Row 4 */}
          <text x="8" y="82">N</text>
          <text x="24" y="82">M</text>
          <text x="40" y="82">G</text>
          <text x="60" y="82">N</text>
          <text x="76" y="82">M</text>
          <text x="92" y="82">G</text>

          {/* Row 5 (Bottom edge) */}
          <text x="8" y="94">G</text>
          <text x="24" y="94">N</text>
          <text x="40" y="94">M</text>
          <text x="60" y="94">G</text>
          <text x="76" y="94">N</text>
          <text x="92" y="94">M</text>
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
    <div className="relative w-full">
      {/* ============================================================ */}
      {/* 1. DESKTOP VIEW: 4 SQUARE WHITE CARDS PER ROW                */}
      {/* ============================================================ */}
      <div className="hidden md:grid md:grid-cols-4 gap-2.5 sm:gap-3">
        {cards.map((card) => (
          <div
            key={card.id}
            onClick={() => handleClick(card.href)}
            className="group relative aspect-square flex flex-col items-center justify-center rounded-xl sm:rounded-2xl border border-[#e2e8f0] bg-white p-2.5 sm:p-3 text-center transition-all duration-200 hover:-translate-y-0.5 hover:border-[#1769c2]/50 hover:shadow-md active:scale-95 shadow-[0_1px_3px_rgba(0,0,0,0.02)] cursor-pointer overflow-hidden"
          >
            {/* Card Background Watermark Pattern covering entire card */}
            <CardWatermarkBg />

            {/* Centered Icon without background box */}
            <div className="relative z-10 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center">
              <Icons8QuickIcon
                iconId={card.iconId}
                fallback={card.fallbackIcon}
                className="h-6 w-6 sm:h-7 sm:w-7"
              />
            </div>

            {/* Title */}
            <h3 className="relative z-10 text-xs sm:text-[13px] font-bold text-[#0f172a] group-hover:text-[#1769c2] transition-colors mt-2 tracking-tight truncate w-full">
              {card.title}
            </h3>

            {/* Open link */}
            <span className="relative z-10 text-[10px] sm:text-[11px] font-medium text-[#64748b] group-hover:text-[#1769c2] flex items-center justify-center gap-0.5 mt-0.5 transition-colors">
              <span>Open</span>
              <span className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
            </span>
          </div>
        ))}
      </div>

      {/* ============================================================ */}
      {/* 2. MOBILE VIEW: 3 SQUARE WHITE CARDS PER ROW                 */}
      {/* ============================================================ */}
      <div className="grid grid-cols-3 gap-1.5 md:hidden">
        {cards.map((card) => (
          <div
            key={card.id}
            onClick={() => handleClick(card.href)}
            className="group relative aspect-square max-h-[84px] flex flex-col items-center justify-center rounded-xl border border-[#e2e8f0] bg-white p-1 text-center transition-all duration-200 active:scale-95 hover:border-[#1769c2]/50 shadow-[0_1px_3px_rgba(0,0,0,0.02)] cursor-pointer overflow-hidden"
          >
            {/* Card Background Watermark Pattern */}
            <CardWatermarkBg />

            {/* Centered Icon without background box */}
            <div className="relative z-10 flex h-6 w-6 items-center justify-center">
              <Icons8QuickIcon
                iconId={card.iconId}
                fallback={card.fallbackIcon}
                className="h-5 w-5"
              />
            </div>

            {/* Title */}
            <h3 className="relative z-10 text-[10px] sm:text-[11px] font-bold text-[#0f172a] group-hover:text-[#1769c2] truncate w-full tracking-tight transition-colors mt-0.5">
              {card.title}
            </h3>

            {/* Open link */}
            <span className="relative z-10 text-[8px] font-medium text-[#64748b] group-hover:text-[#1769c2] flex items-center justify-center gap-0.5 mt-0.5 transition-colors">
              <span>Open</span>
              <span className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
            </span>
          </div>
        ))}

        {/* 9th Slot: Subtle Placeholder Card with Sparkle */}
        <div className="aspect-square max-h-[84px] flex flex-col items-center justify-center rounded-xl border border-[#e2e8f0] bg-[#fafafa]/80 p-1 text-center select-none">
          <div className="flex h-6 w-6 items-center justify-center text-slate-300">
            <Sparkles className="h-4 w-4 stroke-[1.2]" />
          </div>
          <span className="text-[8px] font-medium text-slate-400 mt-0.5 opacity-60">
            MGN
          </span>
        </div>
      </div>
    </div>
  );
}
