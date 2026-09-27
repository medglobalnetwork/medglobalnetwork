"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import {
  X,
  ShieldCheck,
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Lock,
  User,
  Building2,
  Hospital,
  AlertTriangle,
  KeyRound,
  CheckCircle2,
  Phone,
  AtSign,
} from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: "signin" | "signup";
  onClose: () => void;
}

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

const MODAL_ORGANISATION_TYPES = [
  { id: "hospital", label: "Hospital / Healthcare Facility" },
  { id: "clinic", label: "Clinic / Specialized Practice" },
  { id: "diagnostic_center", label: "Diagnostic Lab / Imaging Center" },
  { id: "medical_college", label: "Medical / Health Science College" },
  { id: "research_institute", label: "Research Institute / Biotech Lab" },
  { id: "pharma_device", label: "Pharma / Medical Device Enterprise" },
  { id: "ngo_healthcare", label: "Healthcare NGO / Trust / Foundation" },
  { id: "healthtech_startup", label: "HealthTech / Digital Health Company" },
  { id: "other_org", label: "Other Healthcare Organization" },
];

interface FormErrors {
  name?: string;
  username?: string;
  orgName?: string;
  repName?: string;
  identifier?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  phone?: string;
  agreeToTerms?: string;
  general?: string;
}

export function AuthModal({ isOpen, initialMode = "signin", onClose }: AuthModalProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [mode, setMode] = React.useState<"signin" | "signup">(initialMode);
  const [accountType, setAccountType] = React.useState<"INDIVIDUAL" | "ORGANISATION">("INDIVIDUAL");

  const [identifier, setIdentifier] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [agreedToTerms, setAgreedToTerms] = React.useState(false);
  const [rememberMe, setRememberMe] = React.useState(false);

  // Individual
  const [fullName, setFullName] = React.useState("");

  // Organisation
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

  React.useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  // Load saved email on mount
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

  // Handle URL errors if any
  React.useEffect(() => {
    const error = searchParams?.get("error");
    const errorDesc = searchParams?.get("error_description");
    if (error) {
      setErrors({ general: errorDesc || `Authentication error: ${error}` });
    }
  }, [searchParams]);

  // Real-time Validation
  const validateField = (name: string, value: string | boolean) => {
    const newErrors = { ...errors };

    switch (name) {
      case "identifier":
        if (mode === "signin" && (!value || (typeof value === "string" && !value.trim()))) {
          newErrors.identifier = "Email or Username is required";
        } else {
          delete newErrors.identifier;
        }
        break;

      case "name":
        if (mode === "signup" && accountType === "INDIVIDUAL") {
          if (!value || (typeof value === "string" && value.trim().length < 2)) {
            newErrors.name = "Full name must be at least 2 characters";
          } else {
            delete newErrors.name;
          }
        }
        break;

      case "orgName":
        if (mode === "signup" && accountType === "ORGANISATION") {
          if (!value || (typeof value === "string" && value.trim().length < 2)) {
            newErrors.orgName = "Organisation name is required";
          } else {
            delete newErrors.orgName;
          }
        }
        break;

      case "repName":
        if (mode === "signup" && accountType === "ORGANISATION") {
          if (!value || (typeof value === "string" && value.trim().length < 2)) {
            newErrors.repName = "Representative name is required";
          } else {
            delete newErrors.repName;
          }
        }
        break;

      case "email":
        if (mode === "signup") {
          if (!value || (typeof value === "string" && !value.trim())) {
            newErrors.email = "Email address is required";
          } else if (
            typeof value === "string" &&
            !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value.trim())
          ) {
            newErrors.email = "Please enter a valid email address";
          } else {
            delete newErrors.email;
          }
        }
        break;

      case "password":
        if (!value || (typeof value === "string" && !value.trim())) {
          newErrors.password = "Password is required";
        } else if (mode === "signup" && typeof value === "string") {
          const strength = calculatePasswordStrength(value);
          if (strength.score < 2) {
            newErrors.password = "Please choose a stronger password";
          } else {
            delete newErrors.password;
          }
        } else {
          delete newErrors.password;
        }
        break;

      case "confirmPassword":
        if (mode === "signup") {
          if (value !== password) {
            newErrors.confirmPassword = "Passwords do not match";
          } else {
            delete newErrors.confirmPassword;
          }
        }
        break;

      case "agreeToTerms":
        if (mode === "signup" && !value) {
          newErrors.agreeToTerms = "You must agree to the Terms of Service";
        } else {
          delete newErrors.agreeToTerms;
        }
        break;
    }

    setErrors(newErrors);
  };

  const handleBlur = (fieldName: string) => {
    setFieldTouched((prev) => ({ ...prev, [fieldName]: true }));
    if (fieldName === "identifier") validateField("identifier", identifier);
    if (fieldName === "email") validateField("email", email);
    if (fieldName === "password") validateField("password", password);
    if (fieldName === "confirmPassword") validateField("confirmPassword", confirmPassword);
    if (fieldName === "name") validateField("name", fullName);
    if (fieldName === "orgName") validateField("orgName", orgName);
    if (fieldName === "repName") validateField("repName", repName);
  };

  if (!isOpen) return null;

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (mode === "signin") {
      if (!identifier.trim()) {
        newErrors.identifier = "Email or Username is required";
      }
    } else {
      if (!email.trim()) {
        newErrors.email = "Email address is required";
      } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email.trim())) {
        newErrors.email = "Please enter a valid email address";
      }

      if (accountType === "INDIVIDUAL") {
        if (!fullName.trim() || fullName.trim().length < 2) {
          newErrors.name = "Full name is required (at least 2 characters)";
        }
      } else {
        if (!orgName.trim() || orgName.trim().length < 2) {
          newErrors.orgName = "Organisation name is required";
        }
        if (!repName.trim() || repName.trim().length < 2) {
          newErrors.repName = "Representative name is required";
        }
      }

      if (password !== confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }

      const strength = calculatePasswordStrength(password);
      if (strength.score < 2) {
        newErrors.password = "Password is too weak. Please include letters and numbers.";
      }

      if (!agreedToTerms) {
        newErrors.agreeToTerms = "You must agree to the Terms & Privacy Policy";
      }
    }

    if (!password.trim()) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSuccessMessage("");
    setFieldTouched({
      identifier: true,
      name: true,
      orgName: true,
      repName: true,
      email: true,
      password: true,
      confirmPassword: true,
      agreeToTerms: true,
    });

    if (!validateForm()) return;

    // Handle Remember Me persistence
    if (typeof window !== "undefined") {
      if (rememberMe) {
        localStorage.setItem("userIdentifier", (mode === "signin" ? identifier : email).trim());
        localStorage.setItem("rememberMe", "true");
      } else {
        localStorage.removeItem("userIdentifier");
        localStorage.removeItem("rememberMe");
      }
    }

    setIsSubmitting(true);

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
          onClose();
          router.push("/onboarding");
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
          onClose();
          router.push("/home");
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
        setSuccessMessage("Password reset link sent to your registered email.");
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
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg rounded-3xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#161b22] p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-full text-[#8a8784] hover:bg-[#f0efee] dark:hover:bg-[#21262d] hover:text-[#171717] dark:hover:text-white transition cursor-pointer"
        >
          <X className="size-5" />
        </button>

        {/* Modal Brand Header */}
        <div className="flex flex-col items-center text-center mb-5">
          <img
            src="/logo.png"
            alt="MedGlobalNetwork"
            className="h-10 w-auto object-contain mb-3"
          />

          <h3 className="text-xl sm:text-2xl font-black text-[#171717] dark:text-white tracking-tight">
            {isForgotPassword
              ? "Reset Password"
              : mode === "signup"
              ? accountType === "ORGANISATION"
                ? "Register Organisation"
                : "Join Verified Network"
              : "Welcome Back"}
          </h3>

          <p className="mt-1 text-xs sm:text-sm text-[#77716b] dark:text-[#8b949e] font-medium">
            {isForgotPassword
              ? "Enter your email or username to receive a secure recovery link"
              : mode === "signup"
              ? accountType === "ORGANISATION"
                ? "For hospitals, clinics, colleges, diagnostic centers & health enterprises"
                : "For doctors, clinicians, students & healthcare professionals"
              : "Sign in with your email, username, or MGN ID"}
          </p>
        </div>

        {/* Mode Switcher */}
        {!isForgotPassword && (
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-[#f0efee] dark:bg-[#21262d] border border-[#ded8d1] dark:border-[#30363d] mb-4">
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
          <div className="mb-4 space-y-2">
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
                <div className="flex items-center justify-between mb-1.5">
                  <div
                    className={`p-1.5 rounded-xl ${
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
                <div className="flex items-center justify-between mb-1.5">
                  <div
                    className={`p-1.5 rounded-xl ${
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

        {/* Form Content */}
        {isForgotPassword ? (
          <form onSubmit={handleForgotPassword} className="mt-4 space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5d5854] dark:text-[#8b949e] mb-1.5">
                Email Address or Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8a8784] dark:text-[#8b949e]">
                  <Mail className="size-4" />
                </div>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="doctor@hospital.org or @username"
                  required
                  className="h-11 w-full rounded-xl border border-[#ded8d1] dark:border-[#30363d] pl-10 pr-3.5 text-xs sm:text-sm text-[#171717] dark:text-white bg-white dark:bg-[#0d1117] transition-all focus:outline-none focus:ring-2 focus:border-[#0f4c81] dark:focus:border-[#58a6ff] focus:ring-[#0f4c81]/15"
                />
              </div>
            </div>

            {errors.general && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs font-semibold text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <AlertTriangle className="size-4 shrink-0 text-rose-500" />
                <span>{errors.general}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
                <span>{successMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-[#0f4c81] dark:bg-[#1f6feb] py-3 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-[#0c3c66] dark:hover:bg-[#388bfd] transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Sending link...
                </>
              ) : (
                <>
                  <KeyRound className="size-4" />
                  Send Reset Link
                </>
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
                ← Back to Sign in
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="mt-3 space-y-3 text-left">
            {errors.general && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs font-semibold text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <AlertTriangle className="size-4 shrink-0 text-rose-500" />
                <span>{errors.general}</span>
              </div>
            )}

            {/* Sign In Mode: Email or Username */}
            {mode === "signin" && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#5d5854] dark:text-[#8b949e] mb-1.5">
                  Email or Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8a8784] dark:text-[#8b949e]">
                    <User className="size-4" />
                  </div>
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => {
                      setIdentifier(e.target.value);
                      if (errors.identifier) validateField("identifier", e.target.value);
                    }}
                    onBlur={() => handleBlur("identifier")}
                    placeholder="doctor@hospital.org or @username"
                    required
                    className={`h-11 w-full rounded-xl border pl-10 pr-3.5 text-xs sm:text-sm text-[#171717] dark:text-white bg-white dark:bg-[#0d1117] transition-all focus:outline-none focus:ring-2 ${
                      fieldTouched.identifier && errors.identifier
                        ? "border-rose-500 focus:ring-rose-500/20"
                        : "border-[#ded8d1] dark:border-[#30363d] focus:border-[#0f4c81] dark:focus:border-[#58a6ff] focus:ring-[#0f4c81]/15"
                    }`}
                  />
                </div>
                {fieldTouched.identifier && errors.identifier && (
                  <p className="mt-1 text-xs font-semibold text-rose-500 flex items-center gap-1">
                    <AlertTriangle className="size-3 shrink-0" />
                    {errors.identifier}
                  </p>
                )}
              </div>
            )}

            {/* Individual Sign Up: Full Name */}
            {mode === "signup" && accountType === "INDIVIDUAL" && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#5d5854] dark:text-[#8b949e] mb-1.5">
                  Full Name (with Professional Title)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8a8784] dark:text-[#8b949e]">
                    <User className="size-4" />
                  </div>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (errors.name) validateField("name", e.target.value);
                    }}
                    onBlur={() => handleBlur("name")}
                    placeholder="Dr. Rajesh Sharma"
                    required
                    className={`h-11 w-full rounded-xl border pl-10 pr-3.5 text-xs sm:text-sm text-[#171717] dark:text-white bg-white dark:bg-[#0d1117] transition-all focus:outline-none focus:ring-2 ${
                      fieldTouched.name && errors.name
                        ? "border-rose-500 focus:ring-rose-500/20"
                        : "border-[#ded8d1] dark:border-[#30363d] focus:border-[#0f4c81] dark:focus:border-[#58a6ff] focus:ring-[#0f4c81]/15"
                    }`}
                  />
                </div>
                {fieldTouched.name && errors.name && (
                  <p className="mt-1 text-xs font-semibold text-rose-500 flex items-center gap-1">
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
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#5d5854] dark:text-[#8b949e] mb-1.5">
                    Organisation / Hospital Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8a8784] dark:text-[#8b949e]">
                      <Building2 className="size-4" />
                    </div>
                    <input
                      type="text"
                      value={orgName}
                      onChange={(e) => {
                        setOrgName(e.target.value);
                        if (errors.orgName) validateField("orgName", e.target.value);
                      }}
                      onBlur={() => handleBlur("orgName")}
                      placeholder="e.g. Apex Multispeciality Hospital"
                      required
                      className={`h-11 w-full rounded-xl border pl-10 pr-3.5 text-xs sm:text-sm text-[#171717] dark:text-white bg-white dark:bg-[#0d1117] transition-all focus:outline-none focus:ring-2 ${
                        fieldTouched.orgName && errors.orgName
                          ? "border-rose-500 focus:ring-rose-500/20"
                          : "border-[#ded8d1] dark:border-[#30363d] focus:border-[#0f4c81] dark:focus:border-[#58a6ff] focus:ring-[#0f4c81]/15"
                      }`}
                    />
                  </div>
                  {fieldTouched.orgName && errors.orgName && (
                    <p className="mt-1 text-xs font-semibold text-rose-500 flex items-center gap-1">
                      <AlertTriangle className="size-3 shrink-0" />
                      {errors.orgName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#5d5854] dark:text-[#8b949e] mb-1.5">
                    Organisation Type
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8a8784] dark:text-[#8b949e]">
                      <Hospital className="size-4" />
                    </div>
                    <select
                      value={orgType}
                      onChange={(e) => setOrgType(e.target.value)}
                      className="h-11 w-full rounded-xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#0d1117] pl-10 pr-3.5 text-xs sm:text-sm text-[#171717] dark:text-white focus:border-[#0f4c81] dark:focus:border-[#58a6ff] focus:outline-none focus:ring-1 focus:ring-[#0f4c81] cursor-pointer"
                    >
                      {MODAL_ORGANISATION_TYPES.map((t) => (
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
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8a8784] dark:text-[#8b949e]">
                      <User className="size-4" />
                    </div>
                    <input
                      type="text"
                      value={repName}
                      onChange={(e) => {
                        setRepName(e.target.value);
                        if (errors.repName) validateField("repName", e.target.value);
                      }}
                      onBlur={() => handleBlur("repName")}
                      placeholder="e.g. Dr. Ananya Roy (Medical Director)"
                      required
                      className={`h-11 w-full rounded-xl border pl-10 pr-3.5 text-xs sm:text-sm text-[#171717] dark:text-white bg-white dark:bg-[#0d1117] transition-all focus:outline-none focus:ring-2 ${
                        fieldTouched.repName && errors.repName
                          ? "border-rose-500 focus:ring-rose-500/20"
                          : "border-[#ded8d1] dark:border-[#30363d] focus:border-[#0f4c81] dark:focus:border-[#58a6ff] focus:ring-[#0f4c81]/15"
                      }`}
                    />
                  </div>
                  {fieldTouched.repName && errors.repName && (
                    <p className="mt-1 text-xs font-semibold text-rose-500 flex items-center gap-1">
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
                <label className="block text-xs font-bold uppercase tracking-wider text-[#5d5854] dark:text-[#8b949e] mb-1.5">
                  {accountType === "ORGANISATION"
                    ? "Official / Work Email Address"
                    : "Email address"}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8a8784] dark:text-[#8b949e]">
                    <Mail className="size-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) validateField("email", e.target.value);
                    }}
                    onBlur={() => handleBlur("email")}
                    placeholder={
                      accountType === "ORGANISATION"
                        ? "contact@hospital.org"
                        : "doctor@hospital.org"
                    }
                    required
                    className={`h-11 w-full rounded-xl border pl-10 pr-3.5 text-xs sm:text-sm text-[#171717] dark:text-white bg-white dark:bg-[#0d1117] transition-all focus:outline-none focus:ring-2 ${
                      fieldTouched.email && errors.email
                        ? "border-rose-500 focus:ring-rose-500/20"
                        : "border-[#ded8d1] dark:border-[#30363d] focus:border-[#0f4c81] dark:focus:border-[#58a6ff] focus:ring-[#0f4c81]/15"
                    }`}
                  />
                </div>
                {fieldTouched.email && errors.email && (
                  <p className="mt-1 text-xs font-semibold text-rose-500 flex items-center gap-1">
                    <AlertTriangle className="size-3 shrink-0" />
                    {errors.email}
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
                    className="text-xs font-semibold text-[#0f4c81] dark:text-[#58a6ff] hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8a8784] dark:text-[#8b949e]">
                  <Lock className="size-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) validateField("password", e.target.value);
                  }}
                  onBlur={() => handleBlur("password")}
                  placeholder="••••••••"
                  required
                  className={`h-11 w-full rounded-xl border pl-10 pr-10 text-xs sm:text-sm text-[#171717] dark:text-white bg-white dark:bg-[#0d1117] transition-all focus:outline-none focus:ring-2 ${
                    fieldTouched.password && errors.password
                      ? "border-rose-500 focus:ring-rose-500/20"
                      : "border-[#ded8d1] dark:border-[#30363d] focus:border-[#0f4c81] dark:focus:border-[#58a6ff] focus:ring-[#0f4c81]/15"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8a8784] hover:text-[#171717] dark:hover:text-white cursor-pointer"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>

              {mode === "signup" && password && (
                <PasswordStrengthIndicator password={password} />
              )}

              {fieldTouched.password && errors.password && (
                <p className="mt-1 text-xs font-semibold text-rose-500 flex items-center gap-1">
                  <AlertTriangle className="size-3 shrink-0" />
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
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8a8784] dark:text-[#8b949e]">
                    <Lock className="size-4" />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (errors.confirmPassword) validateField("confirmPassword", e.target.value);
                    }}
                    onBlur={() => handleBlur("confirmPassword")}
                    placeholder="••••••••"
                    required
                    className={`h-11 w-full rounded-xl border pl-10 pr-10 text-xs sm:text-sm text-[#171717] dark:text-white bg-white dark:bg-[#0d1117] transition-all focus:outline-none focus:ring-2 ${
                      fieldTouched.confirmPassword && errors.confirmPassword
                        ? "border-rose-500 focus:ring-rose-500/20"
                        : "border-[#ded8d1] dark:border-[#30363d] focus:border-[#0f4c81] dark:focus:border-[#58a6ff] focus:ring-[#0f4c81]/15"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8a8784] hover:text-[#171717] dark:hover:text-white cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                {fieldTouched.confirmPassword && errors.confirmPassword && (
                  <p className="mt-1 text-xs font-semibold text-rose-500 flex items-center gap-1">
                    <AlertTriangle className="size-3 shrink-0" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            )}

            {/* Phone (Optional for Signup) */}
            {mode === "signup" && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#5d5854] dark:text-[#8b949e] mb-1.5">
                  {accountType === "ORGANISATION" ? "Official Phone / Desk Number" : "Mobile Phone (Optional)"}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8a8784] dark:text-[#8b949e]">
                    <Phone className="size-4" />
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="h-11 w-full rounded-xl border border-[#ded8d1] dark:border-[#30363d] bg-white dark:bg-[#0d1117] pl-10 pr-3.5 text-xs sm:text-sm text-[#171717] dark:text-white focus:border-[#0f4c81] dark:focus:border-[#58a6ff] focus:outline-none focus:ring-1 focus:ring-[#0f4c81]"
                  />
                </div>
              </div>
            )}

            {/* Remember Me / Terms */}
            <div className="pt-1">
              {mode === "signin" ? (
                <label className="flex items-center gap-2 text-xs text-[#5d5854] dark:text-[#8b949e] cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="size-4 rounded border-[#ded8d1] dark:border-[#30363d] text-[#0f4c81] dark:text-[#1f6feb] focus:ring-[#0f4c81]"
                  />
                  <span>Remember this device</span>
                </label>
              ) : (
                <div>
                  <label className="flex items-start gap-2.5 text-xs text-[#5d5854] dark:text-[#8b949e] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => {
                        setAgreedToTerms(e.target.checked);
                        if (errors.agreeToTerms) validateField("agreeToTerms", e.target.checked);
                      }}
                      required
                      className="mt-0.5 size-4 rounded border-[#ded8d1] dark:border-[#30363d] text-[#0f4c81] dark:text-[#1f6feb] focus:ring-[#0f4c81]"
                    />
                    <span>
                      I agree to the{" "}
                      <a href="#" className="font-bold text-[#0f4c81] dark:text-[#58a6ff] underline">
                        Terms of Service
                      </a>{" "}
                      &{" "}
                      <a href="#" className="font-bold text-[#0f4c81] dark:text-[#58a6ff] underline">
                        Privacy Policy
                      </a>
                      .
                    </span>
                  </label>
                  {fieldTouched.agreeToTerms && errors.agreeToTerms && (
                    <p className="mt-1 text-xs font-semibold text-rose-500 flex items-center gap-1">
                      <AlertTriangle className="size-3 shrink-0" />
                      {errors.agreeToTerms}
                    </p>
                  )}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-[#0f4c81] dark:bg-[#1f6feb] py-3 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-[#0c3c66] dark:hover:bg-[#388bfd] transition disabled:opacity-50 cursor-pointer mt-2 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  {mode === "signin" ? "Signing in..." : "Creating Account..."}
                </>
              ) : mode === "signin" ? (
                "Sign in"
              ) : accountType === "ORGANISATION" ? (
                <>
                  <Building2 className="size-4" />
                  Create Organisation Account
                </>
              ) : (
                <>
                  <ShieldCheck className="size-4" />
                  Create Individual Account
                </>
              )}
            </button>

            {/* Toggle Signin / Signup */}
            <div className="pt-3 text-center text-xs text-[#77716b] dark:text-[#8b949e]">
              {mode === "signin" ? (
                <p>
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("signup");
                      setErrors({});
                      setSuccessMessage("");
                    }}
                    className="font-bold text-[#0f4c81] dark:text-[#58a6ff] hover:underline cursor-pointer"
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
                      setErrors({});
                      setSuccessMessage("");
                    }}
                    className="font-bold text-[#0f4c81] dark:text-[#58a6ff] hover:underline cursor-pointer"
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
