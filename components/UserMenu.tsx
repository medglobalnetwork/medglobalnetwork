"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { getUserAvatarUrl } from "@/lib/avatar";

export default function UserMenu() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [open, setOpen] = React.useState(false);
  const [avatarUrl, setAvatarUrl] = React.useState<string>("");
  const ref = React.useRef<HTMLDivElement>(null);

  // Sync avatar on mount and on custom avatar change
  React.useEffect(() => {
    const updateAvatar = () => {
      setAvatarUrl(getUserAvatarUrl(session?.user?.email, session?.user?.name));
    };
    updateAvatar();
    window.addEventListener("mgn-avatar-updated", updateAvatar);
    return () => window.removeEventListener("mgn-avatar-updated", updateAvatar);
  }, [session?.user?.email, session?.user?.name]);

  // Close on outside click
  React.useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const initial = session
    ? (session.user.name || session.user.email).slice(0, 1).toUpperCase()
    : "?";

  const handleSignOut = async () => {
    setOpen(false);
    await authClient.signOut();
    router.replace("/");
  };

  const navTo = (path: string) => {
    setOpen(false);
    router.push(path);
  };

  return (
    <div ref={ref} className="relative">
      {/* Collapsed — profile avatar fetched from email or custom */}
      <button
        type="button"
        aria-label="Open user menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 w-9 lg:h-11 lg:w-11 items-center justify-center overflow-hidden rounded-full border border-[#ded8d1] bg-[#eef5fc] text-sm lg:text-base font-semibold text-[#1769c2] ring-2 ring-transparent transition hover:ring-[#1769c2]/30 focus:outline-none focus:ring-[#1769c2]/50"
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={session?.user?.name || "User Avatar"}
            className="h-full w-full rounded-full object-cover"
          />
        ) : (
          initial
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-11 lg:top-14 z-50 w-[280px] lg:w-[300px] overflow-hidden rounded-2xl border border-[#ebebeb] bg-white shadow-[0_8px_40px_rgba(0,0,0,0.12)]">
          {/* User info */}
          <div
            onClick={() => session?.user?.id && navTo(`/profile/${session.user.id}`)}
            role="button"
            tabIndex={0}
            className="flex cursor-pointer items-center gap-3 px-5 py-4 transition hover:bg-[#f8f7f6]"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#ded8d1] bg-[#eef5fc] text-base font-bold text-[#1769c2]">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={session?.user?.name || "User Avatar"}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                initial
              )}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[#171717]">
                {session?.user.name || "User"}
              </p>
              <p className="truncate text-[12px] text-[#8a8784]">
                {session?.user.email}
              </p>
              <p className="mt-0.5 text-[11px] font-medium text-[#1769c2]">
                View Profile →
              </p>
            </div>
          </div>

          <div className="mx-4 h-px bg-[#f0efee]" />

          {/* Menu items */}
          <ul className="px-2 py-2">
            <li>
              <button
                type="button"
                onClick={() => session?.user?.id && navTo(`/profile/${session.user.id}`)}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium text-[#4f4b48] transition hover:bg-[#f7f6f5] hover:text-[#171717]"
              >
                <span className="text-[#8a8784]">👤</span>
                My Profile
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => navTo("/network/connections")}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium text-[#4f4b48] transition hover:bg-[#f7f6f5] hover:text-[#171717]"
              >
                <span className="text-[#8a8784]">🤝</span>
                My Network
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => navTo("/network/feed")}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium text-[#4f4b48] transition hover:bg-[#f7f6f5] hover:text-[#171717]"
              >
                <span className="text-[#8a8784]">📰</span>
                Professional Feed
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => navTo("/network/communities")}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium text-[#4f4b48] transition hover:bg-[#f7f6f5] hover:text-[#171717]"
              >
                <span className="text-[#8a8784]">👥</span>
                Communities
              </button>
            </li>
          </ul>

          <div className="mx-4 h-px bg-[#f0efee]" />

          {/* Admin Console shortcut for admin */}
          {session?.user.email?.toLowerCase() === "patreshubham141@gmail.com" && (
            <>
              <div className="px-2 py-1.5">
                <button
                  type="button"
                  onClick={() => navTo("/admin")}
                  className="flex w-full items-center gap-3 rounded-xl bg-[#eef5fc] px-3 py-2 text-[13px] font-semibold text-[#1769c2] transition hover:bg-[#dbeafe]"
                >
                  <span>🛡️</span>
                  Admin Console
                </button>
              </div>
              <div className="mx-4 h-px bg-[#f0efee]" />
            </>
          )}

          {/* Settings */}
          <div className="px-2 py-1.5">
            <button
              type="button"
              onClick={() => navTo("/settings")}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-medium text-[#4f4b48] transition hover:bg-[#f7f6f5] hover:text-[#171717]"
            >
              <span className="text-[#8a8784]">
                <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
              </span>
              Settings
            </button>
          </div>

          <div className="mx-4 h-px bg-[#f0efee]" />

          {/* Log out */}
          <div className="px-2 py-1.5">
            <button
              type="button"
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-semibold text-red-500 transition hover:bg-red-50"
            >
              <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
