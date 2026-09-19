"use client";

import * as React from "react";
import { JSX, SVGProps } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

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
    preserveAspectRatio="xMidYMid meet"
    shapeRendering="geometricPrecision"
    {...props}
    aria-hidden="true"
  >
    <path
      fill="#EA4335"
      d="M24 9.5c3.54 0 6.73 1.22 9.24 3.61l6.85-6.85C34.72 2.76 29.75 0 24 0 14.62 0 6.36 5.4 2.49 13.3l8.06 6.26C12.57 14.77 17.83 9.5 24 9.5Z"
    />
    <path
      fill="#4285F4"
      d="M46.5 24.5c0-1.63-.14-3.2-.4-4.7H24v8.96h12.83c-.56 2.98-2.2 5.52-4.7 7.24l7.62 5.92C43.4 36.64 46.5 31.26 46.5 24.5Z"
    />
    <path
      fill="#FBBC05"
      d="M32.13 36.99c-2.04 1.37-4.65 2.17-8.13 2.17-6.17 0-11.39-4.17-13.24-9.77l-8.06 6.27C6.36 42.6 14.62 48 24 48c7.25 0 13.35-2.39 17.8-6.46l-9.67-4.55Z"
    />
    <path
      fill="#34A853"
      d="M10.76 29.39A14.1 14.1 0 0 1 9.5 24c0-1.54.27-3.03.76-4.39l-8.06-6.26A23.46 23.46 0 0 0 0 24c0 3.76.9 7.32 2.49 10.46l8.27-6.07Z"
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

export default function Login01() {
  const router = useRouter();
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

  React.useEffect(() => {
    if (!isSessionPending && session) {
      router.replace("/home");
    }
  }, [isSessionPending, router, session]);

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
    try {
      const callbackURL =
        typeof window !== "undefined"
          ? `${window.location.origin}/home`
          : "http://localhost:3000/home";

      const result = await authClient.signIn.social({
        provider: "google",
        callbackURL,
      });

      if (result?.error) {
        setFormError(result.error.message || "Failed to sign in with Google.");
        setIsSubmitting(false);
        return;
      }

      if (result?.data?.url) {
        window.location.href = result.data.url;
      }
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Failed to sign in with Google.");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#eef5fc] bg-[url('/mobbg.png')] bg-cover bg-center bg-no-repeat md:bg-[url('/loginbg.png')]">
      <div className="flex min-h-screen items-center justify-center px-7 py-8 sm:px-8 md:px-8 lg:justify-end lg:px-[8vw]">
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
              <form onSubmit={handleForgotPassword} className="mt-6 space-y-3.5">
                <div>
                  <Label htmlFor="resetEmail" className="font-medium text-[#171717]">
                    Email
                  </Label>
                  <Input
                    type="email"
                    id="resetEmail"
                    name="resetEmail"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@company.com"
                    className="mt-2 h-11 rounded-xl border-white/70 bg-white/65 text-[15px] shadow-[0_4px_18px_rgba(36,75,112,0.08)] backdrop-blur-md"
                  />
                </div>

                {formError && <p className="text-sm text-[#8a2f2f]">{formError}</p>}
                {successMessage && <p className="text-sm text-[#1f6f46]">{successMessage}</p>}

                <Button
                  type="submit"
                  className="h-11 w-full rounded-xl bg-[#1769c2] text-base text-white hover:bg-[#12569f]"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending..." : "Send reset link"}
                </Button>

                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPassword(false);
                    setFormError("");
                    setSuccessMessage("");
                  }}
                  className="w-full text-center text-sm font-medium text-[#1769c2] hover:underline"
                >
                  Back to sign in
                </button>
              </form>
            ) : (
            <form
              onSubmit={handleSubmit}
              className={cn("mt-6", mode === "signup" ? "space-y-2.5" : "space-y-3.5")}
            >
            {mode === "signup" && (
              <div>
                <Label htmlFor="fullName" className="font-medium text-[#171717]">
                  Full name
                </Label>
                <Input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  className="mt-2 h-11 rounded-xl border-white/70 bg-white/65 text-[15px] shadow-[0_4px_18px_rgba(36,75,112,0.08)] backdrop-blur-md"
                />
              </div>
            )}

            <div>
              <Label htmlFor="email" className="font-medium text-[#171717]">
                Email
              </Label>
              <Input
                type="email"
                id="email"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@company.com"
                className="mt-2 h-11 rounded-xl border-white/70 bg-white/65 text-[15px] shadow-[0_4px_18px_rgba(36,75,112,0.08)] backdrop-blur-md"
              />
            </div>

            {showPasswordField && (
              <>
                <div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="font-medium text-[#171717]">
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
                        className="text-sm font-medium text-[#1769c2] underline-offset-4 hover:underline"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      autoComplete={mode === "signin" ? "current-password" : "new-password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={mode === "signin" ? "Enter your password" : "Create a password"}
                      className="mt-2 h-11 rounded-xl border-white/70 bg-white/65 pr-11 text-[15px] shadow-[0_4px_18px_rgba(36,75,112,0.08)] backdrop-blur-md"
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      onClick={() => setShowPassword((visible) => !visible)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1769c2]"
                    >
                      <EyeIcon open={showPassword} />
                    </button>
                  </div>
                </div>

                {mode === "signup" && (
                  <div>
                    <Label htmlFor="confirmPassword" className="font-medium text-[#171717]">
                      Confirm password
                    </Label>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        id="confirmPassword"
                        name="confirmPassword"
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter your password"
                        className="mt-2 h-12 rounded-xl border-white/70 bg-white/65 pr-11 text-[15px] shadow-[0_4px_18px_rgba(36,75,112,0.08)] backdrop-blur-md"
                      />
                      <button
                        type="button"
                        aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                        onClick={() => setShowConfirmPassword((visible) => !visible)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1769c2]"
                      >
                        <EyeIcon open={showConfirmPassword} />
                      </button>
                    </div>
                    {hasPasswordMismatch && (
                      <p className="mt-1 text-xs text-[#8a2f2f]">Passwords do not match.</p>
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
