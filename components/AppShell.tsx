"use client";

import React, { useState } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import AppHeader from "@/components/AppHeader";
import AppBottomNav from "@/components/AppBottomNav";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[#faf9f8] flex">
      {/* 1. SIDEBAR (Desktop fixed side-nav + Mobile slide-over drawer) */}
      <AppSidebar
        isMobileDrawerOpen={isMobileDrawerOpen}
        onCloseMobileDrawer={() => setIsMobileDrawerOpen(false)}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed((prev) => !prev)}
      />

      {/* 2. MAIN CONTENT WRAPPER */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          isCollapsed ? "md:pl-20" : "md:pl-60 lg:pl-64"
        }`}
      >
        {/* Top Header with Hamburger trigger for mobile and clean search/actions for desktop */}
        <AppHeader onOpenMobileDrawer={() => setIsMobileDrawerOpen(true)} />

        {/* Page Content */}
        <main className="flex-1 pb-20 md:pb-6">{children}</main>

        {/* Bottom Nav (Mobile only, exactly 4 core tabs: Home, Network, Learn, Opportunities) */}
        <AppBottomNav />
      </div>
    </div>
  );
}

export default AppShell;
