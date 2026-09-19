"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import UserMenu from "@/components/UserMenu";
import { useScrollDirection } from "@/lib/useScrollDirection";

/* ── Icons ─────────────────────────────────────── */
function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[20px] w-[20px] lg:h-[23px] lg:w-[23px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}

function MessageIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[20px] w-[20px] lg:h-[23px] lg:w-[23px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

/* ── Notification popup ─────────────────────────── */
const sampleNotifs = [
  { id: 1, title: "New update available", time: "2m ago", read: false },
  { id: 2, title: "Your report is ready", time: "1h ago", read: false },
  { id: 3, title: "Welcome to MGN!", time: "2d ago", read: true },
];

function NotifPopup({ onClose }: { onClose: () => void }) {
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <div ref={ref} className="absolute right-0 top-11 lg:top-14 z-50 w-[320px] lg:w-[350px] overflow-hidden rounded-2xl border border-[#ebebeb] bg-white shadow-[0_8px_40px_rgba(0,0,0,0.12)]">
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#f0efee]">
        <span className="text-sm lg:text-base font-semibold text-[#171717]">Notifications</span>
        <button type="button" onClick={onClose} className="text-[11px] lg:text-xs font-medium text-[#1769c2] hover:underline">Mark all read</button>
      </div>
      <ul className="max-h-[300px] overflow-y-auto divide-y divide-[#f5f4f3]">
        {sampleNotifs.map((n) => (
          <li key={n.id} className={`flex items-start gap-3 px-4 py-3 ${n.read ? "" : "bg-[#f7f9fd]"}`}>
            <span className={`mt-1.5 h-2 w-2 lg:h-2.5 lg:w-2.5 shrink-0 rounded-full ${n.read ? "bg-transparent" : "bg-[#1769c2]"}`} />
            <div className="min-w-0">
              <p className="text-[13px] lg:text-sm font-medium text-[#171717] leading-snug">{n.title}</p>
              <p className="mt-0.5 text-[11px] lg:text-xs text-[#8a8784]">{n.time}</p>
            </div>
          </li>
        ))}
      </ul>
      <div className="px-4 py-3 border-t border-[#f0efee]">
        <button type="button" className="w-full text-center text-[12px] lg:text-xs font-medium text-[#1769c2] hover:underline">View all notifications</button>
      </div>
    </div>
  );
}

/* ── Search bar ─────────────────────────────────── */
function SearchBar() {
  const [query, setQuery] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Ctrl+K / Cmd+K → focus search
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape") inputRef.current?.blur();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="relative flex w-full">
      {/* Search icon */}
      <svg
        className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 lg:h-5 lg:w-5 -translate-y-1/2 text-[#8a8784]"
        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>

      <input
        ref={inputRef}
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search anything..."
        aria-label="Global search"
        className="h-9 lg:h-11 w-full rounded-xl lg:rounded-2xl border border-[#e8e6e3] bg-[#f8f7f6] pl-9 lg:pl-11 pr-14 text-sm lg:text-[15px] text-[#171717] placeholder:text-[#8a8784] transition focus:border-[#1769c2] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1769c2]/20"
      />

      {/* Keyboard shortcut badge */}
      {!query && (
        <kbd className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 rounded-md border border-[#e8e6e3] bg-white px-1.5 py-0.5 font-mono text-[10px] lg:text-xs text-[#8a8784] shadow-sm">
          ⌘K
        </kbd>
      )}

      {/* Clear button */}
      {query && (
        <button
          type="button"
          onClick={() => { setQuery(""); inputRef.current?.focus(); }}
          className="absolute right-3 top-1/2 -translate-y-1/2 flex h-5 w-5 lg:h-6 lg:w-6 items-center justify-center rounded-full bg-[#e8e6e3] text-[#5d5854] hover:bg-[#d9d7d4]"
          aria-label="Clear search"
        >
          <svg viewBox="0 0 24 24" className="h-3 w-3 lg:h-3.5 lg:w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}

/* ── Main Header ────────────────────────────────── */
export default function AppHeader() {
  const router = useRouter();
  const [notifOpen, setNotifOpen] = React.useState(false);
  const hidden = useScrollDirection();

  const iconBtn = "relative flex h-9 w-9 lg:h-11 lg:w-11 items-center justify-center rounded-full text-[#6b6a68] transition hover:bg-[#f0efee] hover:text-[#171717] focus:outline-none";

  return (
    <header
      className={`sticky top-0 z-40 flex items-center bg-white px-4 lg:px-8 py-2.5 lg:py-3.5 transition-transform duration-300 ease-in-out ${
        hidden ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      {/* Left — MGN logo */}
      <button
        type="button"
        onClick={() => router.push("/home")}
        className="flex shrink-0 items-center focus:outline-none"
        aria-label="MGN Home"
      >
        <img src="/logo.png" alt="MGN" className="h-8 lg:h-10 w-auto object-contain" />
      </button>

      {/* Center — search bar truly centered via absolute (desktop only) */}
      <div className="pointer-events-none absolute inset-0 hidden items-center justify-center lg:flex">
        <div className="pointer-events-auto w-full max-w-lg xl:max-w-xl px-4">
          <SearchBar />
        </div>
      </div>

      {/* Right — icons */}
      <div className="ml-auto flex items-center gap-1.5 lg:gap-2.5">
        {/* Notification */}
        <div className="relative">
          <button
            type="button"
            aria-label="Notifications"
            aria-expanded={notifOpen}
            onClick={() => setNotifOpen((o) => !o)}
            className={iconBtn}
          >
            <BellIcon />
            <span className="absolute right-1.5 lg:right-2 top-1.5 lg:top-2 h-2 w-2 lg:h-2.5 lg:w-2.5 rounded-full bg-[#1769c2] ring-2 ring-white" aria-hidden="true" />
          </button>
          {notifOpen && <NotifPopup onClose={() => setNotifOpen(false)} />}
        </div>

        {/* Message */}
        <button
          type="button"
          aria-label="Messages"
          onClick={() => router.push("/home")}
          className={iconBtn}
        >
          <MessageIcon />
        </button>

        {/* User profile */}
        <UserMenu />
      </div>
    </header>
  );
}

