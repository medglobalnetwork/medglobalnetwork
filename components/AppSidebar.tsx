"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Users,
  GraduationCap,
  Briefcase,
  Calendar,
  Tent,
  FlaskConical,
  ShoppingBag,
  MessageSquare,
  CalendarDays,
  UsersRound,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
  ShieldCheck,
  Sparkles,
  LogOut,
  ExternalLink,
  Compass,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { getUserAvatarUrl } from "@/lib/avatar";
import { MemberBadge } from "@/modules/network/components/MemberBadge";

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  highlight?: boolean;
}

export const MAIN_NAV_ITEMS: NavItem[] = [
  { id: "home", label: "Home", href: "/home", icon: Home },
  { id: "network", label: "Network", href: "/network", icon: Users },
  { id: "learn", label: "Learn", href: "/learn", icon: GraduationCap },
  { id: "opportunities", label: "Opportunities", href: "/opportunities", icon: Briefcase },
  { id: "events", label: "Events", href: "/events", icon: Calendar },
  { id: "camps", label: "Health Camps", href: "/camps", icon: Tent },
  { id: "research", label: "Research", href: "/research", icon: FlaskConical },
  { id: "marketplace", label: "Marketplace", href: "/marketplace", icon: ShoppingBag },
];

export const WORKSPACE_NAV_ITEMS: NavItem[] = [
  { id: "messages", label: "Messages", href: "/messages", icon: MessageSquare },
  { id: "calendar", label: "Schedule", href: "/calendar", icon: CalendarDays },
  { id: "communities", label: "Communities", href: "/network/communities", icon: Compass },
];

