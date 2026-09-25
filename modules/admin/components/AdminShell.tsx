"use client";

import React, { useState } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";
import { Search, Users, ShieldCheck, GraduationCap, Briefcase, FileText, X, MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";

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
    { title: "Manage Clinicians & Users", path: "/admin/users", icon: Users, desc: "Search directory, edit accounts, suspend" },
    { title: "Pending Doctor KYC Verifications", path: "/admin/verification", icon: ShieldCheck, desc: "Review council numbers, degree certificates" },
    { title: "Course & Quiz Catalogue", path: "/admin/learn", icon: GraduationCap, desc: "Publish courses, approve instructors" },
    { title: "Job Postings & Recruiters", path: "/admin/opportunities", icon: Briefcase, desc: "Verify organizations, review job applications" },
    { title: "Communication Engine & Moderation", path: "/admin/communication", icon: MessageSquare, desc: "Manage contextual channels, calls, reports, and message audit logs" },
    { title: "Audit Trail & Activity Logs", path: "/admin/audit-logs", icon: FileText, desc: "Inspect immutable admin activity stream" },
  ];

  const filteredLinks = quickLinks.filter(
    (l) =>
      l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex min-h-dvh bg-slate-950 font-sans text-slate-100 antialiased selection:bg-blue-600 selection:text-white">
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

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Global Quick Search Modal (⌘K) */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-2xl ring-1 ring-slate-700/50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <Search className="size-5 text-slate-400 shrink-0" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type a command, section, or entity..."
                className="w-full bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="mt-3 space-y-1 max-h-80 overflow-y-auto">
              <p className="px-2 py-1 text-[10px] font-bold uppercase text-slate-400">
                Quick Navigation
              </p>
              {filteredLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.path}
                    type="button"
                    onClick={() => {
                      setSearchOpen(false);
                      router.push(item.path);
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs transition-colors hover:bg-slate-800 text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    <div className="flex size-8 items-center justify-center rounded-lg bg-slate-800 text-blue-400">
                      <Icon className="size-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">{item.title}</p>
                      <p className="text-[11px] text-slate-400">{item.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
