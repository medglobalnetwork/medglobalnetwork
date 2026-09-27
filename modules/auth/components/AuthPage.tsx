"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { ShieldCheck, Eye, EyeOff, Loader2, ArrowLeft, CheckCircle2, Lock, Sparkles } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

interface AuthPageProps {
  defaultMode?: "signin" | "signup";
}

export function AuthPage({ defaultMode = "signin" }: AuthPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, isPending: isSessionPending } = authClient.useSession();

  const queryMode = searchParams?.get("mode");
  const [mode, setMode] = React.useState<"signin" | "signup">(
    queryMode === "signup" ? "signup" : queryMode === "signin" ? "signin" : defaultMode
  );

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [fullName, setFullName] = React.useState("");
  const [agreedToTerms, setAgreedToTerms] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formError, setFormError] = React.useState("");
  const [successMessage, setSuccessMessage] = React.useState("");
  const [isForgotPassword, setIsForgotPassword] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  // Sync mode if query param changes
  React.useEffect(() => {
    if (queryMode === "signup" || queryMode === "signin") {
      setMode(queryMode);
    }
  }, [queryMode]);

  // Handle URL errors if any
  React.useEffect(() => {
    const error = searchParams?.get("error");
    const errorDesc = searchParams?.get("error_description");
    if (error) {
      setFormError(errorDesc || `Authentication error: ${error}`);
    }
  }, [searchParams]);

  // Redirect if already logged in
  React.useEffect(() => {
    if (!isSessionPending && session?.user) {
      router.replace("/home");
    }
  }, [isSessionPending, session, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    setSuccessMessage("");

    if (!email.trim()) {
      setFormError("Please enter your email address.");
      return;
    }

    if (!password.trim()) {
      setFormError("Please enter your password.");
      return;
    }

    if (mode === "signup") {
      if (!fullName.trim()) {
        setFormError("Please enter your full name.");
        return;
      }

      if (password !== confirmPassword) {
        setFormError("Passwords do not match.");
        return;
      }

      if (!agreedToTerms) {
        setFormError("You must agree to the terms and privacy policy.");
        return;
      }

      setIsSubmitting(true);
      try {
        const { error } = await authClient.signUp.email({
          email: email.trim(),
          password,
          name: fullName.trim(),
        });

        if (error) {
          setFormError(error.message || "Failed to create account. Please try again.");
          setIsSubmitting(false);
        } else {
          router.push("/onboarding");
        }
      } catch {
        setFormError("An unexpected error occurred. Please try again.");
        setIsSubmitting(false);
      }
    } else {
      setIsSubmitting(true);
      try {
        const { error } = await authClient.signIn.email({
          email: email.trim(),
          password,
        });

        if (error) {
          setFormError(error.message || "Invalid email or password.");
          setIsSubmitting(false);
        } else {
          router.push("/home");
        }
      } catch {
        setFormError("An unexpected error occurred. Please try again.");
        setIsSubmitting(false);
      }
    }
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      setFormError("Please enter your email address to reset password.");
      return;
    }

    setIsSubmitting(true);
    setFormError("");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMessage("Password reset link sent to your email.");
      } else {
        setFormError(data.error || "Failed to send reset link.");
      }
    } catch {
      setFormError("Failed to send reset link. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-dvh bg-[#faf9f8] flex flex-col justify-between selection:bg-[#0f4c81]/20">
      {/* Top Navbar */}
      <header className="w-full border-b border-[#ded8d1] bg-white px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <img
            src="/logo.png"
            alt="Med Global Network"
            className="h-9 sm:h-10 w-auto object-contain transition-transform group-hover:scale-105"
          />
          <span className="text-base sm:text-lg font-black tracking-tight text-[#171717] group-hover:text-[#0f4c81] transition-colors">
            Med Global Network
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <ThemeToggle collapsed={true} />
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5d5854] dark:text-[#8b949e] hover:text-[#0f4c81] dark:hover:text-[#388bfd] transition rounded-xl px-3 py-1.5 hover:bg-[#f0efee] dark:hover:bg-[#21262d]"
          >
            <ArrowLeft className="size-4" />
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      {/* Main Centered Content Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-[440px] rounded-3xl border border-[#ded8d1] bg-white p-6 sm:p-8 shadow-xl animate-in fade-in zoom-in-95 duration-200">
          {/* Brand & Title */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="flex items-center justify-center size-12 rounded-2xl bg-[#eef5fc] text-[#0f4c81] border border-[#d3e5f8] mb-3">
              <ShieldCheck className="size-6" />
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-[#171717]">
              {isForgotPassword
                ? "Reset Your Password"
                : mode === "signup"
                ? "Join MedGlobalNetwork"
                : "Welcome Back"}
            </h1>

            <p className="mt-1 text-xs sm:text-sm text-[#77716b] font-medium">
              {isForgotPassword
                ? "Enter your email to receive recovery instructions"
                : mode === "signup"
                ? "Create your authenticated medical practitioner profile"
                : "Sign in to access your clinical dashboard"}
            </p>
          </div>

          {/* Mode Tabs (Sign In / Create Account) */}
          {!isForgotPassword && (
            <div className="grid grid-cols-2 p-1 rounded-2xl bg-[#f0efee] border border-[#ded8d1] mb-5">
              <button
                type="button"
                onClick={() => {
                  setMode("signin");
                  setFormError("");
                  setSuccessMessage("");
                }}
                className={`py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                  mode === "signin"
                    ? "bg-white text-[#0f4c81] shadow-xs"
                    : "text-[#77716b] hover:text-[#171717]"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setFormError("");
                  setSuccessMessage("");
                }}
                className={`py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                  mode === "signup"
                    ? "bg-white text-[#0f4c81] shadow-xs"
                    : "text-[#77716b] hover:text-[#171717]"
                }`}
              >
                Create Account
              </button>
            </div>
          )}

          {/* Form Content */}
          {isForgotPassword ? (
            <form onSubmit={handleForgotPassword} className="mt-4 space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#5d5854] mb-1.5">
                  Registered Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="doctor@hospital.org"
                  required
                  className="h-11 w-full rounded-xl border border-[#ded8d1] px-3.5 text-xs sm:text-sm text-[#171717] focus:border-[#0f4c81] focus:outline-none focus:ring-1 focus:ring-[#0f4c81]"
                />
              </div>

              {formError && <p className="text-xs font-semibold text-rose-600">{formError}</p>}
              {successMessage && <p className="text-xs font-semibold text-emerald-600">{successMessage}</p>}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-[#0f4c81] py-3 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-[#0c3c66] transition disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? "Sending Recovery Email..." : "Send Password Reset Link"}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPassword(false);
                    setFormError("");
                    setSuccessMessage("");
                  }}
                  className="text-xs font-bold text-[#0f4c81] hover:underline cursor-pointer"
                >
                  ← Back to Sign In
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-left">
              {mode === "signup" && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#5d5854] mb-1.5">
                    Full Name (with Clinical Title)
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Dr. Rajesh Sharma"
                    required
                    className="h-11 w-full rounded-xl border border-[#ded8d1] px-3.5 text-xs sm:text-sm text-[#171717] focus:border-[#0f4c81] focus:outline-none focus:ring-1 focus:ring-[#0f4c81]"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#5d5854] mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="doctor@hospital.org"
                  required
                  className="h-11 w-full rounded-xl border border-[#ded8d1] px-3.5 text-xs sm:text-sm text-[#171717] focus:border-[#0f4c81] focus:outline-none focus:ring-1 focus:ring-[#0f4c81]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#5d5854]">
                    Password
                  </label>
                  {mode === "signin" && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsForgotPassword(true);
                        setFormError("");
                        setSuccessMessage("");
                      }}
                      className="text-xs font-semibold text-[#0f4c81] hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="h-11 w-full rounded-xl border border-[#ded8d1] px-3.5 pr-10 text-xs sm:text-sm text-[#171717] focus:border-[#0f4c81] focus:outline-none focus:ring-1 focus:ring-[#0f4c81]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8a8784] hover:text-[#171717]"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              {mode === "signup" && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#5d5854] mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="h-11 w-full rounded-xl border border-[#ded8d1] px-3.5 pr-10 text-xs sm:text-sm text-[#171717] focus:border-[#0f4c81] focus:outline-none focus:ring-1 focus:ring-[#0f4c81]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8a8784] hover:text-[#171717]"
                    >
                      {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>
              )}

              {mode === "signup" && (
                <label className="flex items-start gap-2.5 text-xs text-[#5d5854] cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    required
                    className="mt-0.5 size-4 rounded border-[#ded8d1] text-[#0f4c81] focus:ring-[#0f4c81]"
                  />
                  <span>
                    I agree to the{" "}
                    <a href="#" className="font-bold text-[#0f4c81] underline">
                      Terms of Service
                    </a>{" "}
                    &{" "}
                    <a href="#" className="font-bold text-[#0f4c81] underline">
                      Privacy Policy
                    </a>
                    .
                  </span>
                </label>
              )}

              {formError && <p className="text-xs font-semibold text-rose-600">{formError}</p>}
              {successMessage && <p className="text-xs font-semibold text-emerald-600">{successMessage}</p>}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-[#0f4c81] py-3 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-[#0c3c66] transition disabled:opacity-50 cursor-pointer mt-2"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="size-4 animate-spin" />
                    {mode === "signin" ? "Signing in..." : "Creating Account..."}
                  </span>
                ) : mode === "signin" ? (
                  "Sign In"
                ) : (
                  "Create Free Account"
                )}
              </button>
            </form>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-[#8a8784] border-t border-[#ded8d1] bg-white">
        © {new Date().getFullYear()} Med Global Network. Verified Healthcare Network.
      </footer>
    </div>
  );
}
