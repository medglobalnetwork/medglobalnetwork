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
// Icons8 Quick Link Icon Component (Section Themed)
// ============================================================

function Icons8QuickIcon({
  iconId,
  colorHex = "1769C2",
  fallback,
  fallbackClass = "text-[#1769c2]",
  className = "h-7 w-7 sm:h-8 sm:w-8",
}: {
  iconId?: string;
  colorHex?: string;
  fallback: React.ReactNode;
  fallbackClass?: string;
  className?: string;
}) {
  const [error, setError] = React.useState(false);

  if (!iconId || error) {
    return (
      <div className={`${className} flex items-center justify-center ${fallbackClass} transition-transform duration-200 group-hover:scale-110`}>
        {fallback}
      </div>
    );
  }

  // Icons8 fluent-systems-regular in matching premium section color (retina size=96)
  const url = `https://img.icons8.com/?id=${iconId}&format=png&size=96&color=${colorHex}`;

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
// Data Structure with Premium Soft Color Palette
// ============================================================

interface QuickLinkItem {
  id: string;
  title: string;
  href: string;
  iconId?: string;
  colorHex: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
  hoverTextClass: string;
  fallbackIcon: React.ReactNode;
}

export function QuickLinksBar() {
  const router = useRouter();

  const items: QuickLinkItem[] = [
    {
      id: "network",
      title: "Network",
      href: "/network",
      iconId: "SKiePQ8wY2FG",
      colorHex: "1769C2",
      bgClass: "bg-[#eef5fc] group-hover:bg-[#e0efff]",
      borderClass: "border-[#dbeafe]/80 group-hover:border-[#bfdbfe]",
      textClass: "text-[#1769c2]",
      hoverTextClass: "group-hover:text-[#1769c2]",
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
      colorHex: "059669",
      bgClass: "bg-[#ecfdf5] group-hover:bg-[#d1fae5]",
      borderClass: "border-[#a7f3d0]/80 group-hover:border-[#6ee7b7]",
      textClass: "text-[#059669]",
      hoverTextClass: "group-hover:text-[#059669]",
      fallbackIcon: <GraduationCap className="h-full w-full stroke-[1.9]" />,
    },
    {
      id: "jobs",
      title: "Jobs",
      href: "/opportunities/jobs",
      iconId: "IOkzpfWnUztj",
      colorHex: "D97706",
      bgClass: "bg-[#fffbeb] group-hover:bg-[#fef3c7]",
      borderClass: "border-[#fde68a]/80 group-hover:border-[#fcd34d]",
      textClass: "text-[#d97706]",
      hoverTextClass: "group-hover:text-[#d97706]",
      fallbackIcon: <Briefcase className="h-full w-full stroke-[1.9]" />,
    },
    {
      id: "events",
      title: "Events",
      href: "/events",
      iconId: "vwGXRtPWrZSn",
      colorHex: "7C3AED",
      bgClass: "bg-[#f5f3ff] group-hover:bg-[#ede9fe]",
      borderClass: "border-[#ddd6fe]/80 group-hover:border-[#c4b5fd]",
      textClass: "text-[#7c3aed]",
      hoverTextClass: "group-hover:text-[#7c3aed]",
      fallbackIcon: <Calendar className="h-full w-full stroke-[1.9]" />,
    },
    {
      id: "camps",
      title: "Camps",
      href: "/camps",
      colorHex: "E11D48",
      bgClass: "bg-[#fff1f2] group-hover:bg-[#ffe4e6]",
      borderClass: "border-[#fecdd3]/80 group-hover:border-[#fda4af]",
      textClass: "text-[#e11d48]",
      hoverTextClass: "group-hover:text-[#e11d48]",
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
      colorHex: "0891B2",
      bgClass: "bg-[#ecfeff] group-hover:bg-[#cffafe]",
      borderClass: "border-[#a5f3fc]/80 group-hover:border-[#67e8f9]",
      textClass: "text-[#0891b2]",
      hoverTextClass: "group-hover:text-[#0891b2]",
      fallbackIcon: <FlaskConical className="h-full w-full stroke-[1.9]" />,
    },
    {
      id: "marketplace",
      title: "Marketplace",
      href: "/marketplace",
      iconId: "VksxHreSn4ck",
      colorHex: "C026D3",
      bgClass: "bg-[#fdf4ff] group-hover:bg-[#fae8ff]",
      borderClass: "border-[#f5d0fe]/80 group-hover:border-[#f0abfc]",
      textClass: "text-[#c026d3]",
      hoverTextClass: "group-hover:text-[#c026d3]",
      fallbackIcon: <ShoppingBag className="h-full w-full stroke-[1.9]" />,
    },
    {
      id: "ai-assistant",
      title: "AI Assistant",
      href: "#ai-assistant-section",
      iconId: "YxCw7An8DYqf",
      colorHex: "4F46E5",
      bgClass: "bg-[#eef2ff] group-hover:bg-[#e0e7ff]",
      borderClass: "border-[#c7d2fe]/80 group-hover:border-[#a5b4fc]",
      textClass: "text-[#4f46e5]",
      hoverTextClass: "group-hover:text-[#4f46e5]",
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
    <div className="relative w-full py-1">
      {/* Icon Dock Grid: 4 columns on mobile (2 rows), 8 columns on desktop (1 row) */}
      <div className="grid grid-cols-4 md:grid-cols-8 gap-2 sm:gap-3">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => handleClick(item.href)}
            className="group flex flex-col items-center justify-center text-center cursor-pointer p-1.5 transition-all duration-200 active:scale-95"
          >
            {/* Centered Soft Pill Badge */}
            <div
              className={`flex h-12 w-12 sm:h-13 sm:w-13 items-center justify-center rounded-2xl ${item.bgClass} border ${item.borderClass} shadow-2xs transition-all duration-200 group-hover:scale-105 group-hover:shadow-xs`}
            >
              <Icons8QuickIcon
                iconId={item.iconId}
                colorHex={item.colorHex}
                fallback={item.fallbackIcon}
                fallbackClass={item.textClass}
                className="h-7 w-7 sm:h-7.5 sm:w-7.5"
              />
            </div>

            {/* Clean Title */}
            <span
              className={`text-[11px] sm:text-xs font-semibold text-[#0f172a] ${item.hoverTextClass} transition-colors mt-1.5 tracking-tight truncate w-full`}
            >
              {item.title}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
