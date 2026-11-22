"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

let activeLenis: Lenis | null = null;

export function scrollToTarget(target: string | HTMLElement, offset = -76) {
  if (activeLenis) {
    activeLenis.scrollTo(target, { offset, duration: 1.0 });
  } else if (typeof window !== "undefined") {
    const el =
      typeof target === "string"
        ? (document.querySelector(target) as HTMLElement | null)
        : target;
    if (el) {
      const top = el.getBoundingClientRect().top + window.pageYOffset + offset;
      window.scrollTo({ top, behavior: "smooth" });
    }
  }
}

export function SmoothScroll() {
  const pathname = usePathname();
  // ONLY run smooth momentum scrolling on public landing pages.
  // Dashboard & app routes (/home, /learn, /network, etc.) require standard native scrolling
  // so nested sidebars, feeds, and dropdowns scroll freely without wheel hijacking.
  const isMarketingPage = pathname === "/" || pathname === "/about";

  React.useEffect(() => {
    if (typeof window === "undefined" || !isMarketingPage) {
      if (activeLenis) {
        activeLenis.destroy();
        activeLenis = null;
      }
      return;
    }

    // Initialize Lenis for 60/120fps buttery smooth momentum scroll
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Exponential deceleration
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.2,
      infinite: false,
    });

    activeLenis = lenis;

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);

    // Intercept in-page anchor links and use Lenis smooth scrollTo with navbar offset
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (!href || !href.startsWith("#") || href === "#") return;

      const targetId = href.slice(1);
      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        e.preventDefault();
        lenis.scrollTo(targetElement, {
          offset: -76, // 76px navbar height offset
          duration: 1.0,
        });

        if (window.history.pushState) {
          window.history.pushState(null, "", href);
        }
      }
    };

    document.addEventListener("click", handleAnchorClick, { capture: true });

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener("click", handleAnchorClick, { capture: true });
      lenis.destroy();
      activeLenis = null;
    };
  }, [isMarketingPage]);

  return null;
}

