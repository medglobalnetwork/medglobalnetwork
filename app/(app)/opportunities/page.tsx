"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

const opportunities = [
  {
    id: 1, company: "FinTech Corp", role: "Junior Financial Analyst",
    type: "Full-time", location: "Remote", badge: "New", badgeColor: "#dcfce7", badgeText: "#15803d",
  },
  {
    id: 2, company: "InvestPro Ltd", role: "Investment Research Intern",
    type: "Internship", location: "Mumbai", badge: "Hot", badgeColor: "#fee2e2", badgeText: "#dc2626",
  },
  {
    id: 3, company: "WealthEdge", role: "Financial Advisor Trainee",
    type: "Full-time", location: "Delhi", badge: null, badgeColor: "", badgeText: "",
  },
  {
    id: 4, company: "CryptoVentures", role: "Blockchain Analyst",
    type: "Contract", location: "Remote", badge: "Urgent", badgeColor: "#fef9c3", badgeText: "#854d0e",
  },
];

const filters = ["All", "Full-time", "Internship", "Contract", "Remote"];

export default function OpportunitiesPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [activeFilter, setActiveFilter] = React.useState("All");

  React.useEffect(() => {
    if (!isPending && !session) router.replace("/");
  }, [isPending, router, session]);

  if (isPending || !session) return <main className="min-h-screen bg-[#f5f5f4]" />;

  const filtered = opportunities.filter(
    (o) => activeFilter === "All" || o.type === activeFilter || (activeFilter === "Remote" && o.location === "Remote")
  );

  return (
    <main className="min-h-screen bg-[#f5f5f4] pb-36 text-[#171717]">
      <div className="mx-auto max-w-4xl px-6 py-6 lg:px-12">

        {/* Page header */}
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#77716b]">Career</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Opportunities</h1>
        </div>

        {/* Search bar */}
        <div className="relative mb-5">
          <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a8784]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="search"
            placeholder="Search roles, companies..."
            className="h-10 w-full rounded-xl border border-[#e8e6e3] bg-white pl-9 pr-4 text-sm text-[#171717] placeholder:text-[#8a8784] focus:border-[#1769c2] focus:outline-none focus:ring-2 focus:ring-[#1769c2]/20"
          />
        </div>

        {/* Filters */}
        <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
          {filters.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setActiveFilter(f)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                activeFilter === f
                  ? "bg-[#1769c2] text-white"
                  : "border border-[#e8e6e3] bg-white text-[#5d5854] hover:border-[#1769c2] hover:text-[#1769c2]"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Listings */}
        <div className="space-y-3">
          {filtered.map((opp) => (
            <div key={opp.id} className="rounded-2xl border border-[#e8e6e3] bg-white p-4 shadow-sm transition hover:shadow-md cursor-pointer">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eef5fc] text-sm font-bold text-[#1769c2]">
                    {opp.company.slice(0, 1)}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-[#171717]">{opp.role}</p>
                    <p className="text-xs text-[#77716b]">{opp.company} · {opp.location}</p>
                  </div>
                </div>
                {opp.badge && (
                  <span className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: opp.badgeColor, color: opp.badgeText }}>
                    {opp.badge}
                  </span>
                )}
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="rounded-full border border-[#e8e6e3] px-2.5 py-0.5 text-[11px] font-medium text-[#5d5854]">{opp.type}</span>
                <button className="text-xs font-semibold text-[#1769c2] hover:underline">Apply →</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