interface AppSidebarProps {
  isMobileDrawerOpen: boolean;
  onCloseMobileDrawer: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function AppSidebar({
  isMobileDrawerOpen,
  onCloseMobileDrawer,
  isCollapsed = false,
  onToggleCollapse,
}: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const isLinkActive = (href: string) => {
    if (href === "/home") {
      return pathname === "/home" || pathname === "/";
    }
    return pathname.startsWith(href);
  };

  const userAvatar = getUserAvatarUrl(session?.user?.image, session?.user?.name);

  // Close mobile drawer only when navigating to a new route
  const prevPathname = React.useRef(pathname);
  React.useEffect(() => {
    if (prevPathname.current !== pathname) {
      prevPathname.current = pathname;
      onCloseMobileDrawer();
    }
  }, [pathname, onCloseMobileDrawer]);

  return (
    <>
      {/* ============================================================ */}
      {/* 1. DESKTOP SIDEBAR (>= md) */}
      {/* ============================================================ */}
      <aside
        className={`hidden md:flex flex-col fixed top-0 left-0 bottom-0 z-40 bg-white border-r border-[#e8e6e3] transition-all duration-300 ease-in-out ${
          isCollapsed ? "w-20" : "w-60 lg:w-64"
        }`}
      >
        {/* Top: Logo & Collapse Toggle */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-[#f0efee] shrink-0">
          <Link href="/home" className="flex items-center gap-2.5 overflow-hidden">
            <img
              src="/logo.png"
              alt="MGN"
              className={`h-7 w-auto object-contain transition-transform ${
                isCollapsed ? "mx-auto" : ""
              }`}
            />
          </Link>

          {onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="p-1.5 rounded-lg text-[#77716b] hover:bg-[#f5f4f2] hover:text-[#171717] transition"
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
          )}
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {/* Main Ecosystem Navigation */}
          <div>
            {!isCollapsed && (
              <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-[#9c958f]">
                Ecosystem
              </p>
            )}
            <nav className="space-y-1">
              {MAIN_NAV_ITEMS.map((item) => {
                const active = isLinkActive(item.href);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-bold transition group relative ${
                      active
                        ? "bg-[#eef5fc] text-[#1769c2] shadow-2xs"
                        : "text-[#5d5854] hover:bg-[#f8f7f6] hover:text-[#171717]"
                    } ${isCollapsed ? "justify-center px-2" : ""}`}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon
                      className={`h-4.5 w-4.5 shrink-0 stroke-[2] transition-colors ${
                        active ? "text-[#1769c2]" : "text-[#77716b] group-hover:text-[#171717]"
                      }`}
                    />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                    {active && !isCollapsed && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#1769c2]" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Workspace & Tools */}
          <div>
            {!isCollapsed && (
              <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-[#9c958f]">
                Workspace
              </p>
            )}
            <nav className="space-y-1">
              {WORKSPACE_NAV_ITEMS.map((item) => {
                const active = isLinkActive(item.href);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-bold transition group relative ${
                      active
                        ? "bg-[#eef5fc] text-[#1769c2] shadow-2xs"
                        : "text-[#5d5854] hover:bg-[#f8f7f6] hover:text-[#171717]"
                    } ${isCollapsed ? "justify-center px-2" : ""}`}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon
                      className={`h-4.5 w-4.5 shrink-0 stroke-[2] transition-colors ${
                        active ? "text-[#1769c2]" : "text-[#77716b] group-hover:text-[#171717]"
                      }`}
                    />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                    {active && !isCollapsed && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#1769c2]" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Bottom: Settings & User Profile Bar */}
        <div className="p-3 border-t border-[#f0efee] bg-[#faf9f8] shrink-0">
          <Link
            href="/settings"
            className={`flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-bold text-[#5d5854] hover:bg-white hover:text-[#171717] hover:shadow-2xs transition ${
              isCollapsed ? "justify-center px-2" : ""
            }`}
            title={isCollapsed ? "Settings" : undefined}
          >
            <Settings className="h-4.5 w-4.5 shrink-0 stroke-[2] text-[#77716b]" />
            {!isCollapsed && <span>Settings</span>}
          </Link>

          {!isCollapsed && session?.user && (
            <div className="mt-2 pt-2 border-t border-[#f0efee] flex items-center justify-between gap-2 px-1">
              <Link
                href={`/profile/${session.user.id}`}
                className="flex items-center gap-2.5 min-w-0 group hover:opacity-90 transition"
              >
                <img
                  src={userAvatar}
                  alt={session.user.name || "User"}
                  className="h-8 w-8 rounded-full object-cover border border-[#e8e6e3] shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#171717] truncate group-hover:text-[#1769c2]">
                    {session.user.name}
                  </p>
                  <p className="text-[10px] text-[#77716b] truncate">View Profile</p>
                </div>
              </Link>
            </div>
          )}
        </div>
      </aside>

      {/* ============================================================ */}
      {/* 2. MOBILE DRAWER SIDEBAR (< md) */}
      {/* ============================================================ */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden animate-in fade-in duration-200">
          {/* Backdrop Blur */}
          <div
            onClick={onCloseMobileDrawer}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            aria-hidden="true"
          />

          {/* Drawer Content */}
          <div className="relative flex flex-col w-72 sm:w-80 max-w-[85vw] bg-white h-full shadow-2xl border-r border-[#ded8d1] z-10 animate-in slide-in-from-left duration-250">
            {/* Header / User Profile Banner */}
            <div className="p-4 border-b border-[#f0efee] bg-[#faf9f8] flex items-center justify-between">
              <Link href="/home" onClick={onCloseMobileDrawer} className="flex items-center gap-2">
                <img src="/logo.png" alt="MGN" className="h-6 w-auto object-contain" />
              </Link>
              <button
                type="button"
                onClick={onCloseMobileDrawer}
                className="p-1.5 rounded-xl text-[#77716b] hover:bg-[#efefef] hover:text-[#171717] transition"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* User Profile Card if logged in */}
            {session?.user && (
              <div className="p-4 border-b border-[#f0efee] bg-gradient-to-br from-[#f8fafd] to-[#f0f5fc]">
                <Link
                  href={`/profile/${session.user.id}`}
                  onClick={onCloseMobileDrawer}
                  className="flex items-center gap-3"
                >
                  <img
                    src={userAvatar}
                    alt={session.user.name || "User"}
                    className="h-11 w-11 rounded-full object-cover border-2 border-white shadow-xs shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-black text-[#171717] truncate flex items-center gap-1">
                      {session.user.name}
                      <ShieldCheck className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                    </p>
                    <p className="text-[11px] text-[#5d5854] truncate">
                      {session.user.email}
                    </p>
                    <span className="inline-block text-[10px] font-bold text-[#1769c2] mt-0.5">
                      View Profile →
                    </span>
                  </div>
                </Link>
              </div>
            )}

            {/* Scrollable Nav Items */}
            <div className="flex-1 overflow-y-auto p-3 space-y-5">
              {/* Additional Ecosystem Modules (Events, Camps, Research, Marketplace, etc.) */}
              <div>
                <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-[#9c958f]">
                  Explore Ecosystem
                </p>
                <nav className="space-y-1">
                  {MAIN_NAV_ITEMS.map((item) => {
                    const active = isLinkActive(item.href);
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        onClick={onCloseMobileDrawer}
                        className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold transition ${
                          active
                            ? "bg-[#eef5fc] text-[#1769c2]"
                            : "text-[#5d5854] hover:bg-[#f8f7f6] hover:text-[#171717]"
                        }`}
                      >
                        <Icon
                          className={`h-4.5 w-4.5 shrink-0 stroke-[2] ${
                            active ? "text-[#1769c2]" : "text-[#77716b]"
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                        {active && (
                          <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#1769c2]" />
                        )}
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {/* Tools & Workspace */}
              <div>
                <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-[#9c958f]">
                  Tools & Workspace
                </p>
                <nav className="space-y-1">
                  {WORKSPACE_NAV_ITEMS.map((item) => {
                    const active = isLinkActive(item.href);
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        onClick={onCloseMobileDrawer}
                        className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold transition ${
                          active
                            ? "bg-[#eef5fc] text-[#1769c2]"
                            : "text-[#5d5854] hover:bg-[#f8f7f6] hover:text-[#171717]"
                        }`}
                      >
                        <Icon
                          className={`h-4.5 w-4.5 shrink-0 stroke-[2] ${
                            active ? "text-[#1769c2]" : "text-[#77716b]"
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-3 border-t border-[#f0efee] bg-[#faf9f8] space-y-1">
              <Link
                href="/settings"
                onClick={onCloseMobileDrawer}
                className="flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-bold text-[#5d5854] hover:bg-white hover:text-[#171717] transition"
              >
                <Settings className="h-4.5 w-4.5 shrink-0 text-[#77716b]" />
                <span>Account Settings</span>
              </Link>
              <button
                type="button"
                onClick={() => {
                  onCloseMobileDrawer();
                  authClient.signOut({
                    fetchOptions: {
                      onSuccess: () => {
                        window.location.href = "/";
                      },
                    },
                  });
                }}
                className="w-full flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 transition"
              >
                <LogOut className="h-4.5 w-4.5 shrink-0" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
