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
  RefreshCw,
  Smartphone,
} from "lucide-react";
import CodeSlots from "@/components/ui/CodeSlots";

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
        <div className="flex-1 bg-[#ded8d1]/60 dark:bg-[#30363d] rounded-none h-1.5 overflow-hidden">
          <div
            className={`h-full ${getStrengthColor(strength.score)} rounded-none transition-all duration-300`}
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
  otp?: string;
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

  // Phone Auth Mode: OTP vs Password
  const [phoneAuthMode, setPhoneAuthMode] = React.useState<"otp" | "password">("otp");
  const [otpSent, setOtpSent] = React.useState(false);
  const [otpCode, setOtpCode] = React.useState("");
  const [otpStatus, setOtpStatus] = React.useState<"idle" | "error" | "success">("idle");
  const [devOtp, setDevOtp] = React.useState<string | undefined>(undefined);
  const [otpCountdown, setOtpCountdown] = React.useState(0);
  const [isSendingOtp, setIsSendingOtp] = React.useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = React.useState(false);

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

  // OTP Countdown Timer
  React.useEffect(() => {
    if (otpCountdown > 0) {
      const timer = setInterval(() => {
        setOtpCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [otpCountdown]);

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
            } else if (loginMethod === "phone" && typeof value === "string") {
              const digits = value.replace(/\D/g, "");
              if (digits.length < 10) {
                error = "Please enter a valid 10-digit mobile number";
              }
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

  // Send OTP handler
  async function handleSendPhoneOtp() {
    const rawNum = identifier.trim();
    const digits = rawNum.replace(/\D/g, "");
    if (!digits || digits.length < 10) {
      setErrors({ identifier: "Please enter a valid 10-digit mobile number." });
      return;
    }

    setIsSendingOtp(true);
    setErrors({});
    setSuccessMessage("");

    try {
      const res = await fetch("/api/auth/phone/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: rawNum }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrors({ general: data.error || "Failed to send verification code. Please try again." });
      } else {
        setOtpSent(true);
        setDevOtp(data.devOtp);
        setOtpCountdown(data.expiresInSeconds ? 30 : 30);
        setSuccessMessage(`Verification code sent to ${data.phone}`);
      }
    } catch {
      setErrors({ general: "Failed to connect to authentication server. Please try again." });
    } finally {
      setIsSendingOtp(false);
    }
  }

  // Verify OTP handler
  async function verifyOtpWithCode(codeToVerify: string) {
    const rawNum = identifier.trim();
    if (!rawNum) {
      setErrors({ identifier: "Phone number is required." });
      setOtpStatus("error");
      return;
    }
    if (!codeToVerify.trim() || codeToVerify.trim().length < 4) {
      setErrors({ otp: "Please enter the 6-digit OTP code." });
      setOtpStatus("error");
      return;
    }

    setIsVerifyingOtp(true);
    setErrors({});
    setSuccessMessage("");
    setOtpStatus("idle");

    try {
      const res = await fetch("/api/auth/phone/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: rawNum,
          otp: codeToVerify.trim(),
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrors({ general: data.error || "Invalid verification code. Please try again." });
        setOtpStatus("error");
      } else {
        setOtpStatus("success");
        setSuccessMessage("Login successful! Redirecting...");
        setTimeout(() => {
          if (data.user?.isNewUser) {
            router.push("/onboarding");
          } else {
            router.push("/home");
          }
        }, 600);
      }
    } catch {
      setErrors({ general: "Verification failed. Please check your connection." });
      setOtpStatus("error");
    } finally {
      setIsVerifyingOtp(false);
    }
  }

  async function handleVerifyPhoneOtp(e: React.FormEvent) {
    e.preventDefault();
    await verifyOtpWithCode(otpCode);
  }

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
    <div className="min-h-dvh w-full flex flex-col lg:flex-row bg-white dark:bg-[#0b0f17] font-sans selection:bg-[#0f4c81]/20">
      
      {/* ═══════════════════════════════════════════════
          LEFT 50% COLUMN: FULL SCREEN EDGE-TO-EDGE IMAGE (DESKTOP ONLY)
          ═══════════════════════════════════════════════ */}
      <div className="hidden lg:flex lg:w-1/2 min-h-dvh bg-[#eaf3fc] dark:bg-[#0c1829] flex-col justify-between p-8 lg:p-12 xl:p-16 relative overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-200/80 dark:border-slate-800">
        
        {/* Full-Screen Edge-to-Edge Illustration Background */}
        <img
          src="/login-team.png"
          alt="MGN Healthcare Team"
          className="absolute inset-0 w-full h-full object-cover object-bottom select-none pointer-events-none z-0"
        />

        {/* Top: Logo */}
        <div className="flex items-center justify-between z-10">
          <Link href="/" className="flex items-center gap-2.5 group">
            <img
              src="/logo.png"
              alt="MGN Logo"
              className="h-10 sm:h-12 w-auto object-contain transition-transform group-hover:scale-105"
            />
            <span className="text-2xl sm:text-3xl font-black tracking-tight text-[#0c2b4e] dark:text-[#58a6ff]">
              MGN
            </span>
          </Link>
        </div>

        {/* Middle: Headline, Subtitle & 4 Pillars (Overlaid over the image top half) */}
        <div className="space-y-4 my-auto pt-6 pb-2 z-10 max-w-lg text-left">
          <h1 className="text-3xl lg:text-4xl xl:text-5xl font-black tracking-tight text-[#0c2b4e] dark:text-[#f0f6fc] leading-[1.14] text-balance">
            One Network. <br />
            <span className="text-[#16804d] dark:text-[#2ea043]">
              Endless Opportunities.
            </span>
          </h1>

          <p className="text-xs sm:text-sm lg:text-base text-[#4b5563] dark:text-[#9ca3af] leading-relaxed font-normal text-pretty">
            MGN connects healthcare professionals, students, organizations and businesses on a single platform to learn, grow, collaborate and thrive.
          </p>

          {/* 4 Value Pillars Row */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 pt-2 text-left">
            {/* Connect */}
            <div className="space-y-1">
              <div className="size-8.5 rounded-none bg-blue-100/80 dark:bg-blue-950/70 text-[#0f4c81] dark:text-[#58a6ff] flex items-center justify-center shadow-2xs">
                <Users className="size-4.5" />
              </div>
              <div className="text-xs font-bold text-[#0c2b4e] dark:text-white">Connect</div>
              <div className="text-[10.5px] text-[#6b7280] dark:text-[#8b949e] leading-snug">
                Build meaningful professional connections
              </div>
            </div>

            {/* Learn */}
            <div className="space-y-1">
              <div className="size-8.5 rounded-none bg-emerald-100/80 dark:bg-emerald-950/70 text-[#16804d] dark:text-[#34d399] flex items-center justify-center shadow-2xs">
                <BookOpen className="size-4.5" />
              </div>
              <div className="text-xs font-bold text-[#0c2b4e] dark:text-white">Learn</div>
              <div className="text-[10.5px] text-[#6b7280] dark:text-[#8b949e] leading-snug">
                Access quality courses and resources
              </div>
            </div>

            {/* Grow */}
            <div className="space-y-1">
              <div className="size-8.5 rounded-none bg-teal-100/80 dark:bg-teal-950/70 text-[#0d9488] dark:text-[#2dd4bf] flex items-center justify-center shadow-2xs">
                <TrendingUp className="size-4.5" />
              </div>
              <div className="text-xs font-bold text-[#0c2b4e] dark:text-white">Grow</div>
              <div className="text-[10.5px] text-[#6b7280] dark:text-[#8b949e] leading-snug">
                Discover opportunities and advance career
              </div>
            </div>

            {/* Thrive */}
            <div className="space-y-1">
              <div className="size-8.5 rounded-none bg-sky-100/80 dark:bg-sky-950/70 text-[#0284c7] dark:text-[#38bdf8] flex items-center justify-center shadow-2xs">
                <ShieldCheck className="size-4.5" />
              </div>
              <div className="text-xs font-bold text-[#0c2b4e] dark:text-white">Thrive</div>
              <div className="text-[10.5px] text-[#6b7280] dark:text-[#8b949e] leading-snug">
                Be part of a trusted and verified network
              </div>
            </div>
          </div>
        </div>

        {/* Transparent bottom spacer to let the doctors in the background image shine through */}
        <div className="h-40 lg:h-52 xl:h-60 z-10 pointer-events-none" />
      </div>

      {/* ═══════════════════════════════════════════════
          RIGHT 50% COLUMN: AUTH FORM (ROUNDED-NONE)
          ═══════════════════════════════════════════════ */}
      <div className="w-full lg:w-1/2 min-h-dvh flex flex-col justify-between bg-white dark:bg-[#0d1117] p-5 sm:p-8 lg:p-12 xl:p-16 z-10 rounded-none overflow-y-auto">
        
        {/* Top Header */}
        <div className="flex items-center justify-between w-full max-w-[420px] mx-auto pb-4">
          <Link href="/" className="lg:hidden flex items-center gap-2 group">
            <img
              src="/logo.png"
              alt="MGN Logo"
              className="h-8 w-auto object-contain transition-transform group-hover:scale-105"
            />
            <span className="text-xl font-black tracking-tight text-[#0c2b4e] dark:text-[#58a6ff]">
              MGN
            </span>
          </Link>
          <Link
            href="/"
            className="hidden lg:inline-flex items-center gap-1.5 text-xs font-semibold text-[#5d5854] dark:text-[#8b949e] hover:text-[#0f4c81] dark:hover:text-[#58a6ff] transition"
          >
            ← Back to Home
          </Link>
        </div>

        {/* Center Main Form Area (Rounded-None) */}
        <div className="w-full max-w-[420px] mx-auto my-auto py-4 sm:py-6 rounded-none animate-in fade-in duration-200">
          
          {/* Header inside Form Area */}
          <div className="text-center mb-6">
            <h2 className="text-2xl sm:text-[28px] font-extrabold text-[#0c2b4e] dark:text-[#f0f6fc] tracking-tight">
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
            <div className="grid grid-cols-2 gap-2 p-1 rounded-none bg-[#f0f4f8] dark:bg-[#161b22] mb-5 border border-slate-200/80 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setLoginMethod("email");
                  setErrors({});
                  setSuccessMessage("");
                }}
                className={`flex items-center justify-center gap-2 py-2.5 text-xs font-semibold rounded-none transition cursor-pointer ${
                  loginMethod === "email"
                    ? "bg-white dark:bg-[#21262d] text-[#0f4c81] dark:text-[#58a6ff] shadow-xs border border-[#0f4c81]/30 dark:border-[#58a6ff]/30"
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
                  setSuccessMessage("");
                }}
                className={`flex items-center justify-center gap-2 py-2.5 text-xs font-semibold rounded-none transition cursor-pointer ${
                  loginMethod === "phone"
                    ? "bg-white dark:bg-[#21262d] text-[#0f4c81] dark:text-[#58a6ff] shadow-xs border border-[#0f4c81]/30 dark:border-[#58a6ff]/30"
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
                  className={`p-3 rounded-none border text-left transition cursor-pointer flex flex-col justify-between ${
                    accountType === "INDIVIDUAL"
                      ? "border-[#0f4c81] dark:border-[#58a6ff] bg-[#eef5fc]/60 dark:bg-[#1f2937]/80 text-[#0f4c81] dark:text-[#58a6ff] ring-1 ring-[#0f4c81]/20 dark:ring-[#58a6ff]/20"
                      : "border-slate-200 dark:border-[#30363d] bg-white dark:bg-[#0d1117] text-[#171717] dark:text-[#f0f6fc] hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div
                      className={`p-1.5 rounded-none ${
                        accountType === "INDIVIDUAL"
                          ? "bg-[#0f4c81] text-white"
                          : "bg-[#f0efee] dark:bg-[#21262d] text-[#5d5854] dark:text-[#8b949e]"
                      }`}
                    >
                      <User className="size-4" />
                    </div>
                    {accountType === "INDIVIDUAL" && (
                      <span className="size-2 rounded-none bg-[#0f4c81] dark:bg-[#58a6ff]" />
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
                  className={`p-3 rounded-none border text-left transition cursor-pointer flex flex-col justify-between ${
                    accountType === "ORGANISATION"
                      ? "border-[#0f4c81] dark:border-[#58a6ff] bg-[#eef5fc]/60 dark:bg-[#1f2937]/80 text-[#0f4c81] dark:text-[#58a6ff] ring-1 ring-[#0f4c81]/20 dark:ring-[#58a6ff]/20"
                      : "border-slate-200 dark:border-[#30363d] bg-white dark:bg-[#0d1117] text-[#171717] dark:text-[#f0f6fc] hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div
                      className={`p-1.5 rounded-none ${
                        accountType === "ORGANISATION"
                          ? "bg-[#0f4c81] text-white"
                          : "bg-[#f0efee] dark:bg-[#21262d] text-[#5d5854] dark:text-[#8b949e]"
                      }`}
                    >
                      <Building2 className="size-4" />
                    </div>
                    {accountType === "ORGANISATION" && (
                      <span className="size-2 rounded-none bg-[#0f4c81] dark:bg-[#58a6ff]" />
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
            <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-none flex items-center gap-2 text-xs font-medium text-emerald-700 dark:text-emerald-400 animate-in fade-in text-left">
              <CheckCircle2 className="size-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {errors.general && (
            <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-none flex items-center gap-2 text-xs font-medium text-rose-700 dark:text-rose-400 animate-in fade-in text-left">
              <AlertTriangle className="size-4 shrink-0" />
              <span>{errors.general}</span>
            </div>
          )}

          {/* ═══════════════════════════════════════════
              CASE A: FORGOT PASSWORD
              ═══════════════════════════════════════════ */}
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
                    className="h-11 w-full rounded-none border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0d1117] pl-10 pr-3.5 text-xs sm:text-sm text-[#171717] dark:text-white placeholder:text-slate-400 focus:border-[#0f4c81] dark:focus:border-[#58a6ff] focus:outline-none focus:ring-1 focus:ring-[#0f4c81]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !identifier}
                className="w-full rounded-none bg-[#0f4c81] dark:bg-[#14559b] py-3 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-[#0c3c66] dark:hover:bg-[#0f4c81] transition disabled:opacity-50 cursor-pointer"
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
          ) : mode === "signin" && loginMethod === "phone" && phoneAuthMode === "otp" ? (
            /* ═══════════════════════════════════════════
               CASE B: SIGN IN VIA PHONE OTP (REAL OTP)
               ═══════════════════════════════════════════ */
            <div className="space-y-4 text-left">
              {!otpSent ? (
                /* Step 1: Enter Phone Number & Send OTP */
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendPhoneOtp();
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-xs font-semibold text-[#0c2b4e] dark:text-slate-200 mb-1.5">
                      Mobile Number
                    </label>
                    <div className="flex items-center">
                      <div className="h-11 px-3 bg-slate-100 dark:bg-[#1c2128] border border-r-0 border-slate-200 dark:border-slate-700 flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 select-none">
                        <Smartphone className="size-3.5 text-slate-500" />
                        <span>+91</span>
                      </div>
                      <input
                        type="tel"
                        value={identifier.replace(/^\+91\s*/, "")}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                          setIdentifier(val ? `+91${val}` : "");
                        }}
                        placeholder="98765 43210"
                        autoFocus
                        required
                        className="h-11 w-full rounded-none border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0d1117] px-3 text-xs sm:text-sm text-[#171717] dark:text-white placeholder:text-slate-400 focus:border-[#0f4c81] dark:focus:border-[#58a6ff] focus:outline-none focus:ring-1 focus:ring-[#0f4c81] tracking-wider"
                      />
                    </div>
                    {errors.identifier && (
                      <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-1 font-normal">
                        <AlertTriangle className="size-3 shrink-0" />
                        {errors.identifier}
                      </p>
                    )}
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
                      We'll send a 6-digit verification code to this number.
                    </p>
                  </div>

                  {/* Send OTP CTA */}
                  <button
                    type="submit"
                    disabled={isSendingOtp || !identifier || identifier.replace(/\D/g, "").length < 10}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-none bg-[#0f4c81] dark:bg-[#14559b] py-3 text-sm font-bold text-white shadow-xs hover:bg-[#0c3c66] dark:hover:bg-[#0f4c81] transition disabled:opacity-50 cursor-pointer active:scale-98"
                  >
                    {isSendingOtp ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="size-4 animate-spin" />
                        Sending code...
                      </span>
                    ) : (
                      <>
                        <span>Get Verification Code</span>
                        <ArrowRight className="size-4" />
                      </>
                    )}
                  </button>

                  {/* Alternative: Switch to Password Login */}
                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setPhoneAuthMode("password");
                        setErrors({});
                      }}
                      className="text-xs font-semibold text-[#0f4c81] dark:text-[#58a6ff] hover:underline cursor-pointer"
                    >
                      Login with password instead
                    </button>
                  </div>
                </form>
              ) : (
                /* Step 2: Enter 6-Digit OTP & Verify */
                <form onSubmit={handleVerifyPhoneOtp} className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-[#0c2b4e] dark:text-slate-200">
                        Enter 6-Digit Verification Code
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setOtpSent(false);
                          setOtpCode("");
                          setErrors({});
                          setSuccessMessage("");
                        }}
                        className="text-[11px] font-semibold text-[#0f4c81] dark:text-[#58a6ff] hover:underline cursor-pointer"
                      >
                        Change Number
                      </button>
                    </div>

                    <div className="flex justify-center my-3 py-2">
                      <CodeSlots
                        length={6}
                        value={otpCode}
                        status={otpStatus}
                        onChange={(code) => {
                          setOtpCode(code);
                          if (otpStatus !== "idle") setOtpStatus("idle");
                          if (errors.otp || errors.general) setErrors({});
                        }}
                        onComplete={(code) => {
                          verifyOtpWithCode(code);
                        }}
                        accentColor="#0f4c81"
                        inkColor="#0f4c81"
                        slotColor="#f0efee"
                        digitColor="#171717"
                        dangerColor="#e11d48"
                        slotSize={46}
                        gap={8}
                        radius={10}
                        autoFocus={true}
                      />
                    </div>

                    {/* Non-prod dev OTP helper */}
                    {devOtp && (
                      <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-xs text-blue-700 dark:text-blue-300 flex items-center justify-between">
                        <span>
                          Test OTP: <strong className="font-mono">{devOtp}</strong>
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setOtpCode(devOtp);
                            verifyOtpWithCode(devOtp);
                          }}
                          className="text-[11px] underline font-bold cursor-pointer"
                        >
                          Auto-fill & Verify
                        </button>
                      </div>
                    )}

                    {errors.otp && (
                      <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-1 font-normal">
                        <AlertTriangle className="size-3 shrink-0" />
                        {errors.otp}
                      </p>
                    )}
                  </div>

                  {/* Verify & Login CTA */}
                  <button
                    type="submit"
                    disabled={isVerifyingOtp || otpCode.length < 4}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-none bg-[#0f4c81] dark:bg-[#14559b] py-3 text-sm font-bold text-white shadow-xs hover:bg-[#0c3c66] dark:hover:bg-[#0f4c81] transition disabled:opacity-50 cursor-pointer active:scale-98"
                  >
                    {isVerifyingOtp ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="size-4 animate-spin" />
                        Verifying code...
                      </span>
                    ) : (
                      <>
                        <span>Verify & Login</span>
                        <ArrowRight className="size-4" />
                      </>
                    )}
                  </button>

                  {/* Resend OTP */}
                  <div className="flex items-center justify-between pt-1 text-xs">
                    <span className="text-slate-500 dark:text-slate-400">Didn't receive the code?</span>
                    {otpCountdown > 0 ? (
                      <span className="text-slate-400 font-medium">Resend in {otpCountdown}s</span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendPhoneOtp}
                        disabled={isSendingOtp}
                        className="font-bold text-[#0f4c81] dark:text-[#58a6ff] hover:underline cursor-pointer inline-flex items-center gap-1"
                      >
                        <RefreshCw className="size-3" />
                        Resend Code
                      </button>
                    )}
                  </div>
                </form>
              )}
            </div>
          ) : (
            /* ═══════════════════════════════════════════
               CASE C: STANDARD PASSWORD LOGIN / SIGN UP
               ═══════════════════════════════════════════ */
            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              {/* Sign In Mode: Email vs Phone (Password mode) */}
              {mode === "signin" && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-[#0c2b4e] dark:text-slate-200">
                      {loginMethod === "email" ? "Email Address or Username" : "Mobile Number"}
                    </label>
                    {loginMethod === "phone" && (
                      <button
                        type="button"
                        onClick={() => {
                          setPhoneAuthMode("otp");
                          setOtpSent(false);
                          setErrors({});
                        }}
                        className="text-[11px] font-semibold text-[#0f4c81] dark:text-[#58a6ff] hover:underline cursor-pointer"
                      >
                        Login with OTP instead
                      </button>
                    )}
                  </div>
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
                          ? "doctor@hospital.org or @username"
                          : "+91 Enter mobile number"
                      }
                      required
                      className="h-11 w-full rounded-none border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0d1117] pl-10 pr-3.5 text-xs sm:text-sm text-[#171717] dark:text-white placeholder:text-slate-400 focus:border-[#0f4c81] dark:focus:border-[#58a6ff] focus:outline-none focus:ring-1 focus:ring-[#0f4c81]"
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
                      className="h-11 w-full rounded-none border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0d1117] pl-10 pr-3.5 text-xs sm:text-sm text-[#171717] dark:text-white placeholder:text-slate-400 focus:border-[#0f4c81] dark:focus:border-[#58a6ff] focus:outline-none focus:ring-1 focus:ring-[#0f4c81]"
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
                        className="h-11 w-full rounded-none border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0d1117] pl-10 pr-3.5 text-xs sm:text-sm text-[#171717] dark:text-white placeholder:text-slate-400 focus:border-[#0f4c81] dark:focus:border-[#58a6ff] focus:outline-none focus:ring-1 focus:ring-[#0f4c81]"
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
                        className="h-11 w-full rounded-none border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0d1117] pl-10 pr-3.5 text-xs sm:text-sm text-[#171717] dark:text-white focus:border-[#0f4c81] dark:focus:border-[#58a6ff] focus:outline-none focus:ring-1 focus:ring-[#0f4c81] cursor-pointer"
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
                        className="h-11 w-full rounded-none border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0d1117] pl-10 pr-3.5 text-xs sm:text-sm text-[#171717] dark:text-white placeholder:text-slate-400 focus:border-[#0f4c81] dark:focus:border-[#58a6ff] focus:outline-none focus:ring-1 focus:ring-[#0f4c81]"
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
                      className="h-11 w-full rounded-none border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0d1117] pl-10 pr-3.5 text-xs sm:text-sm text-[#171717] dark:text-white placeholder:text-slate-400 focus:border-[#0f4c81] dark:focus:border-[#58a6ff] focus:outline-none focus:ring-1 focus:ring-[#0f4c81]"
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

              {/* Sign Up Mode: Phone Number (Optional) */}
              {mode === "signup" && (
                <div>
                  <label className="block text-xs font-semibold text-[#0c2b4e] dark:text-slate-200 mb-1.5">
                    Mobile Number <span className="text-[11px] font-normal text-slate-400">(Optional)</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="+91 98765 43210"
                      className="h-11 w-full rounded-none border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0d1117] pl-10 pr-3.5 text-xs sm:text-sm text-[#171717] dark:text-white placeholder:text-slate-400 focus:border-[#0f4c81] dark:focus:border-[#58a6ff] focus:outline-none focus:ring-1 focus:ring-[#0f4c81]"
                    />
                  </div>
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
                      className="h-11 w-full rounded-none border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0d1117] pl-10 pr-3.5 text-xs sm:text-sm text-[#171717] dark:text-white placeholder:text-slate-400 focus:border-[#0f4c81] dark:focus:border-[#58a6ff] focus:outline-none focus:ring-1 focus:ring-[#0f4c81]"
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
                    className="h-11 w-full rounded-none border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0d1117] pl-10 pr-10 text-xs sm:text-sm text-[#171717] dark:text-white placeholder:text-slate-400 focus:border-[#0f4c81] dark:focus:border-[#58a6ff] focus:outline-none focus:ring-1 focus:ring-[#0f4c81]"
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
                      className="h-11 w-full rounded-none border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0d1117] pl-10 pr-10 text-xs sm:text-sm text-[#171717] dark:text-white placeholder:text-slate-400 focus:border-[#0f4c81] dark:focus:border-[#58a6ff] focus:outline-none focus:ring-1 focus:ring-[#0f4c81]"
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
                      className="mt-0.5 size-4 rounded-none border-slate-300 text-[#0f4c81] focus:ring-[#0f4c81]"
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
                className="w-full inline-flex items-center justify-center gap-2 rounded-none bg-[#0f4c81] dark:bg-[#14559b] py-3 text-sm font-bold text-white shadow-xs hover:bg-[#0c3c66] dark:hover:bg-[#0f4c81] transition disabled:opacity-50 cursor-pointer mt-2 active:scale-98"
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
                    setOtpSent(false);
                    setOtpCode("");
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

        {/* Minimal Footer */}
        <footer className="w-full max-w-[420px] mx-auto text-center text-xs text-slate-400 dark:text-slate-500 pt-4">
          © {new Date().getFullYear()} Med Global Network (MGN). All rights reserved.
        </footer>
      </div>

    </div>
  );
}
