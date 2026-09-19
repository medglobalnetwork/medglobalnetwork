"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Returns "up" | "down".
 * Hides after scrolling down `threshold` px, shows instantly on scroll up.
 */
export function useScrollDirection(threshold = 10) {
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        if (Math.abs(y - lastY.current) < threshold) {
          ticking.current = false;
          return;
        }
        setHidden(y > lastY.current && y > 60);
        lastY.current = y;
        ticking.current = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  return hidden;
}
