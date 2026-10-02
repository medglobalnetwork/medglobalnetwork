"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { useScrollDirection } from "@/lib/useScrollDirection";
import { Sparkles } from "lucide-react";

type NavTab = "home" | "network" | "learn" | "opportunities" | "marketplace";

interface NavItemConfig {
  id: NavTab;
  label: string;
  icon8Id: string;
}

const navItems: NavItemConfig[] = [
  { id: "home",          label: "Home",          icon8Id: "i6fZC6wuprSu" },
  { id: "network",       label: "Network",       icon8Id: "YzsadpdsoN8e" },
  { id: "learn",         label: "Learn",         icon8Id: "AvANlXOxUB6Z" },
  { id: "opportunities", label: "Jobs",          icon8Id: "IOkzpfWnUztj" },
  { id: "marketplace",   label: "Market",        icon8Id: "VksxHreSn4ck" },
];

/* ── Dedicated 4-Tab Learn Navigation ── */
interface LearnNavItem {
  id: "dashboard" | "explore" | "mybox" | "askai";
  label: string;
  href?: string;
  icon8Id?: string;
}

const learnNavItems: LearnNavItem[] = [
  { id: "dashboard", label: "Dashboard", href: "/learn",         icon8Id: "i6fZC6wuprSu" },
  { id: "explore",   label: "Explore",   href: "/learn/explore", icon8Id: "AvANlXOxUB6Z" },
  { id: "mybox",     label: "My Box",    href: "/learn/my-box",  icon8Id: "FnCSMZbfR6RU" },
  { id: "askai",     label: "Ask AI" },
];

