"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  ShieldCheck,
  ShieldAlert,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  FileText,
  MapPin,
  Edit3,
  Settings,
  Share2,
  ExternalLink,
  Plus,
  Trash2,
  PlusCircle,
  BookOpen,
  Briefcase,
  GraduationCap,
  Award,
  Globe,
  Info,
  Lock,
  Eye,
  Check,
  Stethoscope,
  HeartPulse,
  Pill,
  Activity,
  Ambulance,
  Users,
  Microscope,
  Building2,
  Shield,
  UploadCloud,
  X,
  Camera,
  Layers,
  Sparkles,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

interface IdentityItem {
  id: string;
  title: string;
  group: string;
  prefix?: string;
  details: Record<string, any>;
  status: string;
  isVerified: boolean;
}

interface EducationRecord {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  startYear: string;
  endYear: string;
  isCurrentlyStudying?: boolean;
  description?: string;
}

interface ExperienceRecord {
  id: string;
  organization: string;
  title: string;
  employmentType: string;
  startDate: string;
  endDate: string;
  isCurrentlyWorking?: boolean;
  description?: string;
}

interface AchievementRecord {
  id: string;
  type: "award" | "certification" | "publication" | "project" | "conference";
  title: string;
  issuerOrJournal: string;
  dateOrYear: string;
  urlOrDoi?: string;
  description?: string;
}

interface ProfileData {
  userId: string;
  fullName: string;
  headline: string;
  initials: string;
  image: string | null;
  coverImageUrl: string | null;
  accountType: string;
  location: string;
  country: string;
  state: string;
  city: string;
  memberId: string | null;
  isFoundingMember: boolean;
  createdAt: string;

  email?: string;
  phone?: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  isIdentityVerified: boolean;

  bio: string;
  bioCharLimit: number;
  healthcareInterests: string[];

  identities: IdentityItem[];
  education: EducationRecord[];
  experience: ExperienceRecord[];
  skills: string[];
  achievements: AchievementRecord[];
  publications: AchievementRecord[];
  socialLinks: Record<string, string>;

  sectionPrivacy: Record<string, "public" | "connections" | "private">;
  completionPercent: number;
  completedSteps: string[];
  pendingSteps: string[];
  isOwnProfile: boolean;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  student: GraduationCap,
  intern_trainee: Award,
  doctor: Stethoscope,
  nurse: HeartPulse,
  pharmacist: Pill,
  physiotherapist: Activity,
  paramedical: Ambulance,
  allied_health: Users,
  researcher: Microscope,
  faculty: BookOpen,
  business_owner: Building2,
  service_provider: Briefcase,
  other_healthcare: Shield,
};

