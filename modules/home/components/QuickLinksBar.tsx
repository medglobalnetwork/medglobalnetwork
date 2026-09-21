"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  Calendar,
  FlaskConical,
  GraduationCap,
  MessageSquare,
  ShoppingBag,
  Sparkles,
  Tent,
  Users,
  Video,
} from "lucide-react";

interface QuickLinkItem {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  bg: string;
}

export function QuickLinksBar() {
  const router = useRouter();

  const links: QuickLinkItem[] = [
    {
      id: "network",
      label: "Network",
      href: "/network",
      bg: "bg-[#eef5fc] text-[#1769c2]",
      icon: <Users className="h-5 w-5 stroke-[2]" />,
    },
    {
      id: "learn",
      label: "Learn",
      href: "/learn",
      bg: "bg-[#f0fdf4] text-[#16a34a]",
      icon: <GraduationCap className="h-5 w-5 stroke-[2]" />,
    },
    {
      id: "jobs",
      label: "Jobs",
      href: "/opportunities",
      bg: "bg-[#fefce8] text-[#ca8a04]",
      icon: <Briefcase className="h-5 w-5 stroke-[2]" />,
    },
    {
      id: "events",
      label: "Events",
      href: "#events-section",
      bg: "bg-[#fff1f2] text-[#e11d48]",
      icon: <Calendar className="h-5 w-5 stroke-[2]" />,
    },
    {
      id: "camps",
      label: "Camps",
      href: "#camps-section",
      bg: "bg-[#ecfdf5] text-[#059669]",
      icon: <Tent className="h-5 w-5 stroke-[2]" />,
    },
    {
      id: "research",
      label: "Research",
      href: "#research-section",
      bg: "bg-[#f5f3ff] text-[#7c3aed]",
      icon: <FlaskConical className="h-5 w-5 stroke-[2]" />,
    },
    {
      id: "marketplace",
      label: "Marketplace",
      href: "/marketplace",
      bg: "bg-[#f0f9ff] text-[#0284c7]",
      icon: <ShoppingBag className="h-5 w-5 stroke-[2]" />,
    },
    {
      id: "meetings",
      label: "Meetings",
      href: "#meetings-section",
      bg: "bg-[#eff6ff] text-[#2563eb]",
      icon: <Video className="h-5 w-5 stroke-[2]" />,
    },
    {
      id: "communities",
      label: "Communities",
      href: "/network/communities",
      bg: "bg-[#faf5ff] text-[#9333ea]",
      icon: <MessageSquare className="h-5 w-5 stroke-[2]" />,
    },
    {
      id: "ai-assistant",
      label: "AI Assistant",
      href: "#ai-assistant-section",
      bg: "bg-gradient-to-tr from-purple-100 to-indigo-100 text-purple-700",
      icon: <Sparkles className="h-5 w-5 stroke-[2]" />,
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
    <div className="rounded-3xl border border-[#e8e6e3] bg-white p-5 shadow-2xs">
      {/* 1. SECTION HEADER */}
      <div className="mb-4">
        <h2 className="text-base font-bold text-[#171717] tracking-tight">Quick Links</h2>
        <p className="text-xs text-[#77716b]">Explore opportunities, learning, and more</p>
      </div>

      {/* 2. 10 ICON CARDS GRID */}
      <div className="grid grid-cols-5 gap-3 sm:grid-cols-5 md:grid-cols-10">
        {links.map((link) => (
          <button
            key={link.id}
            type="button"
            onClick={() => handleClick(link.href)}
            className="group flex flex-col items-center justify-center gap-2 rounded-2xl border border-transparent p-2 text-center transition hover:-translate-y-0.5 hover:border-[#ded8d1] hover:bg-[#faf9f8]"
          >
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-2xl transition group-hover:scale-105 shadow-2xs ${link.bg}`}
            >
              {link.icon}
            </div>
            <span className="text-[11px] font-semibold text-[#171717] group-hover:text-[#1769c2] truncate w-full">
              {link.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
