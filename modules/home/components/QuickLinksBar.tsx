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
// Icons8 Quick Link Icon Component (Deep Navy Monochrome)
// ============================================================

function Icons8QuickIcon({
  iconId,
  fallback,
  className = "h-8.5 w-8.5 sm:h-9.5 sm:w-9.5",
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
    <div className="relative w-full py-1">
      {/* Icon Dock Grid: 4 columns on mobile (2 rows), 8 columns on desktop (1 row) */}
      <div className="grid grid-cols-4 md:grid-cols-8 gap-2 sm:gap-3">
        {cards.map((card) => (
          <div
            key={card.id}
            onClick={() => handleClick(card.href)}
            className="group flex flex-col items-center justify-center text-center cursor-pointer p-1.5 transition-all duration-200 active:scale-95"
          >
            {/* Centered Icon with subtle hover background */}
            <div className="flex h-12 w-12 sm:h-13 sm:w-13 items-center justify-center rounded-2xl transition-all duration-200 group-hover:scale-110 group-hover:bg-[#f1f5f9]/80">
              <Icons8QuickIcon
                iconId={card.iconId}
                fallback={card.fallbackIcon}
                className="h-8.5 w-8.5 sm:h-9.5 sm:w-9.5"
              />
            </div>

            {/* Clean Title */}
            <span className="text-[11px] sm:text-xs font-semibold text-[#0f172a] group-hover:text-[#1769c2] transition-colors mt-1.5 tracking-tight truncate w-full">
              {card.title}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
