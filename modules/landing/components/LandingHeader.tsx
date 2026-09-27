"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Menu,
  X,
  LayoutDashboard,
  Home,
  Layers,
  Users,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { getInitials } from "@/lib/avatar";
import UserMenu from "@/components/UserMenu";
import { ThemeToggle } from "@/components/ThemeToggle";

interface LandingHeaderProps {
  onOpenAuth: (mode?: "signin" | "signup") => void;
}

export function LandingHeader({ onOpenAuth }: LandingHeaderProps) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [activeTab, setActiveTab] = React.useState<string>("home");
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState<boolean>(false);

  // Scroll listener to update active tab based on visible section
  React.useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 120;
      const sections = ["specialties", "verification-trust", "network-showcase", "ecosystem"];

      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el && el.offsetTop <= scrollPosition) {
          setActiveTab(sectionId);
          return;
        }
      }
      if (window.scrollY < 200) {
        setActiveTab("home");
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
    if (id === "home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const navItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "ecosystem", label: "Ecosystem", icon: Layers },
    { id: "network-showcase", label: "Network", icon: Users },
    { id: "verification-trust", label: "Verification", icon: ShieldCheck },
    { id: "specialties", label: "Specialties", icon: Stethoscope },
  ];

  const userInitials = getInitials(session?.user?.name, session?.user?.email);
  const isLoggedIn = !isPending && Boolean(session?.user);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/85 dark:bg-[#161b22]/85 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" onClick={() => handleNavClick("home")} className="flex items-center group">
          <img
            src="/logo.png"
            alt="MGN Logo"
            className="h-11 sm:h-12 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
          />
        </Link>

        {/* Desktop Navigation Links with Icon + Underline Effect */}
        <nav className="hidden md:flex items-center gap-7 sm:gap-8 h-full">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`group relative flex items-center gap-2 py-5 text-sm transition-colors duration-200 cursor-pointer ${
                  isActive
                    ? "font-semibold text-[#171717] dark:text-[#f0f6fc]"
                    : "font-medium text-[#6b7280] dark:text-[#8b949e] hover:text-[#171717] dark:hover:text-[#f0f6fc]"
                }`}
              >
                <Icon
                  className={`size-4.5 transition-colors duration-200 ${
                    isActive
                      ? "text-[#171717] dark:text-[#f0f6fc] stroke-[2.2]"
                      : "text-[#6b7280] dark:text-[#8b949e] group-hover:text-[#171717] dark:group-hover:text-[#f0f6fc] stroke-[1.8]"
                  }`}
                />
                <span>{item.label}</span>

                {/* Bottom Active / Hover Underline Effect */}
                {isActive ? (
                  <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#171717] dark:bg-[#f0f6fc] rounded-full transition-all duration-300" />
                ) : (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#171717]/30 dark:bg-white/30 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-center" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right CTA Actions */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Theme Switcher */}
          <ThemeToggle collapsed={true} />

          {isLoggedIn ? (
            <div className="flex items-center gap-2.5">
              {/* Go to Dashboard CTA */}
              <Link
                href="/home"
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#0f4c81] dark:bg-[#388bfd] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#0c3c66] dark:hover:bg-[#58a6ff] transition active:scale-95"
              >
                <LayoutDashboard className="size-3.5" />
                <span>Dashboard</span>
                <ArrowRight className="size-3.5" />
              </Link>

              {/* User Menu (Avatar + Name + Dropdown: Subscriptions, Membership, Profile, Logout) */}
              <UserMenu />
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="px-4 py-2 text-xs font-bold text-[#171717] dark:text-[#f0f6fc] hover:text-[#0f4c81] dark:hover:text-[#388bfd] transition rounded-xl cursor-pointer"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#0f4c81] dark:bg-[#388bfd] px-4.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#0c3c66] dark:hover:bg-[#58a6ff] transition active:scale-95 cursor-pointer"
              >
                <span>Join Network</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="flex sm:hidden items-center gap-2">
          <ThemeToggle collapsed={true} />

          {isLoggedIn ? (
            <div className="flex items-center gap-1.5">
              <UserMenu />
            </div>
          ) : (
            <Link
              href="/login"
              className="px-3 py-1.5 text-xs font-bold text-[#0f4c81] dark:text-[#58a6ff]"
            >
              Sign in
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
        <div className="md:hidden border-b border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] px-4 py-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150 shadow-md">
          <div className="flex flex-col space-y-1 text-sm font-medium text-[#171717] dark:text-[#f0f6fc]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-3 text-left py-2.5 px-3 rounded-xl transition ${
                    isActive
                      ? "bg-[#0f4c81]/10 text-[#0f4c81] dark:text-[#58a6ff] font-semibold"
                      : "text-[#5d5854] dark:text-[#8b949e] hover:bg-[#faf9f8] dark:hover:bg-[#21262d]"
                  }`}
                >
                  <Icon className="size-4.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-[#ded8d1] dark:border-[#30363d] flex flex-col gap-2">
            {isLoggedIn ? (
              <Link
                href="/home"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl bg-[#0f4c81] dark:bg-[#388bfd] text-xs font-bold text-white shadow-xs flex items-center justify-center gap-2"
              >
                <LayoutDashboard className="size-4" />
                <span>Open Clinical Dashboard</span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth("signup");
                }}
                className="w-full text-center py-2.5 rounded-xl bg-[#0f4c81] dark:bg-[#388bfd] text-xs font-bold text-white shadow-xs cursor-pointer"
              >
                Join Verified Network
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
