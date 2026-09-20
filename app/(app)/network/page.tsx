"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

import { NetworkTabs } from "@/modules/network/components/NetworkTabs";
import { NetworkFilters } from "@/modules/network/components/NetworkFilters";
import { ProfessionalCard } from "@/modules/network/components/ProfessionalCard";
import { NetworkSidebar } from "@/modules/network/components/NetworkSidebar";
import { EmptyState } from "@/modules/network/components/EmptyState";
import { ProfessionalCardSkeleton, ListItemSkeleton } from "@/modules/network/components/SkeletonLoader";
import { VerificationBadge } from "@/modules/network/components/VerificationBadge";
import { ConnectionButton } from "@/modules/network/components/ConnectionButton";
import { ConnectionRequestModal } from "@/modules/network/components/ConnectionRequestModal";
import { SAMPLE_PROFESSIONALS } from "@/modules/network/lib/network-data";
import { getProfessionColor, formatRelativeTime } from "@/modules/network/lib/network-data";
import type { ProfessionalProfile, NetworkFilters as Filters, ConnectionStatus } from "@/modules/network/types";

type ActiveTab = "discover" | "connections" | "invitations" | "following";

// ─────────────────────────────────────────────
// Discover Tab
// ─────────────────────────────────────────────
function DiscoverTab({
  currentUserId,
  searchQuery,
}: {
  currentUserId: string;
  searchQuery: string;
}) {
  const [filters, setFilters] = React.useState<Filters>({});
  const [profiles, setProfiles] = React.useState<ProfessionalProfile[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [page, setPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(false);

  const load = React.useCallback(async (f: Filters, p: number, q: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (f.profession) params.set("profession", f.profession);
      if (f.specialization) params.set("specialization", f.specialization);
      if (f.city) params.set("city", f.city);
      if (f.verified_only) params.set("verified", "true");
      if (q) params.set("q", q);
      params.set("page", String(p));
      params.set("pageSize", "12");

      const res = await fetch(`/api/network/profiles?${params}`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setProfiles((prev) =>
          p === 1 ? (data.data ?? []) : [...prev, ...(data.data ?? [])]
        );
        setHasMore(data.hasMore ?? false);
      } else {
        // Fallback to sample data
        const filtered = SAMPLE_PROFESSIONALS.filter((pr) => {
          if (f.profession && pr.profession !== f.profession) return false;
          if (
            f.city &&
            !pr.city?.toLowerCase().includes(f.city.toLowerCase())
          )
            return false;
          if (q && !pr.name.toLowerCase().includes(q.toLowerCase()) && !pr.profession?.toLowerCase().includes(q.toLowerCase()))
            return false;
          return true;
        });
        setProfiles(filtered);
        setHasMore(false);
      }
    } catch {
      setProfiles(SAMPLE_PROFESSIONALS);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    setPage(1);
    load(filters, 1, searchQuery);
  }, [filters, searchQuery, load]);

  const handleFilterChange = (f: Filters) => {
    setFilters(f);
    setPage(1);
  };

  const handleLoadMore = () => {
    const next = page + 1;
    setPage(next);
    load(filters, next, searchQuery);
  };

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
      {/* Filters sidebar */}
      <div className="lg:w-56 shrink-0">
        <NetworkFilters
          filters={filters}
          onChange={handleFilterChange}
          onReset={() => handleFilterChange({})}
        />
      </div>

      {/* Profile grid */}
      <div className="flex-1 min-w-0">
        {loading && page === 1 ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <ProfessionalCardSkeleton key={i} />
            ))}
          </div>
        ) : profiles.length === 0 ? (
          <EmptyState
            icon="🔍"
            title="No professionals found"
            description="Try adjusting your filters or search query to find healthcare professionals."
            actionText="Reset Filters"
            onAction={() => handleFilterChange({})}
          />
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {profiles.map((p) => (
                <ProfessionalCard key={p.user_id} profile={p} />
              ))}
            </div>
            {hasMore && (
              <div className="mt-6 flex justify-center">
                <button
                  type="button"
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="rounded-xl border border-[#ded8d1] bg-white px-6 py-2.5 text-sm font-medium text-[#5d5854] transition hover:bg-[#f8f7f6] disabled:opacity-50"
                >
                  {loading ? "Loading…" : "Load More"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// My Network Tab
// ─────────────────────────────────────────────
function ConnectionsTab({ currentUserId }: { currentUserId: string }) {
  const router = useRouter();
  const [connections, setConnections] = React.useState<Array<{
    id: string; user_id: string; name: string; image?: string | null;
    profession?: string; specialization?: string; organization?: string;
    city?: string; connected_at: string;
  }>>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch("/api/network/connections?type=connections", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setConnections(d.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="space-y-2"><ListItemSkeleton count={4} /></div>;

  if (connections.length === 0) {
    return (
      <EmptyState
        icon="🤝"
        title="No connections yet"
        description="Start building your healthcare network. Connect with doctors, nurses, physiotherapists, and allied health professionals."
        actionText="Discover Professionals"
      />
    );
  }

  return (
    <div className="space-y-2">
      <p className="mb-3 text-xs text-[#77716b]">
        {connections.length} connection{connections.length !== 1 ? "s" : ""}
      </p>
      {connections.map((c) => {
        const color = getProfessionColor(c.profession);
        const initials = (c.name || "U").split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
        return (
          <div key={c.id} className="flex items-center gap-3 rounded-2xl border border-[#e8e6e3] bg-white p-3.5 shadow-xs">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-[#3f3f3c]" style={{ background: color }}>
              {c.image ? <img src={c.image} alt={c.name} className="h-full w-full rounded-full object-cover" /> : initials}
            </div>
            <div className="min-w-0 flex-1">
              <button type="button" onClick={() => router.push(`/profile/${c.user_id}`)} className="truncate text-sm font-semibold text-[#171717] hover:text-[#1769c2]">
                {c.name}
              </button>
              <p className="truncate text-xs text-[#77716b]">
                {c.profession}{c.specialization ? ` · ${c.specialization}` : ""}
              </p>
              {c.organization && <p className="truncate text-[11px] text-[#a09890]">{c.organization}</p>}
              <p className="text-[11px] text-[#a09890]">Connected {formatRelativeTime(c.connected_at)} ago</p>
            </div>
            <div className="flex shrink-0 gap-1.5">
              <button type="button" onClick={() => router.push(`/profile/${c.user_id}`)} className="rounded-lg border border-[#ded8d1] px-2.5 py-1.5 text-xs font-medium text-[#5d5854] transition hover:bg-[#f8f7f6]">
                View
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────
// Invitations Tab
// ─────────────────────────────────────────────
function InvitationsTab() {
  const router = useRouter();
  const [received, setReceived] = React.useState<Array<{
    id: string; sender_id: string; name: string; image?: string | null;
    message?: string; profession?: string; specialization?: string;
    organization?: string; city?: string; created_at: string;
  }>>([]);
  const [sent, setSent] = React.useState<Array<{
    id: string; receiver_id: string; name: string; image?: string | null;
    profession?: string; specialization?: string; organization?: string; created_at: string;
  }>>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    Promise.all([
      fetch("/api/network/connections?type=received", { credentials: "include" }).then((r) => r.json()),
      fetch("/api/network/connections?type=sent", { credentials: "include" }).then((r) => r.json()),
    ])
      .then(([rec, snt]) => {
        setReceived(rec.data ?? []);
        setSent(snt.data ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleAccept = async (reqId: string) => {
    await fetch(`/api/network/connections/${reqId}`, {
      method: "PATCH", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "accept" }),
    });
    setReceived((prev) => prev.filter((r) => r.id !== reqId));
  };

  const handleIgnore = async (reqId: string) => {
    await fetch(`/api/network/connections/${reqId}`, {
      method: "PATCH", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "ignore" }),
    });
    setReceived((prev) => prev.filter((r) => r.id !== reqId));
  };

  const handleWithdraw = async (reqId: string) => {
    await fetch(`/api/network/connections/${reqId}`, {
      method: "PATCH", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "withdraw" }),
    });
    setSent((prev) => prev.filter((r) => r.id !== reqId));
  };

  if (loading) return <div className="space-y-2"><ListItemSkeleton count={3} /></div>;

  return (
    <div className="space-y-6">
      {/* Received */}
      <section>
        <h3 className="mb-3 text-sm font-semibold text-[#171717]">
          Received <span className="ml-1 text-xs font-normal text-[#77716b]">({received.length})</span>
        </h3>
        {received.length === 0 ? (
          <EmptyState icon="📬" title="No pending requests" description="Connection requests from other healthcare professionals will appear here." />
        ) : (
          <div className="space-y-2">
            {received.map((r) => {
              const color = getProfessionColor(r.profession);
              const initials = (r.name || "U").split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
              return (
                <div key={r.id} className="rounded-2xl border border-[#e8e6e3] bg-white p-4 shadow-xs">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold" style={{ background: color }}>
                      {r.image ? <img src={r.image} alt={r.name} className="h-full w-full rounded-full object-cover" /> : initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <button type="button" onClick={() => router.push(`/profile/${r.sender_id}`)} className="text-sm font-semibold text-[#171717] hover:text-[#1769c2]">{r.name}</button>
                      <p className="text-xs text-[#77716b]">{r.profession}{r.specialization ? ` · ${r.specialization}` : ""}</p>
                      {r.message && <p className="mt-1.5 rounded-lg bg-[#f8f7f6] px-3 py-2 text-xs text-[#5d5854] italic">&ldquo;{r.message}&rdquo;</p>}
                      <p className="mt-1 text-[11px] text-[#a09890]">{formatRelativeTime(r.created_at)} ago</p>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button type="button" onClick={() => handleAccept(r.id)} className="flex-1 rounded-xl bg-[#1769c2] py-2 text-xs font-semibold text-white hover:bg-[#12569f]">Accept</button>
                    <button type="button" onClick={() => handleIgnore(r.id)} className="flex-1 rounded-xl border border-[#ded8d1] py-2 text-xs font-medium text-[#5d5854] hover:bg-[#f8f7f6]">Ignore</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Sent */}
      <section>
        <h3 className="mb-3 text-sm font-semibold text-[#171717]">
          Sent <span className="ml-1 text-xs font-normal text-[#77716b]">({sent.length})</span>
        </h3>
        {sent.length === 0 ? (
          <EmptyState icon="📤" title="No sent requests" description="Requests you've sent will appear here until they are accepted or withdrawn." />
        ) : (
          <div className="space-y-2">
            {sent.map((r) => {
              const color = getProfessionColor(r.profession);
              const initials = (r.name || "U").split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
              return (
                <div key={r.id} className="flex items-center gap-3 rounded-2xl border border-[#e8e6e3] bg-white p-3.5 shadow-xs">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold" style={{ background: color }}>
                    {r.image ? <img src={r.image} alt={r.name} className="h-full w-full rounded-full object-cover" /> : initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[#171717]">{r.name}</p>
                    <p className="text-xs text-[#77716b]">{r.profession}{r.specialization ? ` · ${r.specialization}` : ""}</p>
                  </div>
                  <button type="button" onClick={() => handleWithdraw(r.id)} className="shrink-0 rounded-lg border border-[#ded8d1] px-2.5 py-1.5 text-xs font-medium text-[#5d5854] hover:border-red-300 hover:bg-red-50 hover:text-red-600">Withdraw</button>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

// ─────────────────────────────────────────────
// Following Tab
// ─────────────────────────────────────────────
function FollowingTab({ currentUserId }: { currentUserId: string }) {
  const router = useRouter();
  const [subTab, setSubTab] = React.useState<"following" | "followers">("following");
  const [items, setItems] = React.useState<Array<{ id: string; user_id: string; name: string; image?: string | null; profession?: string; specialization?: string; city?: string; created_at: string }>>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    setLoading(true);
    fetch(`/api/network/follows?type=${subTab}`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setItems(d.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [subTab]);

  const handleUnfollow = async (userId: string) => {
    await fetch(`/api/network/follows?followingId=${userId}`, { method: "DELETE", credentials: "include" });
    setItems((prev) => prev.filter((i) => i.user_id !== userId));
  };

  return (
    <div>
      <div className="mb-4 flex gap-1 rounded-xl border border-[#e8e6e3] bg-[#f8f7f6] p-1 w-fit">
        {(["following", "followers"] as const).map((t) => (
          <button key={t} type="button" onClick={() => setSubTab(t)}
            className={`rounded-lg px-4 py-1.5 text-xs font-medium capitalize transition ${subTab === t ? "bg-white text-[#1769c2] shadow-xs" : "text-[#77716b] hover:text-[#171717]"}`}>
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2"><ListItemSkeleton count={4} /></div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={subTab === "following" ? "🔔" : "👥"}
          title={subTab === "following" ? "You're not following anyone yet" : "No followers yet"}
          description={subTab === "following" ? "Follow healthcare professionals to see their posts and updates in your feed." : "Share your profile to grow your audience."}
        />
      ) : (
        <div className="space-y-2">
          {items.map((item) => {
            const color = getProfessionColor(item.profession);
            const initials = (item.name || "U").split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
            return (
              <div key={item.id} className="flex items-center gap-3 rounded-2xl border border-[#e8e6e3] bg-white p-3.5 shadow-xs">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold" style={{ background: color }}>
                  {item.image ? <img src={item.image} alt={item.name} className="h-full w-full rounded-full object-cover" /> : initials}
                </div>
                <div className="min-w-0 flex-1">
                  <button type="button" onClick={() => router.push(`/profile/${item.user_id}`)} className="text-sm font-semibold text-[#171717] hover:text-[#1769c2]">{item.name}</button>
                  <p className="text-xs text-[#77716b]">{item.profession}{item.specialization ? ` · ${item.specialization}` : ""}{item.city ? ` · ${item.city}` : ""}</p>
                </div>
                <div className="flex shrink-0 gap-1.5">
                  {subTab === "following" && (
                    <button type="button" onClick={() => handleUnfollow(item.user_id)} className="rounded-lg border border-[#ded8d1] px-2.5 py-1.5 text-xs font-medium text-[#5d5854] hover:border-red-300 hover:bg-red-50 hover:text-red-600">Unfollow</button>
                  )}
                  <button type="button" onClick={() => router.push(`/profile/${item.user_id}`)} className="rounded-lg border border-[#ded8d1] px-2.5 py-1.5 text-xs font-medium text-[#5d5854] hover:bg-[#f8f7f6]">View</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN NETWORK PAGE
// ─────────────────────────────────────────────
export default function NetworkPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [activeTab, setActiveTab] = React.useState<ActiveTab>("discover");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [pendingCount, setPendingCount] = React.useState(0);

  React.useEffect(() => {
    if (!isPending && !session) router.replace("/");
  }, [isPending, router, session]);

  // Fetch invitation count for badge
  React.useEffect(() => {
    if (!session?.user) return;
    fetch("/api/network/connections?type=received", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setPendingCount((d.data ?? []).length))
      .catch(() => {});
  }, [session?.user]);

  if (isPending || !session) {
    return (
      <main className="min-h-screen bg-[#f5f5f4] pb-36">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 rounded-xl bg-white/60" />
            <div className="h-10 w-full rounded-xl bg-white/60" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1,2,3,4,5,6].map(i => <div key={i} className="h-48 rounded-2xl bg-white/60" />)}
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f5f4] pb-36 text-[#171717]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        {/* Page Header */}
        <div className="mb-5">
          <h1 className="text-2xl font-semibold tracking-tight">Network</h1>
          <p className="mt-1 text-sm text-[#77716b]">
            Connect with healthcare professionals and grow your professional network.
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-5">
          <svg className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a8784]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search professionals, specialties, organizations..."
            className="h-11 w-full rounded-2xl border border-[#e8e6e3] bg-white pl-10 pr-4 text-sm text-[#171717] placeholder:text-[#8a8784] focus:border-[#1769c2] focus:outline-none focus:ring-2 focus:ring-[#1769c2]/20"
          />
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <NetworkTabs
            activeTab={activeTab}
            onChange={setActiveTab}
            invitationCount={pendingCount}
          />
        </div>

        {/* Two-column layout (discover), single column (others) */}
        {activeTab === "discover" ? (
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
            <div className="flex-1 min-w-0">
              <DiscoverTab currentUserId={session.user.id} searchQuery={searchQuery} />
            </div>
            <NetworkSidebar currentUserId={session.user.id} />
          </div>
        ) : (
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
            <div className="flex-1 min-w-0">
              {activeTab === "connections" && <ConnectionsTab currentUserId={session.user.id} />}
              {activeTab === "invitations" && <InvitationsTab />}
              {activeTab === "following" && <FollowingTab currentUserId={session.user.id} />}
            </div>
            <NetworkSidebar currentUserId={session.user.id} />
          </div>
        )}
      </div>
    </main>
  );
}
