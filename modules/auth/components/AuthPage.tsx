"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  AlertTriangle,
  KeyRound,
  Phone,
  Loader2,
  CheckCircle2,
  Building2,
  Hospital,
  AtSign,
  ArrowRight,
  ShieldCheck,
  Users,
  BookOpen,
  TrendingUp,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

// Password strength calculation utility
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

const PasswordStrengthIndicator: React.FC<{ password: string }> = ({ password }) => {
  const strength = calculatePasswordStrength(password);

  const getStrengthColor = (score: number) => {
    if (score <= 1) return "text-rose-500 bg-rose-500";
    if (score <= 2) return "text-amber-500 bg-amber-500";
    if (score <= 3) return "text-yellow-500 bg-yellow-500";
    if (score <= 4) return "text-blue-500 bg-blue-500";
    return "text-emerald-500 bg-emerald-500";
  };

  const getStrengthText = (score: number) => {
    if (score <= 1) return "Very Weak";
    if (score <= 2) return "Weak";
    if (score <= 3) return "Fair";
    if (score <= 4) return "Good";
    return "Strong";
  };

  if (!password) return null;

  return (
    <div className="mt-2 space-y-1.5 animate-in fade-in-50 slide-in-from-bottom-1">
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-[#ded8d1]/60 dark:bg-[#30363d] rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-full ${getStrengthColor(strength.score)} rounded-full transition-all duration-300`}
            style={{ width: `${(strength.score / 5) * 100}%` }}
          />
        </div>
        <span className="text-[11px] font-medium text-[#77716b] dark:text-[#8b949e] min-w-[55px] text-right">
          {getStrengthText(strength.score)}
        </span>
      </div>
      {strength.feedback.length > 0 && (
        <div className="grid grid-cols-2 gap-1 pt-0.5">
          {strength.feedback.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-1 text-[10px] font-normal text-amber-600 dark:text-amber-400"
            >
              <AlertTriangle className="size-2.5 shrink-0" />
              <span className="truncate">{item}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const ORGANISATION_TYPES_LIST = [
  { id: "hospital", label: "Hospital / Healthcare Facility" },
  { id: "clinic", label: "Clinic / Specialized Rehabilitation Center" },
  { id: "diagnostic_center", label: "Diagnostic Laboratory / Imaging Center" },
  { id: "medical_college", label: "Medical / Health Science College" },
  { id: "research_institute", label: "Research Institute / Biotech Lab" },
  { id: "pharma_device", label: "Pharmaceutical / Medical Device Enterprise" },
  { id: "ngo_healthcare", label: "Healthcare NGO / Trust / Foundation" },
  { id: "healthtech_startup", label: "HealthTech / Digital Health Company" },
  { id: "other_org", label: "Other Healthcare Organization" },
];

interface AuthPageProps {
  defaultMode?: "signin" | "signup";
}

interface FormErrors {
  name?: string;
  username?: string;
  orgName?: string;
  repName?: string;
  orgType?: string;
  email?: string;
  identifier?: string;
  password?: string;
  confirmPassword?: string;
  phone?: string;
  agreeToTerms?: string;
  general?: string;
}

export function AuthPage({ defaultMode = "signin" }: AuthPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, isPending: isSessionPending } = authClient.useSession();

  const queryMode = searchParams?.get("mode");
  const [mode, setMode] = React.useState<"signin" | "signup">(
    queryMode === "signup" ? "signup" : queryMode === "signin" ? "signin" : defaultMode
  );

  // Login Input Method: Email vs Phone
  const [loginMethod, setLoginMethod] = React.useState<"email" | "phone">("email");

  // Account Type Selection: INDIVIDUAL vs ORGANISATION (For Signup)
  const [accountType, setAccountType] = React.useState<"INDIVIDUAL" | "ORGANISATION">("INDIVIDUAL");

  // Form Fields
  const [identifier, setIdentifier] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [agreedToTerms, setAgreedToTerms] = React.useState(false);
  const [rememberMe, setRememberMe] = React.useState(false);

  // Individual Fields
  const [fullName, setFullName] = React.useState("");

  // Organisation Fields
  const [orgName, setOrgName] = React.useState("");
  const [orgType, setOrgType] = React.useState("hospital");
  const [repName, setRepName] = React.useState("");

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [fieldTouched, setFieldTouched] = React.useState<Record<string, boolean>>({});
  const [successMessage, setSuccessMessage] = React.useState("");
  const [isForgotPassword, setIsForgotPassword] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  // Load saved email/username on mount
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const savedIdentifier = localStorage.getItem("userIdentifier") || localStorage.getItem("userEmail");
      const savedRemember = localStorage.getItem("rememberMe") === "true";
      if (savedIdentifier) {
        setIdentifier(savedIdentifier);
        setEmail(savedIdentifier);
        setRememberMe(savedRemember);
      }
    }
  }, []);

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
      setErrors({ general: errorDesc || `Authentication error: ${error}` });
    }
  }, [searchParams]);

  // Redirect if already logged in
  React.useEffect(() => {
    if (!isSessionPending && session?.user) {
      router.replace("/home");
    }
  }, [isSessionPending, session, router]);

  // Auto-generate username suggestion on name input
  const handleNameChange = (val: string) => {
    setFullName(val);
    if (!username || username === fullName.toLowerCase().replace(/[^a-z0-9]/g, "")) {
      const suggested = val
        .toLowerCase()
        .replace(/^(dr\.|dr|mr\.|ms\.|prof\.)\s*/i, "")
        .replace(/[^a-z0-9_.]/g, "")
        .slice(0, 20);
      setUsername(suggested);
    }
  };

  const handleOrgNameChange = (val: string) => {
    setOrgName(val);
    if (!username || username === orgName.toLowerCase().replace(/[^a-z0-9]/g, "")) {
      const suggested = val
        .toLowerCase()
        .replace(/[^a-z0-9_.]/g, "")
        .slice(0, 20);
      setUsername(suggested);
    }
  };

  // Field validator
  const validateField = React.useCallback(
    (field: string, value: string | boolean) => {
      let error = "";
      switch (field) {
        case "identifier":
          if (mode === "signin") {
            if (!value || (typeof value === "string" && !value.trim())) {
              error = loginMethod === "phone" ? "Phone number is required" : "Email address is required";
            }
          }
          break;
        case "name":
          if (mode === "signup" && accountType === "INDIVIDUAL") {
            if (!value || (typeof value === "string" && value.trim().length < 2)) {
              error = "Full name is required (minimum 2 characters)";
            }
          }
          break;
        case "orgName":
          if (mode === "signup" && accountType === "ORGANISATION") {
            if (!value || (typeof value === "string" && value.trim().length < 2)) {
              error = "Organisation / Hospital name is required";
            }
          }
          break;
        case "repName":
          if (mode === "signup" && accountType === "ORGANISATION") {
            if (!value || (typeof value === "string" && value.trim().length < 2)) {
              error = "Authorized representative name is required";
            }
          }
          break;
        case "email":
          if (mode === "signup") {
            if (!value || (typeof value === "string" && !value.trim())) {
              error = "Email address is required";
            } else if (typeof value === "string" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
              error = "Please enter a valid email address";
            }
          }
          break;
        case "username":
          if (mode === "signup" && value && typeof value === "string") {
            if (value.length < 3) {
              error = "Username must be at least 3 characters";
            } else if (!/^[a-zA-Z0-9_.]+$/.test(value)) {
              error = "Username can only contain letters, numbers, dots, and underscores";
            }
          }
          break;
        case "password":
          if (!value) {
            error = "Password is required";
          } else if (typeof value === "string") {
            if (value.length < 8) {
              error = "Password must be at least 8 characters";
            } else if (mode === "signup") {
              const strength = calculatePasswordStrength(value);
              if (strength.score < 2) {
                error = "Password is too weak";
              }
            }
          }
          break;
        case "confirmPassword":
          if (mode === "signup" && value !== password) {
            error = "Passwords do not match";
          }
          break;
        case "agreeToTerms":
          if (mode === "signup" && !value) {
            error = "You must agree to the Terms of Service & Privacy Policy";
          }
          break;
      }
      return error;
    },
    [mode, loginMethod, accountType, password]
  );

  const handleFieldBlur = (field: string, value: string | boolean) => {
    setFieldTouched((prev) => ({ ...prev, [field]: true }));
    const err = validateField(field, value);
    setErrors((prev) => ({ ...prev, [field]: err || undefined }));
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    if (field === "identifier") setIdentifier(value as string);
    if (field === "email") setEmail(value as string);
    if (field === "username") setUsername(value as string);
    if (field === "password") setPassword(value as string);
    if (field === "confirmPassword") setConfirmPassword(value as string);
    if (field === "name") handleNameChange(value as string);
    if (field === "orgName") handleOrgNameChange(value as string);
    if (field === "repName") setRepName(value as string);
    if (field === "orgType") setOrgType(value as string);
    if (field === "phone") setPhone(value as string);
    if (field === "agreeToTerms") setAgreedToTerms(value as boolean);
    if (field === "rememberMe") setRememberMe(value as boolean);

    if (fieldTouched[field]) {
      const err = validateField(field, value);
      setErrors((prev) => ({ ...prev, [field]: err || undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (mode === "signin") {
      const idErr = validateField("identifier", identifier);
      if (idErr) newErrors.identifier = idErr;
      const passErr = validateField("password", password);
      if (passErr) newErrors.password = passErr;
    } else {
      const emailErr = validateField("email", email);
      if (emailErr) newErrors.email = emailErr;

      const passErr = validateField("password", password);
      if (passErr) newErrors.password = passErr;

      if (accountType === "INDIVIDUAL") {
        const nameErr = validateField("name", fullName);
        if (nameErr) newErrors.name = nameErr;
      } else {
        const orgNameErr = validateField("orgName", orgName);
        if (orgNameErr) newErrors.orgName = orgNameErr;
        const repNameErr = validateField("repName", repName);
        if (repNameErr) newErrors.repName = repNameErr;
      }

      if (username) {
        const uErr = validateField("username", username);
        if (uErr) newErrors.username = uErr;
      }

      const confErr = validateField("confirmPassword", confirmPassword);
      if (confErr) newErrors.confirmPassword = confErr;

      const termsErr = validateField("agreeToTerms", agreedToTerms);
      if (termsErr) newErrors.agreeToTerms = termsErr;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors({});
    setSuccessMessage("");

    if (rememberMe && typeof window !== "undefined") {
      localStorage.setItem("userIdentifier", (mode === "signin" ? identifier : email).trim());
      localStorage.setItem("rememberMe", "true");
    } else if (typeof window !== "undefined") {
      localStorage.removeItem("userIdentifier");
      localStorage.removeItem("rememberMe");
    }

    if (mode === "signup") {
      try {
        const registeredName =
          accountType === "INDIVIDUAL"
            ? fullName.trim()
            : `${orgName.trim()} (${repName.trim()})`;

        if (typeof window !== "undefined") {
          const draftPayload: Record<string, any> = {
            accountType,
            phone: phone.trim(),
            username: username.trim().toLowerCase(),
            step: 1,
          };

          if (accountType === "INDIVIDUAL") {
            draftPayload.category = "healthcare_professional";
            draftPayload.professionOrType = "doctor";
            draftPayload.legalFirstName = fullName.trim();
          } else {
            draftPayload.category = orgType;
            draftPayload.professionOrType = orgType;
            draftPayload.legalFirstName = orgName.trim();
            draftPayload.dynamicValues = {
              auth_rep_name: repName.trim(),
            };
          }

          localStorage.setItem("mgn_onboarding_form_draft", JSON.stringify(draftPayload));
        }

        const { error } = await authClient.signUp.email({
          email: email.trim(),
          password,
          name: registeredName,
        });

        if (error) {
          setErrors({ general: error.message || "Failed to create account. Please try again." });
          setIsSubmitting(false);
        } else {
          setSuccessMessage("Account created successfully! Redirecting...");
          setTimeout(() => router.push("/onboarding"), 600);
        }
      } catch {
        setErrors({ general: "An unexpected error occurred. Please try again." });
        setIsSubmitting(false);
      }
    } else {
      try {
        let resolvedEmail = identifier.trim();

        const resolveRes = await fetch("/api/auth/resolve-identifier", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identifier: resolvedEmail }),
        });

        if (resolveRes.ok) {
          const resolveData = await resolveRes.json();
          if (resolveData.found && resolveData.email) {
            resolvedEmail = resolveData.email;
          } else if (!resolvedEmail.includes("@")) {
            setErrors({ general: "No account found with this phone, username or Member ID." });
            setIsSubmitting(false);
            return;
          }
        }

        const { error } = await authClient.signIn.email({
          email: resolvedEmail,
          password,
        });

        if (error) {
          setErrors({ general: error.message || "Invalid email/phone or password." });
          setIsSubmitting(false);
        } else {
          setSuccessMessage("Sign in successful! Redirecting...");
          setTimeout(() => router.push("/home"), 500);
        }
      } catch {
        setErrors({ general: "An unexpected error occurred. Please try again." });
        setIsSubmitting(false);
      }
    }
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!identifier.trim() && !email.trim()) {
      setErrors({ email: "Please enter your email or username to reset password." });
      return;
    }

    setIsSubmitting(true);
    setErrors({});
    try {
      let resetEmail = (identifier || email).trim();
      const resolveRes = await fetch("/api/auth/resolve-identifier", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: resetEmail }),
      });

      if (resolveRes.ok) {
        const resolveData = await resolveRes.json();
        if (resolveData.found && resolveData.email) {
          resetEmail = resolveData.email;
        }
      }

      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMessage("Password reset link sent to your registered email!");
      } else {
        setErrors({ general: data.error || "Failed to send reset link." });
      }
    } catch {
      setErrors({ general: "Failed to send reset link. Please try again later." });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-dvh w-full bg-[#f0f6fd] dark:bg-[#0b0f17] flex flex-col justify-between selection:bg-[#0f4c81]/20 font-sans relative overflow-x-hidden">
      
      {/* Background Subtle Medical Crosses */}
      <div className="absolute top-6 right-10 pointer-events-none opacity-25 dark:opacity-10 hidden sm:block">
        <div className="relative">
          <span className="text-4xl text-[#0f4c81] font-thin leading-none select-none">+</span>
          <span className="text-6xl text-[#0f4c81] font-thin leading-none select-none ml-6 -mt-2 inline-block">+</span>
          <span className="text-2xl text-[#0f4c81] font-thin leading-none select-none block ml-14 -mt-2">+</span>
        </div>
      </div>

      {/* Main Split Grid Container */}
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* ═══════════════════════════════════════════════
              LEFT COLUMN: BRANDING, VALUE PILLARS & TEAM IMAGE
              ═══════════════════════════════════════════════ */}
          <div className="lg:col-span-7 flex flex-col justify-between h-full pt-2 sm:pt-4">
            {/* Top Brand Logo */}
            <div className="flex items-center justify-between pb-6 sm:pb-8">
              <Link href="/" className="flex items-center gap-2 group">
                <img
                  src="/logo.png"
                  alt="MGN Logo"
                  className="h-10 sm:h-12 w-auto object-contain transition-transform group-hover:scale-105"
                />
                <span className="text-2xl sm:text-3xl font-black tracking-tight text-[#0c2b4e] dark:text-[#58a6ff]">
                  MGN
                </span>
              </Link>
              <div className="lg:hidden">
                <ThemeToggle collapsed={true} />
              </div>
            </div>

            {/* Headline & Subtitle */}
            <div className="space-y-4 text-left">
              <h1 className="text-3xl sm:text-5xl lg:text-[52px] font-black tracking-tight text-[#0c2b4e] dark:text-[#f0f6fc] leading-[1.15]">
                One Network. <br />
                <span className="text-[#16804d] dark:text-[#2ea043]">
                  Endless Opportunities.
                </span>
              </h1>

              <p className="text-xs sm:text-sm lg:text-base text-[#4b5563] dark:text-[#9ca3af] leading-relaxed max-w-xl font-normal text-pretty">
                MGN connects healthcare professionals, students, organizations and businesses on a single platform to learn, grow, collaborate and thrive.
              </p>
            </div>

            {/* 4 Value Pillars Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-3 py-6 sm:py-8 text-left">
              {/* Connect */}
              <div className="space-y-1.5">
                <div className="size-9 rounded-xl bg-blue-100/70 dark:bg-blue-950/50 text-[#0f4c81] dark:text-[#58a6ff] flex items-center justify-center">
                  <Users className="size-5" />
                </div>
                <div className="text-xs font-bold text-[#0c2b4e] dark:text-white">Connect</div>
                <div className="text-[11px] text-[#6b7280] dark:text-[#8b949e] leading-snug">
                  Build meaningful professional connections
                </div>
              </div>

              {/* Learn */}
              <div className="space-y-1.5">
                <div className="size-9 rounded-xl bg-emerald-100/70 dark:bg-emerald-950/50 text-[#16804d] dark:text-[#34d399] flex items-center justify-center">
                  <BookOpen className="size-5" />
                </div>
                <div className="text-xs font-bold text-[#0c2b4e] dark:text-white">Learn</div>
                <div className="text-[11px] text-[#6b7280] dark:text-[#8b949e] leading-snug">
                  Access quality courses and resources
                </div>
              </div>

              {/* Grow */}
              <div className="space-y-1.5">
                <div className="size-9 rounded-xl bg-teal-100/70 dark:bg-teal-950/50 text-[#0d9488] dark:text-[#2dd4bf] flex items-center justify-center">
                  <TrendingUp className="size-5" />
                </div>
                <div className="text-xs font-bold text-[#0c2b4e] dark:text-white">Grow</div>
                <div className="text-[11px] text-[#6b7280] dark:text-[#8b949e] leading-snug">
                  Discover opportunities and advance career
                </div>
              </div>

              {/* Thrive */}
              <div className="space-y-1.5">
                <div className="size-9 rounded-xl bg-sky-100/70 dark:bg-sky-950/50 text-[#0284c7] dark:text-[#38bdf8] flex items-center justify-center">
                  <ShieldCheck className="size-5" />
                </div>
                <div className="text-xs font-bold text-[#0c2b4e] dark:text-white">Thrive</div>
                <div className="text-[11px] text-[#6b7280] dark:text-[#8b949e] leading-snug">
                  Be part of a trusted and verified network
                </div>
              </div>
            </div>

            {/* Bottom Team Image Artwork */}
            <div className="relative w-full max-w-lg mx-auto lg:mx-0 mt-2 sm:mt-4 flex justify-center">
              <img
                src="/login-team.png"
                alt="MGN Healthcare Team"
                className="w-full max-h-[320px] sm:max-h-[380px] object-contain object-bottom select-none pointer-events-none drop-shadow-md"
              />
            </div>
          </div>

          {/* ═══════════════════════════════════════════════
              RIGHT COLUMN: AUTH CARD (EXACT MATCH)
              ═══════════════════════════════════════════════ */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-[460px] rounded-3xl bg-white dark:bg-[#161b22] p-6 sm:p-9 shadow-2xl border border-slate-100 dark:border-slate-800 animate-in fade-in duration-200">
              
              {/* Header inside Card */}
              <div className="text-center mb-6">
                <h2 className="text-2xl sm:text-[26px] font-extrabold text-[#0c2b4e] dark:text-[#f0f6fc] tracking-tight">
                  {isForgotPassword
                    ? "Reset Password"
                    : mode === "signup"
                    ? "Create Account"
                    : "Welcome Back!"}
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-[#6b7280] dark:text-[#8b949e]">
                  {isForgotPassword
                    ? "Enter your email or phone to reset your password"
                    : mode === "signup"
                    ? "Join the verified healthcare network"
                    : "Login to continue to your account"}
                </p>
              </div>

              {/* Segmented Email vs Phone Tabs (Sign In Mode) */}
              {!isForgotPassword && mode === "signin" && (
                <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-[#f0f4f8] dark:bg-[#0d1117] mb-5 border border-slate-200/60 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setLoginMethod("email");
                      setErrors({});
                    }}
                    className={`flex items-center justify-center gap-2 py-2.5 text-xs font-semibold rounded-xl transition cursor-pointer ${
                      loginMethod === "email"
                        ? "bg-white dark:bg-[#21262d] text-[#0f4c81] dark:text-[#58a6ff] shadow-sm border border-[#0f4c81]/30 dark:border-[#58a6ff]/30"
                        : "text-[#6b7280] dark:text-[#8b949e] hover:text-[#0c2b4e] dark:hover:text-white"
                    }`}
                  >
                    <Mail className="size-4" />
                    <span>Email</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setLoginMethod("phone");
                      setErrors({});
                    }}
                    className={`flex items-center justify-center gap-2 py-2.5 text-xs font-semibold rounded-xl transition cursor-pointer ${
                      loginMethod === "phone"
                        ? "bg-white dark:bg-[#21262d] text-[#0f4c81] dark:text-[#58a6ff] shadow-sm border border-[#0f4c81]/30 dark:border-[#58a6ff]/30"
                        : "text-[#6b7280] dark:text-[#8b949e] hover:text-[#0c2b4e] dark:hover:text-white"
                    }`}
                  >
                    <Phone className="size-4" />
                    <span>Phone</span>
                  </button>
                </div>
              )}

              {/* Account Type Selector (Sign Up Mode) */}
              {mode === "signup" && !isForgotPassword && (
                <div className="mb-5 space-y-2 text-left">
                  <label className="block text-xs font-semibold text-[#0c2b4e] dark:text-[#8b949e]">
                    Account Type
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    {/* Individual Option */}
                    <button
                      type="button"
                      onClick={() => {
                        setAccountType("INDIVIDUAL");
                        setErrors({});
                      }}
                      className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                        accountType === "INDIVIDUAL"
                          ? "border-[#0f4c81] dark:border-[#58a6ff] bg-[#eef5fc]/60 dark:bg-[#1f2937]/80 text-[#0f4c81] dark:text-[#58a6ff] ring-1.5 ring-[#0f4c81]/20 dark:ring-[#58a6ff]/20"
                          : "border-slate-200 dark:border-[#30363d] bg-white dark:bg-[#0d1117] text-[#171717] dark:text-[#f0f6fc] hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div
                          className={`p-1.5 rounded-lg ${
                            accountType === "INDIVIDUAL"
                              ? "bg-[#0f4c81] text-white"
                              : "bg-[#f0efee] dark:bg-[#21262d] text-[#5d5854] dark:text-[#8b949e]"
                          }`}
                        >
                          <User className="size-4" />
                        </div>
                        {accountType === "INDIVIDUAL" && (
                          <span className="size-2 rounded-full bg-[#0f4c81] dark:bg-[#58a6ff]" />
                        )}
                      </div>
                      <div>
                        <div className="text-xs font-bold">Individual</div>
                        <div className="text-[10px] text-[#6b7280] dark:text-[#8b949e] font-normal leading-tight mt-0.5">
                          Clinician, Nurse, Student
                        </div>
                      </div>
                    </button>

                    {/* Organisation Option */}
                    <button
                      type="button"
                      onClick={() => {
                        setAccountType("ORGANISATION");
                        setErrors({});
                      }}
                      className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                        accountType === "ORGANISATION"
                          ? "border-[#0f4c81] dark:border-[#58a6ff] bg-[#eef5fc]/60 dark:bg-[#1f2937]/80 text-[#0f4c81] dark:text-[#58a6ff] ring-1.5 ring-[#0f4c81]/20 dark:ring-[#58a6ff]/20"
                          : "border-slate-200 dark:border-[#30363d] bg-white dark:bg-[#0d1117] text-[#171717] dark:text-[#f0f6fc] hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div
                          className={`p-1.5 rounded-lg ${
                            accountType === "ORGANISATION"
                              ? "bg-[#0f4c81] text-white"
                              : "bg-[#f0efee] dark:bg-[#21262d] text-[#5d5854] dark:text-[#8b949e]"
                          }`}
                        >
                          <Building2 className="size-4" />
                        </div>
                        {accountType === "ORGANISATION" && (
                          <span className="size-2 rounded-full bg-[#0f4c81] dark:bg-[#58a6ff]" />
                        )}
                      </div>
                      <div>
                        <div className="text-xs font-bold">Organisation</div>
                        <div className="text-[10px] text-[#6b7280] dark:text-[#8b949e] font-normal leading-tight mt-0.5">
                          Hospital, Clinic, College
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* Global Alerts */}
              {successMessage && (
                <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center gap-2 text-xs font-medium text-emerald-700 dark:text-emerald-400 animate-in fade-in text-left">
                  <CheckCircle2 className="size-4 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {errors.general && (
                <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl flex items-center gap-2 text-xs font-medium text-rose-700 dark:text-rose-400 animate-in fade-in text-left">
                  <AlertTriangle className="size-4 shrink-0" />
                  <span>{errors.general}</span>
                </div>
              )}

              {/* Form Content */}
              {isForgotPassword ? (
                <form onSubmit={handleForgotPassword} className="space-y-4 text-left">
                  <div>
                    <label className="block text-xs font-semibold text-[#0c2b4e] dark:text-[#8b949e] mb-1.5">
                      Email Address or Username
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                      <input
                        type="text"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="Enter your email or username"
                        required
                        className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0d1117] pl-10 pr-3.5 text-xs sm:text-sm text-[#171717] dark:text-white placeholder:text-slate-400 focus:border-[#0f4c81] dark:focus:border-[#58a6ff] focus:outline-none focus:ring-1 focus:ring-[#0f4c81]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || !identifier}
                    className="w-full rounded-xl bg-[#0f4c81] dark:bg-[#14559b] py-3 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-[#0c3c66] dark:hover:bg-[#0f4c81] transition disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="size-4 animate-spin" />
                        Sending recovery link...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <KeyRound className="size-4" />
                        Send Password Reset Link
                      </span>
                    )}
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsForgotPassword(false);
                        setErrors({});
                        setSuccessMessage("");
                      }}
                      className="text-xs font-semibold text-[#0f4c81] dark:text-[#58a6ff] hover:underline cursor-pointer"
                    >
                      ← Back to Login
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 text-left">
                  {/* Sign In Mode: Email vs Phone */}
                  {mode === "signin" && (
                    <div>
                      <label className="block text-xs font-semibold text-[#0c2b4e] dark:text-slate-200 mb-1.5">
                        {loginMethod === "email" ? "Email Address" : "Phone Number"}
                      </label>
                      <div className="relative">
                        {loginMethod === "email" ? (
                          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                        ) : (
                          <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                        )}
                        <input
                          type={loginMethod === "email" ? "text" : "tel"}
                          value={identifier}
                          onChange={(e) => handleInputChange("identifier", e.target.value)}
                          onBlur={() => handleFieldBlur("identifier", identifier)}
                          placeholder={
                            loginMethod === "email"
                              ? "Enter your email address"
                              : "+91 Enter mobile number"
                          }
                          required
                          className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0d1117] pl-10 pr-3.5 text-xs sm:text-sm text-[#171717] dark:text-white placeholder:text-slate-400 focus:border-[#0f4c81] dark:focus:border-[#58a6ff] focus:outline-none focus:ring-1 focus:ring-[#0f4c81]"
                        />
                      </div>
                      {errors.identifier && (
                        <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-1 font-normal">
                          <AlertTriangle className="size-3 shrink-0" />
                          {errors.identifier}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Individual Sign Up: Full Name */}
                  {mode === "signup" && accountType === "INDIVIDUAL" && (
                    <div>
                      <label className="block text-xs font-semibold text-[#0c2b4e] dark:text-slate-200 mb-1.5">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => handleInputChange("name", e.target.value)}
                          onBlur={() => handleFieldBlur("name", fullName)}
                          placeholder="Dr. Rajesh Sharma"
                          required
                          className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0d1117] pl-10 pr-3.5 text-xs sm:text-sm text-[#171717] dark:text-white placeholder:text-slate-400 focus:border-[#0f4c81] dark:focus:border-[#58a6ff] focus:outline-none focus:ring-1 focus:ring-[#0f4c81]"
                        />
                      </div>
                      {errors.name && (
                        <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-1 font-normal">
                          <AlertTriangle className="size-3 shrink-0" />
                          {errors.name}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Organisation Sign Up: Org Name, Type, Rep Name */}
                  {mode === "signup" && accountType === "ORGANISATION" && (
                    <>
                      <div>
                        <label className="block text-xs font-semibold text-[#0c2b4e] dark:text-slate-200 mb-1.5">
                          Hospital / Organization Name
                        </label>
                        <div className="relative">
                          <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                          <input
                            type="text"
                            value={orgName}
                            onChange={(e) => handleInputChange("orgName", e.target.value)}
                            onBlur={() => handleFieldBlur("orgName", orgName)}
                            placeholder="e.g. Apex Hospital"
                            required
                            className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0d1117] pl-10 pr-3.5 text-xs sm:text-sm text-[#171717] dark:text-white placeholder:text-slate-400 focus:border-[#0f4c81] dark:focus:border-[#58a6ff] focus:outline-none focus:ring-1 focus:ring-[#0f4c81]"
                          />
                        </div>
                        {errors.orgName && (
                          <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-1 font-normal">
                            <AlertTriangle className="size-3 shrink-0" />
                            {errors.orgName}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#0c2b4e] dark:text-slate-200 mb-1.5">
                          Organization Type
                        </label>
                        <div className="relative">
                          <Hospital className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                          <select
                            value={orgType}
                            onChange={(e) => handleInputChange("orgType", e.target.value)}
                            className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0d1117] pl-10 pr-3.5 text-xs sm:text-sm text-[#171717] dark:text-white focus:border-[#0f4c81] dark:focus:border-[#58a6ff] focus:outline-none focus:ring-1 focus:ring-[#0f4c81] cursor-pointer"
                          >
                            {ORGANISATION_TYPES_LIST.map((t) => (
                              <option key={t.id} value={t.id} className="bg-white dark:bg-[#161b22] text-[#171717] dark:text-white">
                                {t.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#0c2b4e] dark:text-slate-200 mb-1.5">
                          Authorized Representative Name
                        </label>
                        <div className="relative">
                          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                          <input
                            type="text"
                            value={repName}
                            onChange={(e) => handleInputChange("repName", e.target.value)}
                            onBlur={() => handleFieldBlur("repName", repName)}
                            placeholder="e.g. Dr. Ananya Roy (Medical Director)"
                            required
                            className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0d1117] pl-10 pr-3.5 text-xs sm:text-sm text-[#171717] dark:text-white placeholder:text-slate-400 focus:border-[#0f4c81] dark:focus:border-[#58a6ff] focus:outline-none focus:ring-1 focus:ring-[#0f4c81]"
                          />
                        </div>
                        {errors.repName && (
                          <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-1 font-normal">
                            <AlertTriangle className="size-3 shrink-0" />
                            {errors.repName}
                          </p>
                        )}
                      </div>
                    </>
                  )}

                  {/* Sign Up Mode: Email Address */}
                  {mode === "signup" && (
                    <div>
                      <label className="block text-xs font-semibold text-[#0c2b4e] dark:text-slate-200 mb-1.5">
                        {accountType === "ORGANISATION" ? "Work Email Address" : "Email Address"}
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          onBlur={() => handleFieldBlur("email", email)}
                          placeholder="doctor@hospital.org"
                          required
                          className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0d1117] pl-10 pr-3.5 text-xs sm:text-sm text-[#171717] dark:text-white placeholder:text-slate-400 focus:border-[#0f4c81] dark:focus:border-[#58a6ff] focus:outline-none focus:ring-1 focus:ring-[#0f4c81]"
                        />
                      </div>
                      {errors.email && (
                        <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-1 font-normal">
                          <AlertTriangle className="size-3 shrink-0" />
                          {errors.email}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Sign Up Mode: Username */}
                  {mode === "signup" && (
                    <div>
                      <label className="block text-xs font-semibold text-[#0c2b4e] dark:text-slate-200 mb-1.5">
                        Preferred Username
                      </label>
                      <div className="relative">
                        <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => handleInputChange("username", e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, ""))}
                          onBlur={() => handleFieldBlur("username", username)}
                          placeholder="dr_rajesh"
                          className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0d1117] pl-10 pr-3.5 text-xs sm:text-sm text-[#171717] dark:text-white placeholder:text-slate-400 focus:border-[#0f4c81] dark:focus:border-[#58a6ff] focus:outline-none focus:ring-1 focus:ring-[#0f4c81]"
                        />
                      </div>
                      {errors.username && (
                        <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-1 font-normal">
                          <AlertTriangle className="size-3 shrink-0" />
                          {errors.username}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Password Field */}
                  <div>
                    <label className="block text-xs font-semibold text-[#0c2b4e] dark:text-slate-200 mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                        onBlur={() => handleFieldBlur("password", password)}
                        placeholder="Enter your password"
                        required
                        className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0d1117] pl-10 pr-10 text-xs sm:text-sm text-[#171717] dark:text-white placeholder:text-slate-400 focus:border-[#0f4c81] dark:focus:border-[#58a6ff] focus:outline-none focus:ring-1 focus:ring-[#0f4c81]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                        aria-label="Toggle password visibility"
                      >
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                    {mode === "signup" && <PasswordStrengthIndicator password={password} />}
                    {errors.password && (
                      <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-1 font-normal">
                        <AlertTriangle className="size-3 shrink-0" />
                        {errors.password}
                      </p>
                    )}
                  </div>

                  {/* Confirm Password (Sign Up Mode) */}
                  {mode === "signup" && (
                    <div>
                      <label className="block text-xs font-semibold text-[#0c2b4e] dark:text-slate-200 mb-1.5">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                          onBlur={() => handleFieldBlur("confirmPassword", confirmPassword)}
                          placeholder="Re-enter your password"
                          required
                          className="h-11 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0d1117] pl-10 pr-10 text-xs sm:text-sm text-[#171717] dark:text-white placeholder:text-slate-400 focus:border-[#0f4c81] dark:focus:border-[#58a6ff] focus:outline-none focus:ring-1 focus:ring-[#0f4c81]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                          aria-label="Toggle confirm password visibility"
                        >
                          {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-1 font-normal">
                          <AlertTriangle className="size-3 shrink-0" />
                          {errors.confirmPassword}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Forgot Password Link (Sign In Mode) */}
                  {mode === "signin" && (
                    <div className="flex items-center justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setIsForgotPassword(true);
                          setErrors({});
                          setSuccessMessage("");
                        }}
                        className="text-xs font-semibold text-[#0f4c81] dark:text-[#58a6ff] hover:underline cursor-pointer"
                      >
                        Forgot Password?
                      </button>
                    </div>
                  )}

                  {/* Terms Checkbox (Sign Up Mode) */}
                  {mode === "signup" && (
                    <div>
                      <label className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={agreedToTerms}
                          onChange={(e) => handleInputChange("agreeToTerms", e.target.checked)}
                          className="mt-0.5 size-4 rounded border-slate-300 text-[#0f4c81] focus:ring-[#0f4c81]"
                        />
                        <span>
                          I agree to the{" "}
                          <a href="/terms" className="font-semibold text-[#0f4c81] dark:text-[#58a6ff] underline">
                            Terms of Service
                          </a>{" "}
                          and{" "}
                          <a href="/privacy" className="font-semibold text-[#0f4c81] dark:text-[#58a6ff] underline">
                            Privacy Policy
                          </a>
                          .
                        </span>
                      </label>
                      {errors.agreeToTerms && (
                        <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-1 font-normal">
                          <AlertTriangle className="size-3 shrink-0" />
                          {errors.agreeToTerms}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Submit CTA Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#0f4c81] dark:bg-[#14559b] py-3 text-sm font-bold text-white shadow-md hover:bg-[#0c3c66] dark:hover:bg-[#0f4c81] transition disabled:opacity-50 cursor-pointer mt-2 active:scale-98"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="size-4 animate-spin" />
                        {mode === "signin" ? "Logging in..." : "Creating account..."}
                      </span>
                    ) : (
                      <>
                        <span>{mode === "signin" ? "Login" : "Create Account"}</span>
                        <ArrowRight className="size-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Bottom Switcher: Don't have an account? Sign Up */}
              {!isForgotPassword && (
                <div className="text-center mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                    {mode === "signin" ? "Don't have an account? " : "Already have an account? "}
                    <button
                      type="button"
                      onClick={() => {
                        setMode(mode === "signin" ? "signup" : "signin");
                        setErrors({});
                        setSuccessMessage("");
                      }}
                      className="font-bold text-[#0f4c81] dark:text-[#58a6ff] hover:underline cursor-pointer ml-1"
                    >
                      {mode === "signin" ? "Sign Up" : "Login"}
                    </button>
                  </p>
                </div>
              )}

              {/* Data Safety Assurance Footer */}
              <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 text-center">
                <ShieldCheck className="size-3.5 text-slate-400 shrink-0" />
                <span>Your data is safe with us. We never share your information.</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Minimal Footer */}
      <footer className="w-full text-center text-xs text-slate-400 dark:text-slate-500 py-4 border-t border-slate-200/50 dark:border-slate-800/50">
        © {new Date().getFullYear()} Med Global Network (MGN). All rights reserved.
      </footer>
    </div>
  );
}
