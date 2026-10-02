"use client";

import React, { useState, useCallback, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AppSidebar } from "@/components/AppSidebar";
import AppHeader from "@/components/AppHeader";
import AppBottomNav from "@/components/AppBottomNav";
import AppSplashScreen from "@/components/AppSplashScreen";
import { PullToRefresh } from "@/components/PullToRefresh";
import PushToast from "@/components/PushToast";
import { IncomingCallListener } from "@/modules/communication/components/IncomingCallListener";
import { initNativeApp, syncPushToken } from "@/lib/native-mobile";
import { AskAIModal } from "@/modules/learn/components/AskAIModal";
import { AskAIContext } from "@/modules/learn/types";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isMessagesPage = pathname?.startsWith("/messages");
  const isStudyMode = pathname?.startsWith("/learn/lesson/");
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  // Default to auto-hide (collapsed at rest, expands on hover)
  const [isCollapsed, setIsCollapsed] = useState(true);

  // Global Ask AI Assistant State
  const [isAskAIOpen, setIsAskAIOpen] = useState(false);
  const [askAIContext, setAskAIContext] = useState<AskAIContext | undefined>(undefined);

  // Listen for global custom event to open Ask AI modal
  useEffect(() => {
    const handleOpenAskAI = (e: Event) => {
      const customEvent = e as CustomEvent<AskAIContext>;
      if (customEvent.detail) {
        setAskAIContext(customEvent.detail);
      }
      setIsAskAIOpen(true);
    };

    window.addEventListener("open-mgn-ask-ai", handleOpenAskAI);
    return () => window.removeEventListener("open-mgn-ask-ai", handleOpenAskAI);
  }, []);

  // Initialize native mobile features (Status bar color, hardware back button, native splash)
  useEffect(() => {
    initNativeApp(() => router.back());
  }, [router]);

  // Register this device for native push (FCM). Android only prompts once,
  // so re-running on every mount is cheap and self-healing after a token change.
  useEffect(() => {
    void syncPushToken();
  }, []);

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

  // Left edge swipe-to-open gesture (< 45px from left edge) and swipe-to-close
  useEffect(() => {
    let startX = 0;
    let startY = 0;
    let startTime = 0;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      startTime = Date.now();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.changedTouches.length !== 1) return;
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const deltaX = endX - startX;
      const deltaY = endY - startY;
      const deltaTime = Date.now() - startTime;

      // Only trigger on swift horizontal gestures (< 800ms, mostly horizontal)
      if (deltaTime > 800 || Math.abs(deltaY) > 80) return;

      // 1. Swipe right from left edge (0-45px) to open sidebar drawer
      if (!isMobileDrawerOpen && startX <= 45 && deltaX > 45) {
        setIsMobileDrawerOpen(true);
      }

      // 2. Swipe left to close drawer when open
      if (isMobileDrawerOpen && deltaX < -45) {
        setIsMobileDrawerOpen(false);
      }
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isMobileDrawerOpen]);

  return (
    <div className="min-h-dvh bg-[#faf9f8] dark:bg-[#0d1117] flex transition-colors duration-200">
      {/* Initial Startup Splash Screen with Pulsing Logo */}
      <AppSplashScreen />

      {/* Foreground pushes: tray handles these when the app is backgrounded */}
      <PushToast />

      {/* Incoming 1:1 calls — push driven, with a polling fallback */}
      <IncomingCallListener />

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

        {/* Page Content with Native-like Pull to Refresh on Mobile */}
        <main
          className={`flex-1 ${
            isMessagesPage || isStudyMode
              ? "pb-0 overflow-hidden"
              : "pb-20 md:pb-6"
          }`}
        >
          {isMessagesPage || isStudyMode ? children : <PullToRefresh>{children}</PullToRefresh>}
        </main>

        {/* Bottom Nav (Mobile only, hidden in study mode and messages) */}
        {!isMessagesPage && !isStudyMode && (
          <AppBottomNav onOpenAskAI={() => setIsAskAIOpen(true)} />
        )}
      </div>

      {/* Global Medical AI Assistant Modal */}
      <AskAIModal
        isOpen={isAskAIOpen}
        onClose={() => setIsAskAIOpen(false)}
        context={askAIContext}
      />
    </div>
  );
}

export default AppShell;
