"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Moon, Sun, Laptop } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { DEFAULT_BLANK_AVATAR, getUserAvatarUrl } from "@/lib/avatar";
import { UserAvatar } from "@/components/UserAvatar";
import { MemberBadge } from "@/modules/network/components/MemberBadge";
import { useTheme } from "@/components/ThemeProvider";

function Icons8MenuIcon({
  iconId,
  colorHex = "77716B",
  fallback: FallbackIcon,
  className = "h-[19px] w-[19px]",
}: {
  iconId: string;
  colorHex?: string;
  fallback?: React.ReactNode;
  className?: string;
}) {
  const [error, setError] = React.useState(false);
  if (error && FallbackIcon) {
    return <>{FallbackIcon}</>;
  }
  const url = `https://img.icons8.com/?id=${iconId}&format=png&size=48&color=${colorHex}`;
  return (
    <img
      src={url}
      alt=""
      className={`${className} shrink-0 object-contain select-none dark:brightness-125`}
      onError={() => setError(true)}
      loading="eager"
    />
  );
}

export default function UserMenu() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const { theme, resolvedTheme, toggleTheme } = useTheme();
  const [open, setOpen] = React.useState(false);
  const [avatarUrl, setAvatarUrl] = React.useState<string>(DEFAULT_BLANK_AVATAR);
  const [memberId, setMemberId] = React.useState<string | null>(null);
  const [isFoundingMember, setIsFoundingMember] = React.useState(false);
  const [membershipTier, setMembershipTier] = React.useState<string | null>(null);
  const ref = React.useRef<HTMLDivElement>(null);

  // Sync avatar on mount and on custom avatar change
  React.useEffect(() => {
    const updateAvatar = () => {
      setAvatarUrl(
        getUserAvatarUrl(
          session?.user?.id,
          session?.user?.image
        )
      );
    };
    updateAvatar();
    window.addEventListener("mgn-avatar-updated", updateAvatar);
    return () => window.removeEventListener("mgn-avatar-updated", updateAvatar);
  }, [session?.user?.id, session?.user?.image]);

  // Fetch Member ID
  React.useEffect(() => {
    if (session?.user?.id) {
      fetch(`/api/network/profiles/${session.user.id}`, { credentials: "include" })
        .then((res) => res.json())
        .then((resData) => {
          const prof = resData?.data || resData?.profile;
          if (prof?.member_id) setMemberId(prof.member_id);
          if (prof?.is_founding_member !== undefined) setIsFoundingMember(Boolean(prof.is_founding_member));
          if (prof?.membership_tier) setMembershipTier(prof.membership_tier);
        })
        .catch(() => {});
    }
  }, [session?.user?.id]);

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

  const handleSignOut = async () => {
    setOpen(false);
    try {
      await authClient.signOut();
    } catch {}
    try {
      localStorage.removeItem("better-auth.session_token");
    } catch {}
    window.location.href = "/";
  };

  const navTo = (path: string) => {
    setOpen(false);
    router.push(path);
  };

  const isDark = resolvedTheme === "dark";

  return (
    <div ref={ref} className="relative">
      {/* Collapsed — profile avatar & user name */}
      <button
        type="button"
        aria-label="Open user menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 p-1 sm:pr-2.5 rounded-full border border-[#ded8d1] dark:border-[#30363d] bg-[#faf9f8] dark:bg-[#161b22] hover:bg-white dark:hover:bg-[#21262d] hover:border-[#0f4c81]/40 dark:hover:border-[#388bfd]/40 transition shadow-xs group cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0f4c81]/30 dark:focus:ring-[#388bfd]/30"
      >
        <div className="size-8 sm:size-9 shrink-0 overflow-hidden rounded-full border border-[#ded8d1] dark:border-[#30363d]">
          <UserAvatar
            src={avatarUrl}
            name={session?.user?.name}
            email={session?.user?.email}
            userId={session?.user?.id}
            className="h-full w-full object-cover"
          />
        </div>
        <span className="hidden sm:block text-xs font-bold text-[#171717] dark:text-[#f0f6fc] group-hover:text-[#0f4c81] dark:group-hover:text-[#388bfd] transition truncate max-w-[110px] lg:max-w-[140px] text-left">
          {session?.user?.name || "My Account"}
        </span>
        <ChevronDown
          className={`hidden sm:block size-3.5 text-[#8a8784] dark:text-[#8b949e] transition-transform duration-200 ${
            open ? "rotate-180 text-[#0f4c81] dark:text-[#388bfd]" : "group-hover:text-[#171717] dark:group-hover:text-[#f0f6fc]"
          }`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-12 sm:top-13 z-50 w-[280px] sm:w-[310px] overflow-hidden rounded-2xl border border-[#ebebeb] dark:border-[#30363d] bg-white dark:bg-[#161b22] shadow-[0_12px_44px_rgba(0,0,0,0.14)] dark:shadow-[0_12px_44px_rgba(0,0,0,0.5)] animate-in fade-in zoom-in-95 duration-150">
          {/* User info */}
          <div
            onClick={() => session?.user?.id && navTo(`/profile/${session.user.id}`)}
            role="button"
            tabIndex={0}
            className="flex cursor-pointer items-start gap-3 px-4 py-3.5 transition hover:bg-[#f8f7f6] dark:hover:bg-[#21262d]"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#ded8d1] dark:border-[#30363d] mt-0.5">
              <UserAvatar
                src={avatarUrl}
                name={session?.user?.name}
                email={session?.user?.email}
                userId={session?.user?.id}
                className="h-full w-full"
              />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-[#171717] dark:text-[#f0f6fc]">
                {session?.user?.name || "User"}
              </p>
              <p className="truncate text-[11px] text-[#8a8784] dark:text-[#8b949e] mb-1">
                {session?.user?.email}
              </p>
              <MemberBadge
                memberId={memberId}
                isFoundingMember={isFoundingMember}
                membershipTier={membershipTier}
                size="xs"
              />
            </div>
          </div>

          <div className="mx-4 h-px bg-[#f0efee] dark:bg-[#30363d]" />

          {/* Menu items */}
          <ul className="px-2 py-2 space-y-0.5">
            <li>
              <button
                type="button"
                onClick={() => navTo("/home")}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-medium text-[#4f4b48] dark:text-[#8b949e] transition hover:bg-[#f7f6f5] dark:hover:bg-[#21262d] hover:text-[#171717] dark:hover:text-[#f0f6fc] group cursor-pointer"
              >
                <Icons8MenuIcon
                  iconId="v9L1K1EeV6Y7"
                  colorHex="0F4C81"
                  className="h-[19px] w-[19px] group-hover:scale-105 transition-transform"
                />
                Dashboard
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => session?.user?.id && navTo(`/profile/${session.user.id}`)}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-medium text-[#4f4b48] dark:text-[#8b949e] transition hover:bg-[#f7f6f5] dark:hover:bg-[#21262d] hover:text-[#171717] dark:hover:text-[#f0f6fc] group cursor-pointer"
              >
                <Icons8MenuIcon
                  iconId="zxB19VPoVLjK"
                  colorHex="77716B"
                  className="h-[19px] w-[19px] group-hover:scale-105 transition-transform"
                />
                My Profile
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => session?.user?.id ? navTo(`/profile/${session.user.id}`) : navTo("/pricing")}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-medium text-[#4f4b48] dark:text-[#8b949e] transition hover:bg-[#f7f6f5] dark:hover:bg-[#21262d] hover:text-[#171717] dark:hover:text-[#f0f6fc] group cursor-pointer"
              >
                <Icons8MenuIcon
                  iconId="20520"
                  colorHex="16804D"
                  className="h-[19px] w-[19px] group-hover:scale-105 transition-transform"
                />
                <span className="flex-1 text-left">Membership</span>
                {isFoundingMember && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50">
                    Founder
                  </span>
                )}
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => navTo("/pricing")}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-medium text-[#4f4b48] dark:text-[#8b949e] transition hover:bg-[#f7f6f5] dark:hover:bg-[#21262d] hover:text-[#171717] dark:hover:text-[#f0f6fc] group cursor-pointer"
              >
                <Icons8MenuIcon
                  iconId="JYQrEM0EyitQ"
                  colorHex="D97706"
                  className="h-[19px] w-[19px] group-hover:scale-105 transition-transform"
                />
                My Subscriptions
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => navTo("/network/connections")}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-medium text-[#4f4b48] dark:text-[#8b949e] transition hover:bg-[#f7f6f5] dark:hover:bg-[#21262d] hover:text-[#171717] dark:hover:text-[#f0f6fc] group cursor-pointer"
              >
                <Icons8MenuIcon
                  iconId="gf7HkPc5t1hF"
                  colorHex="77716B"
                  className="h-[19px] w-[19px] group-hover:scale-105 transition-transform"
                />
                My Network
              </button>
            </li>
          </ul>

          <div className="mx-4 h-px bg-[#f0efee] dark:bg-[#30363d]" />

          {/* Theme Quick Toggle Row */}
          <div className="px-2 py-1.5">
            <button
              type="button"
              onClick={toggleTheme}
              className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-[13px] font-medium text-[#4f4b48] dark:text-[#8b949e] transition hover:bg-[#f7f6f5] dark:hover:bg-[#21262d] hover:text-[#171717] dark:hover:text-[#f0f6fc] group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                {isDark ? (
                  <Sun className="h-[19px] w-[19px] text-amber-400 group-hover:rotate-45 transition-transform" />
                ) : (
                  <Moon className="h-[19px] w-[19px] text-[#77716b] group-hover:-rotate-12 transition-transform" />
                )}
                <span>Theme</span>
              </div>
              <span className="rounded-full bg-[#f0efee] dark:bg-[#21262d] border border-[#e8e6e3] dark:border-[#30363d] px-2 py-0.5 text-[10px] font-bold text-[#77716b] dark:text-[#8b949e] capitalize">
                {isDark ? "Dark" : "Light"}
              </span>
            </button>
          </div>

          <div className="mx-4 h-px bg-[#f0efee] dark:bg-[#30363d]" />

          {/* Admin Console shortcut for admin */}
          {session?.user?.email?.toLowerCase() === "patreshubham141@gmail.com" && (
            <>
              <div className="px-2 py-1.5">
                <button
                  type="button"
                  onClick={() => navTo("/admin")}
                  className="flex w-full items-center gap-3 rounded-xl bg-[#eef5fc] dark:bg-[#1f2d42] px-3 py-2 text-[13px] font-semibold text-[#0f4c81] dark:text-[#58a6ff] transition hover:bg-[#dbeafe] dark:hover:bg-[#263852] group cursor-pointer"
                >
                  <Icons8MenuIcon
                    iconId="vy6OvJYHSJ8I"
                    colorHex="0F4C81"
                    className="h-[19px] w-[19px] group-hover:scale-105 transition-transform"
                  />
                  Admin Console
                </button>
              </div>
              <div className="mx-4 h-px bg-[#f0efee] dark:bg-[#30363d]" />
            </>
          )}

          {/* Settings */}
          <div className="px-2 py-1.5">
            <button
              type="button"
              onClick={() => navTo("/settings")}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-medium text-[#4f4b48] dark:text-[#8b949e] transition hover:bg-[#f7f6f5] dark:hover:bg-[#21262d] hover:text-[#171717] dark:hover:text-[#f0f6fc] group cursor-pointer"
            >
              <Icons8MenuIcon
                iconId="4511GGVppfIx"
                colorHex="77716B"
                className="h-[19px] w-[19px] group-hover:scale-105 transition-transform"
              />
              Settings
            </button>
          </div>

          <div className="mx-4 h-px bg-[#f0efee] dark:bg-[#30363d]" />

          {/* Log out */}
          <div className="px-2 py-1.5">
            <button
              type="button"
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-semibold text-red-500 dark:text-red-400 transition hover:bg-red-50 dark:hover:bg-red-950/30 group cursor-pointer"
            >
              <Icons8MenuIcon
                iconId="Q1xkcFuVON39"
                colorHex="EF4444"
                className="h-[19px] w-[19px] group-hover:scale-105 transition-transform"
              />
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
