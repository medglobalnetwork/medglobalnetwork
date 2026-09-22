"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import {
  Building2,
  Users,
  Check,
  Search,
  Bone,
  HeartPulse,
  GraduationCap,
  FlaskConical,
  Stethoscope,
  Activity,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

import { NetworkTabs, type NetworkTab } from "@/modules/network/components/NetworkTabs";
import { NetworkFilters } from "@/modules/network/components/NetworkFilters";
import { ProfessionalCard } from "@/modules/network/components/ProfessionalCard";
import { NetworkSidebar } from "@/modules/network/components/NetworkSidebar";
import { EmptyState } from "@/modules/network/components/EmptyState";
import { ProfessionalCardSkeleton, ListItemSkeleton } from "@/modules/network/components/SkeletonLoader";
import { getProfessionColor, formatRelativeTime } from "@/modules/network/lib/network-data";
import type { ProfessionalProfile, NetworkFilters as Filters } from "@/modules/network/types";

// ─────────────────────────────────────────────
// Discover Tab Component (Center Column)
// ─────────────────────────────────────────────
function DiscoverCenter({
  filters,
  searchQuery,
  viewMode,
}: {
  filters: Filters;
  searchQuery: string;
  viewMode: "grid" | "list";
}) {
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
      if (f.organization) params.set("organization", f.organization);
      if (f.verified_only) params.set("verified", "true");
      if (f.experience_min !== undefined) params.set("expMin", String(f.experience_min));
      if (f.experience_max !== undefined) params.set("expMax", String(f.experience_max));
      const effectiveQuery = f.query || q;
      if (effectiveQuery) params.set("q", effectiveQuery);
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
        setProfiles([]);
        setHasMore(false);
      }
    } catch {
      setProfiles([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    setPage(1);
    load(filters, 1, searchQuery);
  }, [filters, searchQuery, load]);

  const handleLoadMore = () => {
    const next = page + 1;
    setPage(next);
    load(filters, next, searchQuery);
  };

  if (loading && page === 1) {
    return (
      <div className={viewMode === "grid" ? "grid grid-cols-2 gap-2.5 sm:gap-4" : "space-y-3"}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <ProfessionalCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (profiles.length === 0) {
    return (
      <EmptyState
        icon="🔍"
        title="No professionals found"
        description="Try adjusting your filters or search query to find healthcare professionals."
      />
    );
  }

  return (
    <div>
      <div className={viewMode === "grid" ? "grid grid-cols-2 gap-2.5 sm:gap-4" : "space-y-3"}>
        {profiles.map((p) => (
          <ProfessionalCard key={p.user_id} profile={p} variant={viewMode} />
        ))}
      </div>
      {hasMore && (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={loading}
            className="rounded-xl border border-[#ded8d1] bg-white px-6 py-2.5 text-xs font-semibold text-[#5d5854] shadow-xs transition hover:bg-[#f8f7f6] disabled:opacity-50"
          >
            {loading ? "Loading…" : "Load More"}
          </button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// My Network Tab
// ─────────────────────────────────────────────
function ConnectionsTab() {
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
      />
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium text-[#77716b]">
        {connections.length} connection{connections.length !== 1 ? "s" : ""}
      </p>
      {connections.map((c) => {
        const color = getProfessionColor(c.profession);
        const initials = (c.name || "U").split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
        return (
          <div key={c.id} className="flex items-center gap-3.5 rounded-2xl border border-[#e8e6e3] bg-white p-4 shadow-xs">
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
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => router.push(`/messages?to=${c.user_id}`)}
                className="rounded-xl border border-[#ded8d1] px-3 py-1.5 text-xs font-semibold text-[#5d5854] transition hover:bg-[#f8f7f6]"
              >
                Message
              </button>
              <button
                type="button"
                onClick={() => router.push(`/profile/${c.user_id}`)}
                className="rounded-xl border border-[#ded8d1] px-3 py-1.5 text-xs font-semibold text-[#5d5854] transition hover:bg-[#f8f7f6]"
              >
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
        <h3 className="mb-3 text-sm font-bold text-[#171717]">
          Received Requests <span className="ml-1 text-xs font-normal text-[#77716b]">({received.length})</span>
        </h3>
        {received.length === 0 ? (
          <EmptyState icon="📬" title="No pending requests" description="Connection requests from other healthcare professionals will appear here." />
        ) : (
          <div className="space-y-3">
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
                      <button type="button" onClick={() => router.push(`/profile/${r.sender_id}`)} className="text-sm font-bold text-[#171717] hover:text-[#1769c2]">{r.name}</button>
                      <p className="text-xs text-[#77716b]">{r.profession}{r.specialization ? ` · ${r.specialization}` : ""}</p>
                      {r.message && <p className="mt-1.5 rounded-xl bg-[#f8f7f6] px-3 py-2 text-xs text-[#5d5854] italic">&ldquo;{r.message}&rdquo;</p>}
                      <p className="mt-1 text-[11px] text-[#a09890]">{formatRelativeTime(r.created_at)} ago</p>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button type="button" onClick={() => handleAccept(r.id)} className="flex-1 rounded-xl bg-[#1769c2] py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#12569f]">Accept</button>
                    <button type="button" onClick={() => handleIgnore(r.id)} className="flex-1 rounded-xl border border-[#ded8d1] py-2 text-xs font-semibold text-[#5d5854] hover:bg-[#f8f7f6]">Ignore</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Sent */}
      <section>
        <h3 className="mb-3 text-sm font-bold text-[#171717]">
          Sent Requests <span className="ml-1 text-xs font-normal text-[#77716b]">({sent.length})</span>
        </h3>
        {sent.length === 0 ? (
          <EmptyState icon="📤" title="No sent requests" description="Requests you've sent will appear here until they are accepted or withdrawn." />
        ) : (
          <div className="space-y-3">
            {sent.map((r) => {
              const color = getProfessionColor(r.profession);
              const initials = (r.name || "U").split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
              return (
                <div key={r.id} className="flex items-center gap-3 rounded-2xl border border-[#e8e6e3] bg-white p-4 shadow-xs">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold" style={{ background: color }}>
                    {r.image ? <img src={r.image} alt={r.name} className="h-full w-full rounded-full object-cover" /> : initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-[#171717]">{r.name}</p>
                    <p className="text-xs text-[#77716b]">{r.profession}{r.specialization ? ` · ${r.specialization}` : ""}</p>
                  </div>
                  <button type="button" onClick={() => handleWithdraw(r.id)} className="shrink-0 rounded-xl border border-[#ded8d1] px-3 py-1.5 text-xs font-semibold text-[#5d5854] hover:border-red-300 hover:bg-red-50 hover:text-red-600">Withdraw</button>
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
function FollowingTab() {
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
            className={`rounded-lg px-4 py-1.5 text-xs font-semibold capitalize transition ${subTab === t ? "bg-white text-[#1769c2] shadow-xs" : "text-[#77716b] hover:text-[#171717]"}`}>
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
        <div className="space-y-3">
          {items.map((item) => {
            const color = getProfessionColor(item.profession);
            const initials = (item.name || "U").split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
            return (
              <div key={item.id} className="flex items-center gap-3.5 rounded-2xl border border-[#e8e6e3] bg-white p-4 shadow-xs">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold" style={{ background: color }}>
                  {item.image ? <img src={item.image} alt={item.name} className="h-full w-full rounded-full object-cover" /> : initials}
                </div>
                <div className="min-w-0 flex-1">
                  <button type="button" onClick={() => router.push(`/profile/${item.user_id}`)} className="text-sm font-bold text-[#171717] hover:text-[#1769c2]">{item.name}</button>
                  <p className="text-xs text-[#77716b]">{item.profession}{item.specialization ? ` · ${item.specialization}` : ""}{item.city ? ` · ${item.city}` : ""}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  {subTab === "following" && (
                    <button type="button" onClick={() => handleUnfollow(item.user_id)} className="rounded-xl border border-[#ded8d1] px-3 py-1.5 text-xs font-semibold text-[#5d5854] hover:border-red-300 hover:bg-red-50 hover:text-red-600">Unfollow</button>
                  )}
                  <button type="button" onClick={() => router.push(`/profile/${item.user_id}`)} className="rounded-xl border border-[#ded8d1] px-3 py-1.5 text-xs font-semibold text-[#5d5854] hover:bg-[#f8f7f6]">View</button>
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
// Communities Tab
// ─────────────────────────────────────────────
function CommunitiesTab() {
  const router = useRouter();
  const [communities, setCommunities] = React.useState<any[]>([]);
  const [joinedSlugs, setJoinedSlugs] = React.useState<Set<string>>(new Set());
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch("/api/network/communities", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (d?.communities) {
          setCommunities(d.communities);
          const initialJoined = new Set<string>();
          d.communities.forEach((c: any) => {
            if (c.is_member) initialJoined.add(c.slug);
          });
          setJoinedSlugs(initialJoined);
        }
      })
      .catch((err) => console.error("Error fetching communities:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleJoin = async (community: any) => {
    const isCurrentlyJoined = joinedSlugs.has(community.slug);
    setJoinedSlugs((prev) => {
      const next = new Set(prev);
      if (isCurrentlyJoined) next.delete(community.slug);
      else next.add(community.slug);
      return next;
    });

    try {
      if (isCurrentlyJoined) {
        await fetch(`/api/network/communities/${community.slug}/members`, {
          method: "DELETE",
          credentials: "include",
        });
      } else {
        await fetch(`/api/network/communities/${community.slug}/members`, {
          method: "POST",
          credentials: "include",
        });
      }
    } catch (err) {
      console.error("Failed to toggle community membership:", err);
    }
  };

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-36 rounded-2xl bg-white border border-[#e8e6e3] p-4 animate-pulse" />
        ))}
      </div>
    );
  }

  if (communities.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[#ded8d1] bg-white p-12 text-center">
        <Users className="mx-auto h-12 w-12 text-[#a09890]" />
        <h3 className="mt-3 text-base font-bold text-[#171717]">No Communities Yet</h3>
        <p className="mt-1 text-xs text-[#77716b] max-w-sm mx-auto">
          Clinical specialty hubs and verified practitioner groups will appear here once created.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {communities.map((c) => {
        const isJoined = joinedSlugs.has(c.slug);
        return (
          <div
            key={c.id || c.slug}
            className="flex flex-col justify-between rounded-2xl border border-[#e8e6e3] bg-white p-4 shadow-xs transition hover:border-[#1769c2]/30 hover:shadow-sm"
          >
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f4f3f0] text-[#1769c2] font-bold overflow-hidden">
                  {c.cover_url ? (
                    <img src={c.cover_url} alt={c.name} className="h-full w-full rounded-xl object-cover" />
                  ) : (
                    <Users className="h-5 w-5 text-[#1769c2]" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="truncate text-sm font-bold text-[#171717]">{c.name}</h4>
                  <p className="text-xs text-[#77716b]">
                    {(c.member_count ?? 0).toLocaleString()} {c.member_count === 1 ? "member" : "members"}
                  </p>
                </div>
              </div>
              {c.description && (
                <p className="mt-2.5 line-clamp-2 text-xs text-[#5d5854] leading-relaxed">
                  {c.description}
                </p>
              )}
            </div>
            <div className="mt-4 flex items-center gap-2 pt-2 border-t border-[#f0efee]">
              <button
                type="button"
                onClick={() => handleJoin(c)}
                className={`flex-1 rounded-xl py-2 text-center text-xs font-semibold transition ${
                  isJoined
                    ? "bg-[#eef5fc] text-[#1769c2] border border-[#1769c2]/20"
                    : "bg-[#1769c2] text-white shadow-xs hover:bg-[#12569f]"
                }`}
              >
                {isJoined ? "Joined ✓" : "Join Community"}
              </button>
              <button
                type="button"
                onClick={() => router.push(`/network/communities/${c.slug}`)}
                className="rounded-xl border border-[#ded8d1] px-3 py-2 text-xs font-semibold text-[#5d5854] hover:bg-[#f8f7f6]"
              >
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
// Organizations Tab
// ─────────────────────────────────────────────
function OrganizationsTab() {
  const router = useRouter();
  const [organizations, setOrganizations] = React.useState<any[]>([]);
  const [followedIds, setFollowedIds] = React.useState<Set<string>>(new Set());
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch("/api/opportunities/organizations", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (d?.organizations) {
          setOrganizations(d.organizations);
        }
      })
      .catch((err) => console.error("Error fetching organizations:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleFollow = (id: string) => {
    setFollowedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-36 rounded-2xl bg-white border border-[#e8e6e3] p-4 animate-pulse" />
        ))}
      </div>
    );
  }

  if (organizations.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[#ded8d1] bg-white p-12 text-center">
        <Building2 className="mx-auto h-12 w-12 text-[#a09890]" />
        <h3 className="mt-3 text-base font-bold text-[#171717]">No Organizations Listed Yet</h3>
        <p className="mt-1 text-xs text-[#77716b] max-w-sm mx-auto">
          Hospitals, clinics, and medical institutes will appear here once registered and verified.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {organizations.map((org) => {
        const isFollowed = followedIds.has(org.id);
        const locationStr = [org.city, org.state].filter(Boolean).join(", ");
        return (
          <div
            key={org.id}
            className="flex flex-col justify-between rounded-2xl border border-[#e8e6e3] bg-white p-4 shadow-xs transition hover:border-[#1769c2]/30 hover:shadow-sm"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#eef5fc] text-[#1769c2] overflow-hidden">
                {org.logo_url ? (
                  <img src={org.logo_url} alt={org.name} className="h-full w-full object-cover" />
                ) : (
                  <Building2 className="h-5 w-5" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  <h4 className="truncate text-sm font-bold text-[#171717]">{org.name}</h4>
                  {org.verification_status === "verified" && (
                    <CheckCircle2 className="h-3.5 w-3.5 fill-[#1769c2]/10 text-[#1769c2]" />
                  )}
                </div>
                <p className="text-xs font-medium text-[#77716b]">{org.organization_type || "Healthcare Organization"}</p>
                {(locationStr || org.active_jobs_count > 0) && (
                  <p className="mt-1 text-[11px] text-[#a09890]">
                    {[locationStr, org.active_jobs_count > 0 ? `${org.active_jobs_count} open jobs` : null].filter(Boolean).join(" · ")}
                  </p>
                )}
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 pt-2 border-t border-[#f0efee]">
              <button
                type="button"
                onClick={() => handleFollow(org.id)}
                className={`flex-1 rounded-xl py-2 text-center text-xs font-semibold transition ${
                  isFollowed
                    ? "bg-[#eef5fc] text-[#1769c2] border border-[#1769c2]/20"
                    : "bg-[#1769c2] text-white shadow-xs hover:bg-[#12569f]"
                }`}
              >
                {isFollowed ? "Following ✓" : "Follow Organization"}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN NETWORK PAGE (3-Column Layout)
// ─────────────────────────────────────────────
export default function NetworkPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [activeTab, setActiveTab] = React.useState<NetworkTab>("discover");
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filters, setFilters] = React.useState<Filters>({});
  const [pendingCount, setPendingCount] = React.useState(0);

  React.useEffect(() => {
    if (!isPending && !session) router.replace("/");
  }, [isPending, router, session]);

  // Fetch pending invitations count for tab badge
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
        <div className="mx-auto max-w-[1440px] px-2 py-4 sm:px-4 lg:px-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 rounded-xl bg-white/60" />
            <div className="h-10 w-full rounded-xl bg-white/60" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-48 rounded-2xl bg-white/60" />
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f5f4] pb-24 md:pb-12 text-[#171717]">
      <div className="mx-auto max-w-[1440px] px-2 py-4 sm:px-4 lg:px-6">
        {/* Page Header */}
        <div className="mb-5">
          <h1 className="text-2xl font-bold tracking-tight text-[#171717]">Network</h1>
          <p className="mt-1 text-xs sm:text-sm text-[#77716b]">
            Connect with healthcare professionals and grow your professional network.
          </p>
        </div>

        {/* Secondary Tabs Bar with View Switcher */}
        <div className="mb-6">
          <NetworkTabs
            activeTab={activeTab}
            onChange={setActiveTab}
            invitationCount={pendingCount}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        </div>

        {/* 3-Column Desktop Layout */}
        <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-12">
          {/* Left Column: Filters (col-span-3) */}
          <div className="lg:col-span-3">
            <NetworkFilters
              filters={filters}
              onChange={(f) => setFilters(f)}
              onReset={() => setFilters({})}
            />
          </div>

          {/* Center Column: Active Tab Content / Doctor Grid (col-span-6) */}
          <div className="min-w-0 lg:col-span-6">
            {activeTab === "discover" && (
              <DiscoverCenter
                filters={filters}
                searchQuery={searchQuery}
                viewMode={viewMode}
              />
            )}
            {activeTab === "connections" && <ConnectionsTab />}
            {activeTab === "invitations" && <InvitationsTab />}
            {activeTab === "following" && <FollowingTab />}
            {activeTab === "communities" && <CommunitiesTab />}
            {activeTab === "organizations" && <OrganizationsTab />}
          </div>

          {/* Right Column: Widgets Sidebar (col-span-3) */}
          <div className="lg:col-span-3">
            <NetworkSidebar currentUserId={session.user.id} />
          </div>
        </div>
      </div>
    </main>
  );
}
