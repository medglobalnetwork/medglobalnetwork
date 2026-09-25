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

        {/* Hollow Outlined Glyph Matrix (M, G, N Monogram) */}
        <g
          fill="none"
          stroke="#0f172a"
          strokeWidth="0.8"
          strokeOpacity="0.14"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="900"
          fontSize="11"
          textAnchor="middle"
          dominantBaseline="central"
        >
          {/* Row 0 (Top) */}
          <text x="10" y="14">M</text>
          <text x="26" y="14">G</text>
          <text x="42" y="14">N</text>
          <text x="58" y="14">M</text>
          <text x="74" y="14">G</text>
          <text x="90" y="14">N</text>

          {/* Row 1 */}
          <text x="10" y="32">N</text>
          <text x="26" y="32">M</text>
          <text x="74" y="32">G</text>
          <text x="90" y="32">N</text>

          {/* Row 2 */}
          <text x="10" y="50">G</text>
          <text x="26" y="50">N</text>
          <text x="74" y="50">M</text>
          <text x="90" y="50">G</text>

          {/* Row 3 */}
          <text x="10" y="68">M</text>
          <text x="26" y="68">G</text>
          <text x="74" y="68">N</text>
          <text x="90" y="68">M</text>

          {/* Row 4 (Bottom) */}
          <text x="10" y="86">M</text>
          <text x="26" y="86">G</text>
          <text x="42" y="86">N</text>
          <text x="58" y="86">M</text>
          <text x="74" y="86">G</text>
          <text x="90" y="86">N</text>
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
    <div className="relative rounded-2xl border border-[#e8ecf2] bg-white p-2.5 sm:p-3.5 shadow-2xs overflow-hidden">
      {/* 1. COMPACT SECTION HEADER (Single Row) */}
      <div className="relative z-10 flex items-center justify-between gap-2 mb-2 sm:mb-2.5">
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          {/* MGN Caduceus Crest Logo */}
          <img
            src="/logo.png"
            alt="MGN"
            className="h-6 w-auto sm:h-7 object-contain shrink-0"
          />

          <div className="flex items-baseline gap-2 min-w-0">
            <h2 className="text-sm sm:text-base font-black tracking-tight text-[#0f172a] shrink-0">
              Quick <span className="text-[#1769c2]">Links</span>
            </h2>
            <p className="hidden sm:block text-[11px] text-[#64748b] font-medium border-l border-[#e2e8f0] pl-2 truncate">
              Healthcare ecosystem shortcuts
            </p>
          </div>
        </div>

        {/* Right Badge */}
        <div className="shrink-0">
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#f0f6ff] text-[#1769c2] border border-[#dbeafe] text-[9px] sm:text-[10px] font-bold shadow-2xs">
            <LayoutGrid className="h-2.5 w-2.5 stroke-[2.5]" />
            <span>Ecosystem</span>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. DESKTOP VIEW: 4 ULTRA-COMPACT WHITE CARDS PER ROW          */}
      {/* ============================================================ */}
      <div className="hidden md:grid md:grid-cols-4 gap-2">
        {cards.map((card) => (
          <div
            key={card.id}
            onClick={() => handleClick(card.href)}
            className="group relative h-24 sm:h-[102px] flex flex-col items-center justify-center rounded-xl border border-[#e2e8f0] bg-white p-2 text-center transition-all duration-200 hover:-translate-y-0.5 hover:border-[#1769c2]/50 hover:shadow-xs active:scale-95 shadow-[0_1px_3px_rgba(0,0,0,0.02)] cursor-pointer overflow-hidden"
          >
            {/* Card Background Watermark Pattern */}
            <CardWatermarkBg />

            {/* Centered Icon without background box */}
            <div className="relative z-10 flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center">
              <Icons8QuickIcon
                iconId={card.iconId}
                fallback={card.fallbackIcon}
                className="h-6 w-6 sm:h-6.5 sm:w-6.5"
              />
            </div>

            {/* Title */}
            <h3 className="relative z-10 text-xs font-bold text-[#0f172a] group-hover:text-[#1769c2] transition-colors mt-1 tracking-tight truncate w-full">
              {card.title}
            </h3>

            {/* Open link */}
            <span className="relative z-10 text-[10px] font-medium text-[#64748b] group-hover:text-[#1769c2] flex items-center justify-center gap-0.5 mt-0.5 transition-colors">
              <span>Open</span>
              <span className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
            </span>
          </div>
        ))}
      </div>

      {/* ============================================================ */}
      {/* 3. MOBILE VIEW: 3 ULTRA-COMPACT WHITE CARDS PER ROW           */}
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
