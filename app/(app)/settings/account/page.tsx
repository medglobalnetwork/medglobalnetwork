"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { getUserAvatarUrl, setUserCustomAvatar } from "@/lib/avatar";
import HoldButton from "@/components/HoldButton";
import { Trash2 } from "lucide-react";

export default function AccountSettingsPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [password, setPassword] = React.useState("");
  const [confirmText, setConfirmText] = React.useState("");
  const [hasPassword, setHasPassword] = React.useState<boolean | null>(null);
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
              <HoldButton
                doneLabel="Deleting..."
                backgroundColor="#dc2626"
                fillColor="#7f1d1d"
                textColor="#ffffff"
                fillTextColor="#ffffff"
                size="md"
                radius={12}
                fillDirection="right"
                holdTime={2000}
                releaseTime={200}
                pressScale={0.97}
                wave
                waveAmplitude={6}
                glow
                resetAfter={0}
                disabled={isDeleting}
                icon={<Trash2 className="h-4 w-4" />}
                onHold={handleDeleteAccount}
                onTap={() => {
                  if (hasPassword && !password) {
                    setError("Please enter your password first, then hold to confirm deletion");
                  } else if (!hasPassword && confirmText.trim().toUpperCase() !== "DELETE") {
                    setError("Please type DELETE first, then hold to confirm deletion");
                  } else {
                    setError("Press and hold the button for 2 seconds to confirm account deletion");
                  }
                }}
              >
                Hold to delete account
              </HoldButton>
              <button
                type="button"
                onClick={() => {
                  setShowConfirm(false);
                  setPassword("");
                  setConfirmText("");
                  setError(null);
                }}
                className="h-11 rounded-xl border border-[#ded8d1] px-4 text-xs font-semibold text-[#5d5854] transition hover:bg-[#f5f3f1]"
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