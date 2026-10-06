"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ExternalLink, Sparkles, ArrowRight } from "lucide-react";

interface AdItem {
  id: string;
  title: string;
  subtitle: string | null;
  banner_url: string;
  banner_mobile_url?: string | null;
  display_style?: "creative_image" | "rich_card";
  target_url: string;
  cta_text: string;
  slot: string;
}

interface SponsoredBannerProps {
  slot?: "feed_hero" | "sidebar_featured" | "learn_hub" | "jobs_hub" | "events_hub";
  profession?: string;
  className?: string;
  variant?: "hero" | "card" | "sidebar" | "compact";
}

export function SponsoredBanner({
  slot = "feed_hero",
  profession,
  className = "",
  variant = "hero",
}: SponsoredBannerProps) {
  const [ad, setAd] = useState<AdItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchAd = async () => {
      try {
        const query = new URLSearchParams({ slot });
        if (profession) query.set("profession", profession);

        const res = await fetch(`/api/ads?${query.toString()}`);
        if (res.ok) {
          const data = await res.json();
          if (!cancelled && data.ads && data.ads.length > 0) {
            setAd(data.ads[0]);
          }
        }
      } catch (err) {
        // Silent fallback
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchAd();
    return () => {
      cancelled = true;
    };
  }, [slot, profession]);

  if (loading || !ad) return null;

  const handleClick = () => {
    fetch("/api/ads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: ad.id }),
    }).catch(() => {});
  };

  const isExternal = ad.target_url.startsWith("http://") || ad.target_url.startsWith("https://");
  const isCreativeImage = !ad.display_style || ad.display_style === "creative_image";

  // Variant: Sidebar Widget
  if (variant === "sidebar") {
    return (
      <div className={`rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161b22] p-3.5 shadow-xs overflow-hidden ${className}`}>
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 dark:bg-amber-500/20 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-300 border border-amber-300/40">
            <Sparkles className="size-2.5" />
            Sponsored
          </span>
        </div>

        <a
          href={ad.target_url}
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noopener noreferrer" : undefined}
          onClick={handleClick}
          className="group block"
        >
          <div className="relative aspect-video w-full rounded-xl overflow-hidden mb-2.5 border border-slate-100 dark:border-slate-800 bg-slate-100 dark:bg-slate-900">
            <picture className="w-full h-full">
              {ad.banner_mobile_url && (
                <source media="(max-width: 640px)" srcSet={ad.banner_mobile_url} />
              )}
              <img
                src={ad.banner_url}
                alt={ad.title}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </picture>
          </div>

          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-snug group-hover:text-blue-600 transition">
            {ad.title}
          </h4>

          {ad.subtitle && (
            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
              {ad.subtitle}
            </p>
          )}

          <div className="mt-2.5 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-[#0f4c81] dark:text-blue-400">
            <span>{ad.cta_text || "Learn More"}</span>
            <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
          </div>
        </a>
      </div>
    );
  }

  // Display Mode 1: Full Promotional Graphic Banner (Edge-to-Edge Responsive Creative)
  if (isCreativeImage) {
    return (
      <div className={`relative group overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-900 shadow-sm transition hover:shadow-md ${className}`}>
        <a
          href={ad.target_url}
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noopener noreferrer" : undefined}
          onClick={handleClick}
          className="block relative w-full overflow-hidden"
        >
          {/* Floating Partner Badge */}
          <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-950/75 backdrop-blur-md px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-amber-300 border border-amber-400/40 shadow-sm">
              <Sparkles className="size-2.5 text-amber-300" />
              Featured Partner
            </span>
          </div>

          {/* Responsive Picture: Loads Mobile Banner on phones, Desktop Banner on wider screens */}
          <div className="relative w-full overflow-hidden bg-slate-950 flex items-center justify-center">
            <picture className="block w-full">
              {ad.banner_mobile_url && (
                <source media="(max-width: 640px)" srcSet={ad.banner_mobile_url} />
              )}
              <img
                src={ad.banner_url}
                alt={ad.title}
                className="w-full h-auto max-h-[360px] sm:max-h-[300px] md:max-h-[340px] object-contain sm:object-cover mx-auto transition-transform duration-500 group-hover:scale-[1.015]"
                loading="lazy"
              />
            </picture>

            {/* Subtle Gradient Overlay for Text Readability if title exists */}
            {(ad.title || ad.cta_text) && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-3.5 sm:p-4 flex items-end justify-between gap-3 z-10">
                <div className="min-w-0 pr-2">
                  <h3 className="text-xs sm:text-sm font-bold text-white leading-snug drop-shadow-sm truncate">
                    {ad.title}
                  </h3>
                  {ad.subtitle && (
                    <p className="text-[11px] text-slate-200 line-clamp-1 drop-shadow-xs">
                      {ad.subtitle}
                    </p>
                  )}
                </div>

                <div className="shrink-0">
                  <span className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3.5 py-1.5 text-xs font-bold text-slate-900 shadow-md transition group-hover:bg-blue-50 group-hover:text-[#0f4c81]">
                    <span>{ad.cta_text || "Explore"}</span>
                    {isExternal ? <ExternalLink className="size-3" /> : <ArrowRight className="size-3" />}
                  </span>
                </div>
              </div>
            )}
          </div>
        </a>
      </div>
    );
  }

  // Display Mode 2: Rich Card Mode (Cover Banner on Left/Top + Structured Details)
  return (
    <div className={`relative overflow-hidden rounded-2xl border border-blue-200 dark:border-blue-900/60 bg-gradient-to-r from-[#0f4c81] via-[#145ca8] to-[#1e3a8a] text-white shadow-md p-4 sm:p-5 transition hover:shadow-lg ${className}`}>
      <div className="absolute -right-10 -bottom-10 size-48 rounded-full bg-blue-400/20 blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3.5 max-w-xl">
          <div className="relative w-full sm:w-36 aspect-video sm:aspect-square rounded-xl overflow-hidden shrink-0 border border-white/20 shadow-sm bg-blue-950">
            <picture className="w-full h-full">
              {ad.banner_mobile_url && (
                <source media="(max-width: 640px)" srcSet={ad.banner_mobile_url} />
              )}
              <img
                src={ad.banner_url}
                alt={ad.title}
                className="h-full w-full object-cover"
              />
            </picture>
          </div>

          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/20 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-amber-300 border border-amber-400/30">
                <Sparkles className="size-2.5 text-amber-300" />
                Featured Partner
              </span>
            </div>

            <h3 className="text-sm sm:text-base font-extrabold text-white leading-tight">
              {ad.title}
            </h3>

            {ad.subtitle && (
              <p className="text-xs text-blue-100/85 line-clamp-2">
                {ad.subtitle}
              </p>
            )}
          </div>
        </div>

        <div className="shrink-0 self-end sm:self-center">
          <a
            href={ad.target_url}
            target={isExternal ? "_blank" : undefined}
            rel={isExternal ? "noopener noreferrer" : undefined}
            onClick={handleClick}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-[#0f4c81] shadow-sm hover:bg-blue-50 transition active:scale-95"
          >
            <span>{ad.cta_text || "Explore Now"}</span>
            {isExternal ? <ExternalLink className="size-3.5" /> : <ArrowRight className="size-3.5" />}
          </a>
        </div>
      </div>
    </div>
  );
}
