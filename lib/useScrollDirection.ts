"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Custom hook that tracks window scroll direction.
 * Returns `hidden = true` when scrolling down (past threshold),
 * and `hidden = false` when scrolling up or near the top of the page.
 * Creates an immersive full-screen reading experience on mobile.
 */
export function useScrollDirection(threshold = 10) {
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    // Initialize current Y
    lastY.current = typeof window !== "undefined" ? window.scrollY : 0;

    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;

      requestAnimationFrame(() => {
        const y = Math.max(0, window.scrollY);
        const diff = y - lastY.current;

        // When near the top of the page (within 40px), always show headers & nav
        if (y <= 40) {
          setHidden(false);
          lastY.current = y;
          ticking.current = false;
          return;
        }

        // Check if delta exceeds threshold to avoid jitter on small micro-scrolls
        if (Math.abs(diff) >= threshold) {
          // diff > 0 means scrolling DOWN -> hide navigation to enter full screen
          // diff < 0 means scrolling UP -> show navigation immediately
          setHidden(diff > 0);
          lastY.current = y;
        }

        ticking.current = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  return hidden;
}
