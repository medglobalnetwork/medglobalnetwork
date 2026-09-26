"use client";

import * as React from "react";
import { JSX, SVGProps, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import {
  openOAuthBrowser,
  closeOAuthBrowser,
  onAppResumeOrDeepLink,
  isNativePlatform,
  signInWithNativeGoogle,
} from "@/lib/native-mobile";

function cn(...inputs: Array<string | false | null | undefined>) {
  return inputs.filter(Boolean).join(" ");
}

function Button({
  className,
  type = "button",
  ...props
}: React.ComponentProps<"button">) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50",
        "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        "h-10 px-4 py-2",
        className,
      )}
      {...props}
    />
  );
}

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground",
        "focus-visible:border-[#1769c2] focus-visible:ring-[#1769c2]/30 focus-visible:ring-[3px] focus-visible:outline-none",
        className,
      )}
      {...props}
    />
  );
}

function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      className={cn("flex items-center gap-2 text-sm leading-none font-medium select-none", className)}
      {...props}
    />
  );
}

function Separator({ className }: { className?: string }) {
  return <div className={cn("h-px w-full bg-border", className)} />;
}

const GoogleIcon = (props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 48 48"
    className="h-5 w-5"
    aria-hidden="true"
    {...props}
  >
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
    <path
      fill="none"
      d="M0 0h48v48H0Z"
    />
  </svg>
);

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="m3 3 18 18M10.6 6.2A10.8 10.8 0 0 1 12 6c6 0 9.5 6 9.5 6a17 17 0 0 1-3.2 3.8M6.5 6.9C3.9 8.5 2.5 12 2.5 12s3.5 6 9.5 6c1 0 1.9-.2 2.7-.4" />
    </svg>
  );
}

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, isPending: isSessionPending } = authClient.useSession();
  const [mode, setMode] = React.useState<"signin" | "signup">("signin");
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

  const showPasswordField = email.trim().length > 0 || mode === "signup";
  const passwordInvalid = submitted && password.trim().length > 0 && mode === "signin" && !password;
  const passwordsMatch = password === confirmPassword;
  const hasPasswordMismatch = mode === "signup" && confirmPassword.length > 0 && !passwordsMatch;

  const [isAwaitingOAuth, setIsAwaitingOAuth] = React.useState(false);

  // Handle URL error params returned from OAuth flows
  React.useEffect(() => {
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
          // Force hard navigation to ensure clean state and session hydration
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

        // If generic app resume while waiting for OAuth, do not prematurely navigate with stale session
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
        setFormError("You must accept the terms and privacy policy to continue.");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      if (mode === "signup") {
        const result = await authClient.signUp.email({
          email: email.trim(),
          password,
          name: fullName.trim(),
        });

        if (result.error) {
          setFormError(result.error.message || "Unable to create your account.");
          return;
        }

        setSuccessMessage("Account created successfully. You can now sign in.");
        setMode("signin");
        setPassword("");
        setConfirmPassword("");
        setFullName("");
        setAgreedToTerms(false);
      } else {
        const result = await authClient.signIn.email({
          email: email.trim(),
          password,
        });

        if (result.error) {
          setFormError(result.error.message || "Wrong password. Try again or reset it.");
          return;
        }

        router.push("/home");
      }
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    setSuccessMessage("");

    if (!email.trim()) {
      setFormError("Please enter your email address.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await authClient.requestPasswordReset({
        email: email.trim(),
        redirectTo: "/reset-password",
      });

      if (result.error) {
        setFormError(result.error.message || "Unable to request a password reset.");
        return;
      }

      setSuccessMessage("If an account exists for this email, reset instructions have been sent.");
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleGoogleSignIn() {
    setFormError("");
    setSuccessMessage("");
    setIsSubmitting(true);
    setIsAwaitingOAuth(true);

    try {
      // 1. If running inside Native Android App shell, invoke Native Google Play Dialog
      if (isNativePlatform()) {
        const nativeRes = await signInWithNativeGoogle();
        if (nativeRes.success) {
          window.location.href = "/home";
          return;
        }

        // If user cancelled, just reset loading state cleanly
        if (
          nativeRes.error?.toLowerCase().includes("cancel") ||
          nativeRes.error?.toLowerCase().includes("abort") ||
          nativeRes.error?.toLowerCase().includes("user closed")
        ) {
          setIsSubmitting(false);
          setIsAwaitingOAuth(false);
          return;
        }

        // If native auth had an issue, fallback smoothly to browser-based OAuth flow below
        console.warn("Native Google auth fallback to browser:", nativeRes.error);
      }

      // 2. Web / Browser OAuth Flow
      const isNative =
        typeof window !== "undefined" &&
        (window.location.origin.includes("life.mgn.app") ||
          window.location.origin.includes("localhost") ||
          window.navigator.userAgent.includes("Capacitor") ||
          window.navigator.userAgent.includes("Android"));

      const callbackURL = isNative
        ? "https://www.mgn.life/auth/mobile-callback"
        : "/home";

      const result = await authClient.signIn.social({
        provider: "google",
        callbackURL,
      });

      if (result?.error) {
        setFormError(result.error.message || "Failed to sign in with Google.");
        setIsSubmitting(false);
        setIsAwaitingOAuth(false);
        return;
      }

      if (result?.data?.url) {
        await openOAuthBrowser(result.data.url);
      }
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Failed to sign in with Google."
      );
      setIsSubmitting(false);
      setIsAwaitingOAuth(false);
    }
  }

  return (
    <div className="min-h-dvh overflow-x-hidden bg-[#eef5fc] bg-[url('/mobbg.png')] bg-cover bg-center bg-no-repeat md:bg-[url('/loginbg.png')]">
      <div className="flex min-h-dvh items-center justify-center px-7 py-8 sm:px-8 md:px-8 lg:justify-end lg:px-[8vw]">
        <div className="w-full max-w-[360px] -translate-y-6 px-1 py-2 sm:max-w-[380px] sm:px-2 lg:max-w-[420px] lg:-translate-y-12 lg:px-0">
          <h2 className="text-[2.1rem] font-semibold tracking-[-0.06em] text-[#171717] sm:text-[2.6rem]">
            {mode === "signin" ? "Welcome back" : "Create your account"}
          </h2>

          <div className="mt-5 flex justify-between rounded-full border border-[#e6dfd9] bg-white/50 p-1">
            <button
              type="button"
              onClick={() => {
                setMode("signin");
                setFormError("");
                setSuccessMessage("");
              }}
              className={cn(
                "flex-1 rounded-full px-4 py-2 text-sm font-medium transition",
                mode === "signin" ? "bg-[#1769c2] text-white shadow-sm" : "text-[#5d5854]",
              )}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setFormError("");
                setSuccessMessage("");
              }}
              className={cn(
                "flex-1 rounded-full px-4 py-2 text-sm font-medium transition",
                mode === "signup" ? "bg-[#1769c2] text-white shadow-sm" : "text-[#5d5854]",
              )}
            >
              Sign up
            </button>
          </div>

          {isForgotPassword ? (
            <form onSubmit={handleForgotPassword} className="mt-6 space-y-4">
              <div className="space-y-1">
                <Label htmlFor="forgot-email" className="text-xs uppercase tracking-[0.14em] text-[#6c6863]">
                  Email address
                </Label>
                <Input
                  id="forgot-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="doctor@hospital.org"
                  className="h-11 rounded-xl border-[#d9d3ce] bg-white text-sm"
                  required
                />
              </div>

              {formError && <p className="text-sm text-[#8a2f2f]">{formError}</p>}
              {successMessage && <p className="text-sm text-[#1f6f46]">{successMessage}</p>}

              <Button
                type="submit"
                className="h-11 w-full rounded-xl bg-[#1769c2] text-base text-white hover:bg-[#12569f]"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending..." : "Send reset instructions"}
              </Button>

              <button
                type="button"
                onClick={() => {
                  setIsForgotPassword(false);
                  setFormError("");
                  setSuccessMessage("");
                }}
                className="w-full text-center text-xs font-semibold text-[#5d5854] hover:text-[#171717]"
              >
                Back to sign in
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {mode === "signup" && (
                <div className="space-y-1">
                  <Label htmlFor="fullName" className="text-xs uppercase tracking-[0.14em] text-[#6c6863]">
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Dr. Jane Doe"
                    className="h-11 rounded-xl border-[#d9d3ce] bg-white text-sm"
                    required
                  />
                </div>
              )}

              <div className="space-y-1">
                <Label htmlFor="email" className="text-xs uppercase tracking-[0.14em] text-[#6c6863]">
                  Email address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="doctor@hospital.org"
                  className="h-11 rounded-xl border-[#d9d3ce] bg-white text-sm"
                  required
                />
              </div>

              {showPasswordField && (
                <>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-xs uppercase tracking-[0.14em] text-[#6c6863]">
                        Password
                      </Label>
                      {mode === "signin" && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsForgotPassword(true);
                            setFormError("");
                            setSuccessMessage("");
                          }}
                          className="text-xs text-[#5d5854] hover:text-[#171717]"
                        >
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="h-11 rounded-xl border-[#d9d3ce] bg-white pr-10 text-sm"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7f7871] hover:text-[#171717]"
                      >
                        <EyeIcon open={showPassword} />
                      </button>
                    </div>
                  </div>

                  {mode === "signup" && (
                    <div className="space-y-1">
                      <Label htmlFor="confirmPassword" className="text-xs uppercase tracking-[0.14em] text-[#6c6863]">
                        Confirm Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className={cn(
                            "h-11 rounded-xl border-[#d9d3ce] bg-white pr-10 text-sm",
                            hasPasswordMismatch && "border-red-500 focus-visible:ring-red-500/30",
                          )}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7f7871] hover:text-[#171717]"
                        >
                          <EyeIcon open={showConfirmPassword} />
                        </button>
                      </div>
                      {hasPasswordMismatch && (
                        <p className="text-xs text-red-500">Passwords do not match</p>
                      )}
                    </div>
                  )}
                </>
              )}

              {mode === "signin" && submitted && passwordInvalid && (
                <p className="text-sm text-[#8a2f2f]">Wrong password. Try again or reset it.</p>
              )}

              {formError && <p className="text-sm text-[#8a2f2f]">{formError}</p>}
              {successMessage && <p className="text-sm text-[#1f6f46]">{successMessage}</p>}

              {mode === "signup" && (
                <label className="flex items-start gap-3 text-sm text-[#4f4a46]">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-[#cfc6be] text-[#171717] focus:ring-[#171717]"
                    required
                  />
                  <span>
                    I agree to the <a href="#" className="font-medium text-[#171717] underline-offset-4 hover:underline">terms</a> and <a href="#" className="font-medium text-[#171717] underline-offset-4 hover:underline">privacy policy</a>.
                  </span>
                </label>
              )}

              <Button
                type="submit"
                className="mt-2 h-11 w-full rounded-xl bg-[#1769c2] text-base text-white hover:bg-[#12569f]"
                disabled={
                  isSubmitting ||
                  (mode === "signup" && (!agreedToTerms || !password || !confirmPassword || !passwordsMatch))
                }
              >
                {isSubmitting ? (mode === "signin" ? "Signing in..." : "Creating account...") : mode === "signin" ? "Sign in" : "Create account"}
              </Button>
            </form>
          )}

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <Separator className="bg-[#d9d3ce]" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-[0.2em]">
              <span className="bg-[#f5f3f1] px-2 text-[#6c6863]">or with</span>
            </div>
          </div>

          <Button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isSubmitting}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#cfc6be] bg-[#f9f7f4] text-[#1f1f1f] shadow-none transition hover:bg-white disabled:opacity-50"
          >
            <GoogleIcon className="h-5 w-5 shrink-0" aria-hidden={true} />
            <span className="text-sm font-medium">
              {isSubmitting ? "Connecting to Google..." : "Continue with Google"}
            </span>
          </Button>

          <p className="mt-4 text-xs text-[#71706d] sm:text-[13px]">
            By signing in, you agree to our{" "}
            <a href="#" className="underline underline-offset-4 text-[#1b1b1b]">
              terms of service
            </a>{" "}
            and{" "}
            <a href="#" className="underline underline-offset-4 text-[#1b1b1b]">
              privacy policy
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Login01() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-[#eef5fc]" />}>
      <LoginFormContent />
    </Suspense>
  );
}
