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
  ChevronRight,
  Sparkles,
  Layers,
  MessageSquare,
} from "lucide-react";

interface AdminSidebarProps {
  badgeCounts?: {
    pendingVerification?: number;
    flaggedReports?: number;
    pendingJobs?: number;
  };
  isOpen?: boolean;
  onClose?: () => void;
}

export function AdminSidebar({ badgeCounts = {}, isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  const navigationGroups = [
    {
      title: "Core Control Plane",
      items: [
        {
          name: "Dashboard",
          href: "/admin",
          icon: LayoutDashboard,
          exact: true,
        },
        {
          name: "Users & Profiles",
          href: "/admin/users",
          icon: Users,
        },
        {
          name: "Doctor Verification",
          href: "/admin/verification",
          icon: ShieldCheck,
          badge: badgeCounts.pendingVerification ? `${badgeCounts.pendingVerification}` : undefined,
          badgeColor: "amber",
        },
        {
          name: "Moderation & Safety",
          href: "/admin/moderation",
          icon: AlertTriangle,
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
        },
        {
          name: "Opportunities & Jobs",
          href: "/admin/opportunities",
          icon: Briefcase,
          badge: badgeCounts.pendingJobs ? `${badgeCounts.pendingJobs}` : undefined,
          badgeColor: "blue",
        },
        {
          name: "Events & CME",
          href: "/admin/events",
          icon: Calendar,
        },
        {
          name: "Medical Camps",
          href: "/admin/camps",
          icon: Tent,
        },
        {
          name: "Research & Trials",
          href: "/admin/research",
          icon: FlaskConical,
        },
        {
          name: "Network & Feed",
          href: "/admin/network",
          icon: Share2,
        },
        {
          name: "Suggestion Engine",
          href: "/admin/recommendations",
          icon: Sparkles,
        },
        {
          name: "Communication Engine",
          href: "/admin/communication",
          icon: MessageSquare,
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
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-72 flex-col border-r border-slate-800/80 bg-slate-950 text-slate-200 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-800/80 px-5">
          <div className="flex items-center gap-3">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 font-black text-white shadow-md shadow-blue-500/20">
              <span className="text-sm tracking-wider">MGN</span>
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold tracking-tight text-white">MGN Admin</span>
                <span className="rounded bg-blue-500/20 px-1.5 py-0.2 text-[10px] font-semibold text-blue-400">
                  v2.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Control Plane</p>
            </div>
          </div>

          <Link
            href="/home"
            className="flex h-8 items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 px-2.5 text-xs font-medium text-slate-400 hover:border-slate-700 hover:text-white transition-colors"
            title="Exit Admin Console"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>App</span>
          </Link>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 scrollbar-thin scrollbar-thumb-slate-800">
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
                      className={`group flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition-all duration-150 ${
                        active
                          ? "bg-blue-600 text-white shadow-md shadow-blue-600/20 font-bold"
                          : "text-slate-300 hover:bg-slate-900/90 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`h-4 w-4 shrink-0 transition-colors ${
                            active ? "text-white" : "text-slate-400 group-hover:text-blue-400"
                          }`}
                        />
                        <span>{item.name}</span>
                      </div>

                      {item.badge && (
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            item.badgeColor === "rose"
                              ? "bg-rose-500/20 text-rose-300 ring-1 ring-rose-500/30"
                              : item.badgeColor === "amber"
                              ? "bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/30"
                              : "bg-blue-500/20 text-blue-300 ring-1 ring-blue-500/30"
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

        {/* Footer Admin Info */}
        <div className="border-t border-slate-800/80 p-3.5 bg-slate-950/60">
          <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-3">
            <div className="flex items-center gap-2.5">
              <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></div>
              <span className="text-[11px] font-medium text-slate-300">Live Secure Gateway</span>
            </div>
            <p className="mt-1 text-[10px] text-slate-400">
              Session secured with Server-Side RBAC & Audit Trail.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
