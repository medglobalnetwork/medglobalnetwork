"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { getUserAvatarUrl, setUserCustomAvatar } from "@/lib/avatar";

export default function AccountSettingsPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = React.useState<string>("");
  const [hasCustomAvatar, setHasCustomAvatar] = React.useState(false);
  const [photoSuccess, setPhotoSuccess] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (!isPending && !session) {
      router.replace("/");
    }
  }, [isPending, router, session]);

  // Sync avatar
  React.useEffect(() => {
    const syncAvatar = () => {
      if (typeof window !== "undefined") {
        const custom = localStorage.getItem("mgn_user_custom_avatar");
        setHasCustomAvatar(Boolean(custom));
      }
      setAvatarUrl(getUserAvatarUrl(session?.user?.email, session?.user?.name));
    };
    syncAvatar();
    window.addEventListener("mgn-avatar-updated", syncAvatar);
    return () => window.removeEventListener("mgn-avatar-updated", syncAvatar);
  }, [session?.user?.email, session?.user?.name]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError("Please select an image smaller than 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setUserCustomAvatar(dataUrl);
      setPhotoSuccess("Profile picture updated successfully!");
      setTimeout(() => setPhotoSuccess(null), 3000);
    };
    reader.readAsDataURL(file);
  };

  const handleResetAvatar = () => {
    setUserCustomAvatar(null);
    setPhotoSuccess("Profile picture reset to email default.");
    setTimeout(() => setPhotoSuccess(null), 3000);
  };

  if (isPending || !session) {
    return <div className="min-h-screen bg-[#f5f3f1]" />;
  }

  const handleDeleteAccount = async () => {
    if (!password) {
      setError("Password is required");
      return;
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
          body: JSON.stringify({ password }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete account");
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
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-[#171717]">Account</h1>
        <p className="mt-1 text-sm text-[#77716b]">Manage your profile, picture, and account credentials.</p>
      </div>

      {/* Profile Photo & Info card */}
      <div className="rounded-2xl border border-[#ded8d1] bg-white p-5 sm:p-6 mb-6 shadow-xs">
        <h2 className="text-sm font-semibold text-[#171717]">Profile Details</h2>
        <p className="mt-0.5 text-xs text-[#77716b]">
          Your avatar is automatically generated from your registered email address. You can also upload a custom photo.
        </p>

        <div className="mt-5 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-[#1769c2]/20 bg-[#eef5fc] shadow-xs">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={session.user.name || "User Avatar"}
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              <span className="text-xl font-bold text-[#1769c2]">
                {(session.user.name || session.user.email).slice(0, 1).toUpperCase()}
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-base font-semibold text-[#171717]">{session.user.name || "—"}</p>
            <p className="text-xs text-[#77716b]">{session.user.email}</p>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-lg bg-[#1769c2] px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-[#12569f]"
              >
                Upload New Photo
              </button>

              {hasCustomAvatar && (
                <button
                  type="button"
                  onClick={handleResetAvatar}
                  className="rounded-lg border border-[#ded8d1] bg-white px-3 py-1.5 text-xs font-medium text-[#5d5854] transition hover:bg-[#f8f7f6]"
                >
                  Reset to Email Avatar
                </button>
              )}
            </div>

            {photoSuccess && (
              <p className="mt-2 text-xs font-medium text-[#15803d]">{photoSuccess}</p>
            )}
          </div>
        </div>
      </div>

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

            {error && (
              <p className="mt-2 text-xs text-red-600">{error}</p>
            )}

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {isDeleting ? "Deleting…" : "Yes, delete my account"}
              </button>
              <button
                type="button"
                onClick={() => { setShowConfirm(false); setPassword(""); setError(null); }}
                className="rounded-lg border border-[#ded8d1] px-4 py-2 text-xs font-medium text-[#5d5854] transition hover:bg-[#f5f3f1]"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}