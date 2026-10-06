"use client";

import React, { useState } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";
import {
  Search,
  Users,
  ShieldCheck,
  GraduationCap,
  Briefcase,
  X,
  MessageSquare,
  HardDrive,
  Calendar,
  Tent,
  FlaskConical,
  Share2,
  Sparkles,
  BarChart3,
  ScrollText,
  Settings,
  Megaphone,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { AdminIcon } from "./AdminIcon";

interface AdminShellProps {
  children: React.ReactNode;
}

export function AdminShell({ children }: AdminShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
      if (e.key === "Escape" && searchOpen) {
        setSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchOpen]);

  const quickLinks = [
    { title: "Manage Clinicians & Users", path: "/admin/users", icon: Users, icons8Id: "zxB19VPoVLjK", desc: "Search directory, edit accounts, suspend" },
    { title: "User Data File Manager", path: "/admin/files", icon: HardDrive, icons8Id: "FnCSMZbfR6RU", desc: "Explore users as folders with their uploads, texts, posts, and documents" },
    { title: "Doctor Verification Queue", path: "/admin/verification", icon: ShieldCheck, icons8Id: "vy6OvJYHSJ8I", desc: "Review council numbers, degree certificates, KYC dossiers" },
    { title: "Course & Quiz Catalogue", path: "/admin/learn", icon: GraduationCap, icons8Id: "AvANlXOxUB6Z", desc: "Publish clinical courses, manage masterclasses" },
    { title: "Job Postings & Recruiters", path: "/admin/opportunities", icon: Briefcase, icons8Id: "IOkzpfWnUztj", desc: "Verify healthcare organizations, review job applications" },
    { title: "Events & CME Conferences", path: "/admin/events", icon: Calendar, icons8Id: "vwGXRtPWrZSn", desc: "Approve medical conferences, workshops, and webinars" },
    { title: "Medical Camps & Outreach", path: "/admin/camps", icon: Tent, icons8Id: "HBLTBJiOS1vp", desc: "Review screening camps, volunteers, and audit reports" },
    { title: "Clinical Research & Trials", path: "/admin/research", icon: FlaskConical, icons8Id: "9ZmP1ylpYlqn", desc: "Moderate clinical studies and multi-center trials" },
    { title: "Network & Specialty Feeds", path: "/admin/network", icon: Share2, icons8Id: "YzsadpdsoN8e", desc: "Supervise clinical case discussions and doctor groups" },
    { title: "Suggestion & Match Engine", path: "/admin/recommendations", icon: Sparkles, icons8Id: "YxCw7An8DYqf", desc: "Tune ranking weights, diversity knobs, and candidate sources" },
    { title: "Ads & Sponsored Campaigns", path: "/admin/ads", icon: Megaphone, desc: "Create, target, and monitor sponsored banners and promoted content" },
    { title: "Communication Engine & Moderation", path: "/admin/communication", icon: MessageSquare, icons8Id: "d7iUgF8ZrDaO", desc: "Manage contextual channels, calls, reports, and message audit logs" },
    { title: "Platform Analytics & Growth", path: "/admin/analytics", icon: BarChart3, desc: "Track registration funnels, conversion rates, and engagement" },
    { title: "Audit Trail & Activity Logs", path: "/admin/audit-logs", icon: ScrollText, desc: "Inspect immutable admin activity stream and compliance logs" },
    { title: "System Settings & RBAC", path: "/admin/settings", icon: Settings, icons8Id: "4511GGVppfIx", desc: "Feature flags, safety rules, and role assignments" },
  ];

  const filteredLinks = quickLinks.filter(
    (l) =>
      l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex min-h-dvh bg-slate-50 font-sans text-slate-900 antialiased selection:bg-blue-600 selection:text-white">
      {/* Sidebar Navigation */}
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0">
        <AdminHeader
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          onOpenSearch={() => setSearchOpen(true)}
        />

        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Global Quick Search Modal (⌘K) */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setSearchOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl ring-1 ring-slate-900/5 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <Search className="size-5 text-slate-400 shrink-0" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type a command, section, or entity..."
                className="w-full bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="mt-3 space-y-1 max-h-80 overflow-y-auto">
              <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Quick Navigation
              </p>
              {filteredLinks.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-500">
                  No matching admin destination
                </div>
              ) : (
                filteredLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.path}
                      type="button"
                      onClick={() => {
                        setSearchOpen(false);
                        router.push(item.path);
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs transition-colors hover:bg-slate-50 text-slate-700 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    >
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 border border-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <AdminIcon
                          iconId={item.icons8Id}
                          fallback={Icon}
                          className="size-4"
                          activeColorWhite={true}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                          {item.title}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">{item.desc}</p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
