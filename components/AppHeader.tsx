"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  Briefcase,
  Calendar,
  FlaskConical,
  GraduationCap,
  Home,
  MessageSquare,
  Search,
  ShoppingBag,
  Tent,
  Users,
  X,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import UserMenu from "@/components/UserMenu";
import { useScrollDirection } from "@/lib/useScrollDirection";
import { formatRelativeTime } from "@/modules/network/lib/network-data";
import { GlobalSearchBar } from "@/components/search/GlobalSearchBar";

/* ── Notification popup ─────────────────────────── */
function NotifPopup({
  onClose,
  onViewAll,
  onMarkAllRead,
}: {
  onClose: () => void;
  onViewAll: () => void;
  onMarkAllRead?: () => void;
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
    }).catch(() => {});
    setNotifs((prev) => prev.map((n) => ({ ...n, is_read: true })));
    onMarkAllRead?.();
  };

  const handleNotifClick = (n: { id: string; type: string; actor_id?: string }) => {
    onClose();
    fetch("/api/network/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ ids: [n.id] }),
    }).catch(() => {});
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
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [mobileSearchOpen, setMobileSearchOpen] = React.useState(false);
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

  const handleToggleNotifications = () => {
    setNotifOpen((prev) => {
      const next = !prev;
      if (next) {
        setUnreadCount(0);
        fetch("/api/network/notifications", {
          method: "PATCH",
          credentials: "include",
        }).catch(() => {});
      }
      return next;
    });
  };

  const navItems = [
    { id: "home", label: "Home", href: "/home", icon: Home },
    { id: "network", label: "Network", href: "/network", icon: Users },
    { id: "learn", label: "Learn", href: "/learn", icon: GraduationCap },
    { id: "opportunities", label: "Opportunities", href: "/opportunities", icon: Briefcase },
    { id: "events", label: "Events", href: "/events", icon: Calendar },
    { id: "camps", label: "Camps", href: "/camps", icon: Tent },
    { id: "research", label: "Research", href: "/research", icon: FlaskConical },
    { id: "marketplace", label: "Marketplace", href: "/marketplace", icon: ShoppingBag },
  ];

  const isProfilePage = pathname?.startsWith("/profile");

  return (
    <header
      className={`sticky top-0 z-40 border-b border-[#e8e6e3] bg-white transition-transform duration-300 ease-in-out ${
        hidden ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <div className="mx-auto flex h-14 sm:h-16 max-w-[1440px] items-center justify-between gap-2 sm:gap-4 px-3 sm:px-6 lg:px-8">
        {/* MOBILE SEARCH OVERLAY (when toggled on mobile) */}
        {mobileSearchOpen ? (
          <div className="flex w-full items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-150 py-1">
            <div className="flex-1">
              <GlobalSearchBar
                isMobile={true}
                onCloseMobile={() => setMobileSearchOpen(false)}
                placeholder="Search doctors, specialties, jobs, courses..."
              />
            </div>
            <button
              type="button"
              onClick={() => setMobileSearchOpen(false)}
              className="shrink-0 rounded-xl border border-[#ded8d1] bg-[#f8f7f6] px-3 py-2 text-xs font-semibold text-[#5d5854] hover:bg-white hover:text-[#171717]"
            >
              Cancel
            </button>
          </div>
        ) : isProfilePage ? (
          <>
            {/* 1. MOBILE-ONLY PROFILE HEADER (< md) */}
            <div className="flex md:hidden w-full items-center justify-between">
              {/* Left: Back Arrow */}
              <button
                type="button"
                onClick={() => router.back()}
                aria-label="Go back"
                className="flex h-9 w-9 items-center justify-center rounded-xl text-[#5d5854] hover:bg-[#f0efee] hover:text-[#171717] transition active:scale-95"
              >
                <ArrowLeft className="h-5 w-5 stroke-[2.2]" />
              </button>

              {/* Center: Website Logo */}
              <Link href="/home" className="flex items-center focus:outline-none" aria-label="MGN Home">
                <img
                  src="/logo.png"
                  alt="MGN - Med Global Network"
                  className="h-7 w-auto object-contain"
                />
              </Link>

              {/* Right: Search, Notifications & Messages */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  aria-label="Open search"
                  onClick={() => setMobileSearchOpen(true)}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-[#5d5854] hover:bg-[#f0efee] hover:text-[#171717] transition"
                >
                  <Search className="h-4.5 w-4.5 stroke-[2]" />
                </button>

                <div className="relative">
                  <button
                    type="button"
                    aria-label="Notifications"
                    aria-expanded={notifOpen}
                    onClick={handleToggleNotifications}
                    className="relative flex h-9 w-9 items-center justify-center rounded-full text-[#5d5854] transition hover:bg-[#f0efee] hover:text-[#171717]"
                  >
                    <Bell className="h-5 w-5 stroke-[1.8]" />
                    {unreadCount > 0 && (
                      <span className="absolute right-1 top-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-rose-500 px-1 text-[8px] font-bold text-white ring-2 ring-white">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                  {notifOpen && (
                    <NotifPopup
                      onClose={() => setNotifOpen(false)}
                      onMarkAllRead={() => setUnreadCount(0)}
                      onViewAll={() => {
                        setNotifOpen(false);
                        router.push("/network/connections");
                      }}
                    />
                  )}
                </div>

                <button
                  type="button"
                  aria-label="Messages"
                  onClick={() => router.push("/messages")}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-[#5d5854] transition hover:bg-[#f0efee] hover:text-[#171717]"
                >
                  <MessageSquare className="h-5 w-5 stroke-[1.8]" />
                </button>
              </div>
            </div>

            {/* 2. DESKTOP PROFILE HEADER (>= md) — Identical to standard desktop navbar */}
            <div className="hidden md:flex w-full items-center justify-between gap-4">
              {/* Left: Logo */}
              <div className="flex shrink-0 items-center gap-4">
                <Link href="/home" className="flex items-center gap-2 focus:outline-none" aria-label="MGN Home">
                  <img
                    src="/logo.png"
                    alt="MGN - Med Global Network"
                    className="h-6 sm:h-7.5 lg:h-8 w-auto object-contain transition-transform"
                  />
                </Link>
              </div>

              {/* Center: Global Search */}
              <div className="flex-1 max-w-xl">
                <GlobalSearchBar />
              </div>

              {/* Right: Navigation Tabs & Utilities */}
              <div className="flex items-center gap-1 sm:gap-2">
                <nav className="flex items-center gap-1 mr-2">
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

                <div className="h-6 w-px bg-[#e8e6e3] mx-1" />

                {/* Notifications */}
                <div className="relative">
                  <button
                    type="button"
                    aria-label="Notifications"
                    aria-expanded={notifOpen}
                    onClick={handleToggleNotifications}
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
                      onMarkAllRead={() => setUnreadCount(0)}
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
                  onClick={() => router.push("/messages")}
                  className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full text-[#5d5854] transition hover:bg-[#f0efee] hover:text-[#171717]"
                >
                  <MessageSquare className="h-4.5 w-4.5 sm:h-5 sm:w-5 stroke-[1.8]" />
                </button>

                {/* User Menu Avatar */}
                <UserMenu />
              </div>
            </div>
          </>
        ) : (
          /* STANDARD HEADER FOR ALL OTHER PAGES */
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
              <GlobalSearchBar />
            </div>

            {/* 3. RIGHT: MOBILE SEARCH ICON + NAVIGATION TABS & UTILITIES */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Mobile Search Icon Trigger */}
              <button
                type="button"
                aria-label="Open search"
                onClick={() => setMobileSearchOpen(true)}
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
                  onClick={handleToggleNotifications}
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
                    onMarkAllRead={() => setUnreadCount(0)}
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
                onClick={() => router.push("/messages")}
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
