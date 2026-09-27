"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { X, ShieldCheck, Eye, EyeOff, Loader2 } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: "signin" | "signup";
  onClose: () => void;
}

export function AuthModal({ isOpen, initialMode = "signin", onClose }: AuthModalProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, isPending: isSessionPending } = authClient.useSession();

  const [mode, setMode] = React.useState<"signin" | "signup">(initialMode);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [fullName, setFullName] = React.useState("");
  const [agreedToTerms, setAgreedToTerms] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formError, setFormError] = React.useState("");
  const [successMessage, setSuccessMessage] = React.useState("");
  const [isForgotPassword, setIsForgotPassword] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  React.useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  // Handle URL errors if any
  React.useEffect(() => {
    const error = searchParams?.get("error");
    const errorDesc = searchParams?.get("error_description");
    if (error) {
      setFormError(errorDesc || `Authentication error: ${error}`);
    }
  }, [searchParams]);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
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
      } catch (err) {
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
      } catch (err) {
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
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-3xl border border-[#ded8d1] bg-white p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-full text-[#8a8784] hover:bg-[#f0efee] hover:text-[#171717] transition cursor-pointer"
        >
          <X className="size-5" />
        </button>

        {/* Modal Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <img
            src="/logo.png"
            alt="MedGlobalNetwork"
            className="h-10 w-auto object-contain mb-3"
          />

          <h3 className="text-xl sm:text-2xl font-black text-[#171717]">
            {isForgotPassword
              ? "Reset Password"
              : mode === "signup"
              ? "Join Verified Network"
              : "Welcome to MGN.life"}
          </h3>

          <p className="mt-1 text-xs sm:text-sm text-[#77716b] font-medium">
            {isForgotPassword
              ? "Enter your email to receive a recovery link"
              : mode === "signup"
              ? "Create your authenticated clinician profile"
              : "Sign in to access your clinical dashboard"}
          </p>
        </div>

        {/* Form Content */}
        {isForgotPassword ? (
          <form onSubmit={handleForgotPassword} className="mt-4 space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5d5854] mb-1.5">
                Email address
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
              {isSubmitting ? "Sending..." : "Send Reset Link"}
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
                ← Back to Sign in
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-left">
            {mode === "signup" && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#5d5854] mb-1.5">
                  Full Name (with Title)
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
                Email address
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
                  I agree to the <a href="#" className="font-bold text-[#0f4c81] underline">Terms of Service</a> & <a href="#" className="font-bold text-[#0f4c81] underline">Privacy Policy</a>.
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
                "Sign in"
              ) : (
                "Create Free Account"
              )}
            </button>

            {/* Toggle Signin / Signup */}
            <div className="pt-3 text-center text-xs text-[#77716b]">
              {mode === "signin" ? (
                <p>
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("signup");
                      setFormError("");
                      setSuccessMessage("");
                    }}
                    className="font-bold text-[#0f4c81] hover:underline cursor-pointer"
                  >
                    Join Network Free
                  </button>
                </p>
              ) : (
                <p>
                  Already registered?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("signin");
                      setFormError("");
                      setSuccessMessage("");
                    }}
                    className="font-bold text-[#0f4c81] hover:underline cursor-pointer"
                  >
                    Sign in here
                  </button>
                </p>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
