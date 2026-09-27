"use client";

import * as React from "react";

export type Theme = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = "mgn_theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<Theme>("light");
  const [resolvedTheme, setResolvedTheme] = React.useState<ResolvedTheme>("light");
  const [mounted, setMounted] = React.useState(false);

  // Helper to apply theme to document
  const applyTheme = React.useCallback((t: Theme) => {
    if (typeof window === "undefined") return;

    let target: ResolvedTheme = "light";
    if (t === "dark") {
      target = "dark";
    } else if (t === "light") {
      target = "light";
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      target = prefersDark ? "dark" : "light";
    }

    setResolvedTheme(target);

    if (target === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.style.colorScheme = "dark";
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.style.colorScheme = "light";
    }
  }, []);

  // Initialize theme from localStorage on mount
  React.useEffect(() => {
    setMounted(true);
    try {
      const savedTheme = (localStorage.getItem(THEME_STORAGE_KEY) as Theme) || "light";
      setThemeState(savedTheme);
      applyTheme(savedTheme);
    } catch {
      applyTheme("light");
    }

    // Media query listener for system preference change
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      const currentSaved = (localStorage.getItem(THEME_STORAGE_KEY) as Theme) || "light";
      if (currentSaved === "system") {
        applyTheme("system");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [applyTheme]);

  const setTheme = React.useCallback(
    (newTheme: Theme) => {
      setThemeState(newTheme);
      try {
        localStorage.setItem(THEME_STORAGE_KEY, newTheme);
      } catch {}
      applyTheme(newTheme);
    },
    [applyTheme]
  );

  const toggleTheme = React.useCallback(() => {
    const nextTheme = resolvedTheme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
  }, [resolvedTheme, setTheme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        resolvedTheme: mounted ? resolvedTheme : "light",
        setTheme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
