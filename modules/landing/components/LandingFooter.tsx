"use client";

import * as React from "react";
import Link from "next/link";
import { ShieldCheck, Heart } from "lucide-react";
import { authClient } from "@/lib/auth-client";

interface LandingFooterProps {
  onOpenAuth: (mode?: "signin" | "signup") => void;
}

export function LandingFooter({ onOpenAuth }: LandingFooterProps) {
  const { data: session } = authClient.useSession();
  const isLoggedIn = Boolean(session?.user);

  return (
    <footer className="bg-[#111827] text-white pt-16 pb-12 border-t border-slate-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12 pb-12 border-b border-slate-800">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <img
                src="/logo.png"
                alt="MedGlobalNetwork"
                className="h-9 sm:h-10 w-auto object-contain brightness-0 invert"
              />
            </div>

            <p className="text-xs sm:text-sm text-slate-400 max-w-sm leading-relaxed">
              The authenticated global professional network connecting verified doctors, physiotherapists, surgeons, researchers, and healthcare institutions worldwide.
            </p>

            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 rounded-xl px-3 py-1.5 w-fit">
              <ShieldCheck className="size-4 shrink-0" />
              <span>100% Medical License Verified Community</span>
            </div>
          </div>

          {/* Platform Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Platform
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button
                  type="button"
                  onClick={() => onOpenAuth("signup")}
                  className="hover:text-white transition cursor-pointer"
                >
                  Doctor-to-Doctor Network
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenAuth("signup")}
                  className="hover:text-white transition cursor-pointer"
                >
                  Clinical Opportunities & Jobs
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenAuth("signup")}
                  className="hover:text-white transition cursor-pointer"
                >
                  Accredited Learn & CME
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenAuth("signup")}
                  className="hover:text-white transition cursor-pointer"
                >
                  Conferences & Events
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenAuth("signup")}
                  className="hover:text-white transition cursor-pointer"
                >
                  Community Medical Camps
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenAuth("signup")}
                  className="hover:text-white transition cursor-pointer"
                >
                  Collaborative Research
                </button>
              </li>
            </ul>
          </div>

          {/* Community & Verification */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Trust & Security
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button
                  type="button"
                  onClick={() => onOpenAuth("signup")}
                  className="hover:text-white transition cursor-pointer"
                >
                  License Verification Process
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenAuth("signup")}
                  className="hover:text-white transition cursor-pointer"
                >
                  Healthcare Organization Portals
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenAuth("signup")}
                  className="hover:text-white transition cursor-pointer"
                >
                  Clinical Data Encryption
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenAuth("signup")}
                  className="hover:text-white transition cursor-pointer"
                >
                  Community Guidelines
                </button>
              </li>
            </ul>
          </div>

          {/* Account / Actions */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              {isLoggedIn ? "My Account" : "Get Started"}
            </h4>
            <div className="space-y-2.5">
              {isLoggedIn ? (
                <Link
                  href="/home"
                  className="w-full text-center rounded-xl bg-[#0f4c81] py-2.5 text-xs font-bold text-white hover:bg-[#0c3c66] transition shadow-xs block"
                >
                  Open Clinical Dashboard →
                </Link>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => onOpenAuth("signup")}
                    className="w-full text-center rounded-xl bg-[#0f4c81] py-2 text-xs font-bold text-white hover:bg-[#0c3c66] transition shadow-xs cursor-pointer"
                  >
                    Join Free as Clinician
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenAuth("signin")}
                    className="w-full text-center rounded-xl border border-slate-700 bg-slate-800 py-2 text-xs font-bold text-slate-200 hover:bg-slate-700 transition cursor-pointer"
                  >
                    Sign In to Account
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} MedGlobalNetwork (MGN.life). All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-slate-400 transition">
              Terms of Service
            </a>
            <a href="#" className="hover:text-slate-400 transition">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-slate-400 transition">
              Security Standards
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
