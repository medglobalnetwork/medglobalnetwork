"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Brain,
  Compass,
  FileText,
  GraduationCap,
  Layers,
  Sparkles,
  Target,
  Calendar,
  FolderHeart,
  LayoutDashboard,
  CheckCircle2,
} from "lucide-react";

export type StudentNavTab =
  | "dashboard"
  | "explore"
  | "my-learning"
  | "practice"
  | "resources"
  | "ask-ai";

interface StudentNavHeaderProps {
  activeTab?: StudentNavTab;
}

export function StudentNavHeader({ activeTab }: StudentNavHeaderProps) {
  const pathname = usePathname();

  const determineActiveTab = (): StudentNavTab => {
    if (activeTab) return activeTab;
    if (pathname === "/learn") return "dashboard";
    if (pathname.startsWith("/learn/explore") || pathname.startsWith("/learn/courses") || pathname.startsWith("/learn/course/")) return "explore";
    if (pathname.startsWith("/learn/my-learning") || pathname.startsWith("/learn/lesson/")) return "my-learning";
    if (pathname.startsWith("/learn/practice") || pathname.startsWith("/learn/question-banks")) return "practice";
    if (
      pathname.startsWith("/learn/resources") ||
      pathname.startsWith("/learn/books") ||
      pathname.startsWith("/learn/mind-maps") ||
      pathname.startsWith("/learn/notes")
    )
      return "resources";
    if (pathname.startsWith("/learn/ask-ai")) return "ask-ai";
    return "dashboard";
  };

  const currentTab = determineActiveTab();

  const navItems = [
    {
      id: "dashboard" as StudentNavTab,
      label: "Dashboard",
      href: "/learn",
      icon: LayoutDashboard,
    },
    {
      id: "explore" as StudentNavTab,
      label: "Explore",
      href: "/learn/explore",
      icon: Compass,
    },
    {
      id: "my-learning" as StudentNavTab,
      label: "My Learning",
      href: "/learn/my-learning",
      icon: GraduationCap,
    },
    {
      id: "practice" as StudentNavTab,
      label: "Practice",
      href: "/learn/practice",
      icon: Target,
    },
    {
      id: "resources" as StudentNavTab,
      label: "Resources",
      href: "/learn/resources",
      icon: BookOpen,
    },
    {
      id: "ask-ai" as StudentNavTab,
      label: "Ask AI",
      href: "/learn/ask-ai",
      icon: Sparkles,
      highlight: true,
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#161b22]/95 backdrop-blur-md border-b border-[#e8e6e3] dark:border-[#30363d] shadow-2xs">
      {/* ───────────────────────────────────────────── */}
      {/* TOP BAR: BRAND + GLOBAL ECOSYSTEM SWITCHER */}
      {/* ───────────────────────────────────────────── */}
      <div className="border-b border-[#f0efee] dark:border-[#21262d] px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Link
              href="/learn"
              className="flex items-center gap-2 group font-bold text-xs uppercase tracking-wider text-[#0f4c81] dark:text-[#58a6ff]"
            >
              <div className="size-6 rounded-lg bg-[#0f4c81] dark:bg-[#58a6ff] text-white flex items-center justify-center group-hover:scale-105 transition shadow-xs">
                <GraduationCap className="size-3.5" />
              </div>
              <span className="font-extrabold text-[#171717] dark:text-[#f0f6fc]">
                MGN <span className="text-[#0f4c81] dark:text-[#58a6ff]">Learn</span>
              </span>
            </Link>
          </div>

          {/* Quick Global Ecosystem Switcher */}
          <div className="flex items-center gap-1 sm:gap-2 text-[11px] text-[#77716b] dark:text-[#8b949e]">
            <span className="hidden md:inline font-semibold">Return to:</span>
            <Link
              href="/home"
              className="hover:text-[#0f4c81] dark:hover:text-[#58a6ff] px-2 py-0.5 rounded-md hover:bg-[#f5f4f2] dark:hover:bg-[#21262d] font-medium transition"
            >
              Home
            </Link>
            <span>•</span>
            <Link
              href="/network"
              className="hover:text-[#0f4c81] dark:hover:text-[#58a6ff] px-2 py-0.5 rounded-md hover:bg-[#f5f4f2] dark:hover:bg-[#21262d] font-medium transition"
            >
              Network
            </Link>
            <span>•</span>
            <Link
              href="/opportunities"
              className="hover:text-[#0f4c81] dark:hover:text-[#58a6ff] px-2 py-0.5 rounded-md hover:bg-[#f5f4f2] dark:hover:bg-[#21262d] font-medium transition"
            >
              Opportunities
            </Link>
            <span>•</span>
            <Link
              href="/marketplace"
              className="hover:text-[#0f4c81] dark:hover:text-[#58a6ff] px-2 py-0.5 rounded-md hover:bg-[#f5f4f2] dark:hover:bg-[#21262d] font-medium transition"
            >
              Marketplace
            </Link>

            <div className="hidden lg:flex items-center gap-1.5 ml-3 pl-3 border-l border-[#e8e6e3] dark:border-[#30363d]">
              <Link
                href="/learn/my-box"
                className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/50 text-[#0f4c81] dark:text-[#58a6ff] font-bold text-[11px] hover:bg-blue-100 transition"
              >
                <FolderHeart className="size-3" />
                <span>My Box</span>
              </Link>
              <Link
                href="/learn/calendar"
                className="flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-[#f5f4f2] dark:hover:bg-[#21262d] text-[#5d5854] dark:text-[#8b949e] font-semibold text-[11px] transition"
              >
                <Calendar className="size-3" />
                <span>Calendar</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────── */}
      {/* 6-TAB MAIN STUDENT NAVIGATION */}
      {/* ───────────────────────────────────────────── */}
      <div className="px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto no-scrollbar">
          <nav className="flex items-center space-x-1 sm:space-x-2 py-1">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              const Icon = item.icon;

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? "bg-[#0f4c81] text-white shadow-xs dark:bg-[#58a6ff] dark:text-[#0d1117]"
                      : item.highlight
                      ? "text-[#0f4c81] dark:text-[#58a6ff] bg-blue-50/70 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60"
                      : "text-[#5d5854] dark:text-[#8b949e] hover:text-[#171717] dark:hover:text-[#f0f6fc] hover:bg-[#f5f4f2] dark:hover:bg-[#21262d]"
                  }`}
                >
                  <Icon
                    className={`size-4 ${
                      item.highlight && !isActive
                        ? "text-amber-500 fill-amber-500/20"
                        : ""
                    }`}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="hidden sm:flex items-center gap-2 shrink-0 pl-4">
            <Link
              href="/learn/instructor"
              className="text-[11px] font-semibold text-[#77716b] dark:text-[#8b949e] hover:text-[#0f4c81] dark:hover:text-[#58a6ff] hover:underline"
            >
              Instructor Studio →
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
