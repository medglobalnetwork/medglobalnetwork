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
  Pin,
  PinOff,
  Plus,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { getUserAvatarUrl } from "@/lib/avatar";
import { MemberBadge } from "@/modules/network/components/MemberBadge";

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  icon8Id?: string;
  badge?: string | number;
  highlight?: boolean;
}

export const MAIN_NAV_ITEMS: NavItem[] = [
  { id: "home", label: "Home", href: "/home", icon: Home, icon8Id: "i6fZC6wuprSu" },
  { id: "network", label: "Network", href: "/network", icon: Users, icon8Id: "YzsadpdsoN8e" },
  { id: "learn", label: "Learn", href: "/learn", icon: GraduationCap, icon8Id: "AvANlXOxUB6Z" },
  { id: "opportunities", label: "Opportunities", href: "/opportunities", icon: Briefcase, icon8Id: "IOkzpfWnUztj" },
  { id: "events", label: "Events", href: "/events", icon: Calendar, icon8Id: "vwGXRtPWrZSn" },
  { id: "camps", label: "Health Camps", href: "/camps", icon: Tent, icon8Id: "HBLTBJiOS1vp" },
  { id: "research", label: "Research", href: "/research", icon: FlaskConical, icon8Id: "9ZmP1ylpYlqn" },
  { id: "marketplace", label: "Marketplace", href: "/marketplace", icon: ShoppingBag, icon8Id: "VksxHreSn4ck" },
];

export const WORKSPACE_NAV_ITEMS: NavItem[] = [
  { id: "create", label: "Create", href: "/create", icon: Plus, icon8Id: "SpuYztywr0Vl" },
  { id: "messages", label: "Messages", href: "/messages", icon: MessageSquare, icon8Id: "d7iUgF8ZrDaO" },
  { id: "calendar", label: "Schedule", href: "/calendar", icon: CalendarDays, icon8Id: "vwGXRtPWrZSn" },
  { id: "communities", label: "Communities", href: "/network/communities", icon: Compass, icon8Id: "aBDIThwGtLKb" },
];

