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
  ArrowRight,
} from "lucide-react";

interface QuickLinkCard {
  id: string;
  title: string;
  description: string;
  actionText: string;
  href: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  actionColor: string;
}

export function QuickLinksBar() {
  const router = useRouter();

  const cards: QuickLinkCard[] = [
    {
      id: "network",
      title: "Network",
      description: "Connect with healthcare professionals",
      actionText: "Explore",
      href: "/network",
      icon: <Users className="h-6 w-6" />,
      iconBg: "bg-[#e8f1fd]",
      iconColor: "text-[#1b64da]",
      actionColor: "text-[#1b64da]",
    },
    {
      id: "learn",
      title: "Learn",
      description: "Courses, CME and certifications",
      actionText: "Start Learning",
      href: "/learn",
      icon: <GraduationCap className="h-6 w-6" />,
      iconBg: "bg-[#e6f9f0]",
      iconColor: "text-[#059669]",
      actionColor: "text-[#059669]",
    },
    {
      id: "jobs",
      title: "Jobs",
      description: "Find career opportunities",
      actionText: "Browse Jobs",
      href: "/opportunities/jobs",
      icon: <Briefcase className="h-6 w-6" />,
      iconBg: "bg-[#fff7e6]",
      iconColor: "text-[#d97706]",
      actionColor: "text-[#d97706]",
    },
    {
      id: "events",
      title: "Events",
      description: "Conferences, CME and webinars",
      actionText: "View Events",
      href: "/events",
      icon: <Calendar className="h-6 w-6" />,
      iconBg: "bg-[#ffeef1]",
      iconColor: "text-[#e11d48]",
      actionColor: "text-[#e11d48]",
    },
    {
      id: "camps",
      title: "Camps",
      description: "Health camps and volunteer outreach",
      actionText: "Explore Camps",
      href: "/camps",
      icon: <Tent className="h-6 w-6" />,
      iconBg: "bg-[#e6f7f2]",
      iconColor: "text-[#047857]",
      actionColor: "text-[#047857]",
    },
    {
      id: "research",
      title: "Research",
      description: "Collaborate and publish studies",
      actionText: "Explore Research",
      href: "/research",
      icon: <FlaskConical className="h-6 w-6" />,
      iconBg: "bg-[#f3effe]",
      iconColor: "text-[#7c3aed]",
      actionColor: "text-[#7c3aed]",
    },
    {
      id: "marketplace",
      title: "Marketplace",
      description: "Medical products and services",
      actionText: "Visit Marketplace",
      href: "/marketplace",
      icon: <ShoppingBag className="h-6 w-6" />,
      iconBg: "bg-[#e6f4fe]",
      iconColor: "text-[#0284c7]",
      actionColor: "text-[#0284c7]",
    },
    {
      id: "meetings",
      title: "Calendar & Schedule",
      description: "Schedule, webinars and appointments",
      actionText: "View Calendar",
      href: "/calendar",
      icon: <Video className="h-6 w-6" />,
      iconBg: "bg-[#e8f1fd]",
      iconColor: "text-[#2563eb]",
      actionColor: "text-[#2563eb]",
    },
    {
      id: "communities",
      title: "Communities",
      description: "Join groups and discussions",
      actionText: "Explore",
      href: "/network/communities",
      icon: <MessageSquare className="h-6 w-6" />,
      iconBg: "bg-[#fceefc]",
      iconColor: "text-[#c026d3]",
      actionColor: "text-[#c026d3]",
    },
    {
      id: "ai-assistant",
      title: "AI Assistant",
      description: "Get instant professional support",
      actionText: "Ask Now",
      href: "#ai-assistant-section",
      icon: <Sparkles className="h-6 w-6" />,
      iconBg: "bg-[#f3effe]",
      iconColor: "text-[#7c3aed]",
      actionColor: "text-[#7c3aed]",
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
    <div className="relative rounded-3xl border border-[#e8ecf2] bg-white p-5 sm:p-7 shadow-xs overflow-hidden">
      {/* Decorative background plus graphic */}
      <div className="pointer-events-none absolute right-24 top-2 select-none opacity-40">
        <svg width="120" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M30 15h15v-15h15v15h15v15h-15v15h-15v-15h-15z"
            fill="#e0f2fe"
            fillOpacity="0.6"
          />
          <path
            d="M75 40h15v-15h15v15h15v15h-15v15h-15v-15h-15z"
            fill="#dbeafe"
            fillOpacity="0.5"
          />
        </svg>
      </div>

      {/* 1. SECTION HEADER */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          {/* Blue accent indicator bar */}
          <div className="h-1 w-8 rounded-full bg-[#1b64da] mb-2.5" />
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-[#0f172a]">
            Quick <span className="text-[#1b64da]">Links</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#64748b] mt-0.5">
            Explore opportunities, learning, and more
          </p>
        </div>

        {/* Right Tagline & View All button */}
        <div className="flex items-center gap-3 sm:gap-4 self-start sm:self-center">
          <span className="hidden md:inline-block text-[10px] sm:text-[11px] font-bold tracking-widest text-[#94a3b8] uppercase">
            For a Healthier Tomorrow
          </span>
          <span className="hidden md:inline-block h-4 w-px bg-[#e2e8f0]" />
          <button
            type="button"
            onClick={() => router.push("/network")}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#1b64da] px-4 py-1.5 text-xs font-bold text-[#1b64da] transition hover:bg-[#1b64da] hover:text-white active:scale-95 shadow-2xs"
          >
            <span>View All</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* 2. 10 CARDS GRID (2 Columns on Mobile, 5 Columns on Desktop) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-4">
        {cards.map((card) => (
          <div
            key={card.id}
            onClick={() => handleClick(card.href)}
            className="group relative flex flex-col justify-between rounded-2xl border border-[#e8ecf2] bg-white p-3.5 sm:p-5 transition-all duration-200 hover:-translate-y-1 hover:border-[#cbd5e1] hover:shadow-md cursor-pointer"
          >
            {/* Top Icon */}
            <div>
              <div
                className={`flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl transition-transform duration-200 group-hover:scale-105 [&>svg]:h-5 [&>svg]:w-5 sm:[&>svg]:h-6 sm:[&>svg]:w-6 ${card.iconBg} ${card.iconColor}`}
              >
                {card.icon}
              </div>

              {/* Title & Description */}
              <h3 className="mt-2.5 sm:mt-3.5 text-xs sm:text-base font-bold text-[#0f172a] tracking-tight group-hover:text-[#1b64da] transition-colors">
                {card.title}
              </h3>
              <p className="mt-0.5 sm:mt-1 text-[11px] sm:text-xs text-[#64748b] leading-tight sm:leading-relaxed line-clamp-2">
                {card.description}
              </p>
            </div>

            {/* Bottom Action Row */}
            <div className="mt-3 sm:mt-4 flex items-center justify-between pt-1.5 sm:pt-2 border-t border-slate-50">
              <span className={`text-[11px] sm:text-xs font-bold ${card.actionColor}`}>
                {card.actionText}
              </span>
              <div className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full border border-[#e2e8f0] bg-white text-[#64748b] transition-all group-hover:border-[#1b64da] group-hover:bg-[#1b64da] group-hover:text-white shadow-2xs">
                <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

