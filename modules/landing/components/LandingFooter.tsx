"use client";

import * as React from "react";
import Link from "next/link";
import { ShieldCheck, Mail, MapPin, ArrowUp } from "lucide-react";
import { MGN_EMAILS } from "@/lib/contact-emails";

interface LandingFooterProps {
  onOpenAuth?: (mode?: "signin" | "signup") => void;
}

export function LandingFooter({ onOpenAuth }: LandingFooterProps) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-[#081d36] text-white pt-16 pb-8 border-t border-slate-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-slate-800">
          {/* Brand Col */}
          <div className="lg:col-span-5 space-y-4">
            <Link href="/" className="flex items-center gap-2.5 group">
              <img
                src="/logo.png"
                alt="MGN Logo"
                className="h-10 w-auto object-contain transition-transform group-hover:scale-105"
              />
              <span className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                MGN
              </span>
            </Link>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-sm">
              India&apos;s authenticated ecosystem connecting verified doctors, healthcare professionals, hospital recruiters, medical students, and certified suppliers.
            </p>

            <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold pt-1">
              <ShieldCheck className="size-4 shrink-0" />
              <span>NMC &amp; State Council Verified Healthcare Network</span>
            </div>
          </div>

          {/* Col 1: Platform Modules */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Platform Modules
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li>
                <Link href="/network" className="hover:text-white transition">
                  Doctor-to-Doctor Network
                </Link>
              </li>
              <li>
                <Link href="/opportunities/jobs" className="hover:text-white transition">
                  Healthcare Careers &amp; Jobs
                </Link>
              </li>
              <li>
                <Link href="/learn" className="hover:text-white transition">
                  CME &amp; Clinical Learning
                </Link>
              </li>
              <li>
                <Link href="/marketplace" className="hover:text-white transition">
                  B2B Medical Marketplace
                </Link>
              </li>
              <li>
                <Link href="/events" className="hover:text-white transition">
                  Conferences &amp; Events
                </Link>
              </li>
              <li>
                <Link href="/camps" className="hover:text-white transition">
                  Health Camps
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 2: Membership & About */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Ecosystem
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li>
                <Link href="/signup" className="hover:text-white transition">
                  For Clinicians
                </Link>
              </li>
              <li>
                <Link href="/signup" className="hover:text-white transition">
                  For Medical Students
                </Link>
              </li>
              <li>
                <Link href="/signup" className="hover:text-white transition">
                  For Hospitals &amp; HRs
                </Link>
              </li>
              <li>
                <Link href="/signup" className="hover:text-white transition">
                  For Medical Vendors
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition">
                  About MGN
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Contact & Support */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Support
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <Mail className="size-3.5 text-slate-400 shrink-0" />
                <a href={`mailto:${MGN_EMAILS.support}`} className="hover:text-white transition">
                  {MGN_EMAILS.support}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="size-3.5 text-slate-400 shrink-0" />
                <a href={`mailto:${MGN_EMAILS.info}`} className="hover:text-white transition">
                  {MGN_EMAILS.info}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="size-3.5 text-slate-400 shrink-0" />
                <span>Pan-India Network</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="text-center sm:text-left">
            &copy; {new Date().getFullYear()} MedGlobalNetwork (MGN). All rights reserved. NMC and DPDP compliant.
          </div>

          <div className="flex items-center gap-5 text-slate-400">
            <Link href="/privacy" className="hover:text-white transition">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white transition">
              Terms of Service
            </Link>
            <button
              type="button"
              onClick={scrollToTop}
              className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <span>Back to Top</span>
              <ArrowUp className="size-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
