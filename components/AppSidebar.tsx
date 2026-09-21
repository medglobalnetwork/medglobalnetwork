"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import BranchedMenu from "@/components/BranchedMenu";

type NavItem = "home" | "study" | "opportunities" | "marketplace";

const navItems: Array<{ id: NavItem; label: string }> = [
  { id: "home", label: "Home" },
  { id: "study", label: "Study" },
  { id: "opportunities", label: "Opportunities" },
  { id: "marketplace", label: "Marketplace" },
];

function NavIcon({ item }: { item: NavItem }) {
  const paths = {
    home: <><path d="m4 10 8-6 8 6" /><path d="M6 9v10h12V9" /><path d="M10 19v-6h4v6" /></>,
    study: <><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M8 8h8M8 12h8M8 16h5" /></>,
    opportunities: <><path d="M5 19 19 5" /><path d="M9 5h10v10" /></>,
    marketplace: <><path d="M4 9h16l-1-4H5L4 9Z" /><path d="M5 9v10h14V9M9 19v-6h6v6" /></>,
  };

  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[item]}
    </svg>
  );
}

export default function AppSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = authClient.useSession();

  const [isSidebarExpanded, setIsSidebarExpanded] = React.useState(false);
  const [isSidebarPinned, setIsSidebarPinned] = React.useState(false);
  const [isDarkMode, setIsDarkMode] = React.useState(false);

  // Determine active tab from pathname
  const activeTab: NavItem =
    navItems.find((item) => pathname.startsWith("/home") && item.id === "home")?.id ??
    (navItems.find((item) => pathname.includes(item.id))?.id ?? "home");

  const isExpanded = isSidebarExpanded || isSidebarPinned;

  return (
    <aside
      onMouseEnter={() => setIsSidebarExpanded(true)}
      onMouseLeave={() => { if (!isSidebarPinned) setIsSidebarExpanded(false); }}
      className={`fixed inset-y-0 left-0 z-30 hidden border-r transition-[width,background-color,border-color] duration-200 lg:flex ${
        isDarkMode ? "border-[#303030] bg-[#151515] text-white" : "border-[#e1e1df] bg-white"
      } ${isExpanded ? "w-[292px] shadow-[8px_0_24px_rgba(0,0,0,0.12)]" : "w-[54px]"}`}
    >
      {/* Narrow icon strip */}
      <div className={`flex w-[54px] shrink-0 flex-col items-center border-r py-4 ${isDarkMode ? "border-[#303030]" : "border-[#ededeb]"}`}>
        <img src="/logo.png" alt="MGN" className="h-7 w-7 object-contain" />

        <button
          type="button"
          aria-label={isSidebarPinned ? "Collapse sidebar" : "Expand sidebar"}
          onClick={() => { setIsSidebarPinned((p) => !p); setIsSidebarExpanded((e) => !e); }}
          className={`mt-3 flex h-6 w-6 items-center justify-center rounded-md text-xs ${isDarkMode ? "text-[#a6a6a6] hover:bg-[#292929]" : "text-[#81817f] hover:bg-[#f2f2f1]"}`}
        >
          {isExpanded ? "‹" : "›"}
        </button>

        <div className="mt-8 flex flex-col gap-2">
          {navItems.map((item) => {
            const targetRoute =
              item.id === "study"
                ? "/learn"
                : item.id === "opportunities"
                ? "/opportunities"
                : item.id === "marketplace"
                ? "/marketplace"
                : "/home";

            return (
              <button
                key={item.id}
                type="button"
                aria-label={item.label}
                onClick={() => router.push(targetRoute)}
                className={`flex h-8 w-8 items-center justify-center rounded-md transition ${
                  activeTab === item.id
                    ? isDarkMode ? "bg-[#303030] text-white" : "bg-[#f0f0ef] text-[#171717]"
                    : isDarkMode ? "text-[#999] hover:bg-[#292929]" : "text-[#81817f] hover:bg-[#f6f6f5]"
                }`}
              >
                <NavIcon item={item.id} />
              </button>
            );
          })}
        </div>

        <div className="mt-auto flex flex-col gap-3">
          <button
            type="button"
            aria-label={isDarkMode ? "Use light theme" : "Use dark theme"}
            onClick={() => setIsDarkMode((d) => !d)}
            className={`flex h-8 w-8 items-center justify-center rounded-md text-sm ${isDarkMode ? "text-[#d3d3d3] hover:bg-[#292929]" : "text-[#81817f] hover:bg-[#f6f6f5]"}`}
          >
            {isDarkMode ? "☼" : "☾"}
          </button>

          <button type="button" aria-label="Notifications" className={`flex h-8 w-8 items-center justify-center rounded-md ${isDarkMode ? "text-[#999] hover:bg-[#292929]" : "text-[#81817f] hover:bg-[#f6f6f5]"}`}>
            <span className="text-lg">♧</span>
          </button>

          <button type="button" aria-label="Activity log" className={`flex h-8 w-8 items-center justify-center rounded-md ${isDarkMode ? "text-[#999] hover:bg-[#292929]" : "text-[#81817f] hover:bg-[#f6f6f5]"}`}>
            <span className="text-lg">▤</span>
          </button>

          <a
            href="/settings"
            aria-label="Settings"
            className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold text-[#1769c2] ${
              isDarkMode ? "border-[#444] bg-[#292929]" : "border-[#d9d9d6] bg-[#f1f1ef]"
            } ${pathname.startsWith("/settings") ? "ring-2 ring-[#1769c2] ring-offset-1" : ""}`}
          >
            {session ? (session.user.name || session.user.email).slice(0, 1).toUpperCase() : "?"}
          </a>
        </div>
      </div>

      {/* Expanded panel */}
      <div className={`flex min-w-0 flex-1 flex-col overflow-hidden px-3 py-4 transition-opacity duration-150 ${isExpanded ? "opacity-100" : "pointer-events-none opacity-0"}`}>
        <div className="flex items-center gap-2 px-2">
          <img src="/logo.png" alt="MGN" className="h-7 w-auto object-contain" />
        </div>

        <div className="relative mt-5">
          <input aria-label="Quick search" placeholder="⌕  Quick Search" className={`h-9 w-full rounded-lg border px-3 text-[11px] outline-none focus:border-[#1769c2] ${isDarkMode ? "border-[#3b3b3b] bg-[#202020] text-white placeholder:text-[#858585]" : "border-[#e1e1df] bg-white"}`} />
          <span className="absolute right-2 top-2 text-[10px] text-[#999]">⌘ F</span>
        </div>

        <div className="mt-5">
          <BranchedMenu
            defaultOpen={[0]}
            defaultActive={activeTab}
            color={isDarkMode ? "#f5f5f5" : "#3f3f46"}
            accentColor={isDarkMode ? "#f5f5f5" : "#1769c2"}
            lineColor={isDarkMode ? "#3f3f46" : "#d4d4d8"}
            onSelect={(value: string) => {
              if (value === "home") router.push("/home");
              else if (value === "study") router.push("/learn");
              else if (value === "opportunities") router.push("/opportunities");
              else if (value === "marketplace") router.push("/marketplace");
              else if (value === "settings") router.push("/settings");
            }}
          />
        </div>

        <div className={`mt-auto border-t pt-4 ${isDarkMode ? "border-[#303030]" : "border-[#ededeb]"}`}>
          <button type="button" className={`flex w-full items-center gap-2 rounded-md px-2 py-[6px] text-left text-[11px] ${isDarkMode ? "text-[#c0c0c0] hover:bg-[#292929]" : "text-[#4f4f4c] hover:bg-[#f7f7f6]"}`}>♧ <span>Notifications</span></button>
          <button type="button" className={`flex w-full items-center gap-2 rounded-md px-2 py-[6px] text-left text-[11px] ${isDarkMode ? "text-[#c0c0c0] hover:bg-[#292929]" : "text-[#4f4f4c] hover:bg-[#f7f7f6]"}`}>▤ <span>Activity Log / Audit Log</span></button>
          <a href="/settings" className={`flex w-full items-center gap-2 rounded-md px-2 py-[6px] text-left text-[11px] ${isDarkMode ? "text-[#c0c0c0] hover:bg-[#292929]" : "text-[#4f4f4c] hover:bg-[#f7f7f6]"}`}>⚙️ <span>Settings</span></a>

          {session && (
            <a href="/settings" className={`mt-2 flex w-full items-center gap-2 rounded-md border p-2 text-left ${isDarkMode ? "border-[#3b3b3b] bg-[#202020]" : "border-[#ededeb] bg-[#fafaf9]"}`}>
              <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold text-[#1769c2] ${isDarkMode ? "bg-[#303030]" : "bg-[#f1f1ef]"}`}>
                {(session.user.name || session.user.email).slice(0, 1).toUpperCase()}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[10px] font-medium">{session.user.name || session.user.email}</span>
                <span className="block text-[9px] text-[#92928f]">Premium Member</span>
              </span>
              <span className="ml-auto text-[10px] text-[#92928f]">⌃</span>
            </a>
          )}
        </div>
      </div>
    </aside>
  );
}