const SUGGESTED_SKILLS = [
  "Clinical Research",
  "Patient Care",
  "Internal Medicine",
  "Emergency Care",
  "Critical Care (ICU)",
  "Diagnostics & Imaging",
  "Pharmacology",
  "Surgical Procedures",
  "Infection Control",
  "Medical Education",
  "Public Health & Epidemiology",
  "Cardiology",
  "Neurology",
  "Pediatrics",
  "Healthcare AI & Informatics",
];

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [profile, setProfile] = React.useState<ProfileData | null>(null);

  // Modals & Drawers
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [editSection, setEditSection] = React.useState<string>("general");
  const [isSaving, setIsSaving] = React.useState(false);
  const [shareToast, setShareToast] = React.useState(false);

  // Form State for Profile Editor
  const [formData, setFormData] = React.useState<{
    fullName: string;
    headline: string;
    city: string;
    state: string;
    country: string;
    bio: string;
    skills: string[];
    healthcareInterests: string[];
    education: EducationRecord[];
    experience: ExperienceRecord[];
    achievements: AchievementRecord[];
    publications: AchievementRecord[];
    socialLinks: Record<string, string>;
    sectionPrivacy: Record<string, "public" | "connections" | "private">;
  }>({
    fullName: "",
    headline: "",
    city: "",
    state: "",
    country: "India",
    bio: "",
    skills: [],
    healthcareInterests: [],
    education: [],
    experience: [],
    achievements: [],
    publications: [],
    socialLinks: {},
    sectionPrivacy: {
      about: "public",
      identities: "public",
      education: "public",
      experience: "public",
      skills: "public",
      achievements: "public",
      publications: "public",
      social: "public",
    },
  });

  // New Skill Tag Input
  const [newSkillInput, setNewSkillInput] = React.useState("");
  const [newInterestInput, setNewInterestInput] = React.useState("");

  // ─────────────────────────────────────────────
  // LOAD PROFILE DATA
  // ─────────────────────────────────────────────
  const loadProfile = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let targetUserId = "";
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("mgn_onboarding_registered_user");
        if (stored) {
          try {
            const p = JSON.parse(stored);
            if (p.userId) targetUserId = p.userId;
          } catch {}
        }
      }

      const url = targetUserId
        ? `/api/profile?userId=${encodeURIComponent(targetUserId)}`
        : "/api/profile";

      const res = await fetch(url, { credentials: "include" });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to load profile.");
      }

      const p: ProfileData = data.profile;
      setProfile(p);
      setFormData({
        fullName: p.fullName || "",
        headline: p.headline || "",
        city: p.city || "",
        state: p.state || "",
        country: p.country || "India",
        bio: p.bio || "",
        skills: p.skills || [],
        healthcareInterests: p.healthcareInterests || [],
        education: p.education || [],
        experience: p.experience || [],
        achievements: p.achievements || [],
        publications: p.publications || [],
        socialLinks: p.socialLinks || {},
        sectionPrivacy: p.sectionPrivacy || {
          about: "public",
          identities: "public",
          education: "public",
          experience: "public",
          skills: "public",
          achievements: "public",
          publications: "public",
          social: "public",
        },
      });
    } catch (err: any) {
      console.error("Profile load error:", err);
      setError(err.message || "Failed to retrieve profile details.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // ─────────────────────────────────────────────
  // SAVE PROFILE CHANGES
  // ─────────────────────────────────────────────
  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save profile changes.");
      }

      setShowEditModal(false);
      await loadProfile();
    } catch (err: any) {
      alert(err.message || "Failed to save profile changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // ─────────────────────────────────────────────
  // SHARE PROFILE
  // ─────────────────────────────────────────────
  const handleShareProfile = () => {
    if (typeof window !== "undefined") {
      const url = window.location.href;
      navigator.clipboard.writeText(url).then(() => {
        setShareToast(true);
        setTimeout(() => setShareToast(false), 3000);
      });
    }
  };

  // ─────────────────────────────────────────────
  // ADD / REMOVE SKILL TAGS
  // ─────────────────────────────────────────────
  const handleAddSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (!trimmed || formData.skills.includes(trimmed)) return;
    setFormData((prev) => ({ ...prev, skills: [...prev.skills, trimmed] }));
    setNewSkillInput("");
  };

  const handleRemoveSkill = (skill: string) => {
    setFormData((prev) => ({ ...prev, skills: prev.skills.filter((s) => s !== skill) }));
  };

  // ─────────────────────────────────────────────
  // ADD / REMOVE HEALTHCARE INTERESTS
  // ─────────────────────────────────────────────
  const handleAddInterest = (interest: string) => {
    const trimmed = interest.trim();
    if (!trimmed || formData.healthcareInterests.includes(trimmed)) return;
    setFormData((prev) => ({
      ...prev,
      healthcareInterests: [...prev.healthcareInterests, trimmed],
    }));
    setNewInterestInput("");
  };

  const handleRemoveInterest = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      healthcareInterests: prev.healthcareInterests.filter((i) => i !== interest),
    }));
  };

  // ─────────────────────────────────────────────
  // ADD / EDIT / REMOVE EDUCATION
  // ─────────────────────────────────────────────
  const handleAddEducation = () => {
    const newEdu: EducationRecord = {
      id: Math.random().toString(36).slice(2, 9),
      institution: "",
      degree: "",
      fieldOfStudy: "",
      startYear: "2018",
      endYear: "2023",
      isCurrentlyStudying: false,
      description: "",
    };
    setFormData((prev) => ({ ...prev, education: [...prev.education, newEdu] }));
  };

  const handleRemoveEducation = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      education: prev.education.filter((e) => e.id !== id),
    }));
  };

  // ─────────────────────────────────────────────
  // ADD / EDIT / REMOVE EXPERIENCE
  // ─────────────────────────────────────────────
  const handleAddExperience = () => {
    const newExp: ExperienceRecord = {
      id: Math.random().toString(36).slice(2, 9),
      organization: "",
      title: "",
      employmentType: "Full-time",
      startDate: "2022",
      endDate: "Present",
      isCurrentlyWorking: true,
      description: "",
    };
    setFormData((prev) => ({ ...prev, experience: [...prev.experience, newExp] }));
  };

  const handleRemoveExperience = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      experience: prev.experience.filter((e) => e.id !== id),
    }));
  };

  // ─────────────────────────────────────────────
  // ADD / REMOVE ACHIEVEMENTS & PUBLICATIONS
  // ─────────────────────────────────────────────
  const handleAddAchievement = (type: AchievementRecord["type"]) => {
    const newItem: AchievementRecord = {
      id: Math.random().toString(36).slice(2, 9),
      type,
      title: "",
      issuerOrJournal: "",
      dateOrYear: new Date().getFullYear().toString(),
      urlOrDoi: "",
      description: "",
    };
    if (type === "publication") {
      setFormData((prev) => ({ ...prev, publications: [...prev.publications, newItem] }));
    } else {
      setFormData((prev) => ({ ...prev, achievements: [...prev.achievements, newItem] }));
    }
  };

  const handleRemoveAchievement = (id: string, isPub: boolean) => {
    if (isPub) {
      setFormData((prev) => ({
        ...prev,
        publications: prev.publications.filter((p) => p.id !== id),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        achievements: prev.achievements.filter((a) => a.id !== id),
      }));
    }
  };

  // ─────────────────────────────────────────────
  // RENDER STATUS BADGE
  // ─────────────────────────────────────────────
  const renderVerificationBadge = (isVerified: boolean, status: string) => {
    if (isVerified || status === "APPROVED") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800/40 shadow-2xs">
          <CheckCircle2 className="size-3.5 fill-current" />
          Verified Credential
        </span>
      );
    }
    if (status === "UNDER_REVIEW") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-xs font-bold border border-amber-200">
          <Clock className="size-3.5 animate-pulse" />
          Under Review
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-semibold border border-slate-200 dark:border-slate-700">
        <Clock className="size-3.5" />
        Verification Pending
      </span>
    );
  };

  // ─────────────────────────────────────────────
  // LOADING SKELETON
  // ─────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-dvh bg-slate-50/60 dark:bg-[#0b131e] text-[#1f2937] dark:text-[#f3f4f6] font-sans pb-24">
        <div className="max-w-5xl mx-auto px-4 py-8 space-y-6 animate-pulse">
          <div className="h-56 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
          <div className="h-44 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800" />
          <div className="h-64 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800" />
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // ERROR STATE
  // ─────────────────────────────────────────────
  if (error && !profile) {
    return (
      <div className="min-h-dvh bg-slate-50/60 dark:bg-[#0b131e] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl border border-red-100 dark:border-red-900/40 p-8 shadow-sm text-center space-y-4">
          <AlertCircle className="size-10 text-red-600 dark:text-red-400 mx-auto" />
          <h2 className="text-xl font-bold text-[#102D45] dark:text-white">Unable to Load Profile</h2>
          <p className="text-xs text-slate-600 dark:text-slate-400">{error}</p>
          <button
            type="button"
            onClick={loadProfile}
            className="px-6 py-2.5 rounded-xl bg-[#102D45] text-white text-xs font-semibold shadow-xs"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-slate-50/60 dark:bg-[#0b131e] text-[#1f2937] dark:text-[#f3f4f6] font-sans pb-24">
      {/* Toast Notification */}
      {shareToast && (
        <div className="fixed top-5 right-5 z-50 bg-[#102D45] text-white text-xs font-bold px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
          <Check className="size-4 text-[#2dd4bf]" />
          <span>Profile link copied to clipboard!</span>
        </div>
      )}

      {/* ─────────────────────────────────────────────
          1. HEADER NAVBAR
          ───────────────────────────────────────────── */}
      <header className="w-full border-b border-slate-100 dark:border-slate-800/80 bg-white/95 dark:bg-[#0b131e]/95 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Return to Dashboard"
            >
              <ArrowLeft className="size-4" />
            </Link>
            <span className="text-sm font-bold text-[#102D45] dark:text-white">Member Profile</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleShareProfile}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-colors"
            >
              <Share2 className="size-3.5" />
              <span>Share Profile</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setEditSection("general");
                setShowEditModal(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#102D45] hover:bg-[#163f61] text-white text-xs font-bold transition-all shadow-xs"
            >
              <Edit3 className="size-3.5" />
              <span>Edit Profile</span>
            </button>
          </div>
        </div>
      </header>

      {/* ─────────────────────────────────────────────
          2. MAIN PROFILE CONTAINER
          ───────────────────────────────────────────── */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* ─────────────────────────────────────────────
            A. PROFILE HEADER CARD (Cover, Avatar, Headline, Badges)
            ───────────────────────────────────────────── */}
        <div className="bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
          {/* Cover Photo */}
          <div className="h-44 sm:h-56 w-full bg-gradient-to-r from-[#102D45] via-[#124b59] to-[#168B78] relative">
            <div className="absolute inset-0 bg-black/10" />
            <button
              type="button"
              onClick={() => {
                setEditSection("cover");
                setShowEditModal(true);
              }}
              className="absolute top-4 right-4 p-2 rounded-xl bg-black/40 hover:bg-black/60 text-white backdrop-blur-md text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <Camera className="size-3.5" />
              <span className="hidden sm:inline">Change Cover</span>
            </button>
          </div>

          {/* Profile Meta & Actions */}
          <div className="px-6 sm:px-8 pb-7 pt-0 relative">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-16 sm:-mt-20 mb-4">
              {/* Profile Avatar */}
              <div className="relative inline-block">
                <div className="size-28 sm:size-36 rounded-3xl border-4 border-white dark:border-[#0f172a] bg-gradient-to-tr from-[#102D45] to-[#168B78] text-white flex items-center justify-center text-3xl sm:text-4xl font-black shadow-md overflow-hidden">
                  {profile?.image ? (
                    <img
                      src={profile.image}
                      alt={profile.fullName}
                      className="size-full object-cover"
                    />
                  ) : (
                    <span>{profile?.initials || "MG"}</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditSection("avatar");
                    setShowEditModal(true);
                  }}
                  className="absolute bottom-1 right-1 p-2 rounded-xl bg-[#102D45] hover:bg-[#163f61] text-white shadow-md border-2 border-white dark:border-[#0f172a] transition-all"
                  title="Update Profile Photo"
                >
                  <Camera className="size-3.5" />
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 pt-2 sm:pt-0">
                <button
                  type="button"
                  onClick={() => {
                    setEditSection("general");
                    setShowEditModal(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-[#102D45] hover:bg-[#163f61] text-white text-xs font-bold transition-all shadow-xs"
                >
                  <Edit3 className="size-3.5" />
                  <span>Edit Profile</span>
                </button>
                <button
                  type="button"
                  onClick={handleShareProfile}
                  className="p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-colors"
                  title="Share Profile"
                >
                  <Share2 className="size-4" />
                </button>
              </div>
            </div>

            {/* Name, Headline, Location */}
            <div className="space-y-2">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black text-[#102D45] dark:text-white tracking-tight">
                  {profile?.fullName}
                </h1>
                {profile?.isIdentityVerified && (
                  <span
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200"
                    title="Clinically Verified by MED Global Network"
                  >
                    <CheckCircle2 className="size-3.5 fill-current" />
                    Verified Clinician
                  </span>
                )}
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#102D45]/5 text-[#102D45] dark:text-[#58a6ff] dark:bg-[#58a6ff]/10">
                  {profile?.accountType || "Individual Account"}
                </span>
              </div>

              {/* Headline */}
              <p className="text-sm sm:text-base font-medium text-slate-700 dark:text-slate-300 max-w-3xl leading-relaxed">
                {profile?.headline}
              </p>

              {/* Location & Contact Meta */}
              <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1 flex-wrap">
                <div className="flex items-center gap-1">
                  <MapPin className="size-3.5 text-slate-400" />
                  <span>{profile?.location}</span>
                </div>
                {profile?.memberId && (
                  <div className="font-mono text-slate-400">
                    ID: {profile.memberId}
                  </div>
                )}
                <div className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <ShieldCheck className="size-3.5" />
                  <span>Contact Verified</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─────────────────────────────────────────────
            B. ABOUT SECTION
            ───────────────────────────────────────────── */}
        <div className="bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
            <h2 className="text-base font-bold text-[#102D45] dark:text-white">About</h2>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                {profile?.sectionPrivacy.about || "Public"}
              </span>
              <button
                type="button"
                onClick={() => {
                  setEditSection("about");
                  setShowEditModal(true);
                }}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <Edit3 className="size-3.5" />
              </button>
            </div>
          </div>

          {profile?.bio ? (
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {profile.bio}
            </p>
          ) : (
            <div className="text-xs text-slate-400 italic">
              No biography provided yet. Click &quot;Edit Profile&quot; to introduce your healthcare background and clinical experience.
            </div>
          )}

          {/* Healthcare Interests Tags */}
          {profile?.healthcareInterests && profile.healthcareInterests.length > 0 && (
            <div className="pt-2 space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Healthcare Interests & Subspecialties
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {profile.healthcareInterests.map((interest) => (
                  <span
                    key={interest}
                    className="px-3 py-1 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-[#168B78] dark:text-[#2dd4bf] text-xs font-semibold border border-teal-100 dark:border-teal-900/40"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ─────────────────────────────────────────────
            C. HEALTHCARE IDENTITIES & VERIFICATION STATUSES
            ───────────────────────────────────────────── */}
        <div className="bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
            <div>
              <h2 className="text-base font-bold text-[#102D45] dark:text-white">Healthcare Identities</h2>
              <p className="text-xs text-slate-400">All registered roles under this individual account</p>
            </div>

            <Link
              href="/onboarding/individual/identity"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#168B78] hover:underline"
            >
              <PlusCircle className="size-3.5" />
              <span>Add Role</span>
            </Link>
          </div>

          <div className="space-y-3">
            {profile?.identities && profile.identities.length > 0 ? (
              profile.identities.map((item) => {
                const Icon = ICON_MAP[item.id] || Stethoscope;
                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="size-10 rounded-2xl bg-teal-50 dark:bg-teal-950/40 text-[#168B78] dark:text-[#2dd4bf] flex items-center justify-center shrink-0 border border-teal-100 dark:border-teal-900/30">
                        <Icon className="size-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-[#102D45] dark:text-white">
                            {item.title}
                          </span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                            {item.group}
                          </span>
                        </div>
                        {item.details?.specialization && (
                          <p className="text-xs text-slate-500 mt-0.5">
                            Specialization: {item.details.specialization}
                          </p>
                        )}
                        {item.details?.course && (
                          <p className="text-xs text-slate-500 mt-0.5">
                            Programme: {item.details.course} {item.details.stage ? `(${item.details.stage})` : ""}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-center">
                      {renderVerificationBadge(item.isVerified, item.status)}
                      <Link
                        href="/onboarding/individual/identity-details"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
                        title="Edit Role Details"
                      >
                        <Edit3 className="size-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-xs text-slate-400 italic">No identities configured yet.</div>
            )}
          </div>
        </div>

        {/* ─────────────────────────────────────────────
            D. CLINICAL & WORK EXPERIENCE
            ───────────────────────────────────────────── */}
        <div className="bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
            <div>
              <h2 className="text-base font-bold text-[#102D45] dark:text-white">Clinical & Work Experience</h2>
              <p className="text-xs text-slate-400">Internships, clinical residencies, hospital postings and appointments</p>
            </div>
            <button
              type="button"
              onClick={() => {
                handleAddExperience();
                setEditSection("experience");
                setShowEditModal(true);
              }}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#168B78] hover:underline"
            >
              <Plus className="size-3.5" />
              <span>Add Position</span>
            </button>
          </div>

          <div className="space-y-4">
            {profile?.experience && profile.experience.length > 0 ? (
              profile.experience.map((exp) => (
                <div key={exp.id} className="flex items-start gap-3.5 text-xs">
                  <div className="size-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                    <Briefcase className="size-4" />
                  </div>
                  <div className="space-y-0.5 flex-1">
                    <div className="font-bold text-sm text-[#102D45] dark:text-white">{exp.title}</div>
                    <div className="text-xs text-slate-600 dark:text-slate-300 font-medium">{exp.organization}</div>
                    <div className="text-[11px] text-slate-400">
                      {exp.startDate} – {exp.isCurrentlyWorking ? "Present" : exp.endDate} • {exp.employmentType}
                    </div>
                    {exp.description && (
                      <p className="text-xs text-slate-500 pt-1 leading-relaxed">{exp.description}</p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-400 italic">
                No clinical experience added yet. Add hospital appointments, clinical postings, or residency experience.
              </div>
            )}
          </div>
        </div>

        {/* ─────────────────────────────────────────────
            E. EDUCATION & QUALIFICATIONS (MEMBER-DECLARED)
            ───────────────────────────────────────────── */}
        <div className="bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
            <div>
              <h2 className="text-base font-bold text-[#102D45] dark:text-white">Education & Degrees</h2>
              <p className="text-xs text-slate-400">Universities, medical colleges, and degree credentials</p>
            </div>
            <button
              type="button"
              onClick={() => {
                handleAddEducation();
                setEditSection("education");
                setShowEditModal(true);
              }}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#168B78] hover:underline"
            >
              <Plus className="size-3.5" />
              <span>Add Degree</span>
            </button>
          </div>

          <div className="space-y-4">
            {profile?.education && profile.education.length > 0 ? (
              profile.education.map((edu) => (
                <div key={edu.id} className="flex items-start gap-3.5 text-xs">
                  <div className="size-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                    <GraduationCap className="size-4" />
                  </div>
                  <div className="space-y-0.5 flex-1">
                    <div className="font-bold text-sm text-[#102D45] dark:text-white">{edu.institution}</div>
                    <div className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                      {edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ""}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {edu.startYear} – {edu.isCurrentlyStudying ? "Present" : edu.endYear}
                    </div>
                    {edu.description && (
                      <p className="text-xs text-slate-500 pt-1 leading-relaxed">{edu.description}</p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-400 italic">No academic degrees listed yet.</div>
            )}
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
            <Info className="size-3.5 shrink-0 mt-0.5" />
            <span>
              Member-declared education records are distinct from independently verified qualifications. To verify credentials, visit Identity Document Verification.
            </span>
          </div>
        </div>

        {/* ─────────────────────────────────────────────
            F. SKILLS & CLINICAL EXPERTISE
            ───────────────────────────────────────────── */}
        <div className="bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
            <h2 className="text-base font-bold text-[#102D45] dark:text-white">Skills & Medical Expertise</h2>
            <button
              type="button"
              onClick={() => {
                setEditSection("skills");
                setShowEditModal(true);
              }}
              className="inline-flex items-center gap-1 text-xs font-bold text-[#168B78] hover:underline"
            >
              <Edit3 className="size-3.5" />
              <span>Edit Skills</span>
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {profile?.skills && profile.skills.length > 0 ? (
              profile.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200/80 dark:border-slate-700"
                >
                  {skill}
                </span>
              ))
            ) : (
              <div className="text-xs text-slate-400 italic">No skills listed yet. Add your clinical competencies.</div>
            )}
          </div>
        </div>

        {/* ─────────────────────────────────────────────
            G. ACHIEVEMENTS & PUBLICATIONS
            ───────────────────────────────────────────── */}
        <div className="bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
            <div>
              <h2 className="text-base font-bold text-[#102D45] dark:text-white">Achievements & Publications</h2>
              <p className="text-xs text-slate-400">Awards, trial research publications, and clinical papers</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  handleAddAchievement("publication");
                  setEditSection("publications");
                  setShowEditModal(true);
                }}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#168B78] hover:underline"
              >
                <Plus className="size-3" />
                <span>Add Publication</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  handleAddAchievement("award");
                  setEditSection("achievements");
                  setShowEditModal(true);
                }}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#168B78] hover:underline"
              >
                <Plus className="size-3" />
                <span>Add Award / Cert</span>
              </button>
            </div>
          </div>

          {/* Publications */}
          <div className="space-y-3">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Publications & Research Papers
            </div>
            {profile?.publications && profile.publications.length > 0 ? (
              profile.publications.map((pub) => (
                <div key={pub.id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs space-y-1">
                  <div className="font-bold text-[#102D45] dark:text-white text-sm">{pub.title}</div>
                  <div className="text-slate-500">
                    {pub.issuerOrJournal} • {pub.dateOrYear}
                  </div>
                  {pub.urlOrDoi && (
                    <a
                      href={pub.urlOrDoi}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[#168B78] hover:underline text-[11px] pt-0.5"
                    >
                      <ExternalLink className="size-3" />
                      <span>{pub.urlOrDoi}</span>
                    </a>
                  )}
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-400 italic">No research publications listed.</div>
            )}
          </div>

          {/* Awards & Certifications */}
          <div className="space-y-3 pt-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Awards, Certifications & Conferences
            </div>
            {profile?.achievements && profile.achievements.length > 0 ? (
              profile.achievements.map((ach) => (
                <div key={ach.id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs space-y-1">
                  <div className="font-bold text-[#102D45] dark:text-white text-sm flex items-center gap-2">
                    <Award className="size-3.5 text-amber-500" />
                    <span>{ach.title}</span>
                  </div>
                  <div className="text-slate-500">
                    {ach.issuerOrJournal} • {ach.dateOrYear}
                  </div>
                  {ach.description && <p className="text-slate-500 pt-0.5">{ach.description}</p>}
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-400 italic">No awards or certifications added.</div>
            )}
          </div>
        </div>

        {/* ─────────────────────────────────────────────
            H. SOCIAL & PROFESSIONAL LINKS
            ───────────────────────────────────────────── */}
        <div className="bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
            <h2 className="text-base font-bold text-[#102D45] dark:text-white">Social & Research Profiles</h2>
            <button
              type="button"
              onClick={() => {
                setEditSection("social");
                setShowEditModal(true);
              }}
              className="inline-flex items-center gap-1 text-xs font-bold text-[#168B78] hover:underline"
            >
              <Edit3 className="size-3.5" />
              <span>Edit Links</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {profile?.socialLinks?.linkedin && (
              <a
                href={profile.socialLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center gap-2.5 hover:border-[#168B78] transition-colors"
              >
                <svg className="size-4 fill-[#0077b5] shrink-0" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.63 1.63 0 1 0-.01-3.26 1.63 1.63 0 0 0 .01 3.26m1.4 9.74v-8.37H5.06v8.37h2.8z"/>
                </svg>
                <span className="font-semibold text-slate-700 dark:text-slate-200 truncate">
                  LinkedIn Profile
                </span>
                <ExternalLink className="size-3 text-slate-400 ml-auto" />
              </a>
            )}

            {profile?.socialLinks?.website && (
              <a
                href={profile.socialLinks.website}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center gap-2.5 hover:border-[#168B78] transition-colors"
              >
                <Globe className="size-4 text-[#168B78]" />
                <span className="font-semibold text-slate-700 dark:text-slate-200 truncate">
                  Personal Website / Portfolio
                </span>
                <ExternalLink className="size-3 text-slate-400 ml-auto" />
              </a>
            )}

            {profile?.socialLinks?.orcid && (
              <a
                href={profile.socialLinks.orcid}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center gap-2.5 hover:border-[#168B78] transition-colors"
              >
                <Microscope className="size-4 text-[#a6ce39]" />
                <span className="font-semibold text-slate-700 dark:text-slate-200 truncate">
                  ORCID / Researcher ID
                </span>
                <ExternalLink className="size-3 text-slate-400 ml-auto" />
              </a>
            )}
          </div>
        </div>
      </main>

      {/* ─────────────────────────────────────────────
          3. FULL PROFILE EDITOR MODAL
          ───────────────────────────────────────────── */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#102D45] dark:text-white">
                  Edit Profile Information
                </h3>
                <p className="text-xs text-slate-400">Update your clinical intro, education, and credentials</p>
              </div>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Modal Body with Section Navigation */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
              {/* Section Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-100 dark:border-slate-800">
                {["general", "about", "education", "experience", "skills", "publications", "social"].map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setEditSection(tab)}
                    className={`px-3 py-1.5 rounded-xl font-bold uppercase tracking-wider text-[10px] shrink-0 transition-colors ${
                      editSection === tab
                        ? "bg-[#102D45] text-white"
                        : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* 1. General Info */}
              {editSection === "general" && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">Full Name</label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">Professional Headline</label>
                    <input
                      type="text"
                      value={formData.headline}
                      onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                      placeholder="e.g. Consultant Physician | MBBS, MD | Clinical Researcher"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700 dark:text-slate-300">City</label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700 dark:text-slate-300">State</label>
                      <input
                        type="text"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 2. About & Bio */}
              {editSection === "about" && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="font-semibold text-slate-700 dark:text-slate-300">Professional Biography</label>
                      <span className="text-[10px] text-slate-400">
                        {formData.bio.length} / 2000 characters
                      </span>
                    </div>
                    <textarea
                      rows={6}
                      maxLength={2000}
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      placeholder="Share your clinical background, medical specialty, research focus, and medical interests..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs leading-relaxed"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">Healthcare Interests</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newInterestInput}
                        onChange={(e) => setNewInterestInput(e.target.value)}
                        placeholder="e.g. Oncology, Minimally Invasive Surgery"
                        className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddInterest(newInterestInput)}
                        className="px-3.5 py-2 rounded-xl bg-[#168B78] text-white font-bold"
                      >
                        Add
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      {formData.healthcareInterests.map((interest) => (
                        <span
                          key={interest}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-[#168B78] text-xs font-semibold"
                        >
                          <span>{interest}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveInterest(interest)}
                            className="text-slate-400 hover:text-rose-600"
                          >
                            <X className="size-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 3. Skills */}
              {editSection === "skills" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">Add Clinical Skills & Competencies</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newSkillInput}
                        onChange={(e) => setNewSkillInput(e.target.value)}
                        placeholder="Type a skill and press Add..."
                        className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddSkill(newSkillInput)}
                        className="px-3.5 py-2 rounded-xl bg-[#168B78] text-white font-bold"
                      >
                        Add
                      </button>
                    </div>

                    <div className="space-y-1 pt-2">
                      <div className="text-[10px] text-slate-400 font-semibold uppercase">Popular Healthcare Skills:</div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {SUGGESTED_SKILLS.map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => handleAddSkill(s)}
                            className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-600 hover:bg-teal-50 hover:text-[#168B78]"
                          >
                            + {s}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3">
                      <div className="text-[11px] font-bold uppercase text-slate-400 mb-1.5">Selected Skills:</div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {formData.skills.map((skill) => (
                          <span
                            key={skill}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-200/70 dark:bg-slate-700 text-slate-800 dark:text-white text-xs font-semibold"
                          >
                            <span>{skill}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveSkill(skill)}
                              className="text-slate-400 hover:text-rose-600"
                            >
                              <X className="size-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. Education History */}
              {editSection === "education" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Degree & Education Records</span>
                    <button
                      type="button"
                      onClick={handleAddEducation}
                      className="text-xs font-bold text-[#168B78] hover:underline"
                    >
                      + Add Degree
                    </button>
                  </div>

                  <div className="space-y-3">
                    {formData.education.map((edu, idx) => (
                      <div
                        key={edu.id}
                        className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2.5 relative"
                      >
                        <button
                          type="button"
                          onClick={() => handleRemoveEducation(edu.id)}
                          className="absolute top-3 right-3 text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                        <div className="text-[11px] font-bold text-slate-400 uppercase">Degree #{idx + 1}</div>
                        <input
                          type="text"
                          value={edu.institution}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormData((prev) => ({
                              ...prev,
                              education: prev.education.map((item) =>
                                item.id === edu.id ? { ...item, institution: val } : item
                              ),
                            }));
                          }}
                          placeholder="Institution Name (e.g. AIIMS New Delhi)"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={edu.degree}
                            onChange={(e) => {
                              const val = e.target.value;
                              setFormData((prev) => ({
                                ...prev,
                                education: prev.education.map((item) =>
                                  item.id === edu.id ? { ...item, degree: val } : item
                                ),
                              }));
                            }}
                            placeholder="Degree (e.g. MBBS, MD)"
                            className="px-3 py-2 rounded-xl border border-slate-200 text-xs"
                          />
                          <input
                            type="text"
                            value={edu.fieldOfStudy || ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              setFormData((prev) => ({
                                ...prev,
                                education: prev.education.map((item) =>
                                  item.id === edu.id ? { ...item, fieldOfStudy: val } : item
                                ),
                              }));
                            }}
                            placeholder="Field of Study"
                            className="px-3 py-2 rounded-xl border border-slate-200 text-xs"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. Experience History */}
              {editSection === "experience" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Clinical & Work Experience</span>
                    <button
                      type="button"
                      onClick={handleAddExperience}
                      className="text-xs font-bold text-[#168B78] hover:underline"
                    >
                      + Add Position
                    </button>
                  </div>

                  <div className="space-y-3">
                    {formData.experience.map((exp, idx) => (
                      <div
                        key={exp.id}
                        className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2.5 relative"
                      >
                        <button
                          type="button"
                          onClick={() => handleRemoveExperience(exp.id)}
                          className="absolute top-3 right-3 text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                        <div className="text-[11px] font-bold text-slate-400 uppercase">Position #{idx + 1}</div>
                        <input
                          type="text"
                          value={exp.title}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormData((prev) => ({
                              ...prev,
                              experience: prev.experience.map((item) =>
                                item.id === exp.id ? { ...item, title: val } : item
                              ),
                            }));
                          }}
                          placeholder="Job Title (e.g. Senior Resident, Consultant)"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                        />
                        <input
                          type="text"
                          value={exp.organization}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormData((prev) => ({
                              ...prev,
                              experience: prev.experience.map((item) =>
                                item.id === exp.id ? { ...item, organization: val } : item
                              ),
                            }));
                          }}
                          placeholder="Hospital or Organization Name"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 6. Social Links */}
              {editSection === "social" && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">LinkedIn URL</label>
                    <input
                      type="text"
                      value={formData.socialLinks.linkedin || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          socialLinks: { ...formData.socialLinks, linkedin: e.target.value },
                        })
                      }
                      placeholder="https://linkedin.com/in/username"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">Personal Website / Portfolio</label>
                    <input
                      type="text"
                      value={formData.socialLinks.website || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          socialLinks: { ...formData.socialLinks, website: e.target.value },
                        })
                      }
                      placeholder="https://drfullname.com"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">ORCID / Research Profile URL</label>
                    <input
                      type="text"
                      value={formData.socialLinks.orcid || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          socialLinks: { ...formData.socialLinks, orcid: e.target.value },
                        })
                      }
                      placeholder="https://orcid.org/0000-000X-XXXX-XXXX"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                disabled={isSaving}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="px-6 py-2 rounded-xl bg-[#102D45] hover:bg-[#163f61] text-white text-xs font-bold transition-all shadow-xs"
              >
                {isSaving ? "Saving Changes..." : "Save Profile"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
