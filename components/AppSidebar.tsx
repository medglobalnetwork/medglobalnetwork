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
  Globe,
  LayoutDashboard,
  FolderHeart,
  Target,
  Pin,
  PinOff,
  Plus,
  Package,
  BookOpen,
  Building2,
} from "lucide-react";
import { authClient, signOutUser, isSuperAdminUser } from "@/lib/auth-client";
import { getUserAvatarUrl } from "@/lib/avatar";
import { MemberBadge } from "@/modules/network/components/MemberBadge";
import { ThemeToggle } from "@/components/ThemeToggle";

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
  { id: "marketplace", label: "Marketplace", href: "/marketplace", icon: ShoppingBag, icon8Id: "VksxHreSn4ck", badge: "Soon" },
];

export const WORKSPACE_NAV_ITEMS: NavItem[] = [
  { id: "organizations", label: "Workspaces", href: "/organizations", icon: Building2, icon8Id: "IOkzpfWnUztj" },
  { id: "create", label: "Create", href: "/create", icon: Plus, icon8Id: "SpuYztywr0Vl" },
  { id: "messages", label: "Messages", href: "/messages", icon: MessageSquare, icon8Id: "d7iUgF8ZrDaO" },
  { id: "calendar", label: "Schedule", href: "/calendar", icon: CalendarDays, icon8Id: "vwGXRtPWrZSn" },
  { id: "communities", label: "Communities", href: "/network/communities", icon: Compass, icon8Id: "aBDIThwGtLKb" },
];

export const LEARN_WORKSPACE_NAV_ITEMS: NavItem[] = [
  { id: "learn-dashboard", label: "Dashboard", href: "/learn", icon: LayoutDashboard, icon8Id: "sUJRwjfnGwbJ" },
  { id: "learn-explore", label: "Explore", href: "/learn/explore", icon: Globe, icon8Id: "K6FkUVH0GtOD" },
  { id: "learn-mylearning", label: "My Learning", href: "/learn/my-learning", icon: GraduationCap, icon8Id: "AvANlXOxUB6Z" },
  { id: "learn-practice", label: "Practice", href: "/learn/practice", icon: Target, icon8Id: "AYFSAzltJPA5" },
  { id: "learn-resources", label: "Resources", href: "/learn/resources", icon: BookOpen, icon8Id: "V8Llcp5r9iZW" },
  { id: "learn-mybox", label: "My Box", href: "/learn/my-box", icon: FolderHeart, icon8Id: "dICWPexHhnSo" },
  { id: "learn-instructor", label: "Instructor Studio", href: "/learn/instructor", icon: Plus, icon8Id: "6bsPWoUBhUuJ" },
];


