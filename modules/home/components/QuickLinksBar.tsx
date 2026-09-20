"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  GraduationCap,
  Briefcase,
  Tent,
  Calendar,
  FlaskConical,
  ShoppingBag,
  Video,
} from "lucide-react";

interface QuickLinkItem {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
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
      icon: <Users className="h-4 w-4 stroke-[2]" />,
    },
    {
      id: "learn",
      label: "Learn",
      href: "/learn",
      color: "bg-[#f0fdf4] text-[#15803d] border-[#bbf7d0]",
      icon: <GraduationCap className="h-4 w-4 stroke-[2]" />,
    },
    {
      id: "jobs",
      label: "Jobs",
      href: "/opportunities",
      color: "bg-[#fefce8] text-[#854d0e] border-[#fef08a]",
      icon: <Briefcase className="h-4 w-4 stroke-[2]" />,
    },
    {
      id: "camps",
      label: "Camps",
      href: "#camps-section",
      color: "bg-[#ecfdf5] text-[#047857] border-[#a7f3d0]",
      icon: <Tent className="h-4 w-4 stroke-[2]" />,
    },
    {
      id: "events",
      label: "Events",
      href: "#events-section",
      color: "bg-[#fef2f2] text-[#b91c1c] border-[#fecaca]",
      icon: <Calendar className="h-4 w-4 stroke-[2]" />,
    },
    {
      id: "research",
      label: "Research",
      href: "#research-section",
      color: "bg-[#f5f3ff] text-[#6d28d9] border-[#ddd6fe]",
      icon: <FlaskConical className="h-4 w-4 stroke-[2]" />,
    },
    {
      id: "marketplace",
      label: "Marketplace",
      href: "/marketplace",
      color: "bg-[#fdf4ff] text-[#c026d3] border-[#f5d0fe]",
      icon: <ShoppingBag className="h-4 w-4 stroke-[2]" />,
    },
    {
      id: "meetings",
      label: "Meetings",
      href: "#meetings-section",
      color: "bg-[#f0f9ff] text-[#0284c7] border-[#bae6fd]",
      icon: <Video className="h-4 w-4 stroke-[2]" />,
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
          <span className="truncate tracking-tight">{link.label}</span>
        </button>
      ))}
    </div>
  );
}
