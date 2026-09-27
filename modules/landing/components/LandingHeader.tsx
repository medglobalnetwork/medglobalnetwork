"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Menu, X, LayoutDashboard } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { getInitials } from "@/lib/avatar";
import UserMenu from "@/components/UserMenu";

interface LandingHeaderProps {
  onOpenAuth: (mode?: "signin" | "signup") => void;
}

export function LandingHeader({ onOpenAuth }: LandingHeaderProps) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const userInitials = getInitials(session?.user?.name, session?.user?.email);
  const isLoggedIn = !isPending && Boolean(session?.user);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#ded8d1] bg-white/90 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <img
            src="/logo.png"
            alt="Med Global Network"
            className="h-9 sm:h-10 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
          />
          <span className="hidden sm:inline-block text-base sm:text-lg font-black tracking-tight text-[#171717] group-hover:text-[#0f4c81] transition-colors">
            Med Global Network
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-bold text-[#5d5854]">
          <button
            type="button"
            onClick={() => scrollToSection("ecosystem")}
            className="hover:text-[#0f4c81] transition cursor-pointer"
          >
            Ecosystem
          </button>
          <button
            type="button"
            onClick={() => scrollToSection("network-showcase")}
            className="hover:text-[#0f4c81] transition cursor-pointer"
          >
            Verified Network
          </button>
          <button
            type="button"
            onClick={() => scrollToSection("verification-trust")}
            className="hover:text-[#0f4c81] transition cursor-pointer"
          >
            Verification & Trust
          </button>
          <button
            type="button"
            onClick={() => scrollToSection("specialties")}
            className="hover:text-[#0f4c81] transition cursor-pointer"
          >
            Specialties
          </button>
        </nav>

        {/* Right CTA Actions */}
        <div className="hidden sm:flex items-center gap-3">
          {isLoggedIn ? (
            <div className="flex items-center gap-2.5">
              {/* Go to Dashboard CTA */}
              <Link
                href="/home"
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#0f4c81] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#0c3c66] transition active:scale-95"
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
                className="px-4 py-2 text-xs font-bold text-[#171717] hover:text-[#0f4c81] transition rounded-xl cursor-pointer"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#0f4c81] px-4.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#0c3c66] transition active:scale-95 cursor-pointer"
              >
                <span>Join Network</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="flex sm:hidden items-center gap-2">
          {isLoggedIn ? (
            <div className="flex items-center gap-1.5">
              <UserMenu />
            </div>
          ) : (
            <Link
              href="/login"
              className="px-3 py-1.5 text-xs font-bold text-[#0f4c81]"
            >
              Sign in
            </Link>
          )}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#5d5854] hover:text-[#171717] rounded-lg cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>


      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#ded8d1] bg-white px-4 py-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150 shadow-md">
          <div className="flex flex-col space-y-2 text-sm font-semibold text-[#171717]">
            <button
              type="button"
              onClick={() => scrollToSection("ecosystem")}
              className="text-left py-2 px-2 rounded-lg hover:bg-[#faf9f8]"
            >
              Ecosystem
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("network-showcase")}
              className="text-left py-2 px-2 rounded-lg hover:bg-[#faf9f8]"
            >
              Verified Network
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("verification-trust")}
              className="text-left py-2 px-2 rounded-lg hover:bg-[#faf9f8]"
            >
              Verification & Trust
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("specialties")}
              className="text-left py-2 px-2 rounded-lg hover:bg-[#faf9f8]"
            >
              Specialties
            </button>
          </div>

          <div className="pt-2 border-t border-[#ded8d1] flex flex-col gap-2">
            {isLoggedIn ? (
              <Link
                href="/home"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl bg-[#0f4c81] text-xs font-bold text-white shadow-xs flex items-center justify-center gap-2"
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
                className="w-full text-center py-2.5 rounded-xl bg-[#0f4c81] text-xs font-bold text-white shadow-xs"
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
