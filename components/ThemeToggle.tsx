"use client";

import * as React from "react";
import { Moon, Sun, Laptop } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

interface ThemeToggleProps {
  collapsed?: boolean;
  className?: string;
}

export function ThemeToggle({ collapsed = false, className = "" }: ThemeToggleProps) {
  const { theme, resolvedTheme, toggleTheme, setTheme } = useTheme();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isDark = resolvedTheme === "dark";

  if (collapsed) {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className={`p-2 rounded-xl text-[#77716b] dark:text-[#9ca3af] hover:bg-[#f0efee] dark:hover:bg-[#1e2330] hover:text-[#171717] dark:hover:text-[#f3f4f6] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f4c81] dark:focus-visible:ring-[#388bfd] flex items-center justify-center ${className}`}
        title={`Switch to ${isDark ? "Light" : "Dark"} mode (Current: ${theme})`}
        aria-label="Toggle theme"
      >
        {isDark ? (
          <Sun className="size-5 text-amber-400 hover:rotate-45 transition-transform duration-300" />
        ) : (
          <Moon className="size-5 text-[#5d5854] hover:-rotate-12 transition-transform duration-300" />
        )}
      </button>
    );
  }

  return (
    <div ref={menuRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={toggleTheme}
        className="w-full flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-xs font-bold text-[#5d5854] dark:text-[#9ca3af] hover:bg-white dark:hover:bg-[#1c202a] hover:text-[#171717] dark:hover:text-[#f3f4f6] hover:shadow-2xs transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f4c81] dark:focus-visible:ring-[#388bfd] group cursor-pointer border border-transparent dark:border-[#262b35]/40"
        title="Toggle dark/light theme"
      >
        <div className="flex items-center gap-3">
          {isDark ? (
            <div className="size-6 flex items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 shrink-0">
              <Sun className="size-4" />
            </div>
          ) : (
            <div className="size-6 flex items-center justify-center rounded-lg bg-[#f0efee] text-[#5d5854] group-hover:text-[#171717] shrink-0">
              <Moon className="size-4" />
            </div>
          )}
          <span className="truncate">Theme</span>
        </div>

        <span className="rounded-full bg-[#f0efee] dark:bg-[#262b35] border border-[#e8e6e3] dark:border-[#30363d] px-2 py-0.5 text-[10px] font-bold text-[#77716b] dark:text-[#9ca3af] capitalize group-hover:border-[#0f4c81]/30 dark:group-hover:border-[#388bfd]/40 transition-colors">
          {theme === "system" ? "Auto" : isDark ? "Dark" : "Light"}
        </span>
      </button>
    </div>
  );
}
