"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" /><circle cx="12" cy="12" r="2.5" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="m3 3 18 18M10.6 6.2A10.8 10.8 0 0 1 12 6c6 0 9.5 6 9.5 6a17 17 0 0 1-3.2 3.8M6.5 6.9C3.9 8.5 2.5 12 2.5 12s3.5 6 9.5 6c1 0 1.9-.2 2.7-.4" />
    </svg>
  );
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const [token, setToken] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  React.useEffect(() => {
    setToken(new URLSearchParams(window.location.search).get("token") || "");
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!token) {
      setError("This password reset link is missing or invalid.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await authClient.resetPassword({
        newPassword: password,
        token,
      });

      if (result.error) {
        setError(result.error.message || "Unable to reset your password.");
        return;
      }

      setMessage("Password updated successfully. Redirecting to sign in...");
      window.setTimeout(() => router.replace("/"), 1200);
    } catch (resetError) {
      setError(resetError instanceof Error ? resetError.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#eef5fc] px-6 py-10 text-[#171717]">
      <section className="w-full max-w-[420px]">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#1769c2]">MGN</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">Reset your password</h1>
        <p className="mt-2 text-sm text-[#5d5854]">Choose a new password for your account.</p>

        <form onSubmit={handleSubmit} className="mt-7 space-y-4">
          <label className="block text-sm font-medium">
            New password
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-2 h-11 w-full rounded-xl border border-[#b8c8d8] bg-white/70 px-3 pr-11 outline-none focus:border-[#1769c2] focus:ring-2 focus:ring-[#1769c2]/30"
                required
              />
              <button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((visible) => !visible)} className="absolute right-3 top-1/2 text-[#1769c2] -translate-y-1/2">
                <EyeIcon open={showPassword} />
              </button>
            </div>
          </label>
          <label className="block text-sm font-medium">
            Confirm password
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="mt-2 h-11 w-full rounded-xl border border-[#b8c8d8] bg-white/70 px-3 pr-11 outline-none focus:border-[#1769c2] focus:ring-2 focus:ring-[#1769c2]/30"
                required
              />
              <button type="button" aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"} onClick={() => setShowConfirmPassword((visible) => !visible)} className="absolute right-3 top-1/2 text-[#1769c2] -translate-y-1/2">
                <EyeIcon open={showConfirmPassword} />
              </button>
            </div>
          </label>

          {error && <p className="text-sm text-[#8a2f2f]">{error}</p>}
          {message && <p className="text-sm text-[#1f6f46]">{message}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="h-11 w-full rounded-xl bg-[#1769c2] text-sm font-medium text-white transition hover:bg-[#12569f] disabled:opacity-60"
          >
            {isSubmitting ? "Updating password..." : "Update password"}
          </button>
        </form>
      </section>
    </main>
  );
}
