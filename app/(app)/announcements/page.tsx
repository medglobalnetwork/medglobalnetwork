"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Megaphone, Loader2, AlertTriangle, ArrowLeft } from "lucide-react";

type Announcement = {
  id: string;
  scope: "global" | "camp" | "event";
  scope_id: string | null;
  title: string;
  body: string;
  priority: "normal" | "high" | "urgent";
  created_at: string;
  expires_at: string | null;
  author_name: string | null;
  author_image: string | null;
  is_read: boolean;
};

const PRIORITY_STYLES: Record<string, string> = {
  urgent: "bg-red-50 text-red-700 border-red-200",
  high: "bg-amber-50 text-amber-800 border-amber-200",
  normal: "bg-[#eef5fc] text-[#1769c2] border-[#cfe0f5]",
};

const SCOPE_LABEL: Record<string, string> = {
  global: "Platform",
  camp: "Health camp",
  event: "Event",
};

function scopeHref(a: Announcement): string | null {
  if (a.scope === "camp" && a.scope_id) return `/camps/${a.scope_id}`;
  if (a.scope === "event" && a.scope_id) return `/events/${a.scope_id}`;
  return null;
}

export default function AnnouncementsPage() {
  const router = useRouter();
  const [items, setItems] = React.useState<Announcement[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    try {
      setError(null);
      const res = await fetch("/api/announcements", { credentials: "include" });
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const data = await res.json();
      setItems(Array.isArray(data?.data) ? data.data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load announcements");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  const markRead = React.useCallback(async (id: string) => {
    setItems((prev) =>
      prev.map((a) => (a.id === id ? { ...a, is_read: true } : a))
    );
    try {
      await fetch(`/api/announcements/${id}/read`, {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // Read state is a nicety — never surface a failure for it.
    }
  }, []);

  const unread = items.filter((a) => !a.is_read).length;

  return (
    <main className="mx-auto w-full max-w-3xl px-3 py-4 sm:px-6 sm:py-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Go back"
            className="rounded-lg p-1.5 text-[#1769c2] transition-colors hover:bg-[#eef5fc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1769c2]"
          >
            <ArrowLeft className="size-5" />
          </button>
          <h1 className="text-lg font-bold text-[#171717] dark:text-[#f0f6fc] sm:text-xl">
            Announcements
          </h1>
        </div>
        {unread > 0 && (
          <span className="rounded-full bg-[#1769c2] px-2.5 py-1 text-[11px] font-bold text-white">
            {unread} new
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-[#64748b]">
          <Loader2 className="size-6 animate-spin" />
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-[#ded8d1] px-6 py-14 text-center">
          <Megaphone className="size-8 text-[#94a3b8]" />
          <p className="text-sm font-semibold text-[#171717] dark:text-[#f0f6fc]">
            No announcements yet
          </p>
          <p className="text-xs text-[#64748b]">
            Platform updates and event news will show up here.
          </p>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {items.map((a) => {
            const href = scopeHref(a);
            const Card = (
              <article
                className={`rounded-2xl border bg-white p-3.5 shadow-2xs transition-colors sm:p-4 ${
                  a.is_read
                    ? "border-[#e5e0d9]"
                    : "border-[#c9dcf3] bg-[#f8fbff]"
                }`}
              >
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${
                      PRIORITY_STYLES[a.priority] ?? PRIORITY_STYLES.normal
                    }`}
                  >
                    {a.priority === "urgent" && <AlertTriangle className="size-3" />}
                    {SCOPE_LABEL[a.scope] ?? a.scope}
                  </span>
                  {!a.is_read && (
                    <span className="size-1.5 rounded-full bg-[#1769c2]" aria-label="Unread" />
                  )}
                  <time
                    dateTime={a.created_at}
                    className="text-[11px] text-[#64748b]"
                  >
                    {new Date(a.created_at).toLocaleDateString(undefined, {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </time>
                </div>

                <h2 className="text-sm font-bold text-balance text-[#171717] sm:text-[15px]">
                  {a.title}
                </h2>
                <p className="mt-1 whitespace-pre-line text-[13px] leading-relaxed text-[#475569]">
                  {a.body}
                </p>

                {a.author_name && (
                  <p className="mt-2 text-[11px] text-[#64748b]">— {a.author_name}</p>
                )}
              </article>
            );

            return (
              <li key={a.id}>
                {href ? (
                  <Link
                    href={href}
                    onClick={() => void markRead(a.id)}
                    className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1769c2]"
                  >
                    {Card}
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => void markRead(a.id)}
                    className="block w-full text-left rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1769c2]"
                  >
                    {Card}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}