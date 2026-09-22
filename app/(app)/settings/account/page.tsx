"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { DEFAULT_BLANK_AVATAR, getUserAvatarUrl, setUserCustomAvatar } from "@/lib/avatar";
import { Trash2, User, Camera, Check, ExternalLink, Loader2 } from "lucide-react";
import { ImageSelectorModal } from "@/components/media/ImageSelectorModal";

export default function AccountSettingsPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [password, setPassword] = React.useState("");
  const [confirmText, setConfirmText] = React.useState("");
  const [hasPassword, setHasPassword] = React.useState<boolean | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  
  // Name & Avatar
  const [name, setName] = React.useState("");
  const [avatarUrl, setAvatarUrl] = React.useState<string>(DEFAULT_BLANK_AVATAR);
  const [isSavingName, setIsSavingName] = React.useState(false);
  const [nameSuccess, setNameSuccess] = React.useState<string | null>(null);
  const [photoSuccess, setPhotoSuccess] = React.useState<string | null>(null);
  const [showAvatarSelector, setShowAvatarSelector] = React.useState(false);

  React.useEffect(() => {
    if (!isPending && !session) {
      router.replace("/");
    }
    if (session?.user?.name) {
      setName(session.user.name);
    }
  }, [isPending, router, session]);

  // Check if account has password or is Google OAuth
  React.useEffect(() => {
    if (!session?.user) return;
    fetch("/api/account/delete", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        setHasPassword(Boolean(data.hasPassword));
      })
      .catch(() => {
        setHasPassword(false);
      });
  }, [session?.user]);

  // Sync avatar
  React.useEffect(() => {
    const syncAvatar = () => {
      if (typeof window !== "undefined") {
        const custom = localStorage.getItem("mgn_user_custom_avatar");
        if (custom) {
          setAvatarUrl(custom);
          return;
        }
      }
      setAvatarUrl(
        getUserAvatarUrl(
          session?.user?.email,
          session?.user?.name,
          session?.user?.image
        )
      );
    };
    syncAvatar();
    window.addEventListener("mgn-avatar-updated", syncAvatar);
    return () => window.removeEventListener("mgn-avatar-updated", syncAvatar);
  }, [session?.user?.email, session?.user?.name, session?.user?.image]);

  const handleUpdateAvatar = async (newUrl: string) => {
    setAvatarUrl(newUrl);
    setUserCustomAvatar(newUrl);
    setPhotoSuccess("Profile photo updated successfully!");
    setTimeout(() => setPhotoSuccess(null), 3000);

    // Persist to server
    try {
      await fetch("/api/network/profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ image: newUrl }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetAvatar = async () => {
    setUserCustomAvatar(null);
    setPhotoSuccess("Profile picture removed. Default avatar applied.");
    setTimeout(() => setPhotoSuccess(null), 3000);

    try {
      await fetch("/api/network/profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ image: "" }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSavingName(true);
    setNameSuccess(null);

    try {
      const res = await fetch("/api/network/profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: name.trim() }),
      });

      if (!res.ok) throw new Error("Failed to update name");

      setNameSuccess("Name updated successfully!");
      setTimeout(() => setNameSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to update name");
    } finally {
      setIsSavingName(false);
    }
  };

  if (isPending || !session) {
    return <div className="min-h-screen bg-[#f5f3f1]" />;
  }

  const handleDeleteAccount = async () => {
    if (hasPassword) {
      if (!password) {
        setError("Password is required");
        return;
      }
    } else {
      if (confirmText.trim().toUpperCase() !== "DELETE") {
        setError("Please type DELETE to confirm");
        return;
      }
    }

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch("/api/account/delete", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          hasPassword ? { password } : { confirmation: confirmText.trim().toUpperCase() }
        ),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete account");
      }

      await authClient.signOut();
      router.replace("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete account");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      {/* Page header */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#171717]">Account</h1>
          <p className="mt-1 text-sm text-[#77716b]">Manage your identity, photos, and login credentials.</p>
        </div>

        <Link
          href={`/profile/${session.user.id}`}
          className="inline-flex items-center gap-1.5 rounded-xl border border-[#ded8d1] bg-white px-3.5 py-2 text-xs font-bold text-[#1769c2] hover:bg-[#f8f7f6] transition shadow-2xs"
        >
          <span>View Public Profile</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Profile Photo & Info card */}
      <div className="rounded-2xl border border-[#ded8d1] bg-white p-5 sm:p-6 mb-6 shadow-xs">
        <h2 className="text-sm font-semibold text-[#171717]">Profile Picture</h2>
        <p className="mt-0.5 text-xs text-[#77716b]">
          Upload a high resolution photo or link an external image URL.
        </p>

        <div className="mt-5 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-[#1769c2]/30 bg-[#eef5fc] shadow-xs">
            <img
              src={avatarUrl || DEFAULT_BLANK_AVATAR}
              alt={session.user.name || "User Avatar"}
              className="h-full w-full rounded-full object-cover"
            />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-base font-semibold text-[#171717]">{session.user.name || "—"}</p>
            <p className="text-xs text-[#77716b]">{session.user.email}</p>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setShowAvatarSelector(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#1769c2] px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-[#12569f]"
              >
                <Camera className="h-3.5 w-3.5" />
                <span>Change Photo (Upload / URL)</span>
              </button>

              <button
                type="button"
                onClick={handleResetAvatar}
                className="rounded-xl border border-[#ded8d1] bg-white px-3.5 py-2 text-xs font-semibold text-[#5d5854] transition hover:bg-[#f8f7f6]"
              >
                Reset Photo
              </button>
            </div>

            {photoSuccess && (
              <p className="mt-2 text-xs font-bold text-emerald-700">{photoSuccess}</p>
            )}
          </div>
        </div>
      </div>

      {/* Name Change card */}
      <form onSubmit={handleSaveName} className="rounded-2xl border border-[#ded8d1] bg-white p-5 sm:p-6 mb-6 shadow-xs">
        <h2 className="text-sm font-semibold text-[#171717]">Display Name</h2>
        <p className="mt-0.5 text-xs text-[#77716b]">
          Change your public display name shown across your profile, network feed, and certificates.
        </p>

        <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your full name"
            className="w-full max-w-md rounded-xl border border-[#ded8d1] px-3.5 py-2 text-xs sm:text-sm text-[#171717] focus:border-[#1769c2] focus:outline-none"
          />

          <button
            type="submit"
            disabled={isSavingName || !name.trim()}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#1769c2] px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#12569f] transition disabled:opacity-50"
          >
            {isSavingName ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
            <span>Save Name</span>
          </button>
        </div>

        {nameSuccess && (
          <p className="mt-2 text-xs font-bold text-emerald-700">{nameSuccess}</p>
        )}
      </form>

      {/* Delete Account section */}
      <div className="rounded-2xl border border-red-200 bg-white p-5 sm:p-6 shadow-xs">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold text-[#171717]">Delete Account</h2>
            <p className="mt-1 text-xs text-[#77716b]">
              Permanently delete your account and all associated healthcare data. This action cannot be undone.
            </p>
          </div>
          {!showConfirm && (
            <button
              type="button"
              onClick={() => { setShowConfirm(true); setError(null); }}
              className="shrink-0 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100"
            >
              Delete Account
            </button>
          )}
        </div>

        {showConfirm && (
          <div className="mt-5 border-t border-[#f3e8e8] pt-5">
            <p className="mb-3 text-xs font-medium text-[#991b1b]">
              ⚠️ Confirm deletion — this cannot be reversed.
            </p>

            {hasPassword ? (
              <>
                <label htmlFor="password" className="block text-xs font-medium text-[#77716b]">
                  Enter your password to confirm
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1.5 block w-full max-w-md rounded-lg border border-[#ded8d1] px-3 py-2 text-xs text-[#171717] focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200 sm:text-sm"
                  placeholder="Enter your password"
                />
              </>
            ) : (
              <>
                <p className="text-xs text-[#5d5854] mb-2">
                  You signed in with Google. Type <strong className="text-red-600 font-semibold">DELETE</strong> below to confirm deleting your account.
                </p>
                <input
                  id="confirm-delete"
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  className="mt-1 block w-full max-w-md rounded-lg border border-[#ded8d1] px-3 py-2 text-xs text-[#171717] focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-200 sm:text-sm font-mono"
                  placeholder="Type DELETE to confirm"
                />
              </>
            )}

            {error && (
              <p className="mt-2 text-xs text-red-600">{error}</p>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-red-700 disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
                {isDeleting ? "Deleting Account..." : "Permanently Delete My Account"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowConfirm(false);
                  setPassword("");
                  setConfirmText("");
                  setError(null);
                }}
                className="rounded-xl border border-[#ded8d1] px-4 py-2.5 text-xs font-semibold text-[#5d5854] transition hover:bg-[#f5f3f1]"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Avatar Image Selector Modal */}
      <ImageSelectorModal
        isOpen={showAvatarSelector}
        onClose={() => setShowAvatarSelector(false)}
        title="Update Profile Picture"
        description="Choose a high quality photo of yourself (Upload from device or enter web URL)."
        currentImageUrl={avatarUrl}
        folder="avatars"
        aspectRatio="square"
        onSelect={handleUpdateAvatar}
        onRemove={handleResetAvatar}
      />
    </div>
  );
}