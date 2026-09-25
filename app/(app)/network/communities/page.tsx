"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { CommunityCard } from "@/modules/network/components/CommunityCard";
import { EmptyState } from "@/modules/network/components/EmptyState";
import { CommunityCardSkeleton } from "@/modules/network/components/SkeletonLoader";
import type { Community } from "@/modules/network/types";

export default function CommunitiesPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [communities, setCommunities] = React.useState<Community[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [activeFilter, setActiveFilter] = React.useState<"all" | "joined">("all");

  React.useEffect(() => {
    if (!isPending && !session) router.replace("/");
  }, [isPending, router, session]);

  React.useEffect(() => {
    if (!session?.user) return;
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (activeFilter === "joined") params.set("joined", "true");

    fetch(`/api/network/communities?${params}`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setCommunities(d.data ?? []))
      .catch(() => setCommunities([]))
      .finally(() => setLoading(false));
  }, [session?.user, search, activeFilter]);

  if (isPending || !session) return <main className="min-h-dvh bg-[#f5f5f4]" />;

  const SPECIALTIES = ["All", "Cardiology", "Physiotherapy", "Nursing", "Medical Students", "Clinical Research", "Sports Medicine", "Radiology", "Pediatrics"];
  const [selectedSpecialty, setSelectedSpecialty] = React.useState("All");

  const displayed = selectedSpecialty === "All"
    ? communities
    : communities.filter((c) => c.specialty === selectedSpecialty);

  return (
    <main className="min-h-dvh bg-[#f5f5f4] pb-36 text-[#171717]">
      <div className="mx-auto max-w-6xl px-2 py-4 sm:px-4 lg:px-6">

        {/* Header */}
        <div className="mb-5 flex items-center gap-3">
          <button type="button" onClick={() => router.push("/network")} className="flex items-center gap-1.5 text-xs font-medium text-[#77716b] hover:text-[#1769c2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1769c2] rounded">
            <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6" /></svg>
            Network
          </button>
          <span className="text-[#ded8d1]">/</span>
          <h1 className="text-lg font-semibold">Communities</h1>
        </div>

        <p className="mb-5 text-sm text-[#77716b]">
          Join healthcare communities to connect with peers, share knowledge, and stay updated in your specialty.
        </p>

        {/* Search */}
        <div className="relative mb-4">
          <svg className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a8784]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search communities..."
            className="h-11 w-full rounded-2xl border border-[#e8e6e3] bg-white pl-10 pr-4 text-sm placeholder:text-[#8a8784] focus:border-[#1769c2] focus:outline-none focus:ring-2 focus:ring-[#1769c2]/20"
          />
        </div>

        {/* Filter chips: All / Joined */}
        <div className="mb-4 flex gap-2">
          {(["all", "joined"] as const).map((f) => (
            <button key={f} type="button" onClick={() => setActiveFilter(f)}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-medium capitalize transition ${activeFilter === f ? "border-[#1769c2] bg-[#eef5fc] text-[#1769c2]" : "border-[#ded8d1] bg-white text-[#5d5854] hover:border-[#1769c2]"}`}>
              {f === "all" ? "All Communities" : "Joined"}
            </button>
          ))}
        </div>

        {/* Specialty chips */}
        <div className="mb-6 flex flex-wrap gap-1.5">
          {SPECIALTIES.map((s) => (
            <button key={s} type="button" onClick={() => setSelectedSpecialty(s)}
              className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition ${selectedSpecialty === s ? "border-[#1769c2] bg-[#eef5fc] text-[#1769c2]" : "border-[#ded8d1] bg-white text-[#5d5854] hover:border-[#1769c2]"}`}>
              {s}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => <CommunityCardSkeleton key={i} />)}
          </div>
        ) : displayed.length === 0 ? (
          <EmptyState
            icon="👥"
            title="No communities found"
            description={activeFilter === "joined" ? "You haven't joined any communities yet." : "No communities match your search."}
            actionText={activeFilter === "joined" ? "Browse All Communities" : "Clear Search"}
            onAction={() => { setActiveFilter("all"); setSearch(""); setSelectedSpecialty("All"); }}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {displayed.map((c) => (
              <CommunityCard key={c.id} community={c} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
