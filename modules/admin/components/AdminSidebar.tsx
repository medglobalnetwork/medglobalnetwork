"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  AlertTriangle,
  GraduationCap,
  Briefcase,
  Calendar,
  Tent,
  FlaskConical,
  Share2,
  BarChart3,
  ScrollText,
  Settings,
  ArrowLeft,
  Sparkles,
  MessageSquare,
  HardDrive,
  LogOut,
} from "lucide-react";
import { AdminIcon } from "./AdminIcon";
import { signOutUser } from "@/lib/auth-client";

interface AdminSidebarProps {
  badgeCounts?: {
    pendingVerification?: number;
    flaggedReports?: number;
    pendingJobs?: number;
  };
  isOpen?: boolean;
  onClose?: () => void;
}

interface AdminNavItem {
  name: string;
  href: string;
  icon: any;
  icons8Id?: string;
  exact?: boolean;
  badge?: string;
  badgeColor?: string;
}

interface AdminNavGroup {
  title: string;
  items: AdminNavItem[];
}

export function AdminSidebar({ badgeCounts = {}, isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  const navigationGroups: AdminNavGroup[] = [
    {
      title: "Core Control Plane",
      items: [
        {
          name: "Dashboard",
          href: "/admin",
          icon: LayoutDashboard,
          icons8Id: "i6fZC6wuprSu",
          exact: true,
        },
        {
          name: "Users & Profiles",
          href: "/admin/users",
          icon: Users,
          icons8Id: "zxB19VPoVLjK",
        },
        {
          name: "User File Manager",
          href: "/admin/files",
          icon: HardDrive,
          icons8Id: "FnCSMZbfR6RU",
        },
        {
          name: "Doctor Verification",
          href: "/admin/verification",
          icon: ShieldCheck,
          icons8Id: "vy6OvJYHSJ8I",
          badge: badgeCounts.pendingVerification ? `${badgeCounts.pendingVerification}` : undefined,
          badgeColor: "amber",
        },
        {
          name: "Moderation & Safety",
          href: "/admin/moderation",
          icon: AlertTriangle,
          icons8Id: "0XwEi0yisdO8",
          badge: badgeCounts.flaggedReports ? `${badgeCounts.flaggedReports}` : undefined,
          badgeColor: "rose",
        },
      ],
    },
    {
      title: "Modules & Operations",
      items: [
        {
          name: "Learn & LMS",
          href: "/admin/learn",
          icon: GraduationCap,
          icons8Id: "AvANlXOxUB6Z",
        },
        {
          name: "Opportunities & Jobs",
          href: "/admin/opportunities",
          icon: Briefcase,
          icons8Id: "IOkzpfWnUztj",
          badge: badgeCounts.pendingJobs ? `${badgeCounts.pendingJobs}` : undefined,
          badgeColor: "blue",
        },
        {
          name: "Events & CME",
          href: "/admin/events",
          icon: Calendar,
          icons8Id: "vwGXRtPWrZSn",
        },
        {
          name: "Medical Camps",
          href: "/admin/camps",
          icon: Tent,
          icons8Id: "HBLTBJiOS1vp",
        },
        {
          name: "Research & Trials",
          href: "/admin/research",
          icon: FlaskConical,
          icons8Id: "9ZmP1ylpYlqn",
        },
        {
          name: "Network & Feed",
          href: "/admin/network",
          icon: Share2,
          icons8Id: "YzsadpdsoN8e",
        },
        {
          name: "Suggestion Engine",
          href: "/admin/recommendations",
          icon: Sparkles,
          icons8Id: "YxCw7An8DYqf",
        },
        {
          name: "Communication Engine",
          href: "/admin/communication",
          icon: MessageSquare,
          icons8Id: "d7iUgF8ZrDaO",
        },
      ],
    },
    {
      title: "Governance & Intelligence",
      items: [
        {
          name: "Platform Analytics",
          href: "/admin/analytics",
          icon: BarChart3,
        },
        {
          name: "Audit Logs",
          href: "/admin/audit-logs",
          icon: ScrollText,
        },
        {
          name: "Settings & RBAC",
          href: "/admin/settings",
          icon: Settings,
          icons8Id: "4511GGVppfIx",
        },
      ],
    },
  ];

  const isLinkActive = (href: string, exact = false) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white text-slate-800 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-200/90 px-5 bg-white">
          <div className="flex items-center gap-3">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 font-black text-white shadow-sm shadow-blue-500/25">
              <span className="text-xs tracking-wider font-extrabold">MGN</span>
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold tracking-tight text-slate-900">MGN Admin</span>
                <span className="rounded-md border border-blue-200 bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold text-blue-700">
                  v2.0
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Control Plane</p>
            </div>
          </div>

          <Link
            href="/home"
            className="flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-xs font-semibold text-slate-600 hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900 transition-all shadow-2xs"
            title="Exit Admin Console"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>App</span>
          </Link>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 scrollbar-thin scrollbar-thumb-slate-200">
          {navigationGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="mb-6">
              <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {group.title}
              </div>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const active = isLinkActive(item.href, item.exact);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={`group flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-150 ${
                        active
                          ? "bg-blue-600 text-white shadow-sm shadow-blue-600/25 font-bold"
                          : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`flex size-7 shrink-0 items-center justify-center rounded-lg transition-colors ${
                            active
                              ? "bg-white/15 text-white"
                              : "bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600"
                          }`}
                        >
                          <AdminIcon
                            iconId={item.icons8Id}
                            fallback={Icon}
                            active={active}
                            className="size-4"
                            activeColorWhite={true}
                          />
                        </div>
                        <span className="truncate">{item.name}</span>
                      </div>

                      {item.badge && (
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold shrink-0 ${
                            active
                              ? "bg-white/25 text-white"
                              : item.badgeColor === "rose"
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : item.badgeColor === "amber"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-blue-50 text-blue-700 border border-blue-200"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Admin Info & Sign Out */}
        <div className="border-t border-slate-200 bg-slate-50/80 p-3.5 space-y-2">
          <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[11px] font-bold text-slate-800">Live Secure Gateway</span>
            </div>
            <p className="mt-1 text-[10px] text-slate-500 leading-relaxed">
              Session secured with Server-Side RBAC & immutable audit trail.
            </p>
          </div>

          <button
            type="button"
            onClick={() => signOutUser("/login")}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50/80 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 transition-colors shadow-2xs cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out of Admin</span>
          </button>
        </div>
      </aside>
    </>
  );
}
