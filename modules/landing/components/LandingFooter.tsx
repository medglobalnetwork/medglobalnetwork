"use client";

import * as React from "react";
import Link from "next/link";
import { ShieldCheck, Mail, Phone, MapPin, Globe } from "lucide-react";
import { authClient } from "@/lib/auth-client";

interface LandingFooterProps {
  onOpenAuth: (mode?: "signin" | "signup") => void;
}

export function LandingFooter({ onOpenAuth }: LandingFooterProps) {
  const { data: session } = authClient.useSession();
  const isLoggedIn = Boolean(session?.user);

  return (
    <footer className="bg-[#0b1728] text-white pt-16 pb-10 border-t border-slate-800/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-10 pb-12 border-b border-slate-800/80">
          {/* Brand Col (Span 2) */}
          <div className="lg:col-span-2 space-y-4 text-left">
            <div className="flex items-center gap-2.5">
              <img
                src="/logo.png"
                alt="MGN Logo"
                className="h-9 sm:h-10 w-auto object-contain brightness-0 invert"
              />
              <span className="text-xl font-black tracking-tight text-white">
                MGN
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 max-w-sm leading-relaxed">
              MGN connects healthcare professionals, students, organizations, and businesses on a single verified platform to learn, grow, collaborate, and thrive.
            </p>

            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 rounded-xl px-3 py-1.5 w-fit">
              <ShieldCheck className="size-4 shrink-0" />
              <span>100% Verified Healthcare Network</span>
            </div>
          </div>

          {/* Col 1: Platform */}
          <div className="space-y-3.5 text-left">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Platform
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/network" className="hover:text-white transition cursor-pointer">
                  Professional Network
                </Link>
              </li>
              <li>
                <Link href="/opportunities/jobs" className="hover:text-white transition cursor-pointer">
                  Jobs &amp; Opportunities
                </Link>
              </li>
              <li>
                <Link href="/learn" className="hover:text-white transition cursor-pointer">
                  Learning &amp; Growth
                </Link>
              </li>
              <li>
                <Link href="/marketplace" className="hover:text-white transition cursor-pointer">
                  Marketplace
                </Link>
              </li>
              <li>
                <Link href="/events" className="hover:text-white transition cursor-pointer">
                  Events &amp; Conferences
                </Link>
              </li>
              <li>
                <Link href="/camps" className="hover:text-white transition cursor-pointer">
                  Medical Camps
                </Link>
              </li>
              <li>
                <Link href="/research" className="hover:text-white transition cursor-pointer">
                  Research Collaboration
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 2: For Users */}
          <div className="space-y-3.5 text-left">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              For Users
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/signup" className="hover:text-white transition cursor-pointer">
                  Healthcare Professionals
                </Link>
              </li>
              <li>
                <Link href="/signup" className="hover:text-white transition cursor-pointer">
                  Students &amp; Learners
                </Link>
              </li>
              <li>
                <Link href="/signup" className="hover:text-white transition cursor-pointer">
                  Hospitals &amp; Clinics
                </Link>
              </li>
              <li>
                <Link href="/signup" className="hover:text-white transition cursor-pointer">
                  Universities &amp; Colleges
                </Link>
              </li>
              <li>
                <Link href="/signup" className="hover:text-white transition cursor-pointer">
                  Healthcare Businesses
                </Link>
              </li>
              <li>
                <Link href="/signup" className="hover:text-white transition cursor-pointer">
                  Verified Identity
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Resources */}
          <div className="space-y-3.5 text-left">
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
                  Help &amp; Support
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition cursor-pointer">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition cursor-pointer">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/verification-guide" className="hover:text-white transition cursor-pointer">
                  Verification Process
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact Us */}
          <div className="space-y-3.5 text-left">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Contact Us
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <Mail className="size-3.5 text-emerald-400 shrink-0" />
                <span>support@mgn.life</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="size-3.5 text-emerald-400 shrink-0" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-2">
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
                  Open Dashboard →
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
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} Med Global Network (MGN). All rights reserved.</p>
          <div className="flex items-center gap-6">
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
