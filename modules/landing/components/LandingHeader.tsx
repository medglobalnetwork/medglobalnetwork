"use client";

import * as React from "react";
import Link from "next/link";
import {
  Menu,
  X,
  Home,
  Sparkles,
  Users,
  ShieldCheck,
  Smartphone,
  ArrowRight,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import UserMenu from "@/components/UserMenu";
import { scrollToTarget } from "@/components/SmoothScroll";

interface LandingHeaderProps {
  onOpenAuth?: (mode?: "signin" | "signup") => void;
}

export function LandingHeader({ onOpenAuth }: LandingHeaderProps) {
  const { data: session, isPending } = authClient.useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState<boolean>(false);
  const [isScrolled, setIsScrolled] = React.useState<boolean>(false);

  const isLoggedIn = !isPending && Boolean(session?.user);

  React.useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 15;
      setIsScrolled((prev) => (prev !== scrolled ? scrolled : prev));
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      scrollToTarget(element, -76);
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 dark:bg-[#0b0f17]/95 backdrop-blur-md shadow-xs py-3 border-b border-slate-200/80 dark:border-slate-800"
          : "bg-gradient-to-b from-black/75 via-black/40 to-transparent py-4 text-white"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <img
            src="/logo.png"
            alt="MGN Logo"
            className="h-9 sm:h-10 w-auto object-contain transition-transform group-hover:scale-105"
          />
          <span
            className={`text-2xl sm:text-[26px] font-black tracking-tight transition-colors ${
              isScrolled
                ? "text-[#0c2b4e] dark:text-[#58a6ff]"
                : "text-white drop-shadow-xs"
            }`}
          >
            MGN
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav
          className={`hidden md:flex items-center gap-6 lg:gap-8 text-[14px] font-semibold transition-colors ${
            isScrolled
              ? "text-[#4b5563] dark:text-[#9ca3af]"
              : "text-white/90 drop-shadow-xs"
          }`}
        >
          <button
            type="button"
            onClick={() => scrollToSection("features")}
            className={`transition cursor-pointer ${
              isScrolled
                ? "hover:text-[#0c2b4e] dark:hover:text-[#58a6ff]"
                : "hover:text-white"
            }`}
          >
            Features
          </button>
          <button
            type="button"
            onClick={() => scrollToSection("verification")}
            className={`transition cursor-pointer ${
              isScrolled
                ? "hover:text-[#0c2b4e] dark:hover:text-[#58a6ff]"
                : "hover:text-white"
            }`}
          >
            Verification
          </button>
          <button
            type="button"
            onClick={() => scrollToSection("audience")}
            className={`transition cursor-pointer ${
              isScrolled
                ? "hover:text-[#0c2b4e] dark:hover:text-[#58a6ff]"
                : "hover:text-white"
            }`}
          >
            Who It&apos;s For
          </button>
          <button
            type="button"
            onClick={() => scrollToSection("mobile-app")}
            className={`transition cursor-pointer ${
              isScrolled
                ? "hover:text-[#0c2b4e] dark:hover:text-[#58a6ff]"
                : "hover:text-white"
            }`}
          >
            Mobile App
          </button>
        </nav>

        {/* Action Buttons */}
        <div className="hidden sm:flex items-center gap-3">
          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              <Link
                href="/home"
                className="inline-flex items-center gap-2 rounded-lg bg-[#0c2b4e] hover:bg-[#081d36] text-white px-5 py-2 text-xs sm:text-sm font-bold shadow-xs hover:shadow-sm transition-all"
              >
                <span>Dashboard</span>
                <ArrowRight className="size-3.5" />
              </Link>
              <UserMenu />
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => (onOpenAuth ? onOpenAuth("signin") : (window.location.href = "/login"))}
                className={`rounded-lg px-4.5 py-2 text-xs sm:text-sm font-bold transition-all cursor-pointer border ${
                  isScrolled
                    ? "border-slate-300 dark:border-slate-700 hover:border-[#0c2b4e] dark:hover:border-[#58a6ff] text-[#0c2b4e] dark:text-[#58a6ff] bg-white dark:bg-[#161b22]"
                    : "border-white/40 text-white hover:bg-white/20 bg-white/10 backdrop-blur-xs"
                }`}
              >
                Sign In
              </button>

              <button
                type="button"
                onClick={() => (onOpenAuth ? onOpenAuth("signup") : (window.location.href = "/signup"))}
                className="rounded-lg bg-[#0c2b4e] hover:bg-[#081d36] text-white px-5 py-2 text-xs sm:text-sm font-bold shadow-xs hover:shadow-sm transition-all cursor-pointer"
              >
                Join Network Free
              </button>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex md:hidden items-center gap-2">
          {isLoggedIn && <UserMenu />}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`p-2 rounded-lg focus:outline-hidden ${
              isScrolled
                ? "text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white"
                : "text-white hover:text-white/80"
            }`}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/98 dark:bg-[#0b0f17]/98 border-b border-slate-200 dark:border-slate-800 px-5 pt-3 pb-6 space-y-3 shadow-xl backdrop-blur-md">
          <div className="space-y-1 text-sm font-semibold text-slate-800 dark:text-slate-200">
            <button
              type="button"
              onClick={() => scrollToSection("features")}
              className="w-full text-left py-2.5 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5"
            >
              <Sparkles className="size-4 text-[#0c2b4e] dark:text-[#58a6ff]" />
              <span>Features</span>
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("verification")}
              className="w-full text-left py-2.5 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5"
            >
              <ShieldCheck className="size-4 text-[#16804d] dark:text-emerald-400" />
              <span>Verification</span>
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("audience")}
              className="w-full text-left py-2.5 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5"
            >
              <Users className="size-4 text-[#0c2b4e] dark:text-[#58a6ff]" />
              <span>Who It&apos;s For</span>
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("mobile-app")}
              className="w-full text-left py-2.5 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5"
            >
              <Smartphone className="size-4 text-[#0c2b4e] dark:text-[#58a6ff]" />
              <span>Mobile App</span>
            </button>
          </div>

          {!isLoggedIn && (
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth ? onOpenAuth("signin") : (window.location.href = "/login");
                }}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 text-[#0c2b4e] dark:text-[#58a6ff] py-2.5 text-center text-sm font-bold"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth ? onOpenAuth("signup") : (window.location.href = "/signup");
                }}
                className="w-full rounded-lg bg-[#0c2b4e] text-white py-2.5 text-center text-sm font-bold shadow-xs"
              >
                Join Network Free
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
