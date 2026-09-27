"use client";

import * as React from "react";
import Link from "next/link";
import { ShieldCheck, Mail, Phone, Globe } from "lucide-react";
import { authClient } from "@/lib/auth-client";

interface LandingFooterProps {
  onOpenAuth: (mode?: "signin" | "signup") => void;
}

export function LandingFooter({ onOpenAuth }: LandingFooterProps) {
  const { data: session } = authClient.useSession();
  const isLoggedIn = Boolean(session?.user);

  return (
    <footer className="bg-[#0b1728] text-white pt-12 sm:pt-16 pb-8 sm:pb-10 border-t border-slate-800/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 sm:gap-8 lg:gap-10 pb-10 sm:pb-12 border-b border-slate-800/80">
          {/* Brand Col (Span 2) */}
          <div className="col-span-2 lg:col-span-2 space-y-3.5 sm:space-y-4 text-left">
            <div className="flex items-center gap-2.5">
              <img
                src="/logo.png"
                alt="MGN Logo"
                className="h-8 sm:h-10 w-auto object-contain brightness-0 invert"
              />
              <span className="text-lg sm:text-xl font-black tracking-tight text-white">
                MGN
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 max-w-sm leading-relaxed text-pretty">
              MGN connects healthcare professionals, students, organizations, and businesses on a single verified platform to learn, grow, collaborate, and thrive.
            </p>

            <div className="flex items-center gap-2 text-[11px] sm:text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 rounded-xl px-3 py-1.5 w-fit">
              <ShieldCheck className="size-3.5 sm:size-4 shrink-0" />
              <span>100% Verified Healthcare Network</span>
            </div>
          </div>

          {/* Col 1: Platform */}
          <div className="space-y-3 text-left">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Platform
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/network" className="hover:text-white transition cursor-pointer">
                  Network
                </Link>
              </li>
              <li>
                <Link href="/opportunities/jobs" className="hover:text-white transition cursor-pointer">
                  Jobs
                </Link>
              </li>
              <li>
                <Link href="/learn" className="hover:text-white transition cursor-pointer">
                  Learning
                </Link>
              </li>
              <li>
                <Link href="/marketplace" className="hover:text-white transition cursor-pointer">
                  Marketplace
                </Link>
              </li>
              <li>
                <Link href="/events" className="hover:text-white transition cursor-pointer">
                  Events
                </Link>
              </li>
              <li>
                <Link href="/camps" className="hover:text-white transition cursor-pointer">
                  Medical Camps
                </Link>
              </li>
              <li>
                <Link href="/research" className="hover:text-white transition cursor-pointer">
                  Research
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 2: For Users */}
          <div className="space-y-3 text-left">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              For Users
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/signup" className="hover:text-white transition cursor-pointer">
                  Professionals
                </Link>
              </li>
              <li>
                <Link href="/signup" className="hover:text-white transition cursor-pointer">
                  Students
                </Link>
              </li>
              <li>
                <Link href="/signup" className="hover:text-white transition cursor-pointer">
                  Hospitals
                </Link>
              </li>
              <li>
                <Link href="/signup" className="hover:text-white transition cursor-pointer">
                  Universities
                </Link>
              </li>
              <li>
                <Link href="/signup" className="hover:text-white transition cursor-pointer">
                  Businesses
                </Link>
              </li>
              <li>
                <Link href="/signup" className="hover:text-white transition cursor-pointer">
                  Verification
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Resources */}
          <div className="space-y-3 text-left">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Resources
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/about" className="hover:text-white transition cursor-pointer">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/features" className="hover:text-white transition cursor-pointer">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition cursor-pointer">
                  Support
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition cursor-pointer">
                  Terms
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition cursor-pointer">
                  Privacy
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact Us */}
          <div className="col-span-2 sm:col-span-1 md:col-span-2 lg:col-span-1 space-y-3 text-left">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Contact Us
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-center gap-2 truncate">
                <Mail className="size-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">support@mgn.life</span>
              </li>
              <li className="flex items-center gap-2 truncate">
                <Phone className="size-3.5 text-emerald-400 shrink-0" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-2 truncate">
                <Globe className="size-3.5 text-emerald-400 shrink-0" />
                <span>www.mgn.life</span>
              </li>
            </ul>

            <div className="pt-2">
              {isLoggedIn ? (
                <Link
                  href="/home"
                  className="w-full text-center rounded-xl bg-[#0f4c81] py-2 text-xs font-bold text-white hover:bg-[#0c3c66] transition shadow-xs block"
                >
                  Dashboard →
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => onOpenAuth("signup")}
                  className="w-full text-center rounded-xl bg-[#16804d] py-2 text-xs font-bold text-white hover:bg-[#136c41] transition shadow-xs block cursor-pointer"
                >
                  Get Started – Free
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 sm:pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 text-xs text-slate-400 text-center sm:text-left">
          <p>© {new Date().getFullYear()} Med Global Network (MGN). All rights reserved.</p>
          <div className="flex items-center gap-4 sm:gap-6 flex-wrap justify-center">
            <Link href="/privacy" className="hover:text-white transition">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white transition">
              Terms of Service
            </Link>
            <Link href="/contact" className="hover:text-white transition">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
