"use client";

import { usePathname, useRouter } from "next/navigation";
import { useScrollDirection } from "@/lib/useScrollDirection";

type NavTab = "home" | "network" | "learn" | "opportunities";

const navItems: Array<{ id: NavTab; label: string }> = [
  { id: "home",          label: "Home" },
  { id: "network",       label: "Network" },
  { id: "learn",         label: "Learn" },
  { id: "opportunities", label: "Opportunities" },
];

/* ── Icons (filled = active, outline = inactive) ── */
function HomeIcon({ active }: { active: boolean }) {
  return active ? (
    <svg viewBox="0 0 24 24" className="h-[21px] w-[21px] lg:h-[24px] lg:w-[24px]" fill="currentColor" stroke="none" aria-hidden="true">
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" className="h-[21px] w-[21px] lg:h-[24px] lg:w-[24px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function NetworkIcon({ active }: { active: boolean }) {
  return active ? (
    <svg viewBox="0 0 24 24" className="h-[21px] w-[21px] lg:h-[24px] lg:w-[24px]" fill="currentColor" stroke="none" aria-hidden="true">
      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" className="h-[21px] w-[21px] lg:h-[24px] lg:w-[24px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function LearnIcon({ active }: { active: boolean }) {
  return active ? (
    <svg viewBox="0 0 24 24" className="h-[21px] w-[21px] lg:h-[24px] lg:w-[24px]" fill="currentColor" stroke="none" aria-hidden="true">
      <path d="M12 3L1 9l4 2.18V16c0 1.1.9 2 2 2h10a2 2 0 0 0 2-2v-4.82L21 9l-9-6zm6 13H6v-3.27l6 3.27 6-3.27V16zm0-6.43L12 9.75 6 6.57l6-3.18 6 3.18v.02z" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" className="h-[21px] w-[21px] lg:h-[24px] lg:w-[24px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" />
    </svg>
  );
}

function OpportunitiesIcon({ active }: { active: boolean }) {
  return active ? (
    <svg viewBox="0 0 24 24" className="h-[21px] w-[21px] lg:h-[24px] lg:w-[24px]" fill="currentColor" stroke="none" aria-hidden="true">
      <path d="M20 6h-2.18A3 3 0 0 0 15 4H9a3 3 0 0 0-2.82 2H4a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2zm-5 0H9a1 1 0 0 1 0-2h6a1 1 0 0 1 0 2z" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" className="h-[21px] w-[21px] lg:h-[24px] lg:w-[24px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      <line x1="12" y1="12" x2="12" y2="16" /><line x1="10" y1="14" x2="14" y2="14" />
    </svg>
  );
}

function MarketplaceIcon({ active }: { active: boolean }) {
  return active ? (
    <svg viewBox="0 0 24 24" className="h-[21px] w-[21px] lg:h-[24px] lg:w-[24px]" fill="currentColor" stroke="none" aria-hidden="true">
      <path d="M19 6h-2a5 5 0 0 0-10 0H5a2 2 0 0 0-2 2l-1 12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2l-1-12a2 2 0 0 0-2-2zm-7-3a3 3 0 0 1 3 3H9a3 3 0 0 1 3-3zm0 10a3 3 0 1 1 0-6 3 3 0 0 1 0 6z" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" className="h-[21px] w-[21px] lg:h-[24px] lg:w-[24px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

const iconMap = {
  home:          HomeIcon,
  network:       NetworkIcon,
  learn:         LearnIcon,
  opportunities: OpportunitiesIcon,
  marketplace:   MarketplaceIcon,
};

export default function AppBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const hidden = useScrollDirection();

  const activeTab: NavTab =
    navItems.find((n) => pathname.startsWith(`/${n.id}`))?.id ?? "home";

  return (
    <nav
      aria-label="Primary navigation"
      className={`fixed bottom-0 left-0 right-0 z-50 flex md:hidden w-full items-center justify-around border-t border-[#e8e6e3] bg-white/95 backdrop-blur-md px-1 pt-1.5 shadow-[0_-2px_12px_rgba(0,0,0,0.06)] transition-transform duration-300 ease-in-out ${
        hidden ? "translate-y-full pointer-events-none" : "translate-y-0"
      }`}
      style={{
        paddingBottom: "max(0.4rem, env(safe-area-inset-bottom, 0px))",
      }}
    >
      <div className="flex w-full items-center justify-around max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = iconMap[item.id];
          return (
            <button
              key={item.id}
              type="button"
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
              onClick={() => router.push(`/${item.id}`)}
              className={`flex flex-1 flex-col items-center justify-center py-1 transition-colors relative ${
                isActive
                  ? "text-[#1769c2]"
                  : "text-[#8a8784] hover:text-[#3f3f3c] active:scale-95"
              }`}
            >
              <div className="relative flex items-center justify-center">
                <Icon active={isActive} />
                {isActive && (
                  <span className="absolute -bottom-1 h-1 w-1 rounded-full bg-[#1769c2]" />
                )}
              </div>
              <span
                className={`mt-1 text-[10px] font-medium leading-none ${
                  isActive ? "text-[#1769c2] font-semibold" : "text-[#8a8784]"
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
