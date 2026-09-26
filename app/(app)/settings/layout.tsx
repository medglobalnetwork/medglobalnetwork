"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

function cn(...inputs: Array<string | false | null | undefined>) {
  return inputs.filter(Boolean).join(" ");
}

const settingsNav = [
  {
    section: "Me",
    items: [
      {
        label: "Account",
        href: "/settings/account",
        icon: (
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
          </svg>
        ),
      },
      {
        label: "Plans & Billing",
        href: "/pricing",
        icon: (
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect width="20" height="14" x="2" y="5" rx="2" />
            <line x1="2" x2="22" y1="10" y2="10" />
          </svg>
        ),
      },
    ],
  },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    try {
      await authClient.signOut();
    } catch {}
    try {
      localStorage.removeItem("better-auth.session_token");
    } catch {}
    window.location.href = "/";
  };

  React.useEffect(() => {
    if (!isPending && !session) {
      router.replace("/");
    }
  }, [isPending, router, session]);

  if (isPending || !session) {
    return <div className="min-h-dvh bg-[#f5f3f1]" />;
  }

  return (
    <div className="min-h-dvh bg-[#f5f3f1]">
      <div className="mx-auto flex max-w-5xl flex-col gap-0 px-4 py-8 lg:flex-row lg:gap-10">
        {/* Settings Sidebar */}
        <aside className="w-full shrink-0 lg:w-52">
          {/* Back to home */}
          <a
            href="/home"
            className="mb-6 flex items-center gap-1.5 text-sm text-[#77716b] hover:text-[#171717] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1769c2] rounded"
          >
            <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m15 18-6-6 6-6" />
            </svg>
            Back
          </a>

          <h2 className="mb-4 text-base font-semibold text-[#171717]">Settings</h2>

          <nav className="space-y-5">
            {settingsNav.map((group) => (
              <div key={group.section}>
                {/* Section label */}
                <p className="mb-1 px-2 text-[11px] font-semibold uppercase text-[#a09890]">
                  {group.section}
                </p>
                <ul className="space-y-0.5">
                  {group.items.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className={cn(
                            "flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm font-medium transition-colors",
                            isActive
                              ? "bg-white text-[#171717] shadow-sm"
                              : "text-[#5d5854] hover:bg-white/60 hover:text-[#171717]"
                          )}
                        >
                          {item.icon}
                          {item.label}
                        </Link>
                      </li>
                    );
                  })}
                  <li>
                    <button
                      type="button"
                      onClick={handleSignOut}
                      disabled={isLoggingOut}
                      className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50/80 transition-colors disabled:opacity-50"
                    >
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      {isLoggingOut ? "Signing out..." : "Sign Out"}
                    </button>
                  </li>
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="min-w-0 flex-1 pb-32 lg:pb-16">
          {children}
        </main>
      </div>
    </div>
  );
}