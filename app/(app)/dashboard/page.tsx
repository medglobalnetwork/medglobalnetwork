"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Bell,
  User,
  ShieldCheck,
  ShieldAlert,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  MapPin,
  Edit3,
  Settings,
  PlusCircle,
  ChevronDown,
  Building2,
  Users,
  BookOpen,
  Briefcase,
  HeartHandshake,
  Sparkles,
  FileText,
  RefreshCw,
  LogOut,
  Stethoscope,
  GraduationCap,
  HeartPulse,
  Pill,
  Activity,
  Ambulance,
  Microscope,
  Shield,
  Award,
  Layers,
  Check,
  Share2,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { CreatePost } from "@/modules/network/components/CreatePost";
import { PostCard } from "@/modules/network/components/PostCard";
import type { NetworkPost } from "@/modules/network/types";

interface IdentityItem {
  id: string;
  title: string;
  group: string;
  prefix?: string;
  status: "NOT_SUBMITTED" | "SUBMITTED" | "UNDER_REVIEW" | "ADDITIONAL_INFORMATION_REQUIRED" | "REJECTED" | "APPROVED";
  isVerified: boolean;
  documentsCount: number;
}

interface DashboardOverviewData {
  user: {
    id: string;
    firstName: string;
    fullName: string;
    email: string;
    phone: string;
    image: string | null;
    initials: string;
    accountType: string;
    location: string;
    createdAt: string;
  };
  contacts: {
    emailVerified: boolean;
    phoneVerified: boolean;
  };
  profileCompletion: {
    percent: number;
    completedItems: string[];
    pendingItems: string[];
  };
  identities: IdentityItem[];
  counts: {
    connections: number;
    unreadNotifications: number;
    documents: number;
  };
  activeIdentity: IdentityItem | null;
  organization: {
    hasLinkedOrg: boolean;
    orgName: string | null;
  };
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

export default function MainDashboardPage() {
  const router = useRouter();
  const { data: session, isPending: isSessionPending } = authClient.useSession();

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [overview, setOverview] = React.useState<DashboardOverviewData | null>(null);
  const [activeContext, setActiveContext] = React.useState<string>("");
  const [showIdentityDropdown, setShowIdentityDropdown] = React.useState(false);
  const [showProfileMenu, setShowProfileMenu] = React.useState(false);

  // Search input
  const [searchQuery, setSearchQuery] = React.useState("");

  // Feed Posts
  const [posts, setPosts] = React.useState<NetworkPost[]>([]);
  const [postsLoading, setPostsLoading] = React.useState(true);
  const [postsPage, setPostsPage] = React.useState(1);
  const [hasMorePosts, setHasMorePosts] = React.useState(false);

  // ─────────────────────────────────────────────
  // 1. FETCH DASHBOARD OVERVIEW DATA
  // ─────────────────────────────────────────────
  const loadOverview = React.useCallback(async () => {
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
        ? `/api/dashboard/overview?userId=${encodeURIComponent(targetUserId)}`
        : "/api/dashboard/overview";

      const res = await fetch(url, { credentials: "include" });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to load dashboard overview.");
      }

      setOverview(data);
      if (data.activeIdentity) {
        setActiveContext(data.activeIdentity.id);
      }
    } catch (err: any) {
      console.error("Dashboard overview error:", err);
      setError(err.message || "Failed to connect to dashboard services.");
    } finally {
      setLoading(false);
    }
  }, []);

  // ─────────────────────────────────────────────
  // 2. FETCH COMMUNITY FEED POSTS
  // ─────────────────────────────────────────────
  const loadPosts = React.useCallback(async (pageNum: number) => {
    setPostsLoading(true);
    try {
      const res = await fetch(`/api/network/posts?page=${pageNum}&pageSize=10`, {
        credentials: "include",
      });

      if (res.ok) {
        const d = await res.json();
        setPosts((prev) => (pageNum === 1 ? (d.data ?? []) : [...prev, ...(d.data ?? [])]));
        setHasMorePosts(d.hasMore ?? false);
        setPostsPage(pageNum);
      } else {
        if (pageNum === 1) setPosts([]);
        setHasMorePosts(false);
      }
    } catch {
      if (pageNum === 1) setPosts([]);
      setHasMorePosts(false);
    } finally {
      setPostsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadOverview();
    loadPosts(1);
  }, [loadOverview, loadPosts]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/network?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handlePostDeleted = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  // ─────────────────────────────────────────────
  // STATUS BADGE RENDERER
  // ─────────────────────────────────────────────
  const renderStatusBadge = (status: IdentityItem["status"]) => {
    switch (status) {
      case "APPROVED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold border border-emerald-200 dark:border-emerald-800/40">
            <CheckCircle2 className="size-3" />
            Approved
          </span>
        );
      case "UNDER_REVIEW":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-[11px] font-bold border border-amber-200">
            <Clock className="size-3 animate-pulse" />
            Under Review
          </span>
        );
      case "SUBMITTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 text-[11px] font-bold border border-sky-200">
            <Check className="size-3" />
            Submitted
          </span>
        );
      case "ADDITIONAL_INFORMATION_REQUIRED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 text-[11px] font-bold border border-amber-300">
            <AlertTriangle className="size-3" />
            Action Needed
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-[11px] font-bold border border-rose-200">
            <XCircle className="size-3" />
            Rejected
          </span>
        );
      case "NOT_SUBMITTED":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-semibold border border-slate-200/80 dark:border-slate-700">
            <Clock className="size-3 text-slate-400" />
            Not Submitted
          </span>
        );
    }
  };

  // ─────────────────────────────────────────────
  // LOADING SKELETON
  // ─────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-dvh bg-slate-50/60 dark:bg-[#0b131e] text-[#1f2937] dark:text-[#f3f4f6] font-sans pb-24">
        {/* Top Navbar Skeleton */}
        <div className="w-full h-18 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 animate-pulse" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-pulse">
          <div className="h-10 w-72 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="h-64 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800" />
            <div className="lg:col-span-2 h-64 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800" />
          </div>
          <div className="h-96 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800" />
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // ERROR STATE
  // ─────────────────────────────────────────────
  if (error && !overview) {
    return (
      <div className="min-h-dvh bg-slate-50/60 dark:bg-[#0b131e] text-[#1f2937] dark:text-[#f3f4f6] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl border border-red-100 dark:border-red-900/40 p-8 shadow-sm text-center space-y-4">
          <div className="size-14 rounded-full bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
            <AlertCircle className="size-7" />
          </div>
          <h2 className="text-xl font-bold text-[#102D45] dark:text-white">Unable to Load Dashboard</h2>
          <p className="text-xs text-slate-600 dark:text-slate-400">{error}</p>
          <button
            type="button"
            onClick={loadOverview}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#102D45] hover:bg-[#163f61] text-white text-xs font-semibold shadow-xs"
          >
            <RefreshCw className="size-3.5" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  const user = overview?.user;
  const contacts = overview?.contacts;
  const completion = overview?.profileCompletion;
  const identities = overview?.identities || [];
  const activeIdentityObj = identities.find((i) => i.id === activeContext) || identities[0];

  return (
    <div className="min-h-dvh bg-slate-50/60 dark:bg-[#0b131e] text-[#1f2937] dark:text-[#f3f4f6] font-sans pb-28">
      {/* ─────────────────────────────────────────────
          1. DASHBOARD HEADER
          ───────────────────────────────────────────── */}
      <header className="w-full border-b border-slate-100 dark:border-slate-800/80 bg-white/95 dark:bg-[#0b131e]/95 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          {/* Logo & Branding */}
          <Link href="/dashboard" className="flex items-center gap-2.5 shrink-0 group">
            <img
              src="/logo.png"
              alt="MED Global Network"
              className="h-9 w-auto object-contain transition-transform group-hover:scale-105"
            />
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-black tracking-tight text-[#102D45] dark:text-[#58a6ff] leading-none">
                MED Global Network
              </span>
              <span className="text-[10px] font-bold tracking-wider uppercase text-[#168B78] dark:text-[#2dd4bf] mt-0.5">
                Healthcare Community
              </span>
            </div>
          </Link>

          {/* Global Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 max-w-md items-center relative"
          >
            <Search className="size-4 text-slate-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search doctors, institutions, research, clinical discussions..."
              className="w-full pl-10 pr-4 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#168B78] transition-all"
            />
          </form>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            {/* Notifications Bell */}
            <Link
              href="/notifications"
              className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Notifications"
            >
              <Bell className="size-5" />
              {(overview?.counts.unreadNotifications ?? 0) > 0 && (
                <span className="absolute top-1 right-1 size-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {overview?.counts.unreadNotifications}
                </span>
              )}
            </Link>

            {/* Profile Menu Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowProfileMenu((prev) => !prev)}
                className="flex items-center gap-2 p-1.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
              >
                <div className="size-8 rounded-full bg-gradient-to-tr from-[#102D45] to-[#168B78] text-white flex items-center justify-center text-xs font-bold shadow-xs">
                  {user?.initials || "MG"}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-bold text-[#102D45] dark:text-white truncate max-w-[120px]">
                    {user?.fullName || "Member"}
                  </span>
                  <span className="text-[10px] text-slate-400 leading-none">
                    {user?.accountType || "Individual"}
                  </span>
                </div>
                <ChevronDown className="size-3.5 text-slate-400 hidden sm:block" />
              </button>

              {/* Profile Dropdown Card */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 shadow-xl p-2 z-50 text-xs space-y-1">
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="font-bold text-[#102D45] dark:text-white truncate">{user?.fullName}</div>
                    <div className="text-[10px] text-slate-400 truncate">{user?.email}</div>
                  </div>
                  <Link
                    href="/profile"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <User className="size-4 text-slate-400" />
                    <span>My Profile</span>
                  </Link>
                  <Link
                    href="/onboarding/individual/documents"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <ShieldCheck className="size-4 text-[#168B78]" />
                    <span>Track Verification</span>
                  </Link>
                  <Link
                    href="/settings"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Settings className="size-4 text-slate-400" />
                    <span>Settings</span>
                  </Link>
                  <div className="border-t border-slate-100 dark:border-slate-800 my-1" />
                  <button
                    type="button"
                    onClick={() => {
                      setShowProfileMenu(false);
                      authClient.signOut().then(() => router.push("/login"));
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  >
                    <LogOut className="size-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ─────────────────────────────────────────────
          2. WELCOME BANNER & IDENTITY CONTEXT SWITCHER
          ───────────────────────────────────────────── */}
      <section className="bg-white dark:bg-[#0f172a] border-b border-slate-100 dark:border-slate-800 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-black text-[#102D45] dark:text-white tracking-tight">
              Hello, {user?.firstName}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Your healthcare network starts here. Connect with peers, share clinical updates, and explore opportunities.
            </p>
          </div>

          {/* Multi-Identity Context Switcher */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowIdentityDropdown((prev) => !prev)}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-xs font-bold text-[#102D45] dark:text-white hover:border-[#168B78] transition-all"
              >
                <Layers className="size-3.5 text-[#168B78]" />
                <span>Active Role: {activeIdentityObj?.title || "Healthcare Member"}</span>
                <ChevronDown className="size-3 text-slate-400" />
              </button>

              {showIdentityDropdown && (
                <div className="absolute left-0 sm:right-0 sm:left-auto mt-2 w-64 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 shadow-xl p-2 z-50 text-xs space-y-1">
                  <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">
                    Switch Role Context
                  </div>
                  {identities.map((item) => {
                    const RoleIcon = ICON_MAP[item.id] || Stethoscope;
                    const isSelected = item.id === activeContext;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setActiveContext(item.id);
                          setShowIdentityDropdown(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors ${
                          isSelected
                            ? "bg-teal-50 dark:bg-teal-950/40 text-[#168B78] font-bold"
                            : "text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <RoleIcon className="size-4 shrink-0" />
                          <span className="truncate">{item.title}</span>
                        </div>
                        {isSelected && <Check className="size-3.5 text-[#168B78]" />}
                      </button>
                    );
                  })}
                  <div className="border-t border-slate-100 dark:border-slate-800 my-1" />
                  <Link
                    href="/onboarding/individual/identity"
                    onClick={() => setShowIdentityDropdown(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-[#168B78] hover:bg-teal-50 dark:hover:bg-teal-950/40 transition-colors"
                  >
                    <PlusCircle className="size-3.5" />
                    <span>Add Another Identity</span>
                  </Link>
                </div>
              )}
            </div>

            <Link
              href="/onboarding/individual/identity"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:border-[#168B78] hover:text-[#168B78] transition-colors"
            >
              <PlusCircle className="size-3.5" />
              <span className="hidden sm:inline">Add Identity</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────
          3. MAIN BODY GRID
          ───────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ─────────────────────────────────────────────
              LEFT COLUMN (Profile & Verification Cards)
              ───────────────────────────────────────────── */}
          <div className="space-y-6">
            {/* Profile Overview Card */}
            <div className="bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="size-14 rounded-2xl bg-gradient-to-tr from-[#102D45] via-[#168B78] to-teal-400 text-white flex items-center justify-center text-lg font-black shadow-sm">
                    {user?.initials || "MG"}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#102D45] dark:text-white flex items-center gap-1.5">
                      <span>{user?.fullName}</span>
                      {activeIdentityObj?.isVerified && (
                        <CheckCircle2 className="size-4 text-[#168B78] fill-current" />
                      )}
                    </h3>
                    <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="size-3.5 shrink-0 text-slate-400" />
                      <span className="truncate">{user?.location || "India"}</span>
                    </div>
                  </div>
                </div>

                <Link
                  href="/profile"
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  title="Edit Profile"
                >
                  <Edit3 className="size-4" />
                </Link>
              </div>

              {/* Account Type Badge */}
              <div className="flex items-center justify-between text-xs py-2 border-y border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Account Type</span>
                <span className="font-bold text-[#102D45] dark:text-[#58a6ff]">
                  {user?.accountType || "Individual Account"}
                </span>
              </div>

              {/* Dynamic Profile Completion (Calculated) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-600 dark:text-slate-300">Profile Completion</span>
                  <span className="text-[#168B78] font-bold">{completion?.percent ?? 0}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#102D45] to-[#168B78] h-2 rounded-full transition-all duration-500"
                    style={{ width: `${completion?.percent ?? 0}%` }}
                  />
                </div>
                <div className="text-[11px] text-slate-400 flex items-center justify-between">
                  <span>{completion?.completedItems.length} steps completed</span>
                  <Link href="/profile" className="text-[#168B78] hover:underline font-medium">
                    Complete Profile →
                  </Link>
                </div>
              </div>

              {/* Edit Profile CTA */}
              <div className="pt-1 flex gap-2">
                <Link
                  href="/profile"
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#102D45] hover:bg-[#163f61] text-white text-xs font-bold transition-all shadow-xs"
                >
                  <Edit3 className="size-3.5" />
                  <span>Edit Profile</span>
                </Link>
                <Link
                  href="/settings"
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800"
                  title="Settings"
                >
                  <Settings className="size-4" />
                </Link>
              </div>
            </div>

            {/* ─────────────────────────────────────────────
                Verification Overview Card
                Contact vs Identity separated
                ───────────────────────────────────────────── */}
            <div className="bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3.5">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="size-5 text-[#168B78]" />
                  <h3 className="text-sm font-bold text-[#102D45] dark:text-white">
                    Verification Status
                  </h3>
                </div>
                <Link
                  href="/onboarding/individual/documents"
                  className="text-xs font-bold text-[#168B78] hover:underline"
                >
                  Track →
                </Link>
              </div>

              {/* 1. Account Contact Verification */}
              <div className="space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Account Contact Security
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-300">Email</span>
                    {contacts?.emailVerified ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                        <Check className="size-3" /> Verified
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold text-amber-600">Pending</span>
                    )}
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-300">Mobile</span>
                    {contacts?.phoneVerified ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                        <Check className="size-3" /> Verified
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold text-amber-600">Pending</span>
                    )}
                  </div>
                </div>
              </div>

              {/* 2. Independent Identity Verification Overview */}
              <div className="space-y-2.5 pt-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Healthcare Roles Credentialing
                </div>

                <div className="space-y-2">
                  {identities.map((item) => {
                    const RoleIcon = ICON_MAP[item.id] || Stethoscope;
                    return (
                      <div
                        key={item.id}
                        className="p-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between gap-2 text-xs"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <RoleIcon className="size-4 text-[#168B78] shrink-0" />
                          <span className="font-bold text-[#102D45] dark:text-white truncate">
                            {item.title}
                          </span>
                        </div>
                        <div className="shrink-0">{renderStatusBadge(item.status)}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Upload CTA */}
              <Link
                href="/onboarding/individual/documents"
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/40 text-[#168B78] dark:text-[#2dd4bf] text-xs font-bold hover:bg-teal-100 transition-colors"
              >
                <FileText className="size-3.5" />
                <span>Upload Credentials</span>
              </Link>
            </div>

            {/* ─────────────────────────────────────────────
                Business / Organization Linking Banner
                ───────────────────────────────────────────── */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-slate-900 to-[#102D45] text-white space-y-3 shadow-md">
              <div className="size-10 rounded-2xl bg-white/10 flex items-center justify-center">
                <Building2 className="size-5 text-[#2dd4bf]" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold">Represent an Organization?</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Link your individual clinician account to hospital listings, clinics, or research labs as an authorized representative.
                </p>
              </div>
              <Link
                href="/organizations"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2dd4bf] hover:underline pt-1"
              >
                <span>Register or Link Business Profile</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>

          {/* ─────────────────────────────────────────────
              RIGHT TWO COLUMNS (Explore Modules & Community Feed)
              ───────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-8">
            {/* ─────────────────────────────────────────────
                Explore Modules (5 Cards)
                ───────────────────────────────────────────── */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                  Explore MED Global Network
                </h2>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {/* 1. Find People */}
                <Link
                  href="/network"
                  className="p-4 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 hover:border-[#168B78] hover:shadow-sm transition-all group flex flex-col justify-between"
                >
                  <div className="size-9 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-[#168B78] dark:text-[#2dd4bf] flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                    <Users className="size-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#102D45] dark:text-white leading-tight">
                      Find People
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">Colleagues & peers</p>
                  </div>
                </Link>

                {/* 2. Organizations */}
                <Link
                  href="/organizations"
                  className="p-4 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 hover:border-[#168B78] hover:shadow-sm transition-all group flex flex-col justify-between"
                >
                  <div className="size-9 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-300 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                    <Building2 className="size-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#102D45] dark:text-white leading-tight">
                      Organizations
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">Hospitals & Labs</p>
                  </div>
                </Link>

                {/* 3. Knowledge Hub */}
                <Link
                  href="/learn"
                  className="p-4 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 hover:border-[#168B78] hover:shadow-sm transition-all group flex flex-col justify-between"
                >
                  <div className="size-9 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                    <BookOpen className="size-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#102D45] dark:text-white leading-tight">
                      Knowledge Hub
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">CME & Journals</p>
                  </div>
                </Link>

                {/* 4. Opportunities */}
                <Link
                  href="/opportunities"
                  className="p-4 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 hover:border-[#168B78] hover:shadow-sm transition-all group flex flex-col justify-between"
                >
                  <div className="size-9 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-300 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                    <Briefcase className="size-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#102D45] dark:text-white leading-tight">
                      Opportunities
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">Clinical Jobs & Fellowships</p>
                  </div>
                </Link>

                {/* 5. Healthcare Community */}
                <Link
                  href="/feed"
                  className="p-4 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 hover:border-[#168B78] hover:shadow-sm transition-all group flex flex-col justify-between col-span-2 sm:col-span-1"
                >
                  <div className="size-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-300 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                    <HeartHandshake className="size-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#102D45] dark:text-white leading-tight">
                      Community
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">Specialty Groups</p>
                  </div>
                </Link>
              </div>
            </div>

            {/* ─────────────────────────────────────────────
                Community Feed: Create Post
                ───────────────────────────────────────────── */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                  Clinical & Healthcare Discussions
                </h2>
                <span className="text-xs text-slate-500">Live Peer Stream</span>
              </div>

              {/* Integrated Create Post */}
              <CreatePost
                userId={user?.id}
                userImage={user?.image ?? undefined}
                userName={user?.fullName}
                onPosted={() => loadPosts(1)}
              />

              {/* Feed Stream */}
              {postsLoading && posts.length === 0 ? (
                <div className="space-y-4">
                  <div className="h-44 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 animate-pulse" />
                  <div className="h-44 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 animate-pulse" />
                </div>
              ) : posts.length === 0 ? (
                <div className="p-8 text-center bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-3">
                  <Sparkles className="size-8 text-[#168B78] mx-auto" />
                  <h3 className="text-sm font-bold text-[#102D45] dark:text-white">
                    Start the First Discussion
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Share a clinical case study, ask for colleague opinions, or announce an upcoming medical workshop.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {posts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      currentUserId={user?.id}
                      onDelete={handlePostDeleted}
                    />
                  ))}

                  {/* Load More Discussions Button */}
                  {hasMorePosts && (
                    <div className="pt-2 text-center">
                      <button
                        type="button"
                        onClick={() => loadPosts(postsPage + 1)}
                        disabled={postsLoading}
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all shadow-xs"
                      >
                        {postsLoading ? "Loading..." : "Load More Discussions"}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* ─────────────────────────────────────────────
          4. MOBILE BOTTOM NAVIGATION
          ───────────────────────────────────────────── */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0b131e]/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800 h-16 flex items-center justify-around px-2">
        <Link
          href="/dashboard"
          className="flex flex-col items-center gap-1 text-[#168B78] dark:text-[#2dd4bf]"
        >
          <Layers className="size-5" />
          <span className="text-[10px] font-bold">Home</span>
        </Link>
        <Link
          href="/network"
          className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-700 dark:hover:text-white"
        >
          <Users className="size-5" />
          <span className="text-[10px]">Network</span>
        </Link>
        <Link
          href="/create"
          className="flex flex-col items-center justify-center size-10 rounded-full bg-[#102D45] text-white shadow-md -mt-4"
        >
          <PlusCircle className="size-6" />
        </Link>
        <Link
          href="/messages"
          className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-700 dark:hover:text-white"
        >
          <Briefcase className="size-5" />
          <span className="text-[10px]">Messages</span>
        </Link>
        <Link
          href="/profile"
          className="flex flex-col items-center gap-1 text-slate-400 hover:text-slate-700 dark:hover:text-white"
        >
          <User className="size-5" />
          <span className="text-[10px]">Profile</span>
        </Link>
      </nav>
    </div>
  );
}
