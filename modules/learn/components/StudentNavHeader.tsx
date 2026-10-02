"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Brain,
  FileText,
  Globe,
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

  const [mobileMoreOpen, setMobileMoreOpen] = React.useState(false);

  return (
    <>
      <header className="sticky top-14 sm:top-16 z-20 bg-white/95 dark:bg-[#161b22]/95 backdrop-blur-md border-b border-[#e8e6e3] dark:border-[#30363d] shadow-2xs">
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

      {/* ───────────────────────────────────────────── */}
      {/* MOBILE BOTTOM NAVIGATION BAR */}
      {/* ───────────────────────────────────────────── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-[#161b22]/95 backdrop-blur-lg border-t border-[#e8e6e3] dark:border-[#30363d] px-2 py-1 shadow-lg">
        <div className="grid grid-cols-5 gap-1 items-center text-center">
          <Link
            href="/learn"
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition ${
              currentTab === "dashboard"
                ? "text-[#0f4c81] dark:text-[#58a6ff] font-bold"
                : "text-[#77716b] dark:text-[#8b949e]"
            }`}
          >
            <LayoutDashboard className="size-5" />
            <span className="text-[10px] mt-0.5">Dashboard</span>
          </Link>

          <Link
            href="/learn/explore"
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition ${
              currentTab === "explore"
                ? "text-[#0f4c81] dark:text-[#58a6ff] font-bold"
                : "text-[#77716b] dark:text-[#8b949e]"
            }`}
          >
            <Globe className="size-5" />
            <span className="text-[10px] mt-0.5">Explore</span>
          </Link>

          <Link
            href="/learn/my-learning"
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition ${
              currentTab === "my-learning"
                ? "text-[#0f4c81] dark:text-[#58a6ff] font-bold"
                : "text-[#77716b] dark:text-[#8b949e]"
            }`}
          >
            <GraduationCap className="size-5" />
            <span className="text-[10px] mt-0.5">My Learning</span>
          </Link>

          <Link
            href="/learn/practice"
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition ${
              currentTab === "practice"
                ? "text-[#0f4c81] dark:text-[#58a6ff] font-bold"
                : "text-[#77716b] dark:text-[#8b949e]"
            }`}
          >
            <Target className="size-5" />
            <span className="text-[10px] mt-0.5">Practice</span>
          </Link>

          <button
            type="button"
            onClick={() => setMobileMoreOpen(true)}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition cursor-pointer ${
              mobileMoreOpen || currentTab === "resources" || currentTab === "ask-ai"
                ? "text-[#0f4c81] dark:text-[#58a6ff] font-bold"
                : "text-[#77716b] dark:text-[#8b949e]"
            }`}
          >
            <Layers className="size-5" />
            <span className="text-[10px] mt-0.5">More</span>
          </button>
        </div>
      </div>

      {/* ───────────────────────────────────────────── */}
      {/* MOBILE MORE MENU DRAWER */}
      {/* ───────────────────────────────────────────── */}
      {mobileMoreOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#161b22] border-t border-[#e8e6e3] dark:border-[#30363d] rounded-t-3xl p-6 space-y-5 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#f0efee] dark:border-[#21262d] pb-3">
              <h3 className="text-sm font-extrabold text-[#171717] dark:text-[#f0f6fc]">
                Learning Workspace Modules
              </h3>
              <button
                type="button"
                onClick={() => setMobileMoreOpen(false)}
                className="p-1 rounded-lg text-[#77716b] hover:bg-[#f0efee] dark:hover:bg-[#21262d] text-xs font-bold"
              >
                Close ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/learn/resources"
                onClick={() => setMobileMoreOpen(false)}
                className="flex items-center gap-3 p-3 rounded-2xl bg-[#faf9f8] dark:bg-[#21262d] hover:bg-blue-50 dark:hover:bg-blue-950/40 transition text-left"
              >
                <div className="size-9 rounded-xl bg-blue-50 dark:bg-blue-950 text-[#0f4c81] dark:text-[#58a6ff] flex items-center justify-center shrink-0">
                  <BookOpen className="size-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#171717] dark:text-[#f0f6fc]">Resources</p>
                  <p className="text-[10px] text-[#77716b]">All Study Assets</p>
                </div>
              </Link>

              <Link
                href="/learn/books"
                onClick={() => setMobileMoreOpen(false)}
                className="flex items-center gap-3 p-3 rounded-2xl bg-[#faf9f8] dark:bg-[#21262d] hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition text-left"
              >
                <div className="size-9 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <BookOpen className="size-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#171717] dark:text-[#f0f6fc]">Medical Books</p>
                  <p className="text-[10px] text-[#77716b]">eReader & Atlases</p>
                </div>
              </Link>

              <Link
                href="/learn/mind-maps"
                onClick={() => setMobileMoreOpen(false)}
                className="flex items-center gap-3 p-3 rounded-2xl bg-[#faf9f8] dark:bg-[#21262d] hover:bg-purple-50 dark:hover:bg-purple-950/40 transition text-left"
              >
                <div className="size-9 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                  <Brain className="size-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#171717] dark:text-[#f0f6fc]">Mind Maps</p>
                  <p className="text-[10px] text-[#77716b]">Interactive Trees</p>
                </div>
              </Link>

              <Link
                href="/learn/notes"
                onClick={() => setMobileMoreOpen(false)}
                className="flex items-center gap-3 p-3 rounded-2xl bg-[#faf9f8] dark:bg-[#21262d] hover:bg-rose-50 dark:hover:bg-rose-950/40 transition text-left"
              >
                <div className="size-9 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                  <FileText className="size-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#171717] dark:text-[#f0f6fc]">Notes & Shared</p>
                  <p className="text-[10px] text-[#77716b]">Peer Study Feed</p>
                </div>
              </Link>

              <Link
                href="/learn/question-banks"
                onClick={() => setMobileMoreOpen(false)}
                className="flex items-center gap-3 p-3 rounded-2xl bg-[#faf9f8] dark:bg-[#21262d] hover:bg-amber-50 dark:hover:bg-amber-950/40 transition text-left"
              >
                <div className="size-9 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <Layers className="size-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#171717] dark:text-[#f0f6fc]">Question Banks</p>
                  <p className="text-[10px] text-[#77716b]">Test Generator</p>
                </div>
              </Link>

              <Link
                href="/learn/my-box"
                onClick={() => setMobileMoreOpen(false)}
                className="flex items-center gap-3 p-3 rounded-2xl bg-[#faf9f8] dark:bg-[#21262d] hover:bg-blue-50 dark:hover:bg-blue-950/40 transition text-left"
              >
                <div className="size-9 rounded-xl bg-blue-50 dark:bg-blue-950 text-[#0f4c81] dark:text-[#58a6ff] flex items-center justify-center shrink-0">
                  <FolderHeart className="size-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#171717] dark:text-[#f0f6fc]">My Box</p>
                  <p className="text-[10px] text-[#77716b]">Certificates & Saved</p>
                </div>
              </Link>

              <Link
                href="/learn/calendar"
                onClick={() => setMobileMoreOpen(false)}
                className="flex items-center gap-3 p-3 rounded-2xl bg-[#faf9f8] dark:bg-[#21262d] hover:bg-blue-50 dark:hover:bg-blue-950/40 transition text-left"
              >
                <div className="size-9 rounded-xl bg-[#f0efee] dark:bg-[#30363d] text-[#171717] dark:text-[#f0f6fc] flex items-center justify-center shrink-0">
                  <Calendar className="size-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#171717] dark:text-[#f0f6fc]">Calendar</p>
                  <p className="text-[10px] text-[#77716b]">Classes & Deadlines</p>
                </div>
              </Link>

              <Link
                href="/learn/ask-ai"
                onClick={() => setMobileMoreOpen(false)}
                className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-tr from-[#0f4c81]/10 to-[#1769c2]/10 dark:from-[#0f4c81]/30 dark:to-[#1769c2]/30 border border-[#0f4c81]/20 transition text-left"
              >
                <div className="size-9 rounded-xl bg-[#0f4c81] text-white flex items-center justify-center shrink-0">
                  <Sparkles className="size-4 text-amber-300" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#0f4c81] dark:text-[#58a6ff]">Ask AI</p>
                  <p className="text-[10px] text-[#77716b]">Study Companion</p>
                </div>
              </Link>
            </div>

            <div className="pt-2 border-t border-[#f0efee] dark:border-[#21262d] flex items-center justify-between text-xs">
              <Link
                href="/learn/instructor"
                onClick={() => setMobileMoreOpen(false)}
                className="font-bold text-[#0f4c81] dark:text-[#58a6ff] hover:underline"
              >
                Instructor Studio →
              </Link>
              <Link
                href="/settings"
                onClick={() => setMobileMoreOpen(false)}
                className="text-[#77716b] hover:text-[#171717]"
              >
                Settings
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
