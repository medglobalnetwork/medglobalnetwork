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
  colorHex = "0F4C81",
  fallback,
  fallbackClass = "text-[#0f4c81]",
  className = "size-8 sm:size-[34px]",
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
      <div className={`${className} flex items-center justify-center ${fallbackClass} transition-transform duration-200 select-none`}>
        {fallback}
      </div>
    );
  }

  // Icons8 fluent-systems-regular in content-specific accent color (retina size=96)
  const cleanHex = colorHex.replace("#", "").toUpperCase();
  const url = `https://img.icons8.com/?id=${iconId}&format=png&size=96&color=${cleanHex}`;

  return (
    <img
      src={url}
      alt=""
      className={`${className} object-contain transition-transform duration-200 select-none`}
      onError={() => setError(true)}
      loading="lazy"
    />
  );
}

// ============================================================
// Data Structure with Distinct Content-Themed Color Palette
// ============================================================

interface QuickLinkItem {
  id: string;
  title: string;
  href: string;
  iconId?: string;
  colorHex: string;
  fallbackClass: string;
  hoverClass: string;
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
      colorHex: "000000",
      fallbackClass: "text-black dark:text-white",
      hoverClass: "group-hover:text-black dark:group-hover:text-white",
      fallbackIcon: (
        <svg viewBox="0 0 24 24" className="size-full" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
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
      colorHex: "000000",
      fallbackClass: "text-black dark:text-white",
      hoverClass: "group-hover:text-black dark:group-hover:text-white",
      fallbackIcon: <GraduationCap className="size-full stroke-[1.9]" />,
    },
    {
      id: "jobs",
      title: "Jobs",
      href: "/opportunities/jobs",
      iconId: "IOkzpfWnUztj",
      colorHex: "000000",
      fallbackClass: "text-black dark:text-white",
      hoverClass: "group-hover:text-black dark:group-hover:text-white",
      fallbackIcon: <Briefcase className="size-full stroke-[1.9]" />,
    },
    {
      id: "events",
      title: "Events",
      href: "/events",
      iconId: "vwGXRtPWrZSn",
      colorHex: "000000",
      fallbackClass: "text-black dark:text-white",
      hoverClass: "group-hover:text-black dark:group-hover:text-white",
      fallbackIcon: <Calendar className="size-full stroke-[1.9]" />,
    },
    {
      id: "camps",
      title: "Camps",
      href: "/camps",
      iconId: "HBLTBJiOS1vp",
      colorHex: "000000",
      fallbackClass: "text-black dark:text-white",
      hoverClass: "group-hover:text-black dark:group-hover:text-white",
      fallbackIcon: (
        <svg viewBox="0 0 24 24" className="size-full" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
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
      colorHex: "000000",
      fallbackClass: "text-black dark:text-white",
      hoverClass: "group-hover:text-black dark:group-hover:text-white",
      fallbackIcon: <FlaskConical className="size-full stroke-[1.9]" />,
    },
    {
      id: "marketplace",
      title: "Marketplace",
      href: "/marketplace",
      iconId: "VksxHreSn4ck",
      colorHex: "000000",
      fallbackClass: "text-black dark:text-white",
      hoverClass: "group-hover:text-black dark:group-hover:text-white",
      fallbackIcon: <ShoppingBag className="size-full stroke-[1.9]" />,
    },
    {
      id: "nearby",
      title: "Nearby",
      href: "/suggestions",
      colorHex: "000000",
      fallbackClass: "text-black dark:text-white",
      hoverClass: "group-hover:text-black dark:group-hover:text-white",
      fallbackIcon: (
        <svg viewBox="0 0 24 24" className="size-full" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
        </svg>
      ),
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
          <button
            key={item.id}
            type="button"
            onClick={() => handleClick(item.href)}
            className="group flex flex-col items-center justify-center text-center p-1.5 transition-all duration-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f4c81] rounded-2xl cursor-pointer"
          >
            {/* Clean Frameless Icon Container (No background box) */}
            <div className="flex size-11 sm:size-12 items-center justify-center transition-transform duration-200 group-hover:scale-110">
              <Icons8QuickIcon
                iconId={item.iconId}
                colorHex={item.colorHex}
                fallback={item.fallbackIcon}
                fallbackClass={item.fallbackClass}
                className="size-8 sm:size-[34px]"
              />
            </div>

            {/* Clean Title */}
            <span className={`text-[11px] sm:text-xs font-semibold text-[#171717] dark:text-[#f0f6fc] ${item.hoverClass} transition-colors mt-1.5 truncate w-full`}>
              {item.title}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
