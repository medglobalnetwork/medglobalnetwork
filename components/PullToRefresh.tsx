"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, ArrowDown, Loader2 } from "lucide-react";

interface PullToRefreshProps {
  children?: React.ReactNode;
  threshold?: number; // Distance in px needed to trigger refresh (default: 65)
  maxPull?: number; // Max pull distance in px (default: 120)
}

export function PullToRefresh({
  children,
  threshold = 65,
  maxPull = 110,
}: PullToRefreshProps) {
  const router = useRouter();
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [canPull, setCanPull] = useState(false);

  const startYRef = useRef(0);
  const startXRef = useRef(0);
  const isPullingRef = useRef(false);
  const isRefreshingRef = useRef(false);
  const pullDistanceRef = useRef(0);

  // Sync ref with state
  useEffect(() => {
    isRefreshingRef.current = isRefreshing;
  }, [isRefreshing]);

  const triggerRefresh = useCallback(() => {
    if (isRefreshingRef.current) return;

    setIsRefreshing(true);
    setPullDistance(50); // Keep pinned at 50px while refreshing

    // Haptic feedback if available on mobile
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(15);
      } catch {
        // ignore vibrate error
      }
    }

    // 1. Dispatch custom event for client components (Feed, Stories, Network, etc.)
    window.dispatchEvent(new CustomEvent("mgn-pull-to-refresh"));

    // 2. Refresh Next.js server components / routes
    router.refresh();

    // 3. Smooth animation finish
    setTimeout(() => {
      setIsRefreshing(false);
      setPullDistance(0);
      pullDistanceRef.current = 0;
      isPullingRef.current = false;
    }, 800);
  }, [router]);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1 || isRefreshingRef.current) return;

      // Only allow pull-down if we are scrolled to the absolute top of the page
      const scrollTop =
        window.scrollY ||
        document.documentElement.scrollTop ||
        document.body.scrollTop ||
        0;

      if (scrollTop <= 2) {
        startYRef.current = e.touches[0].clientY;
        startXRef.current = e.touches[0].clientX;
        isPullingRef.current = true;
        setCanPull(true);
      } else {
        isPullingRef.current = false;
        setCanPull(false);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPullingRef.current || e.touches.length !== 1 || isRefreshingRef.current) return;

      const currentY = e.touches[0].clientY;
      const currentX = e.touches[0].clientX;
      const diffY = currentY - startYRef.current;
      const diffX = currentX - startXRef.current;

      // Ensure gesture is primarily vertical downward
      if (diffY > 0 && Math.abs(diffY) > Math.abs(diffX) * 1.2) {
        const scrollTop =
          window.scrollY ||
          document.documentElement.scrollTop ||
          document.body.scrollTop ||
          0;

        if (scrollTop <= 2) {
          // Logarithmic damping for natural iOS/Android rubber-band resistance
          const dampedDistance = Math.min(
            maxPull,
            Math.pow(diffY, 0.85) * 1.5
          );

          pullDistanceRef.current = dampedDistance;
          setPullDistance(dampedDistance);

          // Prevent native overscroll / navigation behavior while actively pulling down
          if (diffY > 10 && e.cancelable) {
            e.preventDefault();
          }
        }
      } else if (diffY < 0) {
        // User is scrolling down the page normally
        isPullingRef.current = false;
        setPullDistance(0);
        pullDistanceRef.current = 0;
      }
    };

    const handleTouchEnd = () => {
      if (!isPullingRef.current || isRefreshingRef.current) return;
      isPullingRef.current = false;

      if (pullDistanceRef.current >= threshold) {
        triggerRefresh();
      } else {
        // Did not pull enough; spring back smoothly to 0
        setPullDistance(0);
        pullDistanceRef.current = 0;
      }
    };

    // Listen to touch events
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    window.addEventListener("touchcancel", handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, [threshold, maxPull, triggerRefresh]);

  const progress = Math.min(1, pullDistance / threshold);
  const isReady = pullDistance >= threshold;

  return (
    <>
      {/* Floating Pull to Refresh Indicator */}
      {(pullDistance > 0 || isRefreshing) && (
        <div
          className="fixed left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-all duration-150 ease-out"
          style={{
            top: `${Math.max(12, Math.min(80, pullDistance * 0.75 + 8))}px`,
            opacity: isRefreshing ? 1 : Math.max(0.2, progress),
            transform: `translateX(-50%) scale(${isRefreshing ? 1 : Math.min(1.1, 0.7 + progress * 0.35)})`,
          }}
        >
          <div className="flex items-center gap-2 rounded-full bg-white/95 backdrop-blur-md px-3.5 py-2 shadow-lg border border-[#ded8d1] text-[#171717]">
            {isRefreshing ? (
              <>
                <Loader2 className="size-4 animate-spin text-[#0f4c81]" />
                <span className="text-xs font-bold text-[#0f4c81]">Refreshing...</span>
              </>
            ) : isReady ? (
              <>
                <RefreshCw className="size-4 text-[#16804d] animate-pulse" />
                <span className="text-xs font-bold text-[#16804d]">Release to refresh</span>
              </>
            ) : (
              <>
                <ArrowDown
                  className="size-4 text-[#77716b] transition-transform duration-150"
                  style={{ transform: `rotate(${progress * 180}deg)` }}
                />
                <span className="text-xs font-medium text-[#77716b]">Pull down</span>
              </>
            )}
          </div>
        </div>
      )}

      {children}
    </>
  );
}
