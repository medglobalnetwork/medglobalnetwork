"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

interface QuickLinkItem {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
  color: string;
}

export function QuickLinksBar() {
  const router = useRouter();

  const links: QuickLinkItem[] = [
    {
      id: "network",
      label: "Network",
      href: "/network",
      color: "bg-[#eef5fc] text-[#1769c2] border-[#dbeafe]",
      icon: (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      id: "learn",
      label: "Learn",
      href: "/learn",
      color: "bg-[#f0fdf4] text-[#15803d] border-[#bbf7d0]",
      icon: (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
          <path d="M6 12v5c3 3 9 3 12 0v-5" />
        </svg>
      ),
    },
    {
      id: "jobs",
      label: "Jobs",
      href: "/opportunities",
      color: "bg-[#fefce8] text-[#854d0e] border-[#fef08a]",
      icon: (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="7" width="20" height="14" rx="2" />
          <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
        </svg>
      ),
    },
    {
      id: "camps",
      label: "Camps",
      href: "#camps-section",
      color: "bg-[#ecfdf5] text-[#047857] border-[#a7f3d0]",
      icon: (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        </svg>
      ),
    },
    {
      id: "events",
      label: "Events",
      href: "#events-section",
      color: "bg-[#fef2f2] text-[#b91c1c] border-[#fecaca]",
      icon: (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
    },
    {
      id: "research",
      label: "Research",
      href: "#research-section",
      color: "bg-[#f5f3ff] text-[#6d28d9] border-[#ddd6fe]",
      icon: (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 18h8" />
          <path d="M3 22h18" />
          <path d="M14 22a7 7 0 1 0 0-14h-1" />
          <path d="M9 14h2" />
          <path d="M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2Z" />
          <path d="M12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3" />
        </svg>
      ),
    },
    {
      id: "marketplace",
      label: "Marketplace",
      href: "/marketplace",
      color: "bg-[#fdf4ff] text-[#c026d3] border-[#f5d0fe]",
      icon: (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      ),
    },
    {
      id: "meetings",
      label: "Meetings",
      href: "#meetings-section",
      color: "bg-[#f0f9ff] text-[#0284c7] border-[#bae6fd]",
      icon: (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="23 7 16 12 23 17 23 7" />
          <rect x="1" y="5" width="15" height="14" rx="2" />
        </svg>
      ),
    },
  ];

  const handleClick = (href: string) => {
    if (href.startsWith("#")) {
      const el = document.querySelector(href);
      el?.scrollIntoView({ behavior: "smooth" });
    } else {
      router.push(href);
    }
  };

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none sm:grid sm:grid-cols-4 lg:grid-cols-8">
      {links.map((link) => (
        <button
          key={link.id}
          type="button"
          onClick={() => handleClick(link.href)}
          className="group flex shrink-0 items-center justify-center gap-2 rounded-xl border border-[#ded8d1] bg-white px-3 py-2 text-xs font-semibold text-[#171717] shadow-2xs transition hover:-translate-y-0.5 hover:border-[#cfc6be] hover:shadow-xs sm:w-full"
        >
          <span
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border transition group-hover:scale-110 ${link.color}`}
          >
            {link.icon}
          </span>
          <span className="truncate">{link.label}</span>
        </button>
      ))}
    </div>
  );
}
