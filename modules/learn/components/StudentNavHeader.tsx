"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Globe,
  GraduationCap,
  Sparkles,
  Target,
  Calendar,
  FolderHeart,
  LayoutDashboard,
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
      icon: Globe,
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
    <>
      <header className="relative bg-white dark:bg-[#161b22] border-b border-[#e8e6e3] dark:border-[#30363d]">
        {/* ───────────────────────────────────────────── */}
        {/* UNIFIED WORKSPACE BAR: TABS & QUICK TOOLS     */}
        {/* ───────────────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-3 sm:px-4">
          <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar py-1.5">
            {/* Left: 6-Tab Main Navigation */}
            <nav className="flex items-center space-x-1 sm:space-x-1.5 shrink-0">
              {navItems.map((item) => {
                const isActive = currentTab === item.id;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                      isActive
                        ? "bg-[#0f4c81] text-white shadow-xs dark:bg-[#58a6ff] dark:text-[#0d1117]"
                        : item.highlight
                        ? "text-[#0f4c81] dark:text-[#58a6ff] bg-blue-50/70 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60"
                        : "text-[#5d5854] dark:text-[#8b949e] hover:text-[#171717] dark:hover:text-[#f0f6fc] hover:bg-[#f5f4f2] dark:hover:bg-[#21262d]"
                    }`}
                  >
                    <Icon
                      className={`size-3.5 ${
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

            {/* Right: Quick Tools (My Box, Calendar, Instructor Studio) */}
            <div className="hidden sm:flex items-center gap-2 shrink-0 pl-2">
              <Link
                href="/learn/my-box"
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50/80 dark:bg-blue-950/50 text-[#0f4c81] dark:text-[#58a6ff] font-bold text-xs hover:bg-blue-100 transition"
              >
                <FolderHeart className="size-3.5" />
                <span>My Box</span>
              </Link>
              <Link
                href="/learn/calendar"
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-[#f5f4f2] dark:hover:bg-[#21262d] text-[#5d5854] dark:text-[#8b949e] font-semibold text-xs transition"
              >
                <Calendar className="size-3.5" />
                <span>Calendar</span>
              </Link>
              <div className="h-4 w-px bg-[#e8e6e3] dark:border-[#30363d] mx-1" />
              <Link
                href="/learn/instructor"
                className="text-xs font-semibold text-[#77716b] dark:text-[#8b949e] hover:text-[#0f4c81] dark:hover:text-[#58a6ff] hover:underline"
              >
                Instructor Studio →
              </Link>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