function Icons8NavIcon({
  iconId,
  active,
  fallback: FallbackIcon,
  className = "size-6 sm:size-[26px]",
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
          active
            ? "text-[#0f4c81] dark:text-[#388bfd]"
            : "text-[#77716b] dark:text-[#8b949e] group-hover:text-[#171717] dark:group-hover:text-[#f0f6fc]"
        }`}
      />
    );
  }

  // Icons8 fluent-systems-regular pack CDN with active/inactive colors
  const colorHex = active ? "0F4C81" : "77716B";
  const url = `https://img.icons8.com/?id=${iconId}&format=png&size=48&color=${colorHex}`;

  return (
    <img
      src={url}
      alt=""
      className={`${className} shrink-0 object-contain transition-transform duration-200 group-hover:scale-105 select-none dark:brightness-125`}
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
  const [isInstructor, setIsInstructor] = React.useState(false);
  const hoverTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    if (!session?.user?.id) {
      setIsInstructor(false);
      return;
    }
    fetch("/api/shared/eligibility?type=instructor", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : { eligible: false }))
      .then((d) => setIsInstructor(Boolean(d?.eligible)))
      .catch(() => setIsInstructor(false));
  }, [session?.user?.id]);

  const visibleLearnItems = React.useMemo(() => {
    return LEARN_WORKSPACE_NAV_ITEMS.filter(
      (item) => item.id !== "learn-instructor" || isInstructor
    );
  }, [isInstructor]);

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

  const userAvatar = getUserAvatarUrl(session?.user?.id, session?.user?.image);

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
        className={`hidden md:flex flex-col fixed top-0 left-0 bottom-0 bg-white dark:bg-[#161b22] border-r border-[#e8e6e3] dark:border-[#30363d] transition-all duration-300 ease-in-out ${
          isExpanded
            ? isCollapsed
              ? "w-60 lg:w-64 z-50 shadow-2xl"
              : "w-60 lg:w-64 z-40 shadow-none"
            : "w-20 z-40"
        }`}
      >
        {/* Top: Logo & Collapse / Pin Toggle */}
        <div
          className={`h-16 flex items-center px-4 border-b border-[#f0efee] dark:border-[#21262d] shrink-0 ${
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
              className="p-1.5 rounded-lg text-[#77716b] dark:text-[#8b949e] hover:bg-[#f5f4f2] dark:hover:bg-[#21262d] hover:text-[#171717] dark:hover:text-[#f0f6fc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f4c81] dark:focus-visible:ring-[#388bfd] transition group/pin cursor-pointer"
              title={
                isCollapsed
                  ? "Pin sidebar (Keep permanently open)"
                  : "Unpin sidebar (Auto-collapse on mouse leave)"
              }
            >
              {isCollapsed ? (
                <Pin className="size-4 rotate-45 text-[#9c958f] dark:text-[#8b949e] group-hover/pin:text-[#171717] dark:group-hover/pin:text-[#f0f6fc]" />
              ) : (
                <PinOff className="size-4 text-[#0f4c81] dark:text-[#388bfd]" />
              )}
            </button>
          )}
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-3 py-4 space-y-6">
          {/* Learn Workspace Active Mode */}
          {pathname?.startsWith("/learn") && (
            <div>
              {isExpanded && (
                <div className="flex items-center justify-between px-3 mb-2 animate-in fade-in duration-200">
                  <p className="text-[10px] font-extrabold uppercase text-[#0f4c81] dark:text-[#58a6ff]">
                    MGN Learn
                  </p>
                  <Link
                    href="/home"
                    onClick={handleNavClick}
                    className="text-[10px] font-semibold text-[#77716b] dark:text-[#8b949e] hover:text-[#0f4c81] dark:hover:text-[#58a6ff] flex items-center gap-0.5"
                  >
                    <ChevronLeft className="size-3" /> Back
                  </Link>
                </div>
              )}
              <nav className="space-y-1">
                {visibleLearnItems.map((item) => {
                  const active =
                    item.href === "/learn"
                      ? pathname === "/learn" || pathname === "/learn/"
                      : pathname.startsWith(item.href);

                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={handleNavClick}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-bold transition group relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f4c81] dark:focus-visible:ring-[#388bfd] ${
                        active
                          ? "bg-[#f0efee] dark:bg-[#21262d] text-[#171717] dark:text-[#f0f6fc]"
                          : "text-[#5d5854] dark:text-[#8b949e] hover:bg-[#f8f7f6] dark:hover:bg-[#1c202a] hover:text-[#171717] dark:hover:text-[#f0f6fc]"
                      } ${!isExpanded ? "justify-center px-2" : ""}`}
                      title={!isExpanded ? item.label : undefined}
                    >
                      <Icons8NavIcon
                        iconId={item.icon8Id}
                        active={active}
                        fallback={item.icon}
                        className="size-6 sm:size-[26px]"
                      />
                      {isExpanded && (
                        <span className="truncate animate-in fade-in duration-200">{item.label}</span>
                      )}
                      {active && isExpanded && (
                        <span className="ml-auto size-1.5 rounded-full bg-[#16804d] dark:bg-[#2ea043]" />
                      )}
                    </Link>
                  );
                })}

                {/* Ask AI Trigger */}
                <button
                  type="button"
                  onClick={() => {
                    handleNavClick();
                    if (typeof window !== "undefined") {
                      window.dispatchEvent(new CustomEvent("open-mgn-ask-ai"));
                    }
                  }}
                  className={`w-full flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-bold text-[#0f4c81] dark:text-[#58a6ff] hover:bg-[#eef5fc] dark:hover:bg-[#1c2433] transition cursor-pointer ${
                    !isExpanded ? "justify-center px-2" : ""
                  }`}
                  title={!isExpanded ? "Ask Medical AI" : undefined}
                >
                  <div className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-gradient-to-tr from-[#0f4c81] to-[#1769c2] text-white shadow-2xs">
                    <Sparkles className="size-3.5 text-amber-300" />
                  </div>
                  {isExpanded && <span className="truncate">Ask Medical AI</span>}
                </button>
              </nav>
            </div>
          )}

          {/* Main Ecosystem Navigation */}
          <div>
            {isExpanded && (
              <p className="px-3 mb-2 text-[10px] font-bold uppercase text-[#9c958f] dark:text-[#8b949e] animate-in fade-in duration-200">
                Ecosystem
              </p>
            )}
            <nav className="space-y-1">
              {MAIN_NAV_ITEMS.map((item) => {
                const active = isLinkActive(item.href);

                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={handleNavClick}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-bold transition group relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f4c81] dark:focus-visible:ring-[#388bfd] ${
                      active
                        ? "bg-[#f0efee] dark:bg-[#21262d] text-[#171717] dark:text-[#f0f6fc]"
                        : "text-[#5d5854] dark:text-[#8b949e] hover:bg-[#f8f7f6] dark:hover:bg-[#1c202a] hover:text-[#171717] dark:hover:text-[#f0f6fc]"
                    } ${!isExpanded ? "justify-center px-2" : ""}`}
                    title={!isExpanded ? item.label : undefined}
                  >
                    <Icons8NavIcon
                      iconId={item.icon8Id}
                      active={active}
                      fallback={item.icon}
                      className="size-6 sm:size-[26px]"
                    />
                    {isExpanded && (
                      <span className="truncate animate-in fade-in duration-200">
                        {item.label}
                      </span>
                    )}
                    {item.badge && isExpanded && !active && (
                      <span className="ml-auto rounded-full bg-[#f0efee] dark:bg-[#21262d] border border-[#e8e6e3] dark:border-[#30363d] px-1.5 py-0.2 text-[9px] font-bold text-[#77716b] dark:text-[#8b949e]">
                        {item.badge}
                      </span>
                    )}
                    {active && isExpanded && (
                      <span className="ml-auto size-1.5 rounded-full bg-[#16804d] dark:bg-[#2ea043]" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Workspace & Tools */}
          <div>
            {isExpanded && (
              <p className="px-3 mb-2 text-[10px] font-bold uppercase text-[#9c958f] dark:text-[#8b949e] animate-in fade-in duration-200">
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
                    className={`flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-bold transition group relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f4c81] dark:focus-visible:ring-[#388bfd] ${
                      active
                        ? "bg-[#f0efee] dark:bg-[#21262d] text-[#171717] dark:text-[#f0f6fc]"
                        : "text-[#5d5854] dark:text-[#8b949e] hover:bg-[#f8f7f6] dark:hover:bg-[#1c202a] hover:text-[#171717] dark:hover:text-[#f0f6fc]"
                    } ${!isExpanded ? "justify-center px-2" : ""}`}
                    title={!isExpanded ? item.label : undefined}
                  >
                    <Icons8NavIcon
                      iconId={item.icon8Id}
                      active={active}
                      fallback={item.icon}
                      className="size-6 sm:size-[26px]"
                    />
                    {isExpanded && (
                      <span className="truncate animate-in fade-in duration-200">
                        {item.label}
                      </span>
                    )}
                    {active && isExpanded && (
                      <span className="ml-auto size-1.5 rounded-full bg-[#16804d] dark:bg-[#2ea043]" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Bottom: Settings, Theme Toggle & User Profile Bar */}
        <div className="p-3 border-t border-[#f0efee] dark:border-[#21262d] bg-[#faf9f8] dark:bg-[#161b22] shrink-0 space-y-1">
          {/* Theme Toggle Button */}
          <div className={!isExpanded ? "flex justify-center" : ""}>
            <ThemeToggle collapsed={!isExpanded} />
          </div>

          {/* Settings Link */}
          <Link
            href="/settings"
            onClick={handleNavClick}
            className={`flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-bold text-[#5d5854] dark:text-[#8b949e] hover:bg-white dark:hover:bg-[#1c202a] hover:text-[#171717] dark:hover:text-[#f0f6fc] hover:shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f4c81] dark:focus-visible:ring-[#388bfd] transition ${
              isLinkActive("/settings")
                ? "bg-[#f0efee] dark:bg-[#21262d] text-[#171717] dark:text-[#f0f6fc]"
                : ""
            } ${!isExpanded ? "justify-center px-2" : ""}`}
            title={!isExpanded ? "Settings" : undefined}
          >
            <Icons8NavIcon
              iconId="4511GGVppfIx"
              active={isLinkActive("/settings")}
              fallback={Settings}
              className="size-6 sm:size-[26px]"
            />
            {isExpanded && (
              <span className="animate-in fade-in duration-200">Settings</span>
            )}
          </Link>

          {isExpanded && session?.user && (
            <div className="mt-2 pt-2 border-t border-[#f0efee] dark:border-[#21262d] flex items-center justify-between gap-2 px-1 animate-in fade-in duration-200">
              <Link
                href={`/profile/${session.user.id}`}
                onClick={handleNavClick}
                className="flex items-center gap-2.5 min-w-0 group hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f4c81] dark:focus-visible:ring-[#388bfd] rounded-lg p-0.5 transition"
              >
                <img
                  src={userAvatar}
                  alt={session.user.name || "User"}
                  className="size-8 rounded-full object-cover border border-[#e8e6e3] dark:border-[#30363d] shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#171717] dark:text-[#f0f6fc] truncate group-hover:text-[#0f4c81] dark:group-hover:text-[#388bfd]">
                    {session.user.name}
                  </p>
                  <p className="text-[10px] text-[#77716b] dark:text-[#8b949e] truncate">View Profile</p>
                </div>
              </Link>
            </div>
          )}

          {!isExpanded && session?.user && (
            <div className="mt-2 pt-2 border-t border-[#f0efee] dark:border-[#21262d] flex items-center justify-center">
              <Link
                href={`/profile/${session.user.id}`}
                onClick={handleNavClick}
                title={session.user.name || "View Profile"}
                className="group hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f4c81] dark:focus-visible:ring-[#388bfd] rounded-full transition"
              >
                <img
                  src={userAvatar}
                  alt={session.user.name || "User"}
                  className="size-8 rounded-full object-cover border border-[#e8e6e3] dark:border-[#30363d]"
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
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            aria-hidden="true"
          />

          {/* Drawer Content */}
          <div
            className="relative flex flex-col w-72 sm:w-80 max-w-[85vw] bg-white dark:bg-[#161b22] h-full shadow-2xl border-r border-[#ded8d1] dark:border-[#30363d] z-10 animate-in slide-in-from-left duration-250"
            style={{
              paddingTop: "env(safe-area-inset-top, 0px)",
              paddingBottom: "max(0.75rem, env(safe-area-inset-bottom, 0px))",
            }}
          >
            {/* Header / User Profile Banner */}
            <div className="p-4 border-b border-[#f0efee] dark:border-[#21262d] bg-[#faf9f8] dark:bg-[#161b22] flex items-center justify-between">
              <Link href="/home" onClick={onCloseMobileDrawer} className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f4c81] dark:focus-visible:ring-[#388bfd] rounded">
                <img src="/logo.png" alt="MGN" className="h-8.5 w-auto object-contain" />
              </Link>
              <button
                type="button"
                onClick={onCloseMobileDrawer}
                className="p-1.5 rounded-xl text-[#77716b] dark:text-[#8b949e] hover:bg-[#efefef] dark:hover:bg-[#21262d] hover:text-[#171717] dark:hover:text-[#f0f6fc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f4c81] dark:focus-visible:ring-[#388bfd] transition cursor-pointer"
                aria-label="Close menu"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* User Profile Card if logged in */}
            {session?.user && (
              <div className="p-4 border-b border-[#f0efee] dark:border-[#21262d] bg-[#f8fafd] dark:bg-[#1c2128]">
                <Link
                  href={`/profile/${session.user.id}`}
                  onClick={onCloseMobileDrawer}
                  className="flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f4c81] dark:focus-visible:ring-[#388bfd] rounded-xl p-1"
                >
                  <img
                    src={userAvatar}
                    alt={session.user.name || "User"}
                    className="size-11 rounded-full object-cover border-2 border-white dark:border-[#30363d] shadow-xs shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-[#171717] dark:text-[#f0f6fc] truncate flex items-center gap-1">
                      {session.user.name}
                      <ShieldCheck className="size-3.5 text-[#16804d] dark:text-[#2ea043] shrink-0" />
                    </p>
                    <p className="text-[11px] text-[#5d5854] dark:text-[#8b949e] truncate">
                      {session.user.email}
                    </p>
                    <span className="inline-block text-[10px] font-bold text-[#0f4c81] dark:text-[#388bfd] mt-0.5">
                      View Profile →
                    </span>
                  </div>
                </Link>
              </div>
            )}

            {/* Scrollable Nav Items */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-5">
              {/* Learn Workspace Active Mode in Mobile Drawer */}
              {pathname?.startsWith("/learn") && (
                <div>
                  <div className="flex items-center justify-between px-3 mb-2">
                    <p className="text-[10px] font-extrabold uppercase text-[#0f4c81] dark:text-[#58a6ff]">
                      MGN Learn
                    </p>
                    <Link
                      href="/home"
                      onClick={onCloseMobileDrawer}
                      className="text-[10px] font-semibold text-[#77716b] dark:text-[#8b949e] hover:text-[#0f4c81] dark:hover:text-[#58a6ff] flex items-center gap-0.5"
                    >
                      <ChevronLeft className="size-3" /> Back to Main
                    </Link>
                  </div>
                  <nav className="space-y-1">
                    {visibleLearnItems.map((item) => {
                      const active =
                        item.href === "/learn"
                          ? pathname === "/learn" || pathname === "/learn/"
                          : pathname.startsWith(item.href);

                      return (
                        <Link
                          key={item.id}
                          href={item.href}
                          onClick={onCloseMobileDrawer}
                          className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f4c81] dark:focus-visible:ring-[#388bfd] ${
                            active
                              ? "bg-[#f0efee] dark:bg-[#21262d] text-[#171717] dark:text-[#f0f6fc]"
                              : "text-[#5d5854] dark:text-[#8b949e] hover:bg-[#f8f7f6] dark:hover:bg-[#1c202a] hover:text-[#171717] dark:hover:text-[#f0f6fc]"
                          }`}
                        >
                          <Icons8NavIcon
                            iconId={item.icon8Id}
                            active={active}
                            fallback={item.icon}
                            className="size-6"
                          />
                          <span className="truncate">{item.label}</span>
                          {active && (
                            <span className="ml-auto size-1.5 rounded-full bg-[#16804d] dark:bg-[#2ea043]" />
                          )}
                        </Link>
                      );
                    })}

                    <button
                      type="button"
                      onClick={() => {
                        onCloseMobileDrawer();
                        if (typeof window !== "undefined") {
                          window.dispatchEvent(new CustomEvent("open-mgn-ask-ai"));
                        }
                      }}
                      className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold text-[#0f4c81] dark:text-[#58a6ff] hover:bg-[#eef5fc] dark:hover:bg-[#1c2433] transition cursor-pointer"
                    >
                      <div className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-gradient-to-tr from-[#0f4c81] to-[#1769c2] text-white shadow-2xs">
                        <Sparkles className="size-3.5 text-amber-300" />
                      </div>
                      <span className="truncate">Ask Medical AI</span>
                    </button>
                  </nav>
                </div>
              )}

              {/* Additional Ecosystem Modules (Events, Camps, Research, Marketplace, etc.) */}
              <div>
                <p className="px-3 mb-2 text-[10px] font-bold uppercase text-[#9c958f] dark:text-[#8b949e]">
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
                        className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f4c81] dark:focus-visible:ring-[#388bfd] ${
                          active
                            ? "bg-[#f0efee] dark:bg-[#21262d] text-[#171717] dark:text-[#f0f6fc]"
                            : "text-[#5d5854] dark:text-[#8b949e] hover:bg-[#f8f7f6] dark:hover:bg-[#1c202a] hover:text-[#171717] dark:hover:text-[#f0f6fc]"
                        }`}
                      >
                        <Icons8NavIcon
                          iconId={item.icon8Id}
                          active={active}
                          fallback={item.icon}
                          className="size-6"
                        />
                        <span className="truncate">{item.label}</span>
                        {item.badge && !active && (
                          <span className="ml-auto rounded-full bg-[#f0efee] dark:bg-[#21262d] border border-[#e8e6e3] dark:border-[#30363d] px-1.5 py-0.2 text-[9px] font-bold text-[#77716b] dark:text-[#8b949e]">
                            {item.badge}
                          </span>
                        )}
                        {active && (
                          <span className="ml-auto size-1.5 rounded-full bg-[#16804d] dark:bg-[#2ea043]" />
                        )}
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {/* Tools & Workspace */}
              <div>
                <p className="px-3 mb-2 text-[10px] font-bold uppercase text-[#9c958f] dark:text-[#8b949e]">
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
                        className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f4c81] dark:focus-visible:ring-[#388bfd] ${
                          active
                            ? "bg-[#f0efee] dark:bg-[#21262d] text-[#171717] dark:text-[#f0f6fc]"
                            : "text-[#5d5854] dark:text-[#8b949e] hover:bg-[#f8f7f6] dark:hover:bg-[#1c202a] hover:text-[#171717] dark:hover:text-[#f0f6fc]"
                        }`}
                      >
                        <Icons8NavIcon
                          iconId={item.icon8Id}
                          active={active}
                          fallback={item.icon}
                          className="size-6"
                        />
                        <span className="truncate">{item.label}</span>
                        {active && (
                          <span className="ml-auto size-1.5 rounded-full bg-[#16804d] dark:bg-[#2ea043]" />
                        )}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-3 border-t border-[#f0efee] dark:border-[#21262d] bg-[#faf9f8] dark:bg-[#161b22] space-y-1">
              <ThemeToggle collapsed={false} />

              {isSuperAdminUser(session?.user) && (
                <Link
                  href="/admin"
                  onClick={onCloseMobileDrawer}
                  className="flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-bold text-[#0f4c81] dark:text-[#58a6ff] bg-[#eef5fc] dark:bg-[#1f2d42] hover:bg-[#dbeafe] dark:hover:bg-[#263852] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f4c81] transition"
                >
                  <Icons8NavIcon
                    iconId="vy6OvJYHSJ8I"
                    active={isLinkActive("/admin")}
                    fallback={ShieldCheck}
                    className="size-6 text-[#0f4c81] dark:text-[#58a6ff]"
                  />
                  <span>Admin Console</span>
                </Link>
              )}

              <Link
                href="/settings"
                onClick={onCloseMobileDrawer}
                className="flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-bold text-[#5d5854] dark:text-[#8b949e] hover:bg-white dark:hover:bg-[#1c202a] hover:text-[#171717] dark:hover:text-[#f0f6fc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f4c81] dark:focus-visible:ring-[#388bfd] transition"
              >
                <Icons8NavIcon
                  iconId="4511GGVppfIx"
                  active={isLinkActive("/settings")}
                  fallback={Settings}
                  className="size-6"
                />
                <span>Account Settings</span>
              </Link>
              <button
                type="button"
                onClick={() => {
                  onCloseMobileDrawer();
                  signOutUser("/login");
                }}
                className="w-full flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 transition cursor-pointer"
              >
                <Icons8NavIcon
                  iconId="Q1xkcFuVON39"
                  active={false}
                  fallback={LogOut}
                  className="size-6"
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
