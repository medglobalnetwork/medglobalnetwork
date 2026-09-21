"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  Bell,
  Search,
  Shield,
  LogOut,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

interface AdminHeaderProps {
  onToggleSidebar: () => void;
  onOpenSearch?: () => void;
}

export function AdminHeader({ onToggleSidebar, onOpenSearch }: AdminHeaderProps) {
  const pathname = usePathname();
  const { data: session } = authClient.useSession();

  const getBreadcrumbs = () => {
    const parts = pathname.split("/").filter(Boolean);
    if (parts.length === 1 && parts[0] === "admin") {
      return [{ name: "Dashboard", href: "/admin" }];
    }
    return parts.map((part, index) => {
      const href = "/" + parts.slice(0, index + 1).join("/");
      const name =
        part === "admin"
          ? "Admin"
          : part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, " ");
      return { name, href };
    });
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-800 bg-slate-950/80 px-4 sm:px-6 backdrop-blur-md">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-400 hover:text-white lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Breadcrumbs */}
        <nav className="hidden items-center gap-1.5 text-xs text-slate-400 sm:flex">
          {breadcrumbs.map((bc, idx) => (
            <React.Fragment key={bc.href}>
              {idx > 0 && <ChevronRight className="h-3 w-3 text-slate-600" />}
              {idx === breadcrumbs.length - 1 ? (
                <span className="font-semibold text-white">{bc.name}</span>
              ) : (
                <Link
                  href={bc.href}
                  className="hover:text-slate-200 transition-colors"
                >
                  {bc.name}
                </Link>
              )}
            </React.Fragment>
          ))}
        </nav>
      </div>

      {/* Center: Quick Search Trigger */}
      <div className="flex-1 max-w-md px-4 hidden md:block">
        <button
          type="button"
          onClick={onOpenSearch}
          className="flex h-9 w-full items-center justify-between rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 text-xs text-slate-400 hover:border-slate-700 hover:text-slate-300 transition-all"
        >
          <div className="flex items-center gap-2">
            <Search className="h-3.5 w-3.5 text-slate-500" />
            <span>Search users, council numbers, courses, jobs...</span>
          </div>
          <kbd className="hidden rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 lg:inline-block">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: Identity & Role Badge */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/90 px-3 py-1 text-xs">
          <Shield className="h-3.5 w-3.5 text-blue-400" />
          <span className="font-semibold text-slate-200">Super Admin</span>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
        </div>

        <div className="flex items-center gap-2">
          {session?.user?.image ? (
            <img
              src={session.user.image}
              alt={session.user.name || "Admin"}
              className="h-8 w-8 rounded-full border border-slate-700 object-cover ring-2 ring-blue-500/20"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 font-bold text-xs text-white ring-2 ring-blue-500/20">
              {session?.user?.name?.[0]?.toUpperCase() || session?.user?.email?.[0]?.toUpperCase() || "A"}
            </div>
          )}

          <div className="hidden text-left xl:block">
            <p className="text-xs font-semibold text-white leading-tight">
              {session?.user?.name || "Platform Admin"}
            </p>
            <p className="text-[10px] text-slate-400 leading-tight">
              {session?.user?.email || "admin@mgn.life"}
            </p>
          </div>
        </div>

        <Link
          href="/home"
          className="flex h-9 items-center gap-1.5 rounded-xl bg-blue-600 px-3 text-xs font-semibold text-white shadow-xs hover:bg-blue-500 transition-colors"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Main App</span>
        </Link>
      </div>
    </header>
  );
}