/* ── Fallback Icons (filled = active, outline = inactive) ── */
function BoxFallback({ active }: { active: boolean }) {
  return active ? (
    <svg viewBox="0 0 24 24" className="size-6" fill="currentColor" stroke="none" aria-hidden="true">
      <path d="M21 16.5l-9 5.2-9-5.2V7.5L12 2.3l9 5.2v9zM12 4.1L5.5 7.8 12 11.5l6.5-3.7L12 4.1zM4.5 9.2v6.2l6.5 3.7V13L4.5 9.2zm15 0L13 13v6.1l6.5-3.7V9.2z" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}

function HomeFallback({ active }: { active: boolean }) {
  return active ? (
    <svg viewBox="0 0 24 24" className="size-6" fill="currentColor" stroke="none" aria-hidden="true">
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function NetworkFallback({ active }: { active: boolean }) {
  return active ? (
    <svg viewBox="0 0 24 24" className="size-6" fill="currentColor" stroke="none" aria-hidden="true">
      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function LearnFallback({ active }: { active: boolean }) {
  return active ? (
    <svg viewBox="0 0 24 24" className="size-6" fill="currentColor" stroke="none" aria-hidden="true">
      <path d="M12 3L1 9l4 2.18V16c0 1.1.9 2 2 2h10a2 2 0 0 0 2-2v-4.82L21 9l-9-6zm6 13H6v-3.27l6 3.27 6-3.27V16zm0-6.43L12 9.75 6 6.57l6-3.18 6 3.18v.02z" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" />
    </svg>
  );
}

function OpportunitiesFallback({ active }: { active: boolean }) {
  return active ? (
    <svg viewBox="0 0 24 24" className="size-6" fill="currentColor" stroke="none" aria-hidden="true">
      <path d="M20 6h-2.18A3 3 0 0 0 15 4H9a3 3 0 0 0-2.82 2H4a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2zm-5 0H9a1 1 0 0 1 0-2h6a1 1 0 0 1 0 2z" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      <line x1="12" y1="12" x2="12" y2="16" /><line x1="10" y1="14" x2="14" y2="14" />
    </svg>
  );
}

function MarketplaceFallback({ active }: { active: boolean }) {
  return active ? (
    <svg viewBox="0 0 24 24" className="size-6" fill="currentColor" stroke="none" aria-hidden="true">
      <path d="M19 6h-2c0-2.76-2.24-5-5-5S7 3.24 7 6H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-3c1.66 0 3 1.34 3 3H9c0-1.66 1.34-3 3-3zm7 17H5V8h14v12z" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

const fallbackMap: Record<NavTab, React.ComponentType<{ active: boolean }>> = {
  home: HomeFallback,
  network: NetworkFallback,
  learn: LearnFallback,
  opportunities: OpportunitiesFallback,
  marketplace: MarketplaceFallback,
};

function Icons8BottomNavIcon({
  iconId,
  active,
  fallback: FallbackComponent,
  className = "size-6",
}: {
  iconId?: string;
  active: boolean;
  fallback: React.ComponentType<{ active: boolean }>;
  className?: string;
}) {
  const [imgError, setImgError] = React.useState(false);

  if (!iconId || imgError) {
    return <FallbackComponent active={active} />;
  }

  const colorHex = active ? "0F4C81" : "77716B";
  const url = `https://img.icons8.com/?id=${iconId}&format=png&size=48&color=${colorHex}`;

  return (
    <img
      src={url}
      alt=""
      className={`${className} object-contain transition-transform duration-200 ${
        active ? "scale-105" : ""
      } select-none dark:brightness-125`}
      onError={() => setImgError(true)}
      loading="eager"
    />
  );
}

export default function AppBottomNav({ onOpenAskAI }: { onOpenAskAI?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const hidden = useScrollDirection();

  const isLearnWorkspace = pathname?.startsWith("/learn");
  const isStudyMode = pathname?.startsWith("/learn/lesson/");

  // Hide bottom nav in distraction-free study mode
  if (isStudyMode) return null;

  const handleOpenAi = () => {
    if (onOpenAskAI) {
      onOpenAskAI();
    } else if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("open-mgn-ask-ai"));
    }
  };

  const [isMoreOpen, setIsMoreOpen] = React.useState(false);

  if (isLearnWorkspace) {
    // 5-tab Learn Navigation: Dashboard | Explore | My Learning | Practice | More
    const isDashboard = pathname === "/learn" || pathname === "/learn/";
    const isExplore = pathname === "/learn/explore" || pathname.startsWith("/learn/courses");
    const isMyLearning = pathname.startsWith("/learn/my-learning");
    const isPractice = pathname.startsWith("/learn/practice");
    const isMoreActive =
      pathname.startsWith("/learn/resources") ||
      pathname.startsWith("/learn/books") ||
      pathname.startsWith("/learn/mind-maps") ||
      pathname.startsWith("/learn/notes") ||
      pathname.startsWith("/learn/question-banks") ||
      pathname.startsWith("/learn/my-box") ||
      pathname.startsWith("/learn/calendar");

    return (
      <>
        {/* More Bottom Sheet Modal */}
        {isMoreOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end animate-in fade-in duration-200"
            onClick={() => setIsMoreOpen(false)}
          >
            <div
              className="bg-white dark:bg-[#161b22] border-t border-[#e8e6e3] dark:border-[#30363d] rounded-t-3xl p-5 shadow-2xl max-w-lg mx-auto w-full animate-in slide-in-from-bottom duration-250"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#f0efee] dark:border-[#21262d] mb-4">
                <div className="flex items-center gap-2">
                  <div className="size-2 rounded-full bg-[#0f4c81] dark:bg-[#58a6ff]" />
                  <h3 className="text-sm font-bold text-[#171717] dark:text-[#f0f6fc]">
                    Student Learning Hub
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMoreOpen(false)}
                  className="p-1 rounded-full text-[#77716b] hover:bg-[#f5f4f2] dark:hover:bg-[#21262d]"
                >
                  <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                </button>
              </div>

              <div className="grid grid-cols-4 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsMoreOpen(false);
                    router.push("/learn/resources");
                  }}
                  className="flex flex-col items-center gap-1.5 p-2.5 rounded-2xl hover:bg-[#f5f4f2] dark:hover:bg-[#21262d] text-center transition"
                >
                  <div className="size-11 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-[#0f4c81] dark:text-[#58a6ff] flex items-center justify-center font-bold text-lg">
                    📚
                  </div>
                  <span className="text-[11px] font-semibold text-[#171717] dark:text-[#f0f6fc]">Resources</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsMoreOpen(false);
                    router.push("/learn/books");
                  }}
                  className="flex flex-col items-center gap-1.5 p-2.5 rounded-2xl hover:bg-[#f5f4f2] dark:hover:bg-[#21262d] text-center transition"
                >
                  <div className="size-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-lg">
                    📖
                  </div>
                  <span className="text-[11px] font-semibold text-[#171717] dark:text-[#f0f6fc]">Books</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsMoreOpen(false);
                    router.push("/learn/mind-maps");
                  }}
                  className="flex flex-col items-center gap-1.5 p-2.5 rounded-2xl hover:bg-[#f5f4f2] dark:hover:bg-[#21262d] text-center transition"
                >
                  <div className="size-11 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-lg">
                    🧠
                  </div>
                  <span className="text-[11px] font-semibold text-[#171717] dark:text-[#f0f6fc]">Mind Maps</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsMoreOpen(false);
                    router.push("/learn/notes");
                  }}
                  className="flex flex-col items-center gap-1.5 p-2.5 rounded-2xl hover:bg-[#f5f4f2] dark:hover:bg-[#21262d] text-center transition"
                >
                  <div className="size-11 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-lg">
                    📝
                  </div>
                  <span className="text-[11px] font-semibold text-[#171717] dark:text-[#f0f6fc]">Notes</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsMoreOpen(false);
                    router.push("/learn/question-banks");
                  }}
                  className="flex flex-col items-center gap-1.5 p-2.5 rounded-2xl hover:bg-[#f5f4f2] dark:hover:bg-[#21262d] text-center transition"
                >
                  <div className="size-11 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-lg">
                    🗂️
                  </div>
                  <span className="text-[11px] font-semibold text-[#171717] dark:text-[#f0f6fc]">Q-Banks</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsMoreOpen(false);
                    router.push("/learn/my-box");
                  }}
                  className="flex flex-col items-center gap-1.5 p-2.5 rounded-2xl hover:bg-[#f5f4f2] dark:hover:bg-[#21262d] text-center transition"
                >
                  <div className="size-11 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-lg">
                    📦
                  </div>
                  <span className="text-[11px] font-semibold text-[#171717] dark:text-[#f0f6fc]">My Box</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsMoreOpen(false);
                    router.push("/learn/calendar");
                  }}
                  className="flex flex-col items-center gap-1.5 p-2.5 rounded-2xl hover:bg-[#f5f4f2] dark:hover:bg-[#21262d] text-center transition"
                >
                  <div className="size-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-lg">
                    📅
                  </div>
                  <span className="text-[11px] font-semibold text-[#171717] dark:text-[#f0f6fc]">Calendar</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsMoreOpen(false);
                    handleOpenAi();
                  }}
                  className="flex flex-col items-center gap-1.5 p-2.5 rounded-2xl hover:bg-[#f5f4f2] dark:hover:bg-[#21262d] text-center transition"
                >
                  <div className="size-11 rounded-xl bg-gradient-to-tr from-[#0f4c81] to-[#1769c2] text-white flex items-center justify-center shadow-xs">
                    <Sparkles className="size-5 text-amber-300" />
                  </div>
                  <span className="text-[11px] font-bold text-[#0f4c81] dark:text-[#58a6ff]">Ask AI</span>
                </button>
              </div>
            </div>
          </div>
        )}

        <nav
          aria-label="Learn Navigation"
          className={`fixed bottom-0 left-0 right-0 z-50 flex md:hidden w-full items-center justify-around border-t border-[#e8e6e3] dark:border-[#30363d] bg-white/95 dark:bg-[#161b22]/95 backdrop-blur-md px-1 pt-1.5 shadow-[0_-2px_12px_rgba(0,0,0,0.06)] dark:shadow-[0_-2px_12px_rgba(0,0,0,0.4)] transition-transform duration-300 ease-in-out ${
            hidden ? "translate-y-full pointer-events-none" : "translate-y-0"
          }`}
          style={{
            paddingBottom: "max(0.4rem, env(safe-area-inset-bottom, 0px))",
          }}
        >
          <div className="flex w-full items-center justify-around max-w-lg mx-auto">
            {/* 1. Dashboard */}
            <button
              type="button"
              aria-label="Dashboard"
              onClick={() => router.push("/learn")}
              className={`flex flex-1 flex-col items-center justify-center py-1 transition-colors relative cursor-pointer ${
                isDashboard ? "text-[#0f4c81] dark:text-[#58a6ff]" : "text-[#77716b] dark:text-[#8b949e]"
              }`}
            >
              <div className="relative flex items-center justify-center">
                <Icons8BottomNavIcon iconId="i6fZC6wuprSu" active={isDashboard} fallback={HomeFallback} className="size-6" />
                {isDashboard && <span className="absolute -bottom-1 size-1 rounded-full bg-[#16804d] dark:bg-[#2ea043]" />}
              </div>
              <span className="mt-1 text-[10px] font-semibold leading-tight">Dashboard</span>
            </button>

            {/* 2. Explore */}
            <button
              type="button"
              aria-label="Explore"
              onClick={() => router.push("/learn/explore")}
              className={`flex flex-1 flex-col items-center justify-center py-1 transition-colors relative cursor-pointer ${
                isExplore ? "text-[#0f4c81] dark:text-[#58a6ff]" : "text-[#77716b] dark:text-[#8b949e]"
              }`}
            >
              <div className="relative flex items-center justify-center">
                <Icons8BottomNavIcon iconId="AvANlXOxUB6Z" active={isExplore} fallback={LearnFallback} className="size-6" />
                {isExplore && <span className="absolute -bottom-1 size-1 rounded-full bg-[#16804d] dark:bg-[#2ea043]" />}
              </div>
              <span className="mt-1 text-[10px] font-semibold leading-tight">Explore</span>
            </button>

            {/* 3. My Learning */}
            <button
              type="button"
              aria-label="My Learning"
              onClick={() => router.push("/learn/my-learning")}
              className={`flex flex-1 flex-col items-center justify-center py-1 transition-colors relative cursor-pointer ${
                isMyLearning ? "text-[#0f4c81] dark:text-[#58a6ff]" : "text-[#77716b] dark:text-[#8b949e]"
              }`}
            >
              <div className="relative flex items-center justify-center">
                <Icons8BottomNavIcon iconId="AvANlXOxUB6Z" active={isMyLearning} fallback={LearnFallback} className="size-6" />
                {isMyLearning && <span className="absolute -bottom-1 size-1 rounded-full bg-[#16804d] dark:bg-[#2ea043]" />}
              </div>
              <span className="mt-1 text-[10px] font-semibold leading-tight">My Learning</span>
            </button>

            {/* 4. Practice */}
            <button
              type="button"
              aria-label="Practice"
              onClick={() => router.push("/learn/practice")}
              className={`flex flex-1 flex-col items-center justify-center py-1 transition-colors relative cursor-pointer ${
                isPractice ? "text-[#0f4c81] dark:text-[#58a6ff]" : "text-[#77716b] dark:text-[#8b949e]"
              }`}
            >
              <div className="relative flex items-center justify-center">
                <Icons8BottomNavIcon iconId="YzsadpdsoN8e" active={isPractice} fallback={NetworkFallback} className="size-6" />
                {isPractice && <span className="absolute -bottom-1 size-1 rounded-full bg-[#16804d] dark:bg-[#2ea043]" />}
              </div>
              <span className="mt-1 text-[10px] font-semibold leading-tight">Practice</span>
            </button>

            {/* 5. More */}
            <button
              type="button"
              aria-label="More"
              onClick={() => setIsMoreOpen(true)}
              className={`flex flex-1 flex-col items-center justify-center py-1 transition-colors relative cursor-pointer ${
                isMoreActive ? "text-[#0f4c81] dark:text-[#58a6ff]" : "text-[#77716b] dark:text-[#8b949e]"
              }`}
            >
              <div className="relative flex items-center justify-center">
                <Icons8BottomNavIcon iconId="FnCSMZbfR6RU" active={isMoreActive} fallback={BoxFallback} className="size-6" />
                {isMoreActive && <span className="absolute -bottom-1 size-1 rounded-full bg-[#16804d] dark:bg-[#2ea043]" />}
              </div>
              <span className="mt-1 text-[10px] font-semibold leading-tight">More</span>
            </button>
          </div>
        </nav>
      </>
    );
  }


  // Standard 5-tab Ecosystem Navigation
  const activeTab: NavTab =
    navItems.find((n) => pathname.startsWith(`/${n.id}`))?.id ?? "home";

  return (
    <nav
      aria-label="Primary navigation"
      className={`fixed bottom-0 left-0 right-0 z-50 flex md:hidden w-full items-center justify-around border-t border-[#e8e6e3] dark:border-[#30363d] bg-white/95 dark:bg-[#161b22]/95 backdrop-blur-md px-1 pt-1.5 shadow-[0_-2px_12px_rgba(0,0,0,0.06)] dark:shadow-[0_-2px_12px_rgba(0,0,0,0.4)] transition-transform duration-300 ease-in-out ${
        hidden ? "translate-y-full pointer-events-none" : "translate-y-0"
      }`}
      style={{
        paddingBottom: "max(0.4rem, env(safe-area-inset-bottom, 0px))",
      }}
    >
      <div className="flex w-full items-center justify-around max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Fallback = fallbackMap[item.id];
          return (
            <button
              key={item.id}
              type="button"
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
              onClick={() => router.push(`/${item.id}`)}
              className={`flex flex-1 flex-col items-center justify-center py-1 transition-colors relative cursor-pointer ${
                isActive
                  ? "text-[#0f4c81] dark:text-[#58a6ff]"
                  : "text-[#77716b] dark:text-[#8b949e] hover:text-[#171717] dark:hover:text-[#f0f6fc] active:scale-95"
              }`}
            >
              <div className="relative flex items-center justify-center">
                <Icons8BottomNavIcon
                  iconId={item.icon8Id}
                  active={isActive}
                  fallback={Fallback}
                  className="size-6"
                />
                {isActive && (
                  <span className="absolute -bottom-1 size-1 rounded-full bg-[#16804d] dark:bg-[#2ea043]" />
                )}
              </div>
              <span
                className={`mt-1 text-[10px] font-semibold leading-tight ${
                  isActive ? "text-[#0f4c81] dark:text-[#58a6ff]" : "text-[#77716b] dark:text-[#8b949e]"
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
