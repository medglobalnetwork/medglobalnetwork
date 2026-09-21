"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  Briefcase,
  GraduationCap,
  Home,
  MessageSquare,
  Search,
  ShoppingBag,
  Users,
  X,
  ArrowRight,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import UserMenu from "@/components/UserMenu";
import { useScrollDirection } from "@/lib/useScrollDirection";
import { formatRelativeTime } from "@/modules/network/lib/network-data";

/* ── Notification popup ─────────────────────────── */
function NotifPopup({
  onClose,
  onViewAll,
}: {
  onClose: () => void;
  onViewAll: () => void;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [notifs, setNotifs] = React.useState<
    Array<{
      id: string;
      type: string;
      message?: string;
      is_read: boolean;
      created_at: string;
      actor_name?: string;
      actor_id?: string;
    }>
  >([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  React.useEffect(() => {
    fetch("/api/network/notifications", { credentials: "include" })
      .then(async (r) => {
        if (!r.ok) return { data: [] };
        const text = await r.text();
        return text ? JSON.parse(text) : { data: [] };
      })
      .then((d) => setNotifs(d.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleMarkAllRead = async () => {
    await fetch("/api/network/notifications", {
      method: "PATCH",
      credentials: "include",
    });
    setNotifs((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const handleNotifClick = (n: { type: string; actor_id?: string }) => {
    onClose();
    if (n.type.includes("connection")) {
      router.push("/network/connections");
    } else if (n.type.includes("post")) {
      router.push("/network/feed");
    } else if (n.actor_id) {
      router.push(`/profile/${n.actor_id}`);
    } else {
      router.push("/network");
    }
  };

  return (
    <div
      ref={ref}
      className="absolute right-0 top-12 z-50 w-[320px] sm:w-[340px] overflow-hidden rounded-2xl border border-[#ded8d1] bg-white shadow-xl animate-in fade-in zoom-in-95 duration-150"
    >
      <div className="flex items-center justify-between border-b border-[#f0efee] px-4 py-3">
        <span className="text-xs font-bold text-[#171717]">Notifications</span>
        {notifs.some((n) => !n.is_read) && (
          <button
            type="button"
            onClick={handleMarkAllRead}
            className="text-[11px] font-medium text-[#1769c2] hover:underline"
          >
            Mark all read
          </button>
        )}
      </div>

      <ul className="max-h-[320px] divide-y divide-[#f5f4f3] overflow-y-auto">
        {loading ? (
          <li className="p-4 text-center text-xs text-[#8a8784]">Loading notifications...</li>
        ) : notifs.length === 0 ? (
          <li className="p-6 text-center text-xs text-[#8a8784]">
            <p className="mb-1 text-lg">🔔</p>
            No notifications yet
          </li>
        ) : (
          notifs.map((n) => (
            <li
              key={n.id}
              onClick={() => handleNotifClick(n)}
              className={`flex cursor-pointer items-start gap-3 px-4 py-3 transition hover:bg-[#f8f7f6] ${
                n.is_read ? "" : "bg-[#f7f9fd]"
              }`}
            >
              <span
                className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                  n.is_read ? "bg-transparent" : "bg-[#1769c2]"
                }`}
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium leading-snug text-[#171717]">
                  {n.message || "New activity in your healthcare network"}
                </p>
                <p className="mt-0.5 text-[10px] text-[#8a8784]">
                  {formatRelativeTime(n.created_at)} ago
                </p>
              </div>
            </li>
          ))
        )}
      </ul>

      <div className="border-t border-[#f0efee] px-4 py-2.5">
        <button
          type="button"
          onClick={onViewAll}
          className="w-full text-center text-xs font-semibold text-[#1769c2] hover:underline"
        >
          View all notifications →
        </button>
      </div>
    </div>
  );
}

/* ── Main App Header ────────────────────────────── */
export default function AppHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = authClient.useSession();
  const [notifOpen, setNotifOpen] = React.useState(false);
  const [unreadCount, setUnreadCount] = React.useState(3);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const mobileInputRef = React.useRef<HTMLInputElement>(null);
  const hidden = useScrollDirection();

  React.useEffect(() => {
    if (!session?.user) return;
    fetch("/api/network/notifications", { credentials: "include" })
      .then(async (r) => {
        if (!r.ok) return {};
        const text = await r.text();
        return text ? JSON.parse(text) : {};
      })
      .then((d) => {
        if (d.unreadCount !== undefined) setUnreadCount(d.unreadCount);
      })
      .catch(() => {});
  }, [session?.user]);

  // Ctrl+K / Cmd+K → focus search
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        if (window.innerWidth < 768) {
          setMobileSearchOpen(true);
          setTimeout(() => mobileInputRef.current?.focus(), 50);
        } else {
          inputRef.current?.focus();
        }
      }
      if (e.key === "Escape") {
        inputRef.current?.blur();
        setMobileSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/network?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileSearchOpen(false);
    }
  };

  const navItems = [
    { id: "home", label: "Home", href: "/home", icon: Home },
    { id: "network", label: "Network", href: "/network", icon: Users },
    { id: "learn", label: "Learn", href: "/learn", icon: GraduationCap },
    { id: "opportunities", label: "Opportunities", href: "/opportunities", icon: Briefcase },
    { id: "marketplace", label: "Marketplace", href: "/marketplace", icon: ShoppingBag },
  ];

  return (
    <header
      className={`sticky top-0 z-40 border-b border-[#e8e6e3] bg-white transition-transform duration-300 ease-in-out ${
        hidden ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <div className="mx-auto flex h-14 sm:h-16 max-w-[1440px] items-center justify-between gap-2 sm:gap-4 px-3 sm:px-6 lg:px-8">
        {/* MOBILE SEARCH OVERLAY (when toggled on mobile) */}
        {mobileSearchOpen ? (
          <div className="flex w-full items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-150">
            <form onSubmit={handleSearchSubmit} className="relative flex flex-1 items-center">
              <Search className="pointer-events-none absolute left-3 h-4 w-4 text-[#8a8784]" />
              <input
                ref={mobileInputRef}
                type="search"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search doctors, specialties, jobs, courses..."
                aria-label="Mobile global search"
                className="h-10 w-full rounded-xl border border-[#1769c2] bg-[#f8f7f6] pl-9 pr-8 text-xs text-[#171717] placeholder:text-[#8a8784] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1769c2]/20"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 p-1 text-[#8a8784] hover:text-[#171717]"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </form>

            <button
              type="button"
              onClick={() => setMobileSearchOpen(false)}
              className="rounded-xl border border-[#ded8d1] bg-[#f8f7f6] px-3 py-2 text-xs font-semibold text-[#5d5854] hover:bg-white hover:text-[#171717]"
            >
              Cancel
            </button>
          </div>
        ) : (
          <>
            {/* 1. LEFT: LOGO */}
            <div className="flex shrink-0 items-center gap-4">
              <Link href="/home" className="flex items-center gap-2 focus:outline-none" aria-label="MGN Home">
                <img
                  src="/logo.png"
                  alt="MGN - Med Global Network"
                  className="h-6 sm:h-7.5 lg:h-8 w-auto object-contain transition-transform"
                />
              </Link>
            </div>

            {/* 2. CENTER: GLOBAL SEARCH BAR (Desktop) */}
            <div className="hidden md:block flex-1 max-w-xl">
              <form onSubmit={handleSearchSubmit} className="relative flex w-full items-center">
                <Search className="pointer-events-none absolute left-3.5 h-4 w-4 text-[#8a8784]" />
                <input
                  ref={inputRef}
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search professionals, specialties, organizations, jobs, courses..."
                  aria-label="Global search"
                  className="h-9.5 w-full rounded-2xl border border-[#e8e6e3] bg-[#f8f7f6] pl-10 pr-14 text-xs text-[#171717] placeholder:text-[#8a8784] transition focus:border-[#1769c2] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1769c2]/15"
                />
                {!searchQuery && (
                  <kbd className="pointer-events-none absolute right-3 flex items-center rounded-md border border-[#ded8d1] bg-white px-1.5 py-0.5 font-mono text-[10px] text-[#8a8784] shadow-2xs">
                    ⌘ K
                  </kbd>
                )}
              </form>
            </div>

            {/* 3. RIGHT: MOBILE SEARCH ICON + NAVIGATION TABS & UTILITIES */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Mobile Search Icon Trigger */}
              <button
                type="button"
                aria-label="Open search"
                onClick={() => {
                  setMobileSearchOpen(true);
                  setTimeout(() => mobileInputRef.current?.focus(), 50);
                }}
                className="flex md:hidden h-9 w-9 items-center justify-center rounded-full text-[#5d5854] hover:bg-[#f0efee] hover:text-[#171717] transition"
              >
                <Search className="h-4.5 w-4.5 stroke-[2]" />
              </button>

              {/* Navigation Links (Desktop) */}
              <nav className="hidden md:flex items-center gap-1 mr-2">
                {navItems.map((item) => {
                  const isActive =
                    item.href === "/home"
                      ? pathname === "/home" || pathname === "/"
                      : pathname.startsWith(item.href);
                  const IconComp = item.icon;

                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      className={`flex flex-col items-center justify-center rounded-xl px-3 py-1.5 text-center transition ${
                        isActive
                          ? "bg-[#eef5fc] text-[#1769c2] font-bold"
                          : "text-[#77716b] hover:bg-[#f8f7f6] hover:text-[#171717]"
                      }`}
                    >
                      <IconComp className={`h-4 w-4 stroke-[2] ${isActive ? "text-[#1769c2]" : ""}`} />
                      <span className="text-[10px] mt-0.5">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* Vertical Divider */}
              <div className="hidden md:block h-6 w-px bg-[#e8e6e3] mx-1" />

              {/* Notifications */}
              <div className="relative">
                <button
                  type="button"
                  aria-label="Notifications"
                  aria-expanded={notifOpen}
                  onClick={() => {
                    setNotifOpen((o) => !o);
                    if (!notifOpen) setUnreadCount(0);
                  }}
                  className="relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full text-[#5d5854] transition hover:bg-[#f0efee] hover:text-[#171717]"
                >
                  <Bell className="h-4.5 w-4.5 sm:h-5 sm:w-5 stroke-[1.8]" />
                  {unreadCount > 0 && (
                    <span className="absolute right-1.5 top-1.5 sm:right-2 sm:top-2 flex h-3.5 min-w-3.5 sm:h-4 sm:min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[8px] sm:text-[9px] font-bold text-white ring-2 ring-white">
                      {unreadCount}
                    </span>
                  )}
                </button>
                {notifOpen && (
                  <NotifPopup
                    onClose={() => setNotifOpen(false)}
                    onViewAll={() => {
                      setNotifOpen(false);
                      router.push("/network/connections");
                    }}
                  />
                )}
              </div>

              {/* Messages */}
              <button
                type="button"
                aria-label="Messages"
                onClick={() => router.push("/network")}
                className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full text-[#5d5854] transition hover:bg-[#f0efee] hover:text-[#171717]"
              >
                <MessageSquare className="h-4.5 w-4.5 sm:h-5 sm:w-5 stroke-[1.8]" />
              </button>

              {/* User Menu Avatar */}
              <UserMenu />
            </div>
          </>
        )}
      </div>
    </header>
  );
}
