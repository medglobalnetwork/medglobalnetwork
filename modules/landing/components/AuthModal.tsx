"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import {
  openOAuthBrowser,
  closeOAuthBrowser,
  onAppResumeOrDeepLink,
  isNativePlatform,
  signInWithNativeGoogle,
  exchangeBridgeToken,
} from "@/lib/native-mobile";
import { X, ShieldCheck, Eye, EyeOff, Loader2 } from "lucide-react";

const GoogleIcon = () => (
  <svg viewBox="0 0 48 48" className="h-5 w-5 shrink-0" aria-hidden="true">
    <path
      fill="#EA4335"
      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z"
    />
    <path
      fill="#4285F4"
      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65Z"
    />
    <path
      fill="#FBBC05"
      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19Z"
    />
    <path
      fill="#34A853"
      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z"
    />
  </svg>
);

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
  const [isAwaitingOAuth, setIsAwaitingOAuth] = React.useState(false);

  React.useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  // Handle URL error or bridge_token params returned from OAuth flows
  React.useEffect(() => {
    const bridgeToken = searchParams?.get("bridge_token");
    if (bridgeToken) {
      setIsSubmitting(true);
      exchangeBridgeToken(bridgeToken).then((success) => {
        if (success) {
          window.location.href = "/home";
        } else {
          setIsSubmitting(false);
          setFormError("Authentication synchronization failed. Please sign in again.");
        }
      });
      return;
    }

    const error = searchParams?.get("error");
    const errorDesc = searchParams?.get("error_description");
    if (error) {
      if (error === "access_denied") {
        setFormError("Google sign-in was cancelled.");
      } else if (error === "account_not_linked" || error === "OAuthAccountNotLinked") {
        setFormError("An account with this email already exists. Sign in with your password or use your linked account.");
      } else if (error === "state_not_found") {
        setFormError("Sign-in session expired. Please click Sign in with Google again.");
      } else if (error === "invalid_callback_request") {
        setFormError("Google authentication encountered an invalid callback. Please try again.");
      } else {
        setFormError(errorDesc || `Authentication error: ${error}`);
      }
    }
  }, [searchParams]);

  React.useEffect(() => {
    if (!isSessionPending && session && !isAwaitingOAuth) {
      router.replace("/home");
    }
  }, [isSessionPending, isAwaitingOAuth, router, session]);

  // Handle native app resume / focus / deep link after Google OAuth completes
  React.useEffect(() => {
    const cleanup = onAppResumeOrDeepLink(async (deepUrl, authSuccess) => {
      try {
        if (authSuccess) {
          await closeOAuthBrowser();
          window.location.href = "/home";
          return;
        }

        if (deepUrl && (deepUrl.includes("/home") || deepUrl.includes("home"))) {
          await closeOAuthBrowser();
          window.location.href = "/home";
          return;
        }

        if (deepUrl && deepUrl.includes("error=")) {
          await closeOAuthBrowser();
          setFormError("Google authentication could not be completed. Please try again.");
          setIsSubmitting(false);
          setIsAwaitingOAuth(false);
          return;
        }

        if (isAwaitingOAuth) {
          setTimeout(async () => {
            try {
              const currentSession = await authClient.getSession({
                fetchOptions: { headers: { "Cache-Control": "no-cache" } },
              });
              if (currentSession?.data?.session || currentSession?.data?.user) {
                await closeOAuthBrowser();
                window.location.href = "/home";
              } else {
                setIsSubmitting(false);
                setIsAwaitingOAuth(false);
              }
            } catch {
              setIsSubmitting(false);
              setIsAwaitingOAuth(false);
            }
          }, 2200);
        }
      } catch {
        setIsSubmitting(false);
        setIsAwaitingOAuth(false);
      }
    });

    return cleanup;
  }, [isAwaitingOAuth, router]);

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

  async function handleGoogleSignIn() {
    setFormError("");
    setIsSubmitting(true);
    setIsAwaitingOAuth(true);

    try {
      if (isNativePlatform()) {
        const nativeResult = await signInWithNativeGoogle();
        if (nativeResult.success) {
          window.location.href = "/home";
          return;
        }
      }

      const callbackUrl = `${window.location.origin}/home`;

      if (isNativePlatform()) {
        const authUrl = `${window.location.origin}/api/auth/sign-in/social?provider=google&callbackURL=${encodeURIComponent(callbackUrl)}`;
        await openOAuthBrowser(authUrl);
      } else {
        await authClient.signIn.social({
          provider: "google",
          callbackURL: callbackUrl,
        });
      }
    } catch (err: any) {
      console.error("Google sign in error:", err);
      setFormError(err?.message || "Could not connect to Google. Please try again.");
      setIsSubmitting(false);
      setIsAwaitingOAuth(false);
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
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0f4c81] to-[#16804d] text-white shadow-xs mb-3">
            <span className="text-lg font-black tracking-tight">MGN</span>
          </div>

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

        {/* Google OAuth Button */}
        {!isForgotPassword && (
          <div className="space-y-4">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-3 rounded-2xl border border-[#ded8d1] bg-[#faf9f8] px-4 py-3 text-xs sm:text-sm font-bold text-[#171717] hover:bg-white hover:border-[#0f4c81]/40 shadow-2xs transition active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting && isAwaitingOAuth ? (
                <>
                  <Loader2 className="size-4 animate-spin text-[#0f4c81]" />
                  <span>Connecting to Google...</span>
                </>
              ) : (
                <>
                  <GoogleIcon />
                  <span>Continue with Google</span>
                </>
              )}
            </button>

            <div className="relative flex items-center justify-center">
              <div className="w-full border-t border-[#ded8d1]" />
              <span className="absolute bg-white px-3 text-[10px] font-bold uppercase tracking-widest text-[#8a8784]">
                or email
              </span>
            </div>
          </div>
        )}

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
