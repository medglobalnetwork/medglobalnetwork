"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

const connections = [
  { id: 1, name: "Arjun Mehta",    role: "Financial Analyst · FinTech Corp",    mutual: 12, initial: "A", color: "#dbeafe" },
  { id: 2, name: "Priya Sharma",   role: "Investment Advisor · WealthEdge",     mutual: 8,  initial: "P", color: "#dcfce7" },
  { id: 3, name: "Rahul Verma",    role: "Tax Consultant · TaxPro India",       mutual: 5,  initial: "R", color: "#fce7f3" },
  { id: 4, name: "Sneha Kapoor",   role: "Crypto Analyst · CryptoVentures",    mutual: 19, initial: "S", color: "#fef9c3" },
  { id: 5, name: "Vikram Singh",   role: "Portfolio Manager · InvestPro",       mutual: 3,  initial: "V", color: "#ede9fe" },
];

const suggestions = [
  { id: 6, name: "Asha Nair",    role: "CA · Deloitte",              initial: "A", color: "#ffedd5" },
  { id: 7, name: "Karan Bajaj",  role: "MBA Finance · IIM Bangalore", initial: "K", color: "#cffafe" },
];

export default function NetworkPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [connected, setConnected] = React.useState<number[]>([]);

  React.useEffect(() => {
    if (!isPending && !session) router.replace("/");
  }, [isPending, router, session]);

  if (isPending || !session) return <main className="min-h-screen bg-[#f5f5f4]" />;

  return (
    <main className="min-h-screen bg-[#f5f5f4] pb-36 text-[#171717]">
      <div className="mx-auto max-w-4xl px-6 py-6 lg:px-12">

        {/* Page header */}
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#77716b]">People</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Network</h1>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a8784]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="search"
            placeholder="Search connections..."
            className="h-10 w-full rounded-xl border border-[#e8e6e3] bg-white pl-9 pr-4 text-sm text-[#171717] placeholder:text-[#8a8784] focus:border-[#1769c2] focus:outline-none focus:ring-2 focus:ring-[#1769c2]/20"
          />
        </div>

        {/* My connections */}
        <section className="mb-8">
          <h2 className="mb-3 text-sm font-semibold text-[#171717]">
            My Connections <span className="ml-1 text-xs font-normal text-[#77716b]">({connections.length})</span>
          </h2>
          <div className="space-y-2">
            {connections.map((c) => (
              <div key={c.id} className="flex items-center gap-3 rounded-2xl border border-[#e8e6e3] bg-white p-3.5 shadow-sm">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-[#3f3f3c]" style={{ background: c.color }}>
                  {c.initial}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[#171717] truncate">{c.name}</p>
                  <p className="text-xs text-[#77716b] truncate">{c.role}</p>
                  <p className="text-[11px] text-[#a09890]">{c.mutual} mutual connections</p>
                </div>
                <button className="shrink-0 rounded-lg border border-[#e8e6e3] px-3 py-1.5 text-xs font-medium text-[#1769c2] transition hover:bg-[#eef5fc]">
                  Message
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Suggestions */}
        <section>
          <h2 className="mb-3 text-sm font-semibold text-[#171717]">People you may know</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {suggestions.map((s) => (
              <div key={s.id} className="flex flex-col items-center rounded-2xl border border-[#e8e6e3] bg-white p-5 shadow-sm text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-full text-xl font-bold text-[#3f3f3c]" style={{ background: s.color }}>
                  {s.initial}
                </span>
                <p className="mt-3 text-sm font-semibold text-[#171717]">{s.name}</p>
                <p className="text-xs text-[#77716b]">{s.role}</p>
                <button
                  onClick={() => setConnected((prev) => prev.includes(s.id) ? prev.filter((id) => id !== s.id) : [...prev, s.id])}
                  className={`mt-4 w-full rounded-xl py-2 text-xs font-semibold transition ${
                    connected.includes(s.id)
                      ? "bg-[#eef5fc] text-[#1769c2]"
                      : "bg-[#1769c2] text-white hover:bg-[#1258a8]"
                  }`}
                >
                  {connected.includes(s.id) ? "✓ Connected" : "+ Connect"}
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
