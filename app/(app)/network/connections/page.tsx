"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { EmptyState } from "@/modules/network/components/EmptyState";
import { ListItemSkeleton } from "@/modules/network/components/SkeletonLoader";
import { getProfessionColor, formatRelativeTime } from "@/modules/network/lib/network-data";

type Tab = "connections" | "received" | "sent" | "following" | "followers";

export default function MyNetworkPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [activeTab, setActiveTab] = React.useState<Tab>("connections");

  const [connections, setConnections] = React.useState<Array<{
    id: string;
    user_id: string;
    name: string;
    image?: string | null;
    profession?: string;
    specialization?: string;
    organization?: string;
    city?: string;
    connected_at: string;
  }>>([]);

  const [received, setReceived] = React.useState<Array<{
    id: string;
    sender_id: string;
    name: string;
    image?: string | null;
    message?: string;
    profession?: string;
    specialization?: string;
    organization?: string;
    city?: string;
    created_at: string;
  }>>([]);

  const [sent, setSent] = React.useState<Array<{
    id: string;
    receiver_id: string;
    name: string;
    image?: string | null;
    profession?: string;
    specialization?: string;
    organization?: string;
    created_at: string;
  }>>([]);

  const [following, setFollowing] = React.useState<Array<{
    id: string;
    user_id: string;
    name: string;
    image?: string | null;
    profession?: string;
    specialization?: string;
    city?: string;
    created_at: string;
  }>>([]);

  const [followers, setFollowers] = React.useState<Array<{
    id: string;
    user_id: string;
    name: string;
    image?: string | null;
    profession?: string;
    specialization?: string;
    city?: string;
    created_at: string;
  }>>([]);

  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!isPending && !session) router.replace("/");
  }, [isPending, router, session]);

  const loadData = React.useCallback(async () => {
    if (!session?.user) return;
    setLoading(true);
    try {
      const [connRes, recRes, sentRes, folRes, fowRes] = await Promise.all([
        fetch("/api/network/connections?type=connections", { credentials: "include" }),
        fetch("/api/network/connections?type=received", { credentials: "include" }),
        fetch("/api/network/connections?type=sent", { credentials: "include" }),
        fetch("/api/network/follows?type=following", { credentials: "include" }),
        fetch("/api/network/follows?type=followers", { credentials: "include" }),
      ]);

      const [connData, recData, sentData, folData, fowData] = await Promise.all([
        connRes.json(),
        recRes.json(),
        sentRes.json(),
        folRes.json(),
        fowRes.json(),
      ]);

      setConnections(connData.data ?? []);
      setReceived(recData.data ?? []);
      setSent(sentData.data ?? []);
      setFollowing(folData.data ?? []);
      setFollowers(fowData.data ?? []);
    } catch (err) {
      console.error("Failed to load network data:", err);
    } finally {
      setLoading(false);
    }
  }, [session?.user]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRemoveConnection = async (id: string) => {
    if (!confirm("Are you sure you want to remove this connection?")) return;
    try {
      await fetch(`/api/network/connections/${id}`, { method: "DELETE", credentials: "include" });
      setConnections((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAccept = async (reqId: string) => {
    await fetch(`/api/network/connections/${reqId}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "accept" }),
    });
    loadData();
  };

  const handleIgnore = async (reqId: string) => {
    await fetch(`/api/network/connections/${reqId}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "ignore" }),
    });
    setReceived((prev) => prev.filter((r) => r.id !== reqId));
  };

  const handleWithdraw = async (reqId: string) => {
    await fetch(`/api/network/connections/${reqId}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "withdraw" }),
    });
    setSent((prev) => prev.filter((s) => s.id !== reqId));
  };

  const handleUnfollow = async (userId: string) => {
    await fetch(`/api/network/follows?followingId=${userId}`, {
      method: "DELETE",
      credentials: "include",
    });
    setFollowing((prev) => prev.filter((f) => f.user_id !== userId));
  };

  if (isPending || !session) return <main className="min-h-screen bg-[#f5f5f4]" />;

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: "connections", label: "Connections", count: connections.length },
    { id: "received",    label: "Received",    count: received.length },
    { id: "sent",        label: "Sent",        count: sent.length },
    { id: "following",   label: "Following",   count: following.length },
    { id: "followers",   label: "Followers",   count: followers.length },
  ];

  return (
    <main className="min-h-screen bg-[#f5f5f4] pb-36 text-[#171717]">
      <div className="mx-auto max-w-5xl px-2 py-4 sm:px-4 lg:px-6">

        {/* Breadcrumb Header */}
        <div className="mb-5 flex items-center gap-2 text-xs text-[#77716b]">
          <button type="button" onClick={() => router.push("/network")} className="hover:text-[#1769c2]">
            Network
          </button>
          <span>/</span>
          <span className="text-[#171717] font-medium">My Network</span>
        </div>

        <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">My Network</h1>
            <p className="mt-0.5 text-xs text-[#77716b]">
              Manage your healthcare connections, pending requests, and followers.
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.push("/network")}
            className="self-start rounded-xl bg-[#1769c2] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#12569f]"
          >
            + Grow Network
          </button>
        </div>

        {/* 5 Tabs */}
        <div className="mb-6 flex gap-1 overflow-x-auto rounded-xl border border-[#e8e6e3] bg-[#f8f7f6] p-1 scrollbar-none">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-medium transition ${
                activeTab === tab.id
                  ? "bg-white text-[#1769c2] shadow-xs"
                  : "text-[#77716b] hover:text-[#171717]"
              }`}
            >
              {tab.label}
              <span className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                activeTab === tab.id ? "bg-[#eef5fc] text-[#1769c2]" : "bg-[#ded8d1] text-[#5d5854]"
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {loading ? (
          <div className="space-y-2.5">
            <ListItemSkeleton count={5} />
          </div>
        ) : (
          <>
            {/* Connections */}
            {activeTab === "connections" && (
              connections.length === 0 ? (
                <EmptyState
                  icon="🤝"
                  title="No connections yet"
                  description="Start building your healthcare network by connecting with doctors, therapists, and peers."
                  actionText="Discover Professionals"
                  onAction={() => router.push("/network")}
                />
              ) : (
                <div className="space-y-2.5">
                  {connections.map((c) => {
                    const color = getProfessionColor(c.profession);
                    const initials = (c.name || "U").split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
                    return (
                      <div key={c.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-[#e8e6e3] bg-white p-4 shadow-xs">
                        <div className="flex items-center gap-3 min-w-0">
                          <button type="button" onClick={() => router.push(`/profile/${c.user_id}`)} className="shrink-0">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold text-[#3f3f3c]" style={{ background: color }}>
                              {c.image ? <img src={c.image} alt={c.name} className="h-full w-full rounded-full object-cover" /> : initials}
                            </div>
                          </button>
                          <div className="min-w-0 flex-1">
                            <button type="button" onClick={() => router.push(`/profile/${c.user_id}`)} className="text-sm font-semibold text-[#171717] hover:text-[#1769c2] hover:underline truncate block">
                              {c.name}
                            </button>
                            <p className="text-xs text-[#77716b] truncate">{c.profession}{c.specialization ? ` · ${c.specialization}` : ""}</p>
                            {c.organization && <p className="text-[11px] text-[#a09890] truncate">{c.organization}</p>}
                            {c.connected_at && <p className="text-[10px] text-[#a09890]">Connected {formatRelativeTime(c.connected_at)} ago</p>}
                          </div>
                        </div>

                        {/* Actions: Message, View Profile, Remove Connection */}
                        <div className="flex items-center gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0">
                          <button
                            type="button"
                            onClick={() => router.push(`/home`)}
                            className="rounded-xl bg-[#1769c2] px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-[#12569f]"
                          >
                            Message
                          </button>
                          <button
                            type="button"
                            onClick={() => router.push(`/profile/${c.user_id}`)}
                            className="rounded-xl border border-[#ded8d1] px-3.5 py-1.5 text-xs font-medium text-[#5d5854] transition hover:bg-[#f8f7f6]"
                          >
                            View Profile
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveConnection(c.id)}
                            className="rounded-xl border border-[#ded8d1] p-1.5 text-xs text-[#8a8784] hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                            title="Remove connection"
                          >
                            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            )}

            {/* Received Requests */}
            {activeTab === "received" && (
              received.length === 0 ? (
                <EmptyState icon="📬" title="No pending requests" description="You have no incoming connection requests." />
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
                            <button type="button" onClick={() => router.push(`/profile/${r.sender_id}`)} className="text-sm font-semibold text-[#171717] hover:text-[#1769c2]">{r.name}</button>
                            <p className="text-xs text-[#77716b]">{r.profession}{r.specialization ? ` · ${r.specialization}` : ""}</p>
                            {r.message && <p className="mt-2 rounded-xl bg-[#f8f7f6] p-3 text-xs text-[#5d5854] italic">&ldquo;{r.message}&rdquo;</p>}
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
              )
            )}

            {/* Sent Requests */}
            {activeTab === "sent" && (
              sent.length === 0 ? (
                <EmptyState icon="📤" title="No sent requests" description="You have not sent any pending connection requests." />
              ) : (
                <div className="space-y-2.5">
                  {sent.map((s) => {
                    const color = getProfessionColor(s.profession);
                    const initials = (s.name || "U").split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
                    return (
                      <div key={s.id} className="flex items-center justify-between gap-3 rounded-2xl border border-[#e8e6e3] bg-white p-3.5 shadow-xs">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold" style={{ background: color }}>
                            {s.image ? <img src={s.image} alt={s.name} className="h-full w-full rounded-full object-cover" /> : initials}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-[#171717]">{s.name}</p>
                            <p className="text-xs text-[#77716b]">{s.profession}{s.specialization ? ` · ${s.specialization}` : ""}</p>
                          </div>
                        </div>
                        <button type="button" onClick={() => handleWithdraw(s.id)} className="shrink-0 rounded-xl border border-[#ded8d1] px-3 py-1.5 text-xs font-medium text-[#5d5854] hover:border-red-300 hover:bg-red-50 hover:text-red-600">
                          Withdraw
                        </button>
                      </div>
                    );
                  })}
                </div>
              )
            )}

            {/* Following */}
            {activeTab === "following" && (
              following.length === 0 ? (
                <EmptyState icon="🔔" title="You're not following anyone yet" description="Follow healthcare leaders, clinical researchers, and institutions to see their updates." />
              ) : (
                <div className="space-y-2.5">
                  {following.map((f) => {
                    const color = getProfessionColor(f.profession);
                    const initials = (f.name || "U").split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
                    return (
                      <div key={f.id} className="flex items-center justify-between gap-3 rounded-2xl border border-[#e8e6e3] bg-white p-3.5 shadow-xs">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold" style={{ background: color }}>
                            {f.image ? <img src={f.image} alt={f.name} className="h-full w-full rounded-full object-cover" /> : initials}
                          </div>
                          <div className="min-w-0 flex-1">
                            <button type="button" onClick={() => router.push(`/profile/${f.user_id}`)} className="text-sm font-semibold text-[#171717] hover:text-[#1769c2] block truncate">
                              {f.name}
                            </button>
                            <p className="text-xs text-[#77716b] truncate">{f.profession}{f.specialization ? ` · ${f.specialization}` : ""}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button type="button" onClick={() => handleUnfollow(f.user_id)} className="rounded-xl border border-[#ded8d1] px-3 py-1.5 text-xs font-medium text-[#5d5854] hover:border-red-300 hover:bg-red-50 hover:text-red-600">
                            Unfollow
                          </button>
                          <button type="button" onClick={() => router.push(`/profile/${f.user_id}`)} className="rounded-xl border border-[#ded8d1] px-3 py-1.5 text-xs font-medium text-[#5d5854] hover:bg-[#f8f7f6]">
                            View
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            )}

            {/* Followers */}
            {activeTab === "followers" && (
              followers.length === 0 ? (
                <EmptyState icon="👥" title="No followers yet" description="Grow your professional presence by posting clinical insights and participating in communities." />
              ) : (
                <div className="space-y-2.5">
                  {followers.map((f) => {
                    const color = getProfessionColor(f.profession);
                    const initials = (f.name || "U").split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
                    return (
                      <div key={f.id} className="flex items-center justify-between gap-3 rounded-2xl border border-[#e8e6e3] bg-white p-3.5 shadow-xs">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold" style={{ background: color }}>
                            {f.image ? <img src={f.image} alt={f.name} className="h-full w-full rounded-full object-cover" /> : initials}
                          </div>
                          <div className="min-w-0 flex-1">
                            <button type="button" onClick={() => router.push(`/profile/${f.user_id}`)} className="text-sm font-semibold text-[#171717] hover:text-[#1769c2] block truncate">
                              {f.name}
                            </button>
                            <p className="text-xs text-[#77716b] truncate">{f.profession}{f.specialization ? ` · ${f.specialization}` : ""}</p>
                          </div>
                        </div>
                        <button type="button" onClick={() => router.push(`/profile/${f.user_id}`)} className="rounded-xl border border-[#ded8d1] px-3.5 py-1.5 text-xs font-medium text-[#5d5854] hover:bg-[#f8f7f6]">
                          View
                        </button>
                      </div>
                    );
                  })}
                </div>
              )
            )}
          </>
        )}
      </div>
    </main>
  );
}
