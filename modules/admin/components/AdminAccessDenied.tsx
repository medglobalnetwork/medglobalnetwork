"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShieldAlert, ArrowLeft, LogOut, KeyRound, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

interface AdminAccessDeniedProps {
  user: {
    id?: string;
    email?: string | null;
    name?: string | null;
    image?: string | null;
  };
}

export function AdminAccessDenied({ user }: AdminAccessDeniedProps) {
  const router = useRouter();
  const [passkey, setPasskey] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      router.push("/login?redirect=/admin");
    } catch {
      router.push("/login?redirect=/admin");
    }
  };

  const handleClaimAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/admin/claim-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passkey }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessMsg("Administrator privileges granted! Redirecting to Control Plane...");
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        setErrorMsg(data.error || "Invalid passkey. Access denied.");
      }
    } catch {
      setErrorMsg("Failed to connect to verification service.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-3.5 border-b border-slate-100 pb-4">
          <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-600">
            <ShieldAlert className="size-6" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight">
              Admin Control Plane Restricted
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Access level verification failed
            </p>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Current Account Session
          </div>
          <div className="font-bold text-slate-900 truncate">
            {user.name || "Authenticated User"}
          </div>
          <div className="text-slate-500 truncate">
            {user.email || user.id || "No email linked"}
          </div>
          <div className="pt-2">
            <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-800 font-medium flex items-center gap-1.5">
              <AlertCircle className="size-3.5 shrink-0 text-amber-600" />
              <span>This account does not have Super Admin or Staff privileges.</span>
            </div>
          </div>
        </div>

        {/* Claim Super Admin via Secret Passkey */}
        <form onSubmit={handleClaimAdmin} className="space-y-3 pt-1">
          <label className="block text-xs font-bold text-slate-700">
            Founder / System Administrator Passkey
          </label>
          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <input
              type="password"
              value={passkey}
              onChange={(e) => setPasskey(e.target.value)}
              placeholder="Enter admin secret or founder passkey"
              className="w-full h-10 pl-9 pr-3 text-xs bg-slate-50/80 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 transition-colors shadow-2xs"
            />
          </div>

          {errorMsg && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-[11px] text-rose-700 font-semibold flex items-center gap-1.5">
              <AlertCircle className="size-3.5 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-700 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !passkey.trim()}
            className="w-full h-10 bg-blue-600 hover:bg-blue-700 rounded-xl text-white text-xs font-bold transition shadow-xs disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                <span>Verifying Authorization...</span>
              </>
            ) : (
              <span>Authorize & Elevate to Admin</span>
            )}
          </button>
        </form>

        <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row gap-2.5">
          <button
            type="button"
            onClick={handleSignOut}
            className="flex-1 h-9 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
          >
            <LogOut className="size-3.5 text-slate-500" />
            <span>Switch Account</span>
          </button>
          <Link
            href="/home"
            className="flex-1 h-9 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
          >
            <ArrowLeft className="size-3.5 text-slate-500" />
            <span>Return to App</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
