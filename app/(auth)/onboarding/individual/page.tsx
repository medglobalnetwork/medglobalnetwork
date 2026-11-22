"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Check,
  AlertTriangle,
  ShieldCheck,
  Loader2,
  CheckCircle2,
} from "lucide-react";

interface PasswordStrength {
  score: number;
  feedback: string[];
  requirements: {
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
    special: boolean;
  };
}

const calculatePasswordStrength = (password: string): PasswordStrength => {
  const requirements = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
  };

  const score = Object.values(requirements).filter(Boolean).length;
  const feedback: string[] = [];

  if (!requirements.length) feedback.push("At least 8 characters");
  if (!requirements.uppercase) feedback.push("One uppercase letter");
  if (!requirements.lowercase) feedback.push("One lowercase letter");
  if (!requirements.number) feedback.push("One number");
  if (!requirements.special) feedback.push("One special character");

  return { score, feedback, requirements };
};

const COUNTRY_CODES = [
  { code: "+91", label: "India (+91)", flag: "🇮🇳" },
  { code: "+1", label: "USA / Canada (+1)", flag: "🇺🇸" },
  { code: "+44", label: "UK (+44)", flag: "🇬🇧" },
  { code: "+971", label: "UAE (+971)", flag: "🇦🇪" },
  { code: "+65", label: "Singapore (+65)", flag: "🇸🇬" },
  { code: "+61", label: "Australia (+61)", flag: "🇦🇺" },
  { code: "+49", label: "Germany (+49)", flag: "🇩🇪" },
  { code: "+33", label: "France (+33)", flag: "🇫🇷" },
];

