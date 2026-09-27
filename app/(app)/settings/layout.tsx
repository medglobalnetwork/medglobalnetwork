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
        label: "Trust & Verification",
        href: "/settings/verification",
        icon: (
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="m9 12 2 2 4-4" />
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
    return <div className="min-h-dvh bg-[#faf9f8] dark:bg-[#0d1117]" />;
  }

  return (
    <div className="min-h-dvh bg-[#faf9f8] dark:bg-[#0d1117]">
      <div className="mx-auto flex max-w-5xl flex-col gap-0 px-4 py-8 lg:flex-row lg:gap-10">
        {/* Settings Sidebar */}
        <aside className="w-full shrink-0 lg:w-52">
          {/* Back to home */}
          <a
            href="/home"
            className="mb-6 flex items-center gap-1.5 text-sm text-[#77716b] dark:text-[#8b949e] hover:text-[#171717] dark:hover:text-[#f0f6fc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f4c81] rounded"
          >
            <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m15 18-6-6 6-6" />
            </svg>
            Back
          </a>

          <h2 className="mb-4 text-base font-semibold text-[#171717] dark:text-[#f0f6fc]">Settings</h2>

          <nav className="space-y-5">
            {settingsNav.map((group) => (
              <div key={group.section}>
                {/* Section label */}
                <p className="mb-1 px-2 text-[11px] font-semibold uppercase text-[#a09890] dark:text-[#8b949e]">
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
                              ? "bg-white dark:bg-[#161b22] text-[#171717] dark:text-[#f0f6fc] shadow-xs"
                              : "text-[#5d5854] dark:text-[#8b949e] hover:bg-white/60 dark:hover:bg-[#161b22]/60 hover:text-[#171717] dark:hover:text-[#f0f6fc]"
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
                      className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-sm font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50/80 dark:hover:bg-rose-950/30 transition-colors disabled:opacity-50 cursor-pointer"
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