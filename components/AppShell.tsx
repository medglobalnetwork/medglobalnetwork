"use client";

import React, { useState, useCallback, useEffect } from "react";
import { usePathname } from "next/navigation";
import { AppSidebar } from "@/components/AppSidebar";
import AppHeader from "@/components/AppHeader";
import AppBottomNav from "@/components/AppBottomNav";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const isMessagesPage = pathname?.startsWith("/messages");
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  // Default to auto-hide (collapsed at rest, expands on hover)
  const [isCollapsed, setIsCollapsed] = useState(true);

  // Restore user pin preference on client mount if previously set
  useEffect(() => {
    try {
      const saved = localStorage.getItem("mgn_sidebar_pinned");
      if (saved !== null) {
        setIsCollapsed(saved !== "true");
      }
    } catch {
      // ignore storage access errors
    }
  }, []);

  const handleOpenMobileDrawer = useCallback(() => {
    setIsMobileDrawerOpen(true);
  }, []);

  const handleCloseMobileDrawer = useCallback(() => {
    setIsMobileDrawerOpen(false);
  }, []);

  const handleToggleCollapse = useCallback(() => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("mgn_sidebar_pinned", String(!next));
      } catch {
        // ignore storage access errors
      }
      return next;
    });
  }, []);

  return (
    <div className="min-h-dvh bg-[#faf9f8] flex">
      {/* 1. SIDEBAR (Desktop fixed side-nav + Mobile slide-over drawer) */}
      <AppSidebar
        isMobileDrawerOpen={isMobileDrawerOpen}
        onCloseMobileDrawer={handleCloseMobileDrawer}
        isCollapsed={isCollapsed}
        onToggleCollapse={handleToggleCollapse}
      />

      {/* 2. MAIN CONTENT WRAPPER */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          isCollapsed ? "md:pl-20" : "md:pl-60 lg:pl-64"
        }`}
      >
        {/* Top Header with Hamburger trigger for mobile and clean search/actions for desktop */}
        <AppHeader onOpenMobileDrawer={handleOpenMobileDrawer} />

        {/* Page Content */}
        <main className={`flex-1 ${isMessagesPage ? "pb-0 overflow-hidden" : "pb-20 md:pb-6"}`}>
          {children}
        </main>

        {/* Bottom Nav (Mobile only, exactly 4 core tabs: Home, Network, Learn, Opportunities) */}
        {!isMessagesPage && <AppBottomNav />}
      </div>
    </div>
  );
}

export default AppShell;
