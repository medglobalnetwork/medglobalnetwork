"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { DEFAULT_BLANK_AVATAR, getUserAvatarUrl } from "@/lib/avatar";
import { UserAvatar } from "@/components/UserAvatar";
import { MemberBadge } from "@/modules/network/components/MemberBadge";
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
      className={`${className} shrink-0 object-contain select-none`}
      onError={() => setError(true)}
      loading="eager"
    />
  );
}

export default function UserMenu() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
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
    await authClient.signOut();
    router.replace("/");
  };

  const navTo = (path: string) => {
    setOpen(false);
    router.push(path);
  };

  return (
    <div ref={ref} className="relative">
      {/* Collapsed — profile avatar fetched from custom or blank */}
      <button
        type="button"
        aria-label="Open user menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 w-9 lg:h-11 lg:w-11 items-center justify-center overflow-hidden rounded-full border border-[#ded8d1] ring-2 ring-transparent transition hover:ring-[#1769c2]/30 focus:outline-none focus:ring-[#1769c2]/50"
      >
        <UserAvatar
          src={avatarUrl}
          name={session?.user?.name}
          email={session?.user?.email}
          userId={session?.user?.id}
          className="h-full w-full"
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-11 lg:top-14 z-50 w-[280px] lg:w-[310px] overflow-hidden rounded-2xl border border-[#ebebeb] bg-white shadow-[0_8px_40px_rgba(0,0,0,0.12)]">
          {/* User info */}
          <div
            onClick={() => session?.user?.id && navTo(`/profile/${session.user.id}`)}
            role="button"
            tabIndex={0}
            className="flex cursor-pointer items-start gap-3 px-4 py-3.5 transition hover:bg-[#f8f7f6]"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#ded8d1] mt-0.5">
              <UserAvatar
                src={avatarUrl}
                name={session?.user?.name}
                email={session?.user?.email}
                userId={session?.user?.id}
                className="h-full w-full"
              />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-[#171717]">
                {session?.user.name || "User"}
              </p>
              <p className="truncate text-[11px] text-[#8a8784] mb-1">
                {session?.user.email}
              </p>
              <MemberBadge
                memberId={memberId}
                isFoundingMember={isFoundingMember}
                membershipTier={membershipTier}
                size="xs"
              />
            </div>
          </div>

          <div className="mx-4 h-px bg-[#f0efee]" />

          {/* Menu items */}
          <ul className="px-2 py-2">
            <li>
              <button
                type="button"
                onClick={() => session?.user?.id && navTo(`/profile/${session.user.id}`)}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium text-[#4f4b48] transition hover:bg-[#f7f6f5] hover:text-[#171717] group"
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
                onClick={() => navTo("/network/connections")}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium text-[#4f4b48] transition hover:bg-[#f7f6f5] hover:text-[#171717] group"
              >
                <Icons8MenuIcon
                  iconId="gf7HkPc5t1hF"
                  colorHex="77716B"
                  className="h-[19px] w-[19px] group-hover:scale-105 transition-transform"
                />
                My Network
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => navTo("/network/feed")}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium text-[#4f4b48] transition hover:bg-[#f7f6f5] hover:text-[#171717] group"
              >
                <Icons8MenuIcon
                  iconId="0XwEi0yisdO8"
                  colorHex="77716B"
                  className="h-[19px] w-[19px] group-hover:scale-105 transition-transform"
                />
                Professional Feed
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => navTo("/network/communities")}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium text-[#4f4b48] transition hover:bg-[#f7f6f5] hover:text-[#171717] group"
              >
                <Icons8MenuIcon
                  iconId="4C2pzaBlIDEO"
                  colorHex="77716B"
                  className="h-[19px] w-[19px] group-hover:scale-105 transition-transform"
                />
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
                  className="flex w-full items-center gap-3 rounded-xl bg-[#eef5fc] px-3 py-2 text-[13px] font-semibold text-[#1769c2] transition hover:bg-[#dbeafe] group"
                >
                  <Icons8MenuIcon
                    iconId="vy6OvJYHSJ8I"
                    colorHex="1769C2"
                    className="h-[19px] w-[19px] group-hover:scale-105 transition-transform"
                  />
                  Admin Console
                </button>
              </div>
              <div className="mx-4 h-px bg-[#f0efee]" />
            </>
          )}

          {/* Plans & Pricing */}
          <div className="px-2 py-1.5">
            <button
              type="button"
              onClick={() => navTo("/pricing")}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-medium text-[#4f4b48] transition hover:bg-[#f7f6f5] hover:text-[#171717] group"
            >
              <Icons8MenuIcon
                iconId="JYQrEM0EyitQ"
                colorHex="D97706"
                className="h-[19px] w-[19px] group-hover:scale-105 transition-transform"
              />
              Plans & Pricing
            </button>
          </div>

          {/* Settings */}
          <div className="px-2 py-1.5">
            <button
              type="button"
              onClick={() => navTo("/settings")}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-medium text-[#4f4b48] transition hover:bg-[#f7f6f5] hover:text-[#171717] group"
            >
              <Icons8MenuIcon
                iconId="4511GGVppfIx"
                colorHex="77716B"
                className="h-[19px] w-[19px] group-hover:scale-105 transition-transform"
              />
              Settings
            </button>
          </div>

          <div className="mx-4 h-px bg-[#f0efee]" />

          {/* Log out */}
          <div className="px-2 py-1.5">
            <button
              type="button"
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-semibold text-red-500 transition hover:bg-red-50 group"
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
