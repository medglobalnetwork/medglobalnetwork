"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Mail,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Clock,
  ShieldCheck,
  Edit2,
  X,
  Loader2,
  Lock,
} from "lucide-react";
import CodeSlots from "@/components/ui/CodeSlots";
import { getFirebaseAuth, RecaptchaVerifier, signInWithPhoneNumber, type ConfirmationResult } from "@/lib/firebase";

function maskEmail(email: string): string {
  if (!email || !email.includes("@")) return "your email";
  const [local, domain] = email.split("@");
  if (local.length <= 2) return `${local[0]}*@${domain}`;
  const first = local[0];
  const last = local[local.length - 1];
  return `${first}${"*".repeat(Math.min(local.length - 2, 4))}${last}@${domain}`;
}

function maskPhone(phone: string): string {
  if (!phone) return "your mobile";
  const clean = phone.trim();
  if (clean.length < 8) return clean;
  const prefix = clean.startsWith("+") ? clean.slice(0, 3) : "+91";
  const suffix = clean.slice(-4);
  return `${prefix} ••••• •${suffix}`;
}

export default function IndividualVerifyPage() {
  const router = useRouter();

  // User details from registration (Page 2)
  const [userId, setUserId] = React.useState<string>("");
  const [email, setEmail] = React.useState<string>("doctor@hospital.org");
  const [phone, setPhone] = React.useState<string>("+919876543210");
  const [fullName, setFullName] = React.useState<string>("Healthcare Professional");

  // Verification States (Independent)
  const [emailVerified, setEmailVerified] = React.useState(false);
  const [phoneVerified, setPhoneVerified] = React.useState(false);

  // OTP Codes
  const [emailOtp, setEmailOtp] = React.useState("");
  const [phoneOtp, setPhoneOtp] = React.useState("");

  // Slot UI Statuses
  const [emailOtpStatus, setEmailOtpStatus] = React.useState<"idle" | "error" | "success">("idle");
  const [phoneOtpStatus, setPhoneOtpStatus] = React.useState<"idle" | "error" | "success">("idle");

  // Attempt counters (Max 5 attempts)
  const [emailAttemptsLeft, setEmailAttemptsLeft] = React.useState(5);
  const [phoneAttemptsLeft, setPhoneAttemptsLeft] = React.useState(5);

  // Resend Cooldown Timers (45 seconds)
  const [emailResendTimer, setEmailResendTimer] = React.useState(45);
  const [phoneResendTimer, setPhoneResendTimer] = React.useState(45);

  // 5-minute Expiry Countdown (300 seconds)
  const [emailExpiryTimer, setEmailExpiryTimer] = React.useState(300);
  const [phoneExpiryTimer, setPhoneExpiryTimer] = React.useState(300);

  // Loading States
  const [isVerifyingEmail, setIsVerifyingEmail] = React.useState(false);
  const [isVerifyingPhone, setIsVerifyingPhone] = React.useState(false);
  const [isResendingEmail, setIsResendingEmail] = React.useState(false);
  const [isResendingPhone, setIsResendingPhone] = React.useState(false);

  // Errors & Alerts
  const [emailError, setEmailError] = React.useState<string | null>(null);
  const [phoneError, setPhoneError] = React.useState<string | null>(null);
  const [generalError, setGeneralError] = React.useState<string | null>(null);
  const [successNotice, setSuccessNotice] = React.useState<string | null>(null);

  // Contact Edit Modals
  const [isEditingEmail, setIsEditingEmail] = React.useState(false);
  const [isEditingPhone, setIsEditingPhone] = React.useState(false);
  const [newEmailInput, setNewEmailInput] = React.useState("");
  const [newPhoneInput, setNewPhoneInput] = React.useState("");
  const [isUpdatingContact, setIsUpdatingContact] = React.useState(false);
  const [contactUpdateError, setContactUpdateError] = React.useState<string | null>(null);

  // Firebase Phone Auth
  const phoneConfirmationRef = React.useRef<ConfirmationResult | null>(null);

  const setupRecaptcha = React.useCallback(() => {
    try {
      if (typeof window === "undefined") return null;
      const auth = getFirebaseAuth();
      if ((window as any).onboardRecaptchaVerifier) {
        try {
          (window as any).onboardRecaptchaVerifier.clear();
        } catch {}
        (window as any).onboardRecaptchaVerifier = null;
      }
      const container = document.getElementById("firebase-recaptcha-container");
      if (!container) return null;
      container.innerHTML = "";
      const verifier = new RecaptchaVerifier(auth, container, {
        size: "invisible",
        callback: () => {},
        "expired-callback": () => {},
      });
      (window as any).onboardRecaptchaVerifier = verifier;
      verifier.render().catch(() => {});
      return verifier;
    } catch (e) {
      console.warn("Recaptcha setup notice:", e);
      return null;
    }
  }, []);

  // 1. Restore registered user & verified state on mount
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const storedUser = localStorage.getItem("mgn_onboarding_registered_user");
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          if (parsed.email) setEmail(parsed.email);
          if (parsed.phone) setPhone(parsed.phone);
          if (parsed.userId) setUserId(parsed.userId);
          if (parsed.fullName) setFullName(parsed.fullName);
        }

        // Restore verified status if navigating backward
        const verifiedState = localStorage.getItem("mgn_onboarding_verified_state");
        if (verifiedState) {
          const parsedStatus = JSON.parse(verifiedState);
          if (parsedStatus.emailVerified) {
            setEmailVerified(true);
            setEmailOtpStatus("success");
          }
          if (parsedStatus.phoneVerified) {
            setPhoneVerified(true);
            setPhoneOtpStatus("success");
          }
        }
      } catch (err) {
        console.warn("Could not load stored user/verification state:", err);
      }
    }
  }, []);

  // 2. Persist verified state
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(
          "mgn_onboarding_verified_state",
          JSON.stringify({
            emailVerified,
            phoneVerified,
            email,
            phone,
            updatedAt: Date.now(),
          })
        );
      } catch (err) {
        console.warn("Could not persist verification state:", err);
      }
    }
  }, [emailVerified, phoneVerified, email, phone]);

  // 3. Countdown Timers
  React.useEffect(() => {
    const interval = setInterval(() => {
      setEmailResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
      setPhoneResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
      setEmailExpiryTimer((prev) => (prev > 0 ? prev - 1 : 0));
      setPhoneExpiryTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // ─────────────────────────────────────────────
  // EMAIL OTP VERIFICATION
  // ─────────────────────────────────────────────
  const handleVerifyEmail = async (codeToVerify?: string) => {
    const code = (codeToVerify || emailOtp).trim();
    setEmailError(null);

    if (emailVerified) return;

    if (emailExpiryTimer <= 0) {
      setEmailError("Verification code has expired. Please request a new code.");
      setEmailOtpStatus("error");
      return;
    }

    if (emailAttemptsLeft <= 0) {
      setEmailError("Maximum attempts reached. Please request a new verification code.");
      setEmailOtpStatus("error");
      return;
    }

    if (code.length !== 6) {
      setEmailError("Please enter all 6 digits of the verification code.");
      setEmailOtpStatus("error");
      return;
    }

    setIsVerifyingEmail(true);

    try {
      const res = await fetch("/api/auth/email/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          otp: code,
          userId,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success && data.verified === true) {
        setEmailVerified(true);
        setEmailOtpStatus("success");
        setEmailError(null);
        setSuccessNotice("Email address verified successfully!");
      } else {
        const nextAttempts = Math.max(0, emailAttemptsLeft - 1);
        setEmailAttemptsLeft(nextAttempts);
        setEmailOtpStatus("error");

        if (nextAttempts === 0) {
          setEmailError("Maximum 5 attempts reached. Please request a fresh code.");
        } else {
          setEmailError(
            data.error || `Incorrect code. ${nextAttempts} attempt${nextAttempts > 1 ? "s" : ""} remaining.`
          );
        }
      }
    } catch (err: any) {
      console.error("Email verification network error:", err);
      setEmailError("Network error. Please check your connection and try again.");
      setEmailOtpStatus("error");
    } finally {
      setIsVerifyingEmail(false);
    }
  };

  const handleResendEmailOtp = async () => {
    if (emailResendTimer > 0 || isResendingEmail || emailVerified) return;

    setIsResendingEmail(true);
    setEmailError(null);

    try {
      const res = await fetch("/api/auth/email/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          purpose: "verify",
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setEmailOtp("");
        setEmailOtpStatus("idle");
        setEmailAttemptsLeft(5);
        setEmailResendTimer(45);
        setEmailExpiryTimer(300);
        setSuccessNotice(`New 6-digit code dispatched to ${email}`);
      } else {
        setEmailError(data.error || "Failed to resend verification code. Please wait a moment.");
      }
    } catch (err) {
      setEmailError("Network error while requesting resend. Please try again.");
    } finally {
      setIsResendingEmail(false);
    }
  };

  // ─────────────────────────────────────────────
  // MOBILE OTP VERIFICATION
  // ─────────────────────────────────────────────
  const handleVerifyPhone = async (codeToVerify?: string) => {
    const code = (codeToVerify || phoneOtp).trim();
    setPhoneError(null);

    if (phoneVerified) return;

    if (phoneExpiryTimer <= 0) {
      setPhoneError("Verification code has expired. Please request a new code.");
      setPhoneOtpStatus("error");
      return;
    }

    if (phoneAttemptsLeft <= 0) {
      setPhoneError("Maximum attempts reached. Please request a new verification code.");
      setPhoneOtpStatus("error");
      return;
    }

    if (code.length !== 6) {
      setPhoneError("Please enter all 6 digits of the mobile OTP.");
      setPhoneOtpStatus("error");
      return;
    }

    setIsVerifyingPhone(true);

    let firebaseVerified = false;
    if (phoneConfirmationRef.current) {
      try {
        await phoneConfirmationRef.current.confirm(code);
        firebaseVerified = true;
      } catch (fbErr: any) {
        console.warn("Firebase confirm error:", fbErr);
      }
    }

    try {
      const res = await fetch("/api/auth/phone/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          otp: code,
          purpose: "verify",
          userId,
          firebaseVerified,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success && data.verified === true) {
        setPhoneVerified(true);
        setPhoneOtpStatus("success");
        setPhoneError(null);
        setSuccessNotice("Mobile number verified successfully!");
      } else {
        const nextAttempts = Math.max(0, phoneAttemptsLeft - 1);
        setPhoneAttemptsLeft(nextAttempts);
        setPhoneOtpStatus("error");

        if (nextAttempts === 0) {
          setPhoneError("Maximum 5 attempts reached. Please request a fresh code.");
        } else {
          setPhoneError(
            data.error || `Incorrect code. ${nextAttempts} attempt${nextAttempts > 1 ? "s" : ""} remaining.`
          );
        }
      }
    } catch (err: any) {
      console.error("Phone verification network error:", err);
      setPhoneError("Network error. Please check your connection and try again.");
      setPhoneOtpStatus("error");
    } finally {
      setIsVerifyingPhone(false);
    }
  };

  const handleResendPhoneOtp = async () => {
    if (phoneResendTimer > 0 || isResendingPhone || phoneVerified) return;

    setIsResendingPhone(true);
    setPhoneError(null);

    // 1. Trigger Firebase real SMS
    let firebaseSent = false;
    try {
      const auth = getFirebaseAuth();
      let appVerifier = (window as any).onboardRecaptchaVerifier;
      if (!appVerifier) {
        appVerifier = setupRecaptcha();
      }
      if (appVerifier) {
        const formattedPhone = phone.startsWith("+") ? phone : `+91${phone.replace(/\D/g, "")}`;
        const confirmation = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
        phoneConfirmationRef.current = confirmation;
        firebaseSent = true;
      }
    } catch (fbErr: any) {
      console.warn("Firebase Phone Auth trigger note:", fbErr?.code, fbErr?.message);
      if (fbErr?.code === "auth/operation-not-allowed") {
        setPhoneError("Phone provider is not enabled in Firebase Console yet. Please enable Phone under Authentication > Sign-in method.");
      } else if (fbErr?.code === "auth/too-many-requests") {
        setPhoneError("Too many SMS attempts from this device. Please wait a few minutes.");
      }
    }

    try {
      const res = await fetch("/api/auth/phone/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          purpose: "verify",
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setPhoneOtp("");
        setPhoneOtpStatus("idle");
        setPhoneAttemptsLeft(5);
        setPhoneResendTimer(45);
        setPhoneExpiryTimer(300);
        setSuccessNotice(
          firebaseSent
            ? `Real SMS OTP dispatched to ${phone} via Firebase!`
            : `New 6-digit code dispatched to ${phone}`
        );
      } else {
        setPhoneError(data.error || "Failed to resend mobile OTP. Please wait a moment.");
      }
    } catch (err) {
      setPhoneError("Network error while requesting resend. Please try again.");
    } finally {
      setIsResendingPhone(false);
    }
  };

  // ─────────────────────────────────────────────
  // CONTACT UPDATE (CHANGE EMAIL / MOBILE)
  // ─────────────────────────────────────────────
  const handleUpdateContact = async (type: "email" | "phone") => {
    const val = type === "email" ? newEmailInput.trim() : newPhoneInput.trim();
    setContactUpdateError(null);

    if (!val) {
      setContactUpdateError(`Please enter a valid ${type}.`);
      return;
    }

    setIsUpdatingContact(true);

    try {
      const res = await fetch("/api/onboarding/update-contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          type,
          value: val,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        if (type === "email") {
          setEmail(data.newValue);
          setEmailVerified(false);
          setEmailOtp("");
          setEmailOtpStatus("idle");
          setEmailAttemptsLeft(5);
          setEmailResendTimer(45);
          setEmailExpiryTimer(300);
          setIsEditingEmail(false);
          setNewEmailInput("");
        } else {
          setPhone(data.newValue);
          setPhoneVerified(false);
          setPhoneOtp("");
          setPhoneOtpStatus("idle");
          setPhoneAttemptsLeft(5);
          setPhoneResendTimer(45);
          setPhoneExpiryTimer(300);
          setIsEditingPhone(false);
          setNewPhoneInput("");
        }

        // Update stored profile
        if (typeof window !== "undefined") {
          const stored = localStorage.getItem("mgn_onboarding_registered_user");
          if (stored) {
            const p = JSON.parse(stored);
            if (type === "email") p.email = data.newValue;
            if (type === "phone") p.phone = data.newValue;
            localStorage.setItem("mgn_onboarding_registered_user", JSON.stringify(p));
          }
        }

        setSuccessNotice(data.message);
      } else {
        setContactUpdateError(data.error || `Failed to update ${type}.`);
      }
    } catch (err) {
      setContactUpdateError("Network error while updating contact.");
    } finally {
      setIsUpdatingContact(false);
    }
  };

  // ─────────────────────────────────────────────
  // CONTINUE TO NEXT STEP
  // ─────────────────────────────────────────────
  const bothVerified = emailVerified && phoneVerified;

  const handleContinue = () => {
    if (!bothVerified) return;

    // Route to Page 4: Personal Information
    router.push("/onboarding/individual/personal-information");
  };

  return (
    <div className="min-h-dvh bg-white dark:bg-[#0b131e] text-[#1f2937] dark:text-[#f3f4f6] flex flex-col font-sans">
      {/* ─────────────────────────────────────────────
          1. HEADER
          ───────────────────────────────────────────── */}
      <header className="w-full border-b border-slate-100 dark:border-slate-800/80 bg-white/95 dark:bg-[#0b131e]/95 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Logo on Left */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <img
              src="/logo.png"
              alt="MED Global Network Logo"
              className="h-9 w-auto object-contain transition-transform group-hover:scale-105"
            />
            <div className="flex flex-col">
              <span className="text-xl sm:text-[22px] font-black tracking-tight text-[#102D45] dark:text-[#58a6ff] leading-none">
                MED Global Network
              </span>
              <span className="text-[10px] font-bold tracking-wider uppercase text-[#168B78] dark:text-[#2dd4bf] mt-0.5">
                Healthcare Community
              </span>
            </div>
          </Link>

          {/* Already registered? Sign In on Right */}
          <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            <span>Already verified? </span>
            <Link
              href="/login"
              className="font-bold text-[#168B78] hover:text-[#116a5c] dark:text-[#2dd4bf] transition inline-flex items-center gap-1 ml-0.5 hover:underline"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* ─────────────────────────────────────────────
          2. MAIN CONTENT AREA
          ───────────────────────────────────────────── */}
      <main className="flex-1 flex items-center justify-center py-8 sm:py-14 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-2xl mx-auto space-y-6">
          {/* Back Navigation */}
          <div>
            <Link
              href="/onboarding/individual"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#102D45] dark:text-slate-400 dark:hover:text-white transition group"
            >
              <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
              <span>Back to Registration</span>
            </Link>
          </div>

          {/* Verification Container Card */}
          <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#121c2a] p-6 sm:p-9 shadow-md relative overflow-hidden">
            {/* Header inside Card */}
            <div className="space-y-2 pb-6 border-b border-slate-100 dark:border-slate-800 text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#168B78]/10 text-[#168B78] dark:bg-teal-950/40 dark:text-[#2dd4bf]">
                <ShieldCheck className="size-3.5" />
                <span>Security Step 3 of 5</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#102D45] dark:text-white tracking-tight">
                Verify Your Account
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Secure your MED Global Network account by verifying your email address and mobile number.
              </p>

              {/* Verification Progress Tracker */}
              <div className="pt-3">
                <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                  <span className="text-[#102D45] dark:text-slate-200">
                    Verification Progress
                  </span>
                  <span
                    className={
                      bothVerified
                        ? "text-emerald-600 font-bold"
                        : "text-[#168B78] font-bold"
                    }
                  >
                    {bothVerified
                      ? "2 of 2 Verified ✓"
                      : emailVerified || phoneVerified
                      ? "1 of 2 Verified"
                      : "0 of 2 Verified"}
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      bothVerified
                        ? "bg-emerald-500 w-full"
                        : emailVerified || phoneVerified
                        ? "bg-[#168B78] w-1/2"
                        : "bg-slate-200 dark:bg-slate-700 w-0"
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Success Notification Alert */}
            {successNotice && (
              <div className="mt-5 p-3.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900/60 text-xs sm:text-sm text-teal-800 dark:text-teal-200 flex items-center justify-between animate-in fade-in">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 shrink-0 text-[#168B78]" />
                  <span className="font-medium">{successNotice}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSuccessNotice(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            )}

            {/* General Error Alert */}
            {generalError && (
              <div className="mt-5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs sm:text-sm text-rose-700 dark:text-rose-300 flex items-start gap-2.5 animate-in fade-in">
                <AlertTriangle className="size-4 shrink-0 text-rose-500 mt-0.5" />
                <span className="leading-relaxed font-medium">{generalError}</span>
              </div>
            )}

            {/* Testing Helper Box */}
            <div className="mt-5 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-900 dark:text-amber-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-amber-200/80 dark:bg-amber-900/80 font-bold text-[10px] text-amber-900 dark:text-amber-100">
                  TEST MODE
                </span>
                <span>Universal Test Code: <strong className="font-mono text-sm tracking-wider">123456</strong></span>
              </div>
              <button
                type="button"
                onClick={() => {
                  handleVerifyEmail("123456");
                  handleVerifyPhone("123456");
                }}
                className="px-2.5 py-1 rounded-lg bg-amber-200 hover:bg-amber-300 dark:bg-amber-900 dark:hover:bg-amber-800 text-amber-900 dark:text-amber-100 font-bold text-[11px] transition cursor-pointer"
              >
                Auto-verify Both ⚡
              </button>
            </div>

            <div className="mt-6 space-y-6 text-left">
              {/* ═══════════════════════════════════════════════
                  SECTION 1: EMAIL OTP VERIFICATION
                  ═══════════════════════════════════════════════ */}
              <div
                className={`p-5 rounded-2xl border transition-all ${
                  emailVerified
                    ? "border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/20 dark:bg-emerald-950/10"
                    : "border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-[#0e1622]"
                }`}
              >
                {/* Email Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${
                        emailVerified
                          ? "bg-emerald-600 text-white"
                          : "bg-[#102D45]/10 text-[#102D45] dark:bg-slate-800 dark:text-slate-200"
                      }`}
                    >
                      <Mail className="size-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[#102D45] dark:text-white">
                          Email Verification
                        </span>
                        {emailVerified ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                            <CheckCircle2 className="size-3" />
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                            Pending
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                        {maskEmail(email)}
                      </p>
                    </div>
                  </div>

                  {/* Change Email Button */}
                  {!emailVerified && !isEditingEmail && (
                    <button
                      type="button"
                      onClick={() => {
                        setNewEmailInput(email);
                        setIsEditingEmail(true);
                        setContactUpdateError(null);
                      }}
                      className="text-xs font-semibold text-[#168B78] hover:text-[#116a5c] dark:text-[#2dd4bf] inline-flex items-center gap-1 transition cursor-pointer"
                    >
                      <Edit2 className="size-3" />
                      <span>Change</span>
                    </button>
                  )}
                </div>

                {/* Inline Change Email Form */}
                {isEditingEmail && !emailVerified && (
                  <div className="mt-4 p-3.5 rounded-xl border border-teal-200 dark:border-teal-900 bg-white dark:bg-[#121c2a] space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-[#102D45] dark:text-slate-200">
                        Update Email Address
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsEditingEmail(false)}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        value={newEmailInput}
                        onChange={(e) => setNewEmailInput(e.target.value)}
                        placeholder="new.email@example.com"
                        className="flex-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#0b131e] px-3 py-1.5 text-xs text-slate-900 dark:text-white"
                      />
                      <button
                        type="button"
                        disabled={isUpdatingContact}
                        onClick={() => handleUpdateContact("email")}
                        className="px-3.5 py-1.5 bg-[#168B78] text-white text-xs font-bold rounded-lg hover:bg-[#116a5c] transition disabled:opacity-50 cursor-pointer flex items-center gap-1"
                      >
                        {isUpdatingContact && <Loader2 className="size-3 animate-spin" />}
                        <span>Update &amp; Send OTP</span>
                      </button>
                    </div>
                    {contactUpdateError && (
                      <p className="text-[11px] text-rose-500 font-medium">{contactUpdateError}</p>
                    )}
                  </div>
                )}

                {/* Verification Slot & Actions */}
                {!emailVerified ? (
                  <div className="mt-5 space-y-3">
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      Enter the 6-digit code sent to your email inbox:
                    </p>

                    {/* 6-Digit Code Slots */}
                    <div className="flex justify-center py-1">
                      <CodeSlots
                        length={6}
                        value={emailOtp}
                        status={emailOtpStatus}
                        onChange={(code) => {
                          setEmailOtp(code);
                          if (emailOtpStatus !== "idle") setEmailOtpStatus("idle");
                          if (emailError) setEmailError(null);
                        }}
                        onComplete={(code) => {
                          handleVerifyEmail(code);
                        }}
                        accentColor="#168B78"
                        inkColor="#168B78"
                        slotColor="#f0efee"
                        digitColor="#102D45"
                        dangerColor="#e11d48"
                        slotSize={42}
                        gap={8}
                        radius={10}
                        autoFocus={true}
                        disabled={isVerifyingEmail || emailAttemptsLeft <= 0 || emailExpiryTimer <= 0}
                      />
                    </div>

                    {/* Inline Error Message */}
                    {emailError && (
                      <p className="text-xs text-rose-600 font-medium text-center animate-in fade-in flex items-center justify-center gap-1">
                        <AlertTriangle className="size-3.5 shrink-0" />
                        <span>{emailError}</span>
                      </p>
                    )}

                    {/* Timers & Attempts Row */}
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                      <div className="flex items-center gap-1.5">
                        <Clock className="size-3.5 text-slate-400" />
                        <span>
                          {emailExpiryTimer > 0 ? (
                            <>Expires in <span className="font-semibold text-slate-700 dark:text-slate-200">{formatTimer(emailExpiryTimer)}</span></>
                          ) : (
                            <span className="text-rose-500 font-semibold">Code Expired</span>
                          )}
                        </span>
                        <span className="text-slate-300 dark:text-slate-700">·</span>
                        <span>
                          <span className="font-semibold">{emailAttemptsLeft}</span> of 5 attempts left
                        </span>
                      </div>

                      {/* Resend Action */}
                      <div>
                        {emailResendTimer > 0 ? (
                          <span className="text-slate-400">Resend in {emailResendTimer}s</span>
                        ) : (
                          <button
                            type="button"
                            disabled={isResendingEmail}
                            onClick={handleResendEmailOtp}
                            className="font-bold text-[#168B78] hover:text-[#116a5c] dark:text-[#2dd4bf] transition inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
                          >
                            <RefreshCw className={`size-3 ${isResendingEmail ? "animate-spin" : ""}`} />
                            <span>Resend Code</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-900/60 flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-200">
                    <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
                    <span className="font-medium">
                      Email address verified successfully. No further action needed.
                    </span>
                  </div>
                )}
              </div>

              {/* ═══════════════════════════════════════════════
                  SECTION 2: MOBILE OTP VERIFICATION
                  ═══════════════════════════════════════════════ */}
              <div
                className={`p-5 rounded-2xl border transition-all ${
                  phoneVerified
                    ? "border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/20 dark:bg-emerald-950/10"
                    : "border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-[#0e1622]"
                }`}
              >
                {/* Invisible Firebase ReCaptcha Container */}
                <div id="firebase-recaptcha-container" />

                {/* Mobile Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${
                        phoneVerified
                          ? "bg-emerald-600 text-white"
                          : "bg-[#102D45]/10 text-[#102D45] dark:bg-slate-800 dark:text-slate-200"
                      }`}
                    >
                      <Smartphone className="size-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[#102D45] dark:text-white">
                          Mobile Verification
                        </span>
                        {phoneVerified ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                            <CheckCircle2 className="size-3" />
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                            Pending
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                        {maskPhone(phone)}
                      </p>
                    </div>
                  </div>

                  {/* Change Mobile Button */}
                  {!phoneVerified && !isEditingPhone && (
                    <button
                      type="button"
                      onClick={() => {
                        setNewPhoneInput(phone);
                        setIsEditingPhone(true);
                        setContactUpdateError(null);
                      }}
                      className="text-xs font-semibold text-[#168B78] hover:text-[#116a5c] dark:text-[#2dd4bf] inline-flex items-center gap-1 transition cursor-pointer"
                    >
                      <Edit2 className="size-3" />
                      <span>Change</span>
                    </button>
                  )}
                </div>

                {/* Inline Change Mobile Form */}
                {isEditingPhone && !phoneVerified && (
                  <div className="mt-4 p-3.5 rounded-xl border border-teal-200 dark:border-teal-900 bg-white dark:bg-[#121c2a] space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-[#102D45] dark:text-slate-200">
                        Update Mobile Number
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsEditingPhone(false)}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="tel"
                        value={newPhoneInput}
                        onChange={(e) => setNewPhoneInput(e.target.value)}
                        placeholder="+919876543210"
                        className="flex-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#0b131e] px-3 py-1.5 text-xs text-slate-900 dark:text-white"
                      />
                      <button
                        type="button"
                        disabled={isUpdatingContact}
                        onClick={() => handleUpdateContact("phone")}
                        className="px-3.5 py-1.5 bg-[#168B78] text-white text-xs font-bold rounded-lg hover:bg-[#116a5c] transition disabled:opacity-50 cursor-pointer flex items-center gap-1"
                      >
                        {isUpdatingContact && <Loader2 className="size-3 animate-spin" />}
                        <span>Update &amp; Send OTP</span>
                      </button>
                    </div>
                    {contactUpdateError && (
                      <p className="text-[11px] text-rose-500 font-medium">{contactUpdateError}</p>
                    )}
                  </div>
                )}

                {/* Verification Slot & Actions */}
                {!phoneVerified ? (
                  <div className="mt-5 space-y-3">
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      Enter the 6-digit SMS OTP sent to your phone:
                    </p>

                    {/* 6-Digit Code Slots */}
                    <div className="flex justify-center py-1">
                      <CodeSlots
                        length={6}
                        value={phoneOtp}
                        status={phoneOtpStatus}
                        onChange={(code) => {
                          setPhoneOtp(code);
                          if (phoneOtpStatus !== "idle") setPhoneOtpStatus("idle");
                          if (phoneError) setPhoneError(null);
                        }}
                        onComplete={(code) => {
                          handleVerifyPhone(code);
                        }}
                        accentColor="#168B78"
                        inkColor="#168B78"
                        slotColor="#f0efee"
                        digitColor="#102D45"
                        dangerColor="#e11d48"
                        slotSize={42}
                        gap={8}
                        radius={10}
                        autoFocus={false}
                        disabled={isVerifyingPhone || phoneAttemptsLeft <= 0 || phoneExpiryTimer <= 0}
                      />
                    </div>

                    {/* Inline Error Message */}
                    {phoneError && (
                      <p className="text-xs text-rose-600 font-medium text-center animate-in fade-in flex items-center justify-center gap-1">
                        <AlertTriangle className="size-3.5 shrink-0" />
                        <span>{phoneError}</span>
                      </p>
                    )}

                    {/* Timers & Attempts Row */}
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                      <div className="flex items-center gap-1.5">
                        <Clock className="size-3.5 text-slate-400" />
                        <span>
                          {phoneExpiryTimer > 0 ? (
                            <>Expires in <span className="font-semibold text-slate-700 dark:text-slate-200">{formatTimer(phoneExpiryTimer)}</span></>
                          ) : (
                            <span className="text-rose-500 font-semibold">Code Expired</span>
                          )}
                        </span>
                        <span className="text-slate-300 dark:text-slate-700">·</span>
                        <span>
                          <span className="font-semibold">{phoneAttemptsLeft}</span> of 5 attempts left
                        </span>
                      </div>

                      {/* Resend Action */}
                      <div>
                        {phoneResendTimer > 0 ? (
                          <span className="text-slate-400">Resend in {phoneResendTimer}s</span>
                        ) : (
                          <button
                            type="button"
                            disabled={isResendingPhone}
                            onClick={handleResendPhoneOtp}
                            className="font-bold text-[#168B78] hover:text-[#116a5c] dark:text-[#2dd4bf] transition inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
                          >
                            <RefreshCw className={`size-3 ${isResendingPhone ? "animate-spin" : ""}`} />
                            <span>Resend Code</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-900/60 flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-200">
                    <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
                    <span className="font-medium">
                      Mobile number verified successfully. No further action needed.
                    </span>
                  </div>
                )}
              </div>

              {/* ─────────────────────────────────────────────
                  CONTINUE BUTTON
                  ───────────────────────────────────────────── */}
              <div className="pt-4">
                <button
                  type="button"
                  disabled={!bothVerified}
                  onClick={handleContinue}
                  className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all duration-200 ${
                    bothVerified
                      ? "bg-[#102D45] hover:bg-[#0c2235] text-white shadow-md hover:shadow-lg active:scale-98 cursor-pointer ring-2 ring-[#168B78]/30"
                      : "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed"
                  }`}
                >
                  {bothVerified ? (
                    <>
                      <span>Continue to Profile Setup</span>
                      <ArrowRight className="size-4" />
                    </>
                  ) : (
                    <>
                      <Lock className="size-4 opacity-70" />
                      <span>Verify both Email &amp; Mobile to continue</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Footer Trust Tag */}
            <div className="mt-8 pt-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="size-4 text-[#168B78]" />
              <span>Encrypted 256-bit Healthcare Identity Handshake</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
