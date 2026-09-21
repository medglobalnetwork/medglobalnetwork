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

  React.useEffect(() => {
    if (!isPending && !session) {
      router.replace("/");
    }
  }, [isPending, router, session]);

  if (isPending || !session) {
    return <div className="min-h-screen bg-[#f5f3f1]" />;
  }

  return (
    <div className="min-h-screen bg-[#f5f3f1]">
      <div className="mx-auto flex max-w-5xl flex-col gap-0 px-4 py-8 lg:flex-row lg:gap-10">
        {/* Settings Sidebar */}
        <aside className="w-full shrink-0 lg:w-52">
          {/* Back to home */}
          <a
            href="/home"
            className="mb-6 flex items-center gap-1.5 text-sm text-[#77716b] hover:text-[#171717]"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m15 18-6-6 6-6" />
            </svg>
            Back
          </a>

          <h2 className="mb-4 text-base font-semibold tracking-tight text-[#171717]">Settings</h2>

          <nav className="space-y-5">
            {settingsNav.map((group) => (
              <div key={group.section}>
                {/* Section label */}
                <p className="mb-1 px-2 text-[11px] font-semibold uppercase tracking-widest text-[#a09890]">
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
                          {/* Delete account hint badge */}
                          {item.href === "/settings/account" && (
                            <span className="ml-auto inline-flex items-center rounded-full bg-red-50 px-1.5 py-0.5 text-[10px] font-medium text-red-600">
                              Delete
                            </span>
                          )}
                        </Link>
                      </li>
                    );
                  })}
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