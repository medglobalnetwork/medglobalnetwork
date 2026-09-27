"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, ArrowRight, Menu, X, LayoutDashboard } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import UserMenu from "@/components/UserMenu";
import { ThemeToggle } from "@/components/ThemeToggle";

interface LandingHeaderProps {
  onOpenAuth?: (mode?: "signin" | "signup") => void;
}

export function LandingHeader({ onOpenAuth }: LandingHeaderProps) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState<boolean>(false);
  const [activeDropdown, setActiveDropdown] = React.useState<string | null>(null);

  const isLoggedIn = !isPending && Boolean(session?.user);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    setActiveDropdown(null);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 dark:bg-[#0b0f17]/90 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* 1. Brand Logo */}
        <Link href="/" className="flex items-center group">
          <img
            src="/logo.png"
            alt="MGN Logo"
            className="h-10 sm:h-11 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
          />
        </Link>

        {/* 2. Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-7 text-[13.5px] font-medium text-[#4b5563] dark:text-[#9ca3af]">
          <Link
            href="/"
            className="text-[#0f4c81] dark:text-[#388bfd] font-semibold transition hover:text-[#0f4c81]"
          >
            Home
          </Link>

          <button
            type="button"
            onClick={() => scrollToSection("features")}
            className="hover:text-[#0f4c81] dark:hover:text-[#f0f6fc] transition cursor-pointer"
          >
            About Us
          </button>

          <button
            type="button"
            onClick={() => scrollToSection("features")}
            className="hover:text-[#0f4c81] dark:hover:text-[#f0f6fc] transition cursor-pointer"
          >
            Features
          </button>

          {/* For Professionals Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setActiveDropdown("professionals")}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button
              type="button"
              className="flex items-center gap-1 hover:text-[#0f4c81] dark:hover:text-[#f0f6fc] transition cursor-pointer"
            >
              <span>For Professionals</span>
              <ChevronDown className="size-3.5 opacity-70" />
            </button>
            {activeDropdown === "professionals" && (
              <div className="absolute top-full left-0 mt-1 w-56 rounded-2xl bg-white dark:bg-[#161b22] p-2 shadow-xl border border-[#ded8d1]/60 dark:border-[#30363d] animate-in fade-in slide-in-from-top-1">
                <Link
                  href="/signup"
                  className="block px-3 py-2 rounded-xl text-xs font-medium text-[#171717] dark:text-[#f0f6fc] hover:bg-[#f0efee] dark:hover:bg-[#21262d]"
                >
                  Doctor & Clinician Network
                </Link>
                <Link
                  href="/signup"
                  className="block px-3 py-2 rounded-xl text-xs font-medium text-[#171717] dark:text-[#f0f6fc] hover:bg-[#f0efee] dark:hover:bg-[#21262d]"
                >
                  Allied Health Specialists
                </Link>
                <Link
                  href="/signup"
                  className="block px-3 py-2 rounded-xl text-xs font-medium text-[#171717] dark:text-[#f0f6fc] hover:bg-[#f0efee] dark:hover:bg-[#21262d]"
                >
                  Nursing Community
                </Link>
                <Link
                  href="/signup"
                  className="block px-3 py-2 rounded-xl text-xs font-medium text-[#171717] dark:text-[#f0f6fc] hover:bg-[#f0efee] dark:hover:bg-[#21262d]"
                >
                  Medical Students & Residents
                </Link>
              </div>
            )}
          </div>

          {/* For Organizations Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setActiveDropdown("organizations")}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button
              type="button"
              className="flex items-center gap-1 hover:text-[#0f4c81] dark:hover:text-[#f0f6fc] transition cursor-pointer"
            >
              <span>For Organizations</span>
              <ChevronDown className="size-3.5 opacity-70" />
            </button>
            {activeDropdown === "organizations" && (
              <div className="absolute top-full left-0 mt-1 w-56 rounded-2xl bg-white dark:bg-[#161b22] p-2 shadow-xl border border-[#ded8d1]/60 dark:border-[#30363d] animate-in fade-in slide-in-from-top-1">
                <Link
                  href="/signup"
                  className="block px-3 py-2 rounded-xl text-xs font-medium text-[#171717] dark:text-[#f0f6fc] hover:bg-[#f0efee] dark:hover:bg-[#21262d]"
                >
                  Hospitals & Clinical Institutes
                </Link>
                <Link
                  href="/signup"
                  className="block px-3 py-2 rounded-xl text-xs font-medium text-[#171717] dark:text-[#f0f6fc] hover:bg-[#f0efee] dark:hover:bg-[#21262d]"
                >
                  Medical Colleges & Universities
                </Link>
                <Link
                  href="/signup"
                  className="block px-3 py-2 rounded-xl text-xs font-medium text-[#171717] dark:text-[#f0f6fc] hover:bg-[#f0efee] dark:hover:bg-[#21262d]"
                >
                  Healthcare Recruiters & HR
                </Link>
              </div>
            )}
          </div>

          {/* Resources Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setActiveDropdown("resources")}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button
              type="button"
              className="flex items-center gap-1 hover:text-[#0f4c81] dark:hover:text-[#f0f6fc] transition cursor-pointer"
            >
              <span>Resources</span>
              <ChevronDown className="size-3.5 opacity-70" />
            </button>
            {activeDropdown === "resources" && (
              <div className="absolute top-full left-0 mt-1 w-52 rounded-2xl bg-white dark:bg-[#161b22] p-2 shadow-xl border border-[#ded8d1]/60 dark:border-[#30363d] animate-in fade-in slide-in-from-top-1">
                <button
                  type="button"
                  onClick={() => scrollToSection("features")}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-[#171717] dark:text-[#f0f6fc] hover:bg-[#f0efee] dark:hover:bg-[#21262d]"
                >
                  Accredited CME Courses
                </button>
                <button
                  type="button"
                  onClick={() => scrollToSection("features")}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-[#171717] dark:text-[#f0f6fc] hover:bg-[#f0efee] dark:hover:bg-[#21262d]"
                >
                  Clinical Case Studies
                </button>
                <button
                  type="button"
                  onClick={() => scrollToSection("mobile-app")}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-[#171717] dark:text-[#f0f6fc] hover:bg-[#f0efee] dark:hover:bg-[#21262d]"
                >
                  Mobile Applications
                </button>
              </div>
            )}
          </div>
        </nav>

        {/* 3. Right CTA Buttons */}
        <div className="hidden sm:flex items-center gap-3">
          <ThemeToggle collapsed={true} />

          {isLoggedIn ? (
            <div className="flex items-center gap-2.5">
              <Link
                href="/home"
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#0f4c81] dark:bg-[#14559b] px-4.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#0c3c66] dark:hover:bg-[#0f4c81] transition active:scale-95"
              >
                <LayoutDashboard className="size-3.5" />
                <span>Dashboard</span>
                <ArrowRight className="size-3.5" />
              </Link>
              <UserMenu />
            </div>
          ) : (
            <>
              {/* Outlined Login Button */}
              <Link
                href="/login"
                className="px-5 py-2 rounded-xl border border-[#0f4c81]/30 dark:border-[#58a6ff]/40 text-xs font-semibold text-[#0f4c81] dark:text-[#58a6ff] hover:bg-[#0f4c81]/5 dark:hover:bg-[#58a6ff]/10 transition cursor-pointer"
              >
                Login
              </Link>

              {/* Solid Blue Sign Up Button */}
              <Link
                href="/signup"
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#0f4c81] dark:bg-[#14559b] px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#0c3c66] dark:hover:bg-[#0f4c81] transition active:scale-95 cursor-pointer"
              >
                <span>Sign Up</span>
              </Link>
            </>
          )}
        </div>

        {/* 4. Mobile Menu Button */}
        <div className="flex sm:hidden items-center gap-2">
          <ThemeToggle collapsed={true} />
          {isLoggedIn ? (
            <UserMenu />
          ) : (
            <Link
              href="/login"
              className="px-3 py-1.5 text-xs font-semibold text-[#0f4c81] dark:text-[#58a6ff]"
            >
              Login
            </Link>
          )}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#5d5854] dark:text-[#8b949e] hover:text-[#171717] dark:hover:text-[#f0f6fc] rounded-lg cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] px-4 py-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150 shadow-md">
          <div className="flex flex-col space-y-2 text-sm font-medium text-[#171717] dark:text-[#f0f6fc]">
            <Link href="/" onClick={() => setMobileMenuOpen(false)} className="py-2 px-2 text-[#0f4c81] font-semibold">
              Home
            </Link>
            <button
              type="button"
              onClick={() => scrollToSection("features")}
              className="text-left py-2 px-2 rounded-lg hover:bg-[#faf9f8] dark:hover:bg-[#21262d]"
            >
              About Us
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("features")}
              className="text-left py-2 px-2 rounded-lg hover:bg-[#faf9f8] dark:hover:bg-[#21262d]"
            >
              Features
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("audience")}
              className="text-left py-2 px-2 rounded-lg hover:bg-[#faf9f8] dark:hover:bg-[#21262d]"
            >
              For Professionals & Organizations
            </button>
          </div>

          <div className="pt-3 border-t border-[#ded8d1] dark:border-[#30363d] flex flex-col gap-2">
            {isLoggedIn ? (
              <Link
                href="/home"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl bg-[#0f4c81] text-xs font-bold text-white shadow-xs"
              >
                Open Dashboard
              </Link>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  className="text-center py-2.5 rounded-xl border border-[#0f4c81] text-xs font-semibold text-[#0f4c81]"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="text-center py-2.5 rounded-xl bg-[#0f4c81] text-xs font-semibold text-white shadow-xs"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