function Icons8NavIcon({
  iconId,
  active,
  fallback: FallbackIcon,
  className = "h-6 w-6 sm:h-[26px] sm:w-[26px]",
}: {
  iconId?: string;
  active: boolean;
  fallback: React.ComponentType<{ className?: string }>;
  className?: string;
}) {
  const [imgError, setImgError] = React.useState(false);

  if (!iconId || imgError) {
    return (
      <FallbackIcon
        className={`${className} shrink-0 stroke-[2] transition-colors ${
          active ? "text-[#1769c2]" : "text-[#77716b] group-hover:text-[#171717]"
        }`}
      />
    );
  }

  // Icons8 fluent-systems-regular pack CDN with active/inactive colors
  const colorHex = active ? "1769C2" : "77716B";
  const url = `https://img.icons8.com/?id=${iconId}&format=png&size=48&color=${colorHex}`;

  return (
    <img
      src={url}
      alt=""
      className={`${className} shrink-0 object-contain transition-transform duration-200 group-hover:scale-105 select-none`}
      onError={() => setImgError(true)}
      loading="lazy"
    />
  );
}

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

  const [isHovered, setIsHovered] = React.useState(false);
  const hoverTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 150);
  };

  const handleNavClick = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setIsHovered(false);
  };

  React.useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  const isLinkActive = (href: string) => {
    if (href === "/home") {
      return pathname === "/home" || pathname === "/";
    }
    return pathname.startsWith(href);
  };

  const userAvatar = getUserAvatarUrl(session?.user?.image, session?.user?.name);

  // Close mobile drawer and collapse hover state when navigating to a new route
  const prevPathname = React.useRef(pathname);
  React.useEffect(() => {
    if (prevPathname.current !== pathname) {
      prevPathname.current = pathname;
      onCloseMobileDrawer();
      setIsHovered(false);
    }
  }, [pathname, onCloseMobileDrawer]);

  const isExpanded = !isCollapsed || isHovered;

  return (
    <>
      {/* ============================================================ */}
      {/* 1. DESKTOP SIDEBAR (>= md) */}
      {/* ============================================================ */}
      <aside
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`hidden md:flex flex-col fixed top-0 left-0 bottom-0 bg-white border-r border-[#e8e6e3] transition-all duration-300 ease-in-out ${
          isExpanded
            ? isCollapsed
              ? "w-60 lg:w-64 z-50 shadow-2xl"
              : "w-60 lg:w-64 z-40 shadow-none"
            : "w-20 z-40"
        }`}
      >
        {/* Top: Logo & Collapse / Pin Toggle */}
        <div
          className={`h-16 flex items-center px-4 border-b border-[#f0efee] shrink-0 ${
            isExpanded ? "justify-between" : "justify-center"
          }`}
        >
          <Link
            href="/home"
            onClick={handleNavClick}
            className="flex items-center gap-2.5 overflow-hidden"
          >
            <img
              src="/logo.png"
              alt="MGN"
              className="h-8.5 w-auto object-contain"
            />
          </Link>

          {onToggleCollapse && isExpanded && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="p-1.5 rounded-lg text-[#77716b] hover:bg-[#f5f4f2] hover:text-[#171717] transition group/pin"
              title={
                isCollapsed
                  ? "Pin sidebar (Keep permanently open)"
                  : "Unpin sidebar (Auto-collapse on mouse leave)"
              }
            >
              {isCollapsed ? (
                <Pin className="h-4 w-4 rotate-45 text-[#9c958f] group-hover/pin:text-[#171717]" />
              ) : (
                <PinOff className="h-4 w-4 text-[#1769c2]" />
              )}
            </button>
          )}
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {/* Main Ecosystem Navigation */}
          <div>
            {isExpanded && (
              <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-[#9c958f] animate-in fade-in duration-200">
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
                    onClick={handleNavClick}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-bold transition group relative ${
                      active
                        ? "bg-[#eef5fc] text-[#1769c2] shadow-2xs"
                        : "text-[#5d5854] hover:bg-[#f8f7f6] hover:text-[#171717]"
                    } ${!isExpanded ? "justify-center px-2" : ""}`}
                    title={!isExpanded ? item.label : undefined}
                  >
                    <Icons8NavIcon
                      iconId={item.icon8Id}
                      active={active}
                      fallback={item.icon}
                      className="h-6 w-6 sm:h-[26px] sm:w-[26px]"
                    />
                    {isExpanded && (
                      <span className="truncate animate-in fade-in duration-200">
                        {item.label}
                      </span>
                    )}
                    {active && isExpanded && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#1769c2]" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Workspace & Tools */}
          <div>
            {isExpanded && (
              <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-[#9c958f] animate-in fade-in duration-200">
                Workspace
              </p>
            )}
            <nav className="space-y-1">
              {WORKSPACE_NAV_ITEMS.map((item) => {
                const active = isLinkActive(item.href);

                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={handleNavClick}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-bold transition group relative ${
                      active
                        ? "bg-[#eef5fc] text-[#1769c2] shadow-2xs"
                        : "text-[#5d5854] hover:bg-[#f8f7f6] hover:text-[#171717]"
                    } ${!isExpanded ? "justify-center px-2" : ""}`}
                    title={!isExpanded ? item.label : undefined}
                  >
                    <Icons8NavIcon
                      iconId={item.icon8Id}
                      active={active}
                      fallback={item.icon}
                      className="h-6 w-6 sm:h-[26px] sm:w-[26px]"
                    />
                    {isExpanded && (
                      <span className="truncate animate-in fade-in duration-200">
                        {item.label}
                      </span>
                    )}
                    {active && isExpanded && (
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
            onClick={handleNavClick}
            className={`flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-bold text-[#5d5854] hover:bg-white hover:text-[#171717] hover:shadow-2xs transition ${
              !isExpanded ? "justify-center px-2" : ""
            }`}
            title={!isExpanded ? "Settings" : undefined}
          >
            <Icons8NavIcon
              iconId="4511GGVppfIx"
              active={isLinkActive("/settings")}
              fallback={Settings}
              className="h-6 w-6 sm:h-[26px] sm:w-[26px]"
            />
            {isExpanded && (
              <span className="animate-in fade-in duration-200">Settings</span>
            )}
          </Link>

          {isExpanded && session?.user && (
            <div className="mt-2 pt-2 border-t border-[#f0efee] flex items-center justify-between gap-2 px-1 animate-in fade-in duration-200">
              <Link
                href={`/profile/${session.user.id}`}
                onClick={handleNavClick}
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

          {!isExpanded && session?.user && (
            <div className="mt-2 pt-2 border-t border-[#f0efee] flex items-center justify-center">
              <Link
                href={`/profile/${session.user.id}`}
                onClick={handleNavClick}
                title={session.user.name || "View Profile"}
                className="group hover:opacity-90 transition"
              >
                <img
                  src={userAvatar}
                  alt={session.user.name || "User"}
                  className="h-8 w-8 rounded-full object-cover border border-[#e8e6e3]"
                />
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
                <img src="/logo.png" alt="MGN" className="h-8.5 w-auto object-contain" />
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
                        <Icons8NavIcon
                          iconId={item.icon8Id}
                          active={active}
                          fallback={item.icon}
                          className="h-6 w-6"
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
                        <Icons8NavIcon
                          iconId={item.icon8Id}
                          active={active}
                          fallback={item.icon}
                          className="h-6 w-6"
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
                <Icons8NavIcon
                  iconId="4511GGVppfIx"
                  active={isLinkActive("/settings")}
                  fallback={Settings}
                  className="h-6 w-6"
                />
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
                <Icons8NavIcon
                  iconId="Q1xkcFuVON39"
                  active={false}
                  fallback={LogOut}
                  className="h-6 w-6"
                />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
