"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

const products = [
  { id: 1, name: "Precision Clinical Stethoscope", price: "₹2,499", category: "Clinical Equipment", emoji: "🩺", tag: "Bestseller" },
  { id: 2, name: "Advanced Dry Needling Kit & Guide", price: "₹1,899", category: "Rehab Tools", emoji: "🎯", tag: "Popular" },
  { id: 3, name: "Sports Rehabilitation Protocols 2026", price: "₹799", category: "Books & Guides", emoji: "📖", tag: "Essential" },
  { id: 4, name: "Digital Goniometer & Joint Angle Sensor", price: "₹3,299", category: "Clinical Equipment", emoji: "📐", tag: "Top Rated" },
  { id: 5, name: "Clinical Trial Documentation Kit", price: "₹499", category: "Templates", emoji: "📋", tag: null },
  { id: 6, name: "Myofascial Release & Cupping Set", price: "₹1,499", category: "Rehab Tools", emoji: "⚡", tag: "Pro Pick" },
];

const categories = ["All", "Clinical Equipment", "Rehab Tools", "Books & Guides", "Templates"];

export default function MarketplacePage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [activeCategory, setActiveCategory] = React.useState("All");

  React.useEffect(() => {
    if (!isPending && !session) router.replace("/");
  }, [isPending, router, session]);

  if (isPending || !session) return <main className="min-h-dvh bg-[#f5f5f4]" />;

  const filtered = products.filter(
    (p) => activeCategory === "All" || p.category === activeCategory
  );

  return (
    <main className="min-h-dvh bg-[#f5f5f4] pb-36 text-[#171717]">
      <div className="mx-auto max-w-4xl px-6 py-6 lg:px-12">

        {/* Page header */}
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase text-[#77716b]">Shop</p>
          <h1 className="mt-1 text-2xl font-semibold text-balance">Marketplace</h1>
        </div>

        {/* Search */}
        <div className="relative mb-5">
          <svg className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#8a8784]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="search"
            placeholder="Search products..."
            className="h-10 w-full rounded-xl border border-[#e8e6e3] bg-white pl-9 pr-4 text-sm text-[#171717] placeholder:text-[#8a8784] focus:border-[#1769c2] focus:outline-none focus:ring-2 focus:ring-[#1769c2]/20"
          />
        </div>

        {/* Category filters */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1769c2] ${
                activeCategory === cat
                  ? "bg-[#1769c2] text-white"
                  : "border border-[#e8e6e3] bg-white text-[#5d5854] hover:border-[#1769c2] hover:text-[#1769c2]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((product) => (
            <div key={product.id} className="flex flex-col rounded-2xl border border-[#e8e6e3] bg-white p-4 shadow-sm transition hover:shadow-md cursor-pointer">
              {/* Emoji thumbnail */}
              <div className="mb-3 flex size-14 items-center justify-center rounded-2xl bg-[#f5f5f4] text-3xl">
                {product.emoji}
              </div>

              <div className="flex items-start justify-between gap-2 mb-1">
                <p className="text-sm font-semibold text-[#171717] leading-snug text-pretty">{product.name}</p>
                {product.tag && (
                  <span className="shrink-0 rounded-full bg-[#eef5fc] px-2 py-0.5 text-[10px] font-bold text-[#1769c2]">
                    {product.tag}
                  </span>
                )}
              </div>

              <p className="mb-3 text-[11px] font-medium text-[#77716b]">{product.category}</p>

              <div className="mt-auto flex items-center justify-between">
                <span className="text-base font-bold text-[#171717]">{product.price}</span>
                <button className="rounded-xl bg-[#1769c2] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#1258a8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1769c2]">
                  Buy now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
