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
  ShieldCheck,
  AlertTriangle,
  KeyRound,
  Phone,
  Loader2,
  ArrowLeft,
  CheckCircle2,
  Building2,
  Hospital,
  AtSign,
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
        <span className="text-[11px] font-bold text-[#77716b] dark:text-[#8b949e] min-w-[55px] text-right">
          {getStrengthText(strength.score)}
        </span>
      </div>
      {strength.feedback.length > 0 && (
        <div className="grid grid-cols-2 gap-1 pt-0.5">
          {strength.feedback.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-1 text-[10px] font-medium text-amber-600 dark:text-amber-400"
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

  // Account Type Selection: INDIVIDUAL vs ORGANISATION
  const [accountType, setAccountType] = React.useState<"INDIVIDUAL" | "ORGANISATION">("INDIVIDUAL");

  // Common Fields
  const [identifier, setIdentifier] = React.useState(""); // For login (email or username)
  const [email, setEmail] = React.useState(""); // For signup
  const [username, setUsername] = React.useState(""); // For signup
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
          if (mode === "signin" && (!value || (typeof value === "string" && !value.trim()))) {
            error = "Email or Username is required";
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
    [mode, accountType, password]
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

        // Pre-save onboarding draft
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
          setSuccessMessage("Account created successfully! Redirecting to verification onboarding...");
          setTimeout(() => router.push("/onboarding"), 600);
        }
      } catch {
        setErrors({ general: "An unexpected error occurred. Please try again." });
        setIsSubmitting(false);
      }
    } else {
      try {
        // Resolve email if user entered a username, member ID, or direct email
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
            setErrors({ general: "No account found with this username or Member ID." });
            setIsSubmitting(false);
            return;
          }
        }

        const { error } = await authClient.signIn.email({
          email: resolvedEmail,
          password,
        });

        if (error) {
          setErrors({ general: error.message || "Invalid username/email or password." });
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
    <div className="min-h-dvh bg-white dark:bg-[#0d1117] flex flex-col justify-between selection:bg-[#0f4c81]/20 transition-colors">
      {/* Top Navbar */}
      <header className="w-full border-b border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <img
            src="/logo.png"
            alt="Med Global Network"
            className="h-9 sm:h-10 w-auto object-contain transition-transform group-hover:scale-105"
          />
          <span className="text-base sm:text-lg font-black tracking-tight text-[#171717] dark:text-[#f0f6fc] group-hover:text-[#0f4c81] dark:group-hover:text-[#58a6ff] transition-colors">
            Med Global Network
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <ThemeToggle collapsed={true} />
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5d5854] dark:text-[#8b949e] hover:text-[#0f4c81] dark:hover:text-[#58a6ff] transition rounded-xl px-3 py-1.5 hover:bg-[#f0efee] dark:hover:bg-[#21262d]"
          >
            <ArrowLeft className="size-4" />
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      {/* Main Open / Frameless Auth Layout */}
      <main className="flex-1 flex flex-col items-center justify-center py-8 sm:py-12 px-4 sm:px-6">
        <div className="w-full max-w-[440px] mx-auto animate-in fade-in duration-200">
          {/* Page Header */}
          <div className="flex flex-col items-center text-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#171717] dark:text-[#f0f6fc]">
              {isForgotPassword
                ? "Reset Your Password"
                : mode === "signup"
                ? accountType === "ORGANISATION"
                  ? "Register Organisation"
                  : "Join Verified Network"
                : "Welcome Back"}
            </h1>

            <p className="mt-1.5 text-xs sm:text-sm text-[#77716b] dark:text-[#8b949e] font-medium leading-relaxed">
              {isForgotPassword
                ? "Enter your email or username to receive password recovery instructions"
                : mode === "signup"
                ? accountType === "ORGANISATION"
                  ? "For Hospitals, Clinics, Colleges, Diagnostic Labs & Healthcare Companies"
                  : "For Doctors, Nurses, Therapists, Students & Healthcare Professionals"
                : "Sign in with your email, username, or MGN ID"}
            </p>
          </div>

          {/* Mode Tabs (Sign In / Create Account) */}
          {!isForgotPassword && (
            <div className="grid grid-cols-2 p-1 rounded-2xl bg-[#f0efee] dark:bg-[#21262d] mb-5">
              <button
                type="button"
                onClick={() => {
                  setMode("signin");
                  setErrors({});
                  setSuccessMessage("");
                }}
                className={`py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                  mode === "signin"
                    ? "bg-white dark:bg-[#161b22] text-[#0f4c81] dark:text-[#58a6ff] shadow-xs"
                    : "text-[#77716b] dark:text-[#8b949e] hover:text-[#171717] dark:hover:text-[#f0f6fc]"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setErrors({});
                  setSuccessMessage("");
                }}
                className={`py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                  mode === "signup"
                    ? "bg-white dark:bg-[#161b22] text-[#0f4c81] dark:text-[#58a6ff] shadow-xs"
                    : "text-[#77716b] dark:text-[#8b949e] hover:text-[#171717] dark:hover:text-[#f0f6fc]"
                }`}
              >
                Create Account
              </button>
            </div>
          )}

          {/* Account Type Selection (Only for Sign Up) */}
          {mode === "signup" && !isForgotPassword && (
            <div className="mb-5 space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5d5854] dark:text-[#8b949e]">
                Select Account Type
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
                      ? "border-[#0f4c81] dark:border-[#58a6ff] bg-[#eef5fc]/60 dark:bg-[#1f2937]/80 text-[#0f4c81] dark:text-[#58a6ff] ring-2 ring-[#0f4c81]/20 dark:ring-[#58a6ff]/20"
                      : "border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#0d1117] text-[#171717] dark:text-[#f0f6fc] hover:border-[#8a8784]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className={`p-2 rounded-xl ${
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
                    <div className="text-xs font-black">Individual</div>
                    <div className="text-[10px] text-[#77716b] dark:text-[#8b949e] font-medium leading-tight mt-0.5">
                      Doctor, Nurse, Student & Clinician
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
                      ? "border-[#0f4c81] dark:border-[#58a6ff] bg-[#eef5fc]/60 dark:bg-[#1f2937]/80 text-[#0f4c81] dark:text-[#58a6ff] ring-2 ring-[#0f4c81]/20 dark:ring-[#58a6ff]/20"
                      : "border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#0d1117] text-[#171717] dark:text-[#f0f6fc] hover:border-[#8a8784]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className={`p-2 rounded-xl ${
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
                    <div className="text-xs font-black">Organisation</div>
                    <div className="text-[10px] text-[#77716b] dark:text-[#8b949e] font-medium leading-tight mt-0.5">
                      Hospital, Clinic, College & Lab
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Global Messages */}
          {successMessage && (
            <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 animate-in fade-in">
              <CheckCircle2 className="size-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {errors.general && (
            <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl flex items-center gap-2 text-xs font-bold text-rose-700 dark:text-rose-400 animate-in fade-in">
              <AlertTriangle className="size-4 shrink-0" />
              <span>{errors.general}</span>
            </div>
          )}

          {/* Form Content */}
          {isForgotPassword ? (
            <form onSubmit={handleForgotPassword} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#5d5854] dark:text-[#8b949e] mb-1.5">
                  Email Address or Username
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#8a8784]" />
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="doctor@hospital.org or @username"
                    required
                    className="h-11 w-full rounded-xl border border-[#ded8d1] dark:border-[#30363d] bg-[#faf9f8] dark:bg-[#0d1117] pl-10 pr-3.5 text-xs sm:text-sm text-[#171717] dark:text-[#f0f6fc] placeholder:text-[#8a8784] focus:border-[#0f4c81] dark:focus:border-[#58a6ff] focus:outline-none focus:ring-1 focus:ring-[#0f4c81]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !identifier}
                className="w-full rounded-xl bg-[#0f4c81] dark:bg-[#14559b] py-3 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-[#0c3c66] dark:hover:bg-[#0f4c81] transition disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="size-4 animate-spin" />
                    Sending Recovery Link...
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
                  className="text-xs font-bold text-[#0f4c81] dark:text-[#58a6ff] hover:underline cursor-pointer"
                >
                  ← Back to Sign In
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5 text-left">
              {/* Sign In Mode: Email or Username */}
              {mode === "signin" && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#5d5854] dark:text-[#8b949e] mb-1.5">
                    Email or Username
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#8a8784]" />
                    <input
                      type="text"
                      value={identifier}
                      onChange={(e) => handleInputChange("identifier", e.target.value)}
                      onBlur={() => handleFieldBlur("identifier", identifier)}
                      placeholder="doctor@hospital.org or @username"
                      required
                      className="h-11 w-full rounded-xl border border-[#ded8d1] dark:border-[#30363d] bg-[#faf9f8] dark:bg-[#0d1117] pl-10 pr-3.5 text-xs sm:text-sm text-[#171717] dark:text-[#f0f6fc] placeholder:text-[#8a8784] focus:border-[#0f4c81] dark:focus:border-[#58a6ff] focus:outline-none focus:ring-1 focus:ring-[#0f4c81]"
                    />
                  </div>
                  {errors.identifier && (
                    <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-1 font-medium">
                      <AlertTriangle className="size-3" />
                      {errors.identifier}
                    </p>
                  )}
                </div>
              )}

              {/* Sign Up Fields for Individual */}
              {mode === "signup" && accountType === "INDIVIDUAL" && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#5d5854] dark:text-[#8b949e] mb-1.5">
                    Full Name (with Professional Title)
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#8a8784]" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      onBlur={() => handleFieldBlur("name", fullName)}
                      placeholder="Dr. Rajesh Sharma"
                      required
                      className="h-11 w-full rounded-xl border border-[#ded8d1] dark:border-[#30363d] bg-[#faf9f8] dark:bg-[#0d1117] pl-10 pr-3.5 text-xs sm:text-sm text-[#171717] dark:text-[#f0f6fc] placeholder:text-[#8a8784] focus:border-[#0f4c81] dark:focus:border-[#58a6ff] focus:outline-none focus:ring-1 focus:ring-[#0f4c81]"
                    />
                  </div>
                  {errors.name && (
                    <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-1 font-medium">
                      <AlertTriangle className="size-3" />
                      {errors.name}
                    </p>
                  )}
                </div>
              )}

              {/* Sign Up Fields for Organisation */}
              {mode === "signup" && accountType === "ORGANISATION" && (
                <>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#5d5854] dark:text-[#8b949e] mb-1.5">
                      Organisation / Hospital / Clinic Name
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#8a8784]" />
                      <input
                        type="text"
                        value={orgName}
                        onChange={(e) => handleInputChange("orgName", e.target.value)}
                        onBlur={() => handleFieldBlur("orgName", orgName)}
                        placeholder="e.g. Apex Multispeciality Hospital"
                        required
                        className="h-11 w-full rounded-xl border border-[#ded8d1] dark:border-[#30363d] bg-[#faf9f8] dark:bg-[#0d1117] pl-10 pr-3.5 text-xs sm:text-sm text-[#171717] dark:text-[#f0f6fc] placeholder:text-[#8a8784] focus:border-[#0f4c81] dark:focus:border-[#58a6ff] focus:outline-none focus:ring-1 focus:ring-[#0f4c81]"
                      />
                    </div>
                    {errors.orgName && (
                      <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-1 font-medium">
                        <AlertTriangle className="size-3" />
                        {errors.orgName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#5d5854] dark:text-[#8b949e] mb-1.5">
                      Organisation Type
                    </label>
                    <div className="relative">
                      <Hospital className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#8a8784]" />
                      <select
                        value={orgType}
                        onChange={(e) => handleInputChange("orgType", e.target.value)}
                        className="h-11 w-full rounded-xl border border-[#ded8d1] dark:border-[#30363d] bg-[#faf9f8] dark:bg-[#0d1117] pl-10 pr-3.5 text-xs sm:text-sm text-[#171717] dark:text-[#f0f6fc] focus:border-[#0f4c81] dark:focus:border-[#58a6ff] focus:outline-none focus:ring-1 focus:ring-[#0f4c81] cursor-pointer"
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
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#5d5854] dark:text-[#8b949e] mb-1.5">
                      Authorized Representative / Admin Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#8a8784]" />
                      <input
                        type="text"
                        value={repName}
                        onChange={(e) => handleInputChange("repName", e.target.value)}
                        onBlur={() => handleFieldBlur("repName", repName)}
                        placeholder="e.g. Dr. Ananya Roy (Medical Director)"
                        required
                        className="h-11 w-full rounded-xl border border-[#ded8d1] dark:border-[#30363d] bg-[#faf9f8] dark:bg-[#0d1117] pl-10 pr-3.5 text-xs sm:text-sm text-[#171717] dark:text-[#f0f6fc] placeholder:text-[#8a8784] focus:border-[#0f4c81] dark:focus:border-[#58a6ff] focus:outline-none focus:ring-1 focus:ring-[#0f4c81]"
                      />
                    </div>
                    {errors.repName && (
                      <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-1 font-medium">
                        <AlertTriangle className="size-3" />
                        {errors.repName}
                      </p>
                    )}
                  </div>
                </>
              )}

              {/* Sign Up Mode: Email Address */}
              {mode === "signup" && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#5d5854] dark:text-[#8b949e] mb-1.5">
                    {accountType === "ORGANISATION"
                      ? "Official / Work Email Address"
                      : "Email Address"}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#8a8784]" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      onBlur={() => handleFieldBlur("email", email)}
                      placeholder={
                        accountType === "ORGANISATION"
                          ? "contact@hospital.org"
                          : "doctor@hospital.org"
                      }
                      required
                      className="h-11 w-full rounded-xl border border-[#ded8d1] dark:border-[#30363d] bg-[#faf9f8] dark:bg-[#0d1117] pl-10 pr-3.5 text-xs sm:text-sm text-[#171717] dark:text-[#f0f6fc] placeholder:text-[#8a8784] focus:border-[#0f4c81] dark:focus:border-[#58a6ff] focus:outline-none focus:ring-1 focus:ring-[#0f4c81]"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-1 font-medium">
                      <AlertTriangle className="size-3" />
                      {errors.email}
                    </p>
                  )}
                </div>
              )}

              {/* Sign Up Mode: Custom Username */}
              {mode === "signup" && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#5d5854] dark:text-[#8b949e] mb-1.5">
                    Preferred Username
                  </label>
                  <div className="relative">
                    <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#8a8784]" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => handleInputChange("username", e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, ""))}
                      onBlur={() => handleFieldBlur("username", username)}
                      placeholder="dr_rajesh"
                      className="h-11 w-full rounded-xl border border-[#ded8d1] dark:border-[#30363d] bg-[#faf9f8] dark:bg-[#0d1117] pl-10 pr-3.5 text-xs sm:text-sm text-[#171717] dark:text-[#f0f6fc] placeholder:text-[#8a8784] focus:border-[#0f4c81] dark:focus:border-[#58a6ff] focus:outline-none focus:ring-1 focus:ring-[#0f4c81]"
                    />
                  </div>
                  {errors.username && (
                    <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-1 font-medium">
                      <AlertTriangle className="size-3" />
                      {errors.username}
                    </p>
                  )}
                </div>
              )}

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#5d5854] dark:text-[#8b949e]">
                    Password
                  </label>
                  {mode === "signin" && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsForgotPassword(true);
                        setErrors({});
                        setSuccessMessage("");
                      }}
                      className="text-xs font-bold text-[#0f4c81] dark:text-[#58a6ff] hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#8a8784]" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    onBlur={() => handleFieldBlur("password", password)}
                    placeholder="••••••••"
                    required
                    className="h-11 w-full rounded-xl border border-[#ded8d1] dark:border-[#30363d] bg-[#faf9f8] dark:bg-[#0d1117] pl-10 pr-10 text-xs sm:text-sm text-[#171717] dark:text-[#f0f6fc] placeholder:text-[#8a8784] focus:border-[#0f4c81] dark:focus:border-[#58a6ff] focus:outline-none focus:ring-1 focus:ring-[#0f4c81]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8a8784] hover:text-[#171717] dark:hover:text-[#f0f6fc] cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                {mode === "signup" && <PasswordStrengthIndicator password={password} />}
                {errors.password && (
                  <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-1 font-medium">
                    <AlertTriangle className="size-3" />
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              {mode === "signup" && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#5d5854] dark:text-[#8b949e] mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#8a8784]" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      onBlur={() => handleFieldBlur("confirmPassword", confirmPassword)}
                      placeholder="••••••••"
                      required
                      className="h-11 w-full rounded-xl border border-[#ded8d1] dark:border-[#30363d] bg-[#faf9f8] dark:bg-[#0d1117] pl-10 pr-10 text-xs sm:text-sm text-[#171717] dark:text-[#f0f6fc] placeholder:text-[#8a8784] focus:border-[#0f4c81] dark:focus:border-[#58a6ff] focus:outline-none focus:ring-1 focus:ring-[#0f4c81]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8a8784] hover:text-[#171717] dark:hover:text-[#f0f6fc] cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-1 font-medium">
                      <AlertTriangle className="size-3" />
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              )}

              {/* Phone (Optional) */}
              {mode === "signup" && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#5d5854] dark:text-[#8b949e] mb-1.5">
                    {accountType === "ORGANISATION" ? "Official Phone / Desk Number" : "Mobile Phone (Optional)"}
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#8a8784]" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="+91 98765 43210"
                      className="h-11 w-full rounded-xl border border-[#ded8d1] dark:border-[#30363d] bg-[#faf9f8] dark:bg-[#0d1117] pl-10 pr-3.5 text-xs sm:text-sm text-[#171717] dark:text-[#f0f6fc] placeholder:text-[#8a8784] focus:border-[#0f4c81] dark:focus:border-[#58a6ff] focus:outline-none focus:ring-1 focus:ring-[#0f4c81]"
                    />
                  </div>
                </div>
              )}

              {/* Remember Me / Terms */}
              <div className="pt-1">
                {mode === "signin" ? (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => handleInputChange("rememberMe", e.target.checked)}
                      className="size-4 rounded border-[#ded8d1] dark:border-[#30363d] text-[#0f4c81] focus:ring-[#0f4c81]"
                    />
                    <span className="text-xs text-[#5d5854] dark:text-[#8b949e] font-medium">
                      Remember this device
                    </span>
                  </label>
                ) : (
                  <div>
                    <label className="flex items-start gap-2.5 text-xs text-[#5d5854] dark:text-[#8b949e] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={agreedToTerms}
                        onChange={(e) => handleInputChange("agreeToTerms", e.target.checked)}
                        className="mt-0.5 size-4 rounded border-[#ded8d1] dark:border-[#30363d] text-[#0f4c81] focus:ring-[#0f4c81]"
                      />
                      <span>
                        I agree to the{" "}
                        <a href="#" className="font-bold text-[#0f4c81] dark:text-[#58a6ff] underline">
                          Terms of Service
                        </a>{" "}
                        and{" "}
                        <a href="#" className="font-bold text-[#0f4c81] dark:text-[#58a6ff] underline">
                          Privacy Policy
                        </a>
                        .
                      </span>
                    </label>
                    {errors.agreeToTerms && (
                      <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-1 font-medium">
                        <AlertTriangle className="size-3" />
                        {errors.agreeToTerms}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-[#0f4c81] dark:bg-[#14559b] py-3 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-[#0c3c66] dark:hover:bg-[#0f4c81] transition disabled:opacity-50 cursor-pointer mt-2 active:scale-98"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="size-4 animate-spin" />
                    {mode === "signin" ? "Signing In..." : "Creating Account..."}
                  </span>
                ) : mode === "signin" ? (
                  "Sign In to Network"
                ) : accountType === "ORGANISATION" ? (
                  "Create Organisation Account"
                ) : (
                  "Create Individual Account"
                )}
              </button>
            </form>
          )}

          {/* Bottom Switcher */}
          {!isForgotPassword && (
            <div className="text-center mt-6 pt-4 border-t border-[#f0efee] dark:border-[#30363d]">
              <p className="text-xs text-[#77716b] dark:text-[#8b949e]">
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
                  {mode === "signin" ? "Sign up" : "Sign in"}
                </button>
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-[#8a8784] dark:text-[#8b949e] border-t border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22]">
        © {new Date().getFullYear()} Med Global Network. Verified Healthcare Network.
      </footer>
    </div>
  );
}