export default function IndividualOnboardingPage() {
  const router = useRouter();

  // Form State
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [countryCode, setCountryCode] = React.useState("+91");
  const [phone, setPhone] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [agreeTerms, setAgreeTerms] = React.useState(false);

  // Validation & Touched States
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});
  const [backendError, setBackendError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  // Preserve Page 1 account type
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("mgn_onboarding_account_type");
      if (!stored) {
        // Default to individual if opened directly
        localStorage.setItem("mgn_onboarding_account_type", "INDIVIDUAL");
      }
    }
  }, []);

  const markTouched = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  // Inline Validation Computations
  const isFirstNameValid = firstName.trim().length >= 1;
  const isLastNameValid = lastName.trim().length >= 1;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const phoneDigits = phone.replace(/\D/g, "");
  const isPhoneValid = phoneDigits.length >= 10;
  const passwordStrength = calculatePasswordStrength(password);
  const isPasswordValid = password.length >= 8;

  const isFormValid =
    isFirstNameValid &&
    isLastNameValid &&
    isEmailValid &&
    isPhoneValid &&
    isPasswordValid &&
    agreeTerms;

  // Strength Styling
  const getStrengthBarColor = (score: number) => {
    if (score <= 1) return "bg-rose-500";
    if (score <= 2) return "bg-amber-500";
    if (score <= 3) return "bg-yellow-500";
    if (score <= 4) return "bg-[#168B78]";
    return "bg-emerald-500";
  };

  const getStrengthLabel = (score: number) => {
    if (score <= 1) return { text: "Very Weak", color: "text-rose-500" };
    if (score <= 2) return { text: "Weak", color: "text-amber-500" };
    if (score <= 3) return { text: "Fair", color: "text-yellow-600" };
    if (score <= 4) return { text: "Good", color: "text-[#168B78]" };
    return { text: "Strong", color: "text-emerald-600 font-bold" };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBackendError(null);

    // Mark all touched
    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      password: true,
      agreeTerms: true,
    });

    if (!isFormValid || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const payload = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        countryCode,
        phone: phone.trim(),
        password,
        accountType: "INDIVIDUAL",
      };

      const res = await fetch("/api/onboarding/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setBackendError(data.error || "Failed to create account. Please check your details.");
        setIsSubmitting(false);
        return;
      }

      // Store credentials & progress for subsequent OTP steps
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("mgn_onboarding_account_type", "INDIVIDUAL");
          localStorage.setItem(
            "mgn_onboarding_registered_user",
            JSON.stringify({
              userId: data.userId,
              email: data.email,
              phone: data.phone,
              fullName: data.fullName,
            })
          );
        } catch (storageErr) {
          console.warn("Storage save warning:", storageErr);
        }
      }

      setSuccessMessage("Account created successfully! Verification codes dispatched.");

      // Route to next onboarding verification step after short timeout
      setTimeout(() => {
        router.push("/onboarding/individual/verify");
      }, 900);
    } catch (err: any) {
      console.error("Submission error:", err);
      setBackendError("An unexpected network error occurred. Please try again.");
      setIsSubmitting(false);
    }
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
                Individual Registration
              </span>
            </div>
          </Link>

          {/* Already a member? Sign In on Right */}
          <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            <span>Already registered? </span>
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
        <div className="w-full max-w-xl mx-auto space-y-6">
          {/* Navigation Back link */}
          <div>
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#102D45] dark:text-slate-400 dark:hover:text-white transition group"
            >
              <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
              <span>Back to Account Selection</span>
            </Link>
          </div>

          {/* Main Card Container */}
          <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#121c2a] p-6 sm:p-9 shadow-md relative overflow-hidden">
            {/* Header inside Card */}
            <div className="space-y-2 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#168B78]/10 text-[#168B78] dark:bg-teal-950/40 dark:text-[#2dd4bf]">
                  <User className="size-3.5" />
                  <span>Individual Account</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const rnd = Math.floor(100 + Math.random() * 900);
                    setFirstName("Dr. Aman");
                    setLastName("Verma");
                    setEmail(`aman.verma${rnd}@mgn.life`);
                    setCountryCode("+91");
                    setPhone("9876543210");
                    setPassword("Doctor@MGN2026");
                    setAgreeTerms(true);
                    setTouched({});
                    setBackendError(null);
                  }}
                  className="text-xs font-bold text-[#168B78] hover:text-[#116a5c] dark:text-[#2dd4bf] hover:underline cursor-pointer flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800"
                >
                  <span>⚡ Auto-fill Dummy Details</span>
                </button>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#102D45] dark:text-white tracking-tight">
                Create Your Profile
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Join verified clinicians, students, and healthcare professionals across India.
              </p>
            </div>

            {/* Error Alert */}
            {backendError && (
              <div className="mt-5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs sm:text-sm text-rose-700 dark:text-rose-300 flex items-start gap-2.5 animate-in fade-in">
                <AlertTriangle className="size-4 shrink-0 text-rose-500 mt-0.5" />
                <span className="leading-relaxed font-medium">{backendError}</span>
              </div>
            )}

            {/* Success Alert */}
            {successMessage && (
              <div className="mt-5 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-xs sm:text-sm text-emerald-700 dark:text-emerald-300 flex items-center gap-2.5 animate-in fade-in">
                <CheckCircle2 className="size-4.5 shrink-0 text-emerald-600" />
                <span className="font-semibold">{successMessage}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-6 space-y-4 sm:space-y-5" noValidate>
              {/* Row 1: First Name & Last Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* First Name */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="firstName"
                    className="block text-xs font-bold text-[#102D45] dark:text-slate-200"
                  >
                    First Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="firstName"
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      onBlur={() => markTouched("firstName")}
                      placeholder="e.g. Rajesh"
                      autoComplete="given-name"
                      className={`w-full rounded-xl border bg-slate-50/50 dark:bg-[#0b131e] px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 transition-all ${
                        touched.firstName && !isFirstNameValid
                          ? "border-rose-400 focus:ring-rose-400"
                          : "border-slate-300 dark:border-slate-700 focus:ring-[#168B78] focus:border-[#168B78]"
                      }`}
                    />
                  </div>
                  {touched.firstName && !isFirstNameValid && (
                    <p className="text-[11px] text-rose-500 font-medium">First name is required.</p>
                  )}
                </div>

                {/* Last Name */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="lastName"
                    className="block text-xs font-bold text-[#102D45] dark:text-slate-200"
                  >
                    Last Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="lastName"
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      onBlur={() => markTouched("lastName")}
                      placeholder="e.g. Sharma"
                      autoComplete="family-name"
                      className={`w-full rounded-xl border bg-slate-50/50 dark:bg-[#0b131e] px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 transition-all ${
                        touched.lastName && !isLastNameValid
                          ? "border-rose-400 focus:ring-rose-400"
                          : "border-slate-300 dark:border-slate-700 focus:ring-[#168B78] focus:border-[#168B78]"
                      }`}
                    />
                  </div>
                  {touched.lastName && !isLastNameValid && (
                    <p className="text-[11px] text-rose-500 font-medium">Last name is required.</p>
                  )}
                </div>
              </div>

              {/* Row 2: Email Address */}
              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="block text-xs font-bold text-[#102D45] dark:text-slate-200"
                >
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="size-4" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => markTouched("email")}
                    placeholder="doctor@hospital.org or personal@gmail.com"
                    autoComplete="email"
                    className={`w-full rounded-xl border bg-slate-50/50 dark:bg-[#0b131e] pl-10 pr-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 transition-all ${
                      touched.email && !isEmailValid
                        ? "border-rose-400 focus:ring-rose-400"
                        : "border-slate-300 dark:border-slate-700 focus:ring-[#168B78] focus:border-[#168B78]"
                    }`}
                  />
                </div>
                {touched.email && !isEmailValid && (
                  <p className="text-[11px] text-rose-500 font-medium">
                    Please enter a valid email address.
                  </p>
                )}
              </div>

              {/* Row 3: Mobile Number with Country Code */}
              <div className="space-y-1.5">
                <label
                  htmlFor="phone"
                  className="block text-xs font-bold text-[#102D45] dark:text-slate-200"
                >
                  Mobile Number <span className="text-rose-500">*</span>
                </label>
                <div className="flex gap-2">
                  {/* Country Code Select */}
                  <div className="relative w-36 shrink-0">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      aria-label="Country Code"
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-[#0b131e] px-3 py-2.5 text-sm text-slate-900 dark:text-white font-medium focus:outline-hidden focus:ring-2 focus:ring-[#168B78] transition-all cursor-pointer"
                    >
                      {COUNTRY_CODES.map((item) => (
                        <option key={item.code} value={item.code}>
                          {item.flag} {item.code}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Phone Input */}
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Phone className="size-4" />
                    </div>
                    <input
                      id="phone"
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      onBlur={() => markTouched("phone")}
                      placeholder="98765 43210"
                      autoComplete="tel-national"
                      className={`w-full rounded-xl border bg-slate-50/50 dark:bg-[#0b131e] pl-10 pr-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 transition-all ${
                        touched.phone && !isPhoneValid
                          ? "border-rose-400 focus:ring-rose-400"
                          : "border-slate-300 dark:border-slate-700 focus:ring-[#168B78] focus:border-[#168B78]"
                      }`}
                    />
                  </div>
                </div>
                {touched.phone && !isPhoneValid && (
                  <p className="text-[11px] text-rose-500 font-medium">
                    Please enter a valid 10-digit mobile number.
                  </p>
                )}
              </div>

              {/* Row 4: Password with Visibility Toggle & Strength */}
              <div className="space-y-1.5">
                <label
                  htmlFor="password"
                  className="block text-xs font-bold text-[#102D45] dark:text-slate-200"
                >
                  Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="size-4" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => markTouched("password")}
                    placeholder="Create a strong password (min 8 chars)"
                    autoComplete="new-password"
                    className={`w-full rounded-xl border bg-slate-50/50 dark:bg-[#0b131e] pl-10 pr-11 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 transition-all ${
                      touched.password && !isPasswordValid
                        ? "border-rose-400 focus:ring-rose-400"
                        : "border-slate-300 dark:border-slate-700 focus:ring-[#168B78] focus:border-[#168B78]"
                    }`}
                  />
                  {/* Visibility Toggle */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {password.length > 0 && (
                  <div className="pt-1.5 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 dark:text-slate-400">Password strength:</span>
                      <span className={`font-semibold ${getStrengthLabel(passwordStrength.score).color}`}>
                        {getStrengthLabel(passwordStrength.score).text}
                      </span>
                    </div>

                    {/* Progress segments */}
                    <div className="grid grid-cols-5 gap-1.5 h-1.5">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`rounded-full transition-all duration-300 ${
                            passwordStrength.score >= level
                              ? getStrengthBarColor(passwordStrength.score)
                              : "bg-slate-200 dark:bg-slate-800"
                          }`}
                        />
                      ))}
                    </div>

                    {/* Requirement hint */}
                    {password.length < 8 && (
                      <p className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1">
                        <AlertTriangle className="size-3 shrink-0" />
                        <span>Password must be at least 8 characters long.</span>
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Row 5: Terms & Conditions Checkbox */}
              <div className="pt-2">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <div className="relative flex items-center pt-0.5">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="size-4.5 rounded-md border-slate-300 dark:border-slate-700 text-[#168B78] focus:ring-[#168B78] cursor-pointer"
                    />
                  </div>
                  <span className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    I agree to the{" "}
                    <Link
                      href="/terms"
                      target="_blank"
                      className="font-bold text-[#168B78] hover:underline"
                    >
                      Terms &amp; Conditions
                    </Link>{" "}
                    and acknowledge the{" "}
                    <Link
                      href="/privacy"
                      target="_blank"
                      className="font-bold text-[#168B78] hover:underline"
                    >
                      Privacy Policy
                    </Link>
                    .
                  </span>
                </label>
                {touched.agreeTerms && !agreeTerms && (
                  <p className="text-[11px] text-rose-500 font-medium mt-1">
                    You must accept the Terms &amp; Privacy Policy to continue.
                  </p>
                )}
              </div>

              {/* Submit / Continue Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={!isFormValid || isSubmitting}
                  className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all duration-200 ${
                    isFormValid && !isSubmitting
                      ? "bg-[#102D45] hover:bg-[#0c2235] text-white shadow-md hover:shadow-lg active:scale-98 cursor-pointer"
                      : "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="size-4.5 animate-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Continue to Verification</span>
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Footer Trust Tag */}
            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="size-3.5 text-[#168B78]" />
              <span>Passwords are cryptographically hashed server-side</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
