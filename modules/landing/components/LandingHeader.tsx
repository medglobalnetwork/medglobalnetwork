"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronDown, ArrowRight, Menu, X, LayoutDashboard, Stethoscope, Building2, BookOpen } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import UserMenu from "@/components/UserMenu";
import { ThemeToggle } from "@/components/ThemeToggle";

interface LandingHeaderProps {
  onOpenAuth?: (mode?: "signin" | "signup") => void;
}

export function LandingHeader({ onOpenAuth }: LandingHeaderProps) {
  const { data: session, isPending } = authClient.useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState<boolean>(false);
  const [activeDropdown, setActiveDropdown] = React.useState<string | null>(null);
  const [mobileExpandedSection, setMobileExpandedSection] = React.useState<string | null>(null);

  const isLoggedIn = !isPending && Boolean(session?.user);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    setActiveDropdown(null);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const toggleMobileAccordion = (section: string) => {
    setMobileExpandedSection(mobileExpandedSection === section ? null : section);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 dark:bg-[#0b0f17]/95 backdrop-blur-md transition-all border-b border-slate-100/80 dark:border-slate-800/60">
      <div className="mx-auto flex h-16 sm:h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* 1. Brand Logo */}
        <Link href="/" className="flex items-center group shrink-0">
          <img
            src="/logo.png"
            alt="MGN Logo"
            className="h-9 sm:h-11 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
          />
        </Link>

        {/* 2. Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-[13.5px] font-medium text-[#4b5563] dark:text-[#9ca3af]">
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
              className="flex items-center gap-1 hover:text-[#0f4c81] dark:hover:text-[#f0f6fc] transition cursor-pointer py-2"
            >
              <span>For Professionals</span>
              <ChevronDown className="size-3.5 opacity-70" />
            </button>
            {activeDropdown === "professionals" && (
              <div className="absolute top-full left-0 mt-0.5 w-60 rounded-2xl bg-white dark:bg-[#161b22] p-2 shadow-xl border border-[#ded8d1]/60 dark:border-[#30363d] animate-in fade-in slide-in-from-top-1 z-50">
                <Link
                  href="/signup"
                  className="block px-3 py-2 rounded-xl text-xs font-medium text-[#171717] dark:text-[#f0f6fc] hover:bg-[#f0efee] dark:hover:bg-[#21262d]"
                >
                  Doctor &amp; Clinician Network
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
                  Medical Students &amp; Residents
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
              className="flex items-center gap-1 hover:text-[#0f4c81] dark:hover:text-[#f0f6fc] transition cursor-pointer py-2"
            >
              <span>For Organizations</span>
              <ChevronDown className="size-3.5 opacity-70" />
            </button>
            {activeDropdown === "organizations" && (
              <div className="absolute top-full left-0 mt-0.5 w-60 rounded-2xl bg-white dark:bg-[#161b22] p-2 shadow-xl border border-[#ded8d1]/60 dark:border-[#30363d] animate-in fade-in slide-in-from-top-1 z-50">
                <Link
                  href="/signup"
                  className="block px-3 py-2 rounded-xl text-xs font-medium text-[#171717] dark:text-[#f0f6fc] hover:bg-[#f0efee] dark:hover:bg-[#21262d]"
                >
                  Hospitals &amp; Clinical Institutes
                </Link>
                <Link
                  href="/signup"
                  className="block px-3 py-2 rounded-xl text-xs font-medium text-[#171717] dark:text-[#f0f6fc] hover:bg-[#f0efee] dark:hover:bg-[#21262d]"
                >
                  Medical Colleges &amp; Universities
                </Link>
                <Link
                  href="/signup"
                  className="block px-3 py-2 rounded-xl text-xs font-medium text-[#171717] dark:text-[#f0f6fc] hover:bg-[#f0efee] dark:hover:bg-[#21262d]"
                >
                  Healthcare Recruiters &amp; HR
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
              className="flex items-center gap-1 hover:text-[#0f4c81] dark:hover:text-[#f0f6fc] transition cursor-pointer py-2"
            >
              <span>Resources</span>
              <ChevronDown className="size-3.5 opacity-70" />
            </button>
            {activeDropdown === "resources" && (
              <div className="absolute top-full left-0 mt-0.5 w-56 rounded-2xl bg-white dark:bg-[#161b22] p-2 shadow-xl border border-[#ded8d1]/60 dark:border-[#30363d] animate-in fade-in slide-in-from-top-1 z-50">
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

        {/* 3. Right CTA Buttons (Tablet & Desktop) */}
        <div className="hidden sm:flex items-center gap-2.5 sm:gap-3 shrink-0">
          <ThemeToggle collapsed={true} />

          {isLoggedIn ? (
            <div className="flex items-center gap-2.5">
              <Link
                href="/home"
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#0f4c81] dark:bg-[#14559b] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#0c3c66] dark:hover:bg-[#0f4c81] transition active:scale-95"
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
                className="px-4 sm:px-5 py-2 rounded-xl border border-[#0f4c81]/30 dark:border-[#58a6ff]/40 text-xs font-semibold text-[#0f4c81] dark:text-[#58a6ff] hover:bg-[#0f4c81]/5 dark:hover:bg-[#58a6ff]/10 transition cursor-pointer"
              >
                Login
              </Link>

              {/* Solid Blue Sign Up Button */}
              <Link
                href="/signup"
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#0f4c81] dark:bg-[#14559b] px-4 sm:px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#0c3c66] dark:hover:bg-[#0f4c81] transition active:scale-95 cursor-pointer"
              >
                <span>Sign Up</span>
              </Link>
            </>
          )}
        </div>

        {/* 4. Mobile Toggle Bar (Mobile Only) */}
        <div className="flex sm:hidden items-center gap-2 shrink-0">
          <ThemeToggle collapsed={true} />
          {isLoggedIn ? (
            <UserMenu />
          ) : (
            <Link
              href="/login"
              className="px-2.5 py-1.5 text-xs font-semibold text-[#0f4c81] dark:text-[#58a6ff]"
            >
              Login
            </Link>
          )}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-[#5d5854] dark:text-[#8b949e] hover:text-[#171717] dark:hover:text-[#f0f6fc] rounded-lg cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* 5. Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] px-4 py-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150 shadow-lg max-h-[calc(100dvh-4rem)] overflow-y-auto">
          <div className="flex flex-col space-y-1 text-sm font-medium text-[#171717] dark:text-[#f0f6fc]">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2.5 px-3 rounded-lg text-[#0f4c81] dark:text-[#58a6ff] font-semibold bg-[#eef5fc]/60 dark:bg-[#1e293b]"
            >
              Home
            </Link>

            <button
              type="button"
              onClick={() => scrollToSection("features")}
              className="text-left py-2.5 px-3 rounded-lg hover:bg-[#faf9f8] dark:hover:bg-[#21262d]"
            >
              About Us
            </button>

            <button
              type="button"
              onClick={() => scrollToSection("features")}
              className="text-left py-2.5 px-3 rounded-lg hover:bg-[#faf9f8] dark:hover:bg-[#21262d]"
            >
              Features
            </button>

            {/* Accordion 1: For Professionals */}
            <div>
              <button
                type="button"
                onClick={() => toggleMobileAccordion("professionals")}
                className="w-full flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-[#faf9f8] dark:hover:bg-[#21262d] text-left"
              >
                <span className="flex items-center gap-2">
                  <Stethoscope className="size-4 text-[#0f4c81]" />
                  <span>For Professionals</span>
                </span>
                <ChevronDown className={`size-4 transition-transform duration-200 ${mobileExpandedSection === "professionals" ? "rotate-180" : ""}`} />
              </button>
              {mobileExpandedSection === "professionals" && (
                <div className="pl-9 pr-3 py-1 space-y-1 text-xs text-[#555] dark:text-slate-300">
                  <Link href="/signup" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 hover:text-[#0f4c81]">
                    Doctor &amp; Clinician Network
                  </Link>
                  <Link href="/signup" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 hover:text-[#0f4c81]">
                    Allied Health Specialists
                  </Link>
                  <Link href="/signup" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 hover:text-[#0f4c81]">
                    Nursing Community
                  </Link>
                  <Link href="/signup" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 hover:text-[#0f4c81]">
                    Medical Students &amp; Residents
                  </Link>
                </div>
              )}
            </div>

            {/* Accordion 2: For Organizations */}
            <div>
              <button
                type="button"
                onClick={() => toggleMobileAccordion("organizations")}
                className="w-full flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-[#faf9f8] dark:hover:bg-[#21262d] text-left"
              >
                <span className="flex items-center gap-2">
                  <Building2 className="size-4 text-[#16804d]" />
                  <span>For Organizations</span>
                </span>
                <ChevronDown className={`size-4 transition-transform duration-200 ${mobileExpandedSection === "organizations" ? "rotate-180" : ""}`} />
              </button>
              {mobileExpandedSection === "organizations" && (
                <div className="pl-9 pr-3 py-1 space-y-1 text-xs text-[#555] dark:text-slate-300">
                  <Link href="/signup" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 hover:text-[#16804d]">
                    Hospitals &amp; Clinical Institutes
                  </Link>
                  <Link href="/signup" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 hover:text-[#16804d]">
                    Medical Colleges &amp; Universities
                  </Link>
                  <Link href="/signup" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 hover:text-[#16804d]">
                    Healthcare Recruiters &amp; HR
                  </Link>
                </div>
              )}
            </div>

            {/* Accordion 3: Resources */}
            <div>
              <button
                type="button"
                onClick={() => toggleMobileAccordion("resources")}
                className="w-full flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-[#faf9f8] dark:hover:bg-[#21262d] text-left"
              >
                <span className="flex items-center gap-2">
                  <BookOpen className="size-4 text-[#0284c7]" />
                  <span>Resources</span>
                </span>
                <ChevronDown className={`size-4 transition-transform duration-200 ${mobileExpandedSection === "resources" ? "rotate-180" : ""}`} />
              </button>
              {mobileExpandedSection === "resources" && (
                <div className="pl-9 pr-3 py-1 space-y-1 text-xs text-[#555] dark:text-slate-300">
                  <button type="button" onClick={() => scrollToSection("features")} className="block w-full text-left py-1.5 hover:text-[#0284c7]">
                    Accredited CME Courses
                  </button>
                  <button type="button" onClick={() => scrollToSection("features")} className="block w-full text-left py-1.5 hover:text-[#0284c7]">
                    Clinical Case Studies
                  </button>
                  <button type="button" onClick={() => scrollToSection("mobile-app")} className="block w-full text-left py-1.5 hover:text-[#0284c7]">
                    Mobile Applications
                  </button>
                </div>
              )}
            </div>
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
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 rounded-xl border border-[#0f4c81]/40 text-xs font-semibold text-[#0f4c81] dark:text-[#58a6ff]"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileMenuOpen(false)}
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
