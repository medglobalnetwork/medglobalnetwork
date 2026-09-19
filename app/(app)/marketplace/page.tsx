"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

const products = [
  { id: 1, name: "Premium Budget Planner", price: "₹499", category: "Tools", emoji: "📊", tag: "Bestseller", tagColor: "#dbeafe", tagText: "#1769c2" },
  { id: 2, name: "Investment Starter Kit", price: "₹999", category: "Courses", emoji: "💼", tag: "Popular", tagColor: "#dcfce7", tagText: "#15803d" },
  { id: 3, name: "Tax Filing Guide 2024", price: "₹299", category: "Guides", emoji: "📋", tag: null, tagColor: "", tagText: "" },
  { id: 4, name: "Crypto Portfolio Tracker", price: "₹749", category: "Tools", emoji: "📈", tag: "New", tagColor: "#fce7f3", tagText: "#9d174d" },
  { id: 5, name: "Wealth Management eBook", price: "₹199", category: "Books", emoji: "📖", tag: null, tagColor: "", tagText: "" },
  { id: 6, name: "1-on-1 Financial Coaching", price: "₹2,499", category: "Services", emoji: "🎯", tag: "Limited", tagColor: "#fef9c3", tagText: "#854d0e" },
];

const categories = ["All", "Tools", "Courses", "Guides", "Books", "Services"];

export default function MarketplacePage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [activeCategory, setActiveCategory] = React.useState("All");

  React.useEffect(() => {
    if (!isPending && !session) router.replace("/");
  }, [isPending, router, session]);

  if (isPending || !session) return <main className="min-h-screen bg-[#f5f5f4]" />;

  const filtered = products.filter(
    (p) => activeCategory === "All" || p.category === activeCategory
  );

  return (
    <main className="min-h-screen bg-[#f5f5f4] pb-36 text-[#171717]">
      <div className="mx-auto max-w-4xl px-6 py-6 lg:px-12">

        {/* Page header */}
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#77716b]">Shop</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Marketplace</h1>
        </div>

        {/* Search */}
        <div className="relative mb-5">
          <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a8784]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
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
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f5f5f4] text-3xl">
                {product.emoji}
              </div>

              <div className="flex items-start justify-between gap-2 mb-1">
                <p className="text-sm font-semibold text-[#171717] leading-snug">{product.name}</p>
                {product.tag && (
                  <span className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: product.tagColor, color: product.tagText }}>
                    {product.tag}
                  </span>
                )}
              </div>

              <p className="mb-3 text-[11px] font-medium text-[#77716b]">{product.category}</p>

              <div className="mt-auto flex items-center justify-between">
                <span className="text-base font-bold text-[#171717]">{product.price}</span>
                <button className="rounded-xl bg-[#1769c2] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#1258a8]">
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
