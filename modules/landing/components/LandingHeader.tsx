"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ShieldCheck, Menu, X, LayoutDashboard, User } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { DEFAULT_BLANK_AVATAR, getUserAvatarUrl, getInitials } from "@/lib/avatar";

interface LandingHeaderProps {
  onOpenAuth: (mode?: "signin" | "signup") => void;
}

export function LandingHeader({ onOpenAuth }: LandingHeaderProps) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // Dynamic Avatar sync
  const [avatarUrl, setAvatarUrl] = React.useState<string>(DEFAULT_BLANK_AVATAR);

  React.useEffect(() => {
    if (session?.user?.id) {
      setAvatarUrl(getUserAvatarUrl(session.user.id, session.user.image));
    }
  }, [session?.user?.id, session?.user?.image]);

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
            alt="MedGlobalNetwork"
            className="h-9 sm:h-10 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
          />
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
              {/* User Avatar + Name chip */}
              <Link
                href="/home"
                className="flex items-center gap-2 p-1 pr-3 rounded-full border border-[#ded8d1] bg-[#faf9f8] hover:bg-white hover:border-[#0f4c81]/40 transition group"
                title="View Profile / Dashboard"
              >
                <div className="size-8 rounded-full overflow-hidden bg-[#eef5fc] border border-[#ded8d1] flex items-center justify-center text-xs font-bold text-[#0f4c81]">
                  {session?.user?.image || (avatarUrl && avatarUrl !== DEFAULT_BLANK_AVATAR) ? (
                    <img
                      src={avatarUrl}
                      alt={session?.user?.name || "User"}
                      className="size-full rounded-full object-cover"
                    />
                  ) : (
                    userInitials
                  )}
                </div>
                <span className="text-xs font-bold text-[#171717] group-hover:text-[#0f4c81] transition truncate max-w-[130px]">
                  {session?.user?.name || "My Account"}
                </span>
              </Link>

              {/* Go to Dashboard CTA */}
              <Link
                href="/home"
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#0f4c81] px-4.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#0c3c66] transition active:scale-95"
              >
                <LayoutDashboard className="size-3.5" />
                <span>Go to Dashboard</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={() => onOpenAuth("signin")}
                className="px-4 py-2 text-xs font-bold text-[#171717] hover:text-[#0f4c81] transition rounded-xl cursor-pointer"
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => onOpenAuth("signup")}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#0f4c81] px-4.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#0c3c66] transition active:scale-95 cursor-pointer"
              >
                <span>Join Network</span>
                <ArrowRight className="size-3.5" />
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="flex sm:hidden items-center gap-2">
          {isLoggedIn ? (
            <Link
              href="/home"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0f4c81] text-white text-xs font-bold shadow-xs"
            >
              <div className="size-5 rounded-full overflow-hidden bg-white/20 flex items-center justify-center text-[10px]">
                {userInitials}
              </div>
              <span>Dashboard</span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => onOpenAuth("signin")}
              className="px-3 py-1.5 text-xs font-bold text-[#0f4c81]"
            >
              Sign in
            </button>
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
