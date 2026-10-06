"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Megaphone,
  Plus,
  Eye,
  MousePointerClick,
  TrendingUp,
  Sparkles,
  ExternalLink,
  Trash2,
  CheckCircle2,
  PauseCircle,
  PlayCircle,
  Loader2,
  RefreshCw,
  Sliders,
  Upload,
  Smartphone,
  Monitor,
  Layout,
  Layers,
  X,
  Check,
  Pencil,
} from "lucide-react";
import { AdminMetricCard } from "@/modules/admin/components/AdminMetricCard";

interface AdCampaign {
  id: string;
  title: string;
  subtitle: string | null;
  banner_url: string;
  banner_mobile_url?: string | null;
  display_style?: "creative_image" | "rich_card";
  target_url: string;
  cta_text: string;
  slot: string;
  target_profession: string;
  status: "active" | "paused" | "draft";
  impressions: number;
  clicks: number;
  created_at: string;
}

const SLOT_LABELS: Record<string, string> = {
  feed_hero: "Feed Top Hero Banner",
  sidebar_featured: "Sidebar Sticky Sponsored Box",
  learn_hub: "CME Learn Catalog Header",
  jobs_hub: "Jobs & Opportunities Header",
  events_hub: "Conferences & Events Header",
};

export default function AdminAdsPage() {
  const [campaigns, setCampaigns] = useState<AdCampaign[]>([]);
  const [stats, setStats] = useState<any>({
    total_campaigns: 0,
    active_campaigns: 0,
    total_impressions: 0,
    total_clicks: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<AdCampaign | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Form fields
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [bannerMobileUrl, setBannerMobileUrl] = useState("");
  const [displayStyle, setDisplayStyle] = useState<"creative_image" | "rich_card">("creative_image");
  const [targetUrl, setTargetUrl] = useState("");
  const [ctaText, setCtaText] = useState("Explore Now");
  const [slot, setSlot] = useState("feed_hero");
  const [targetProfession, setTargetProfession] = useState("all");
  const [status, setStatus] = useState<"active" | "paused">("active");

  // Preview device state
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [uploadingDesktop, setUploadingDesktop] = useState(false);
  const [uploadingMobile, setUploadingMobile] = useState(false);

  const desktopFileRef = useRef<HTMLInputElement>(null);
  const mobileFileRef = useRef<HTMLInputElement>(null);

  const fetchAds = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/ads");
      if (res.ok) {
        const data = await res.json();
        setCampaigns(data.campaigns || []);
        setStats(data.stats || {});
      }
    } catch (err) {
      console.error("Failed to fetch ads:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  const handleOpenCreate = () => {
    setEditingCampaign(null);
    setTitle("");
    setSubtitle("");
    setBannerUrl("");
    setBannerMobileUrl("");
    setDisplayStyle("creative_image");
    setTargetUrl("");
    setCtaText("Explore Now");
    setSlot("feed_hero");
    setTargetProfession("all");
    setStatus("active");
    setShowModal(true);
  };

  const handleOpenEdit = (campaign: AdCampaign) => {
    setEditingCampaign(campaign);
    setTitle(campaign.title || "");
    setSubtitle(campaign.subtitle || "");
    setBannerUrl(campaign.banner_url || "");
    setBannerMobileUrl(campaign.banner_mobile_url || "");
    setDisplayStyle(campaign.display_style || "creative_image");
    setTargetUrl(campaign.target_url || "");
    setCtaText(campaign.cta_text || "Explore Now");
    setSlot(campaign.slot || "feed_hero");
    setTargetProfession(campaign.target_profession || "all");
    setStatus(campaign.status === "paused" ? "paused" : "active");
    setShowModal(true);
  };

  const handleFileUpload = async (file: File, target: "desktop" | "mobile") => {
    const isDesktop = target === "desktop";
    if (isDesktop) setUploadingDesktop(true);
    else setUploadingMobile(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "ads");

      const res = await fetch("/api/media/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.publicUrl) {
          if (isDesktop) {
            setBannerUrl(data.publicUrl);
          } else {
            setBannerMobileUrl(data.publicUrl);
          }
        }
      } else {
        const err = await res.json();
        alert(err.error || "Upload failed");
      }
    } catch (err) {
      console.error("Image upload failed:", err);
      alert("Failed to upload image.");
    } finally {
      if (isDesktop) setUploadingDesktop(false);
      else setUploadingMobile(false);
    }
  };

  const handleSaveAd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !bannerUrl.trim() || !targetUrl.trim()) return;

    setSubmitting(true);
    try {
      const isEditing = Boolean(editingCampaign);
      const url = "/api/admin/ads";
      const method = isEditing ? "PATCH" : "POST";
      const payload: any = {
        title: title.trim(),
        subtitle: subtitle.trim() || null,
        banner_url: bannerUrl.trim(),
        banner_mobile_url: bannerMobileUrl.trim() || null,
        display_style: displayStyle,
        target_url: targetUrl.trim(),
        cta_text: ctaText.trim() || "Explore Now",
        slot,
        target_profession: targetProfession,
        status,
      };

      if (isEditing && editingCampaign) {
        payload.id = editingCampaign.id;
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowModal(false);
        setEditingCampaign(null);
        fetchAds();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to save campaign");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (campaign: AdCampaign) => {
    const newStatus = campaign.status === "active" ? "paused" : "active";
    setActionLoading(campaign.id);
    try {
      const res = await fetch("/api/admin/ads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: campaign.id, status: newStatus }),
      });
      if (res.ok) {
        setCampaigns((prev) =>
          prev.map((c) => (c.id === campaign.id ? { ...c, status: newStatus } : c))
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this ad campaign?")) return;
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/ads?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setCampaigns((prev) => prev.filter((c) => c.id !== id));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const ctr =
    stats.total_impressions > 0
      ? ((stats.total_clicks / stats.total_impressions) * 100).toFixed(1)
      : "0.0";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">Ads & Sponsored Campaigns Console</h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-xs font-bold text-blue-700">
              <Sparkles className="size-3 text-blue-600" />
              Multi-Device Ad Engine
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Publish high-impact responsive ads, pharma promotional flyers, CME conferences, and hospital recruiting banners with device-specific creatives.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchAds}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs"
          >
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition"
          >
            <Plus className="size-4" />
            <span>Post New Ad / Banner</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminMetricCard
          title="Active Campaigns"
          value={`${stats.active_campaigns} / ${stats.total_campaigns}`}
          subtitle="Running across discovery feeds"
          icon={<Megaphone className="size-4 text-blue-600" />}
        />
        <AdminMetricCard
          title="Total Impressions"
          value={stats.total_impressions.toLocaleString()}
          subtitle="Views delivered to clinicians"
          icon={<Eye className="size-4 text-purple-600" />}
        />
        <AdminMetricCard
          title="Total Clicks"
          value={stats.total_clicks.toLocaleString()}
          subtitle="Engagements on CTAs"
          icon={<MousePointerClick className="size-4 text-emerald-600" />}
        />
        <AdminMetricCard
          title="Avg. CTR (Click-Through)"
          value={`${ctr}%`}
          subtitle="Click-to-impression ratio"
          icon={<TrendingUp className="size-4 text-amber-600" />}
        />
      </div>

      {/* Campaign Management Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="size-4 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900">All Sponsored Campaigns & Banners</h2>
          </div>
          <span className="text-xs text-slate-500">{campaigns.length} Campaigns</span>
        </div>

        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-2 text-xs text-slate-500">
            <Loader2 className="size-5 animate-spin text-blue-600" />
            <span>Loading active campaigns...</span>
          </div>
        ) : campaigns.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="size-12 rounded-2xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center">
              <Megaphone className="size-6" />
            </div>
            <p className="text-sm font-bold text-slate-800">No Ad Campaigns Created Yet</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Post your first sponsored banner to promote medical masterclasses, hospital fellowships, or pharmaceutical products.
            </p>
            <button
              type="button"
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition"
            >
              <Plus className="size-3.5" />
              <span>Create First Ad</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-700 font-bold">
                  <th className="py-3 px-4">Banner Creative & Title</th>
                  <th className="py-3 px-4">Slot & Format</th>
                  <th className="py-3 px-4">Destination Link</th>
                  <th className="py-3 px-4 text-center">Impressions</th>
                  <th className="py-3 px-4 text-center">Clicks</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {campaigns.map((c) => {
                  const itemCtr =
                    c.impressions > 0 ? ((c.clicks / c.impressions) * 100).toFixed(1) : "0.0";
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-3.5 px-4 max-w-sm">
                        <div className="flex items-center gap-3">
                          <div className="relative w-16 h-10 rounded-lg overflow-hidden border border-slate-200 shrink-0 bg-slate-100">
                            <img
                              src={c.banner_url}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 truncate">{c.title}</p>
                            {c.subtitle && (
                              <p className="text-[11px] text-slate-500 truncate">{c.subtitle}</p>
                            )}
                            <div className="flex items-center gap-2 mt-0.5">
                              {c.banner_mobile_url && (
                                <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded">
                                  <Smartphone className="size-2.5" /> Mobile Variant
                                </span>
                              )}
                              <span className="text-[10px] text-slate-400 capitalize">
                                {c.display_style === "rich_card" ? "Card Layout" : "Full Creative Banner"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-block font-semibold text-slate-800">
                          {SLOT_LABELS[c.slot] || c.slot}
                        </span>
                        <p className="text-[10px] text-slate-500 capitalize">Audience: {c.target_profession}</p>
                      </td>

                      <td className="py-3.5 px-4">
                        <a
                          href={c.target_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-blue-600 font-medium hover:underline max-w-[150px] truncate"
                        >
                          <span className="truncate">{c.target_url}</span>
                          <ExternalLink className="size-3 shrink-0" />
                        </a>
                      </td>

                      <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                        {c.impressions.toLocaleString()}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="font-bold text-emerald-600">{c.clicks.toLocaleString()}</span>
                        <span className="text-[10px] text-slate-400 block">{itemCtr}% CTR</span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            c.status === "active"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {c.status === "active" ? <CheckCircle2 className="size-3" /> : <PauseCircle className="size-3" />}
                          <span className="capitalize">{c.status}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Edit Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(c)}
                            disabled={actionLoading === c.id}
                            title="Edit Campaign Details"
                            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-blue-600 transition shadow-2xs"
                          >
                            <Pencil className="size-3.5" />
                          </button>

                          {/* Pause / Play Toggle */}
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(c)}
                            disabled={actionLoading === c.id}
                            title={c.status === "active" ? "Pause Ad" : "Activate Ad"}
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 transition"
                          >
                            {c.status === "active" ? (
                              <PauseCircle className="size-3.5" />
                            ) : (
                              <PlayCircle className="size-3.5 text-emerald-600" />
                            )}
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => handleDelete(c.id)}
                            disabled={actionLoading === c.id}
                            title="Delete Campaign"
                            className="p-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 transition"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE / EDIT AD MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-3xl rounded-3xl bg-white p-6 sm:p-7 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Megaphone className="size-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    {editingCampaign ? "Edit Sponsored Campaign & Banner" : "Publish Sponsored Campaign & Banner"}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {editingCampaign ? "Update creative links, images, targeting or display style" : "Configure desktop & mobile banner creatives and targeting"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-2 rounded-xl hover:bg-slate-100 text-slate-500"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAd} className="space-y-5">
              {/* Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Campaign Title / Product Headline *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. BioCef O 200mg - Next Gen Antibiotic Therapy"
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600 shadow-2xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Subtitle / Promotional Offer (Optional)
                  </label>
                  <input
                    type="text"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="e.g. Broad spectrum coverage with high clinical efficacy. Request clinical samples."
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600 shadow-2xs"
                  />
                </div>

                {/* Display Mode Choice */}
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">
                    Banner Display Style
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setDisplayStyle("creative_image")}
                      className={`p-3 rounded-2xl border text-left flex items-start gap-3 transition ${
                        displayStyle === "creative_image"
                          ? "border-blue-600 bg-blue-50/60 ring-1 ring-blue-600 text-blue-900"
                          : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <Layout className="size-5 shrink-0 mt-0.5 text-blue-600" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 font-bold text-xs">
                          <span>Full Creative Graphic Banner</span>
                          {displayStyle === "creative_image" && <Check className="size-3 text-blue-600" />}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Displays your uploaded graphic flyer/banner in full responsive edge-to-edge size without cutting text. (Recommended)
                        </p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDisplayStyle("rich_card")}
                      className={`p-3 rounded-2xl border text-left flex items-start gap-3 transition ${
                        displayStyle === "rich_card"
                          ? "border-blue-600 bg-blue-50/60 ring-1 ring-blue-600 text-blue-900"
                          : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <Layers className="size-5 shrink-0 mt-0.5 text-purple-600" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 font-bold text-xs">
                          <span>Hero Card with Details</span>
                          {displayStyle === "rich_card" && <Check className="size-3 text-blue-600" />}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Side-by-side cover thumbnail, large bold typography, and direct CTA button.
                        </p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Banner 1: Desktop / Standard Banner */}
                <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                      <Monitor className="size-3.5 text-blue-600" />
                      <span>Desktop Banner Creative *</span>
                    </label>
                    <span className="text-[10px] text-slate-400 font-medium">Wide (16:9 or 21:9)</span>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={bannerUrl}
                      onChange={(e) => setBannerUrl(e.target.value)}
                      placeholder="https://... or upload image"
                      className="flex-1 rounded-xl border border-slate-200 bg-white p-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                    <button
                      type="button"
                      onClick={() => desktopFileRef.current?.click()}
                      disabled={uploadingDesktop}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 shrink-0"
                    >
                      {uploadingDesktop ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
                      <span>Upload</span>
                    </button>
                    <input
                      ref={desktopFileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, "desktop");
                      }}
                    />
                  </div>
                </div>

                {/* Banner 2: Mobile / Tablet Banner */}
                <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                      <Smartphone className="size-3.5 text-emerald-600" />
                      <span>Mobile Banner Creative (Optional)</span>
                    </label>
                    <span className="text-[10px] text-slate-400 font-medium">Compact (4:3, 1:1, 16:9)</span>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={bannerMobileUrl}
                      onChange={(e) => setBannerMobileUrl(e.target.value)}
                      placeholder="Leave blank to auto-scale Desktop Banner"
                      className="flex-1 rounded-xl border border-slate-200 bg-white p-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                    <button
                      type="button"
                      onClick={() => mobileFileRef.current?.click()}
                      disabled={uploadingMobile}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 shrink-0"
                    >
                      {uploadingMobile ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
                      <span>Upload</span>
                    </button>
                    <input
                      ref={mobileFileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, "mobile");
                      }}
                    />
                  </div>
                </div>

                {/* Destination Link */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Destination URL *
                  </label>
                  <input
                    type="text"
                    required
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    placeholder="/events or /learn/courses or https://..."
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>

                {/* CTA Button Text */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Call to Action (CTA) Button Text
                  </label>
                  <input
                    type="text"
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    placeholder="e.g. Register Free, Order Now, Learn More"
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>

                {/* Slot Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Placement Location Slot
                  </label>
                  <select
                    value={slot}
                    onChange={(e) => setSlot(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                  >
                    <option value="feed_hero">Doctor&apos;s Feed Top Hero Banner</option>
                    <option value="sidebar_featured">Sidebar Sticky Sponsored Box</option>
                    <option value="learn_hub">CME Learn Catalog Header</option>
                    <option value="jobs_hub">Jobs & Opportunities Header</option>
                    <option value="events_hub">Conferences & Events Header</option>
                  </select>
                </div>

                {/* Target Audience */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Target Profession Audience
                  </label>
                  <select
                    value={targetProfession}
                    onChange={(e) => setTargetProfession(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                  >
                    <option value="all">All Healthcare Members</option>
                    <option value="doctor">Doctors & Physicians (MD/MBBS)</option>
                    <option value="surgeon">Surgeons</option>
                    <option value="physiotherapist">Physical Therapists</option>
                    <option value="student">Medical & Nursing Students</option>
                    <option value="hospital">Hospitals & Organizations</option>
                  </select>
                </div>
              </div>

              {/* LIVE INTERACTIVE DEVICE PREVIEW BOX */}
              <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Live Device Preview
                  </p>

                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setPreviewDevice("desktop")}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                        previewDevice === "desktop"
                          ? "bg-white text-slate-900 shadow-2xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <Monitor className="size-3.5" />
                      <span>Desktop View</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPreviewDevice("mobile")}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                        previewDevice === "mobile"
                          ? "bg-white text-slate-900 shadow-2xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <Smartphone className="size-3.5" />
                      <span>Mobile View</span>
                    </button>
                  </div>
                </div>

                {/* Preview Container */}
                <div className="flex justify-center p-3 sm:p-4 rounded-2xl bg-slate-100/70 border border-slate-200">
                  <div className={`transition-all duration-300 ${previewDevice === "mobile" ? "w-[340px]" : "w-full max-w-xl"}`}>
                    {displayStyle === "creative_image" ? (
                      /* Full Graphic Banner Preview */
                      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 shadow-md">
                        <div className="absolute top-2.5 left-2.5 z-20">
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-950/80 backdrop-blur-md px-2 py-0.5 text-[9px] font-black uppercase text-amber-300 border border-amber-400/40">
                            <Sparkles className="size-2 text-amber-300" />
                            Featured Partner
                          </span>
                        </div>

                        <img
                          src={previewDevice === "mobile" && bannerMobileUrl ? bannerMobileUrl : bannerUrl}
                          alt={title || "Banner Preview"}
                          className="w-full h-auto max-h-[260px] object-contain sm:object-cover mx-auto"
                        />

                        <div className="p-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-white truncate">{title || "Your Campaign Headline"}</p>
                            {subtitle && <p className="text-[10px] text-slate-300 truncate">{subtitle}</p>}
                          </div>
                          <span className="shrink-0 rounded-lg bg-white px-2.5 py-1 text-[11px] font-bold text-slate-900">
                            {ctaText || "Explore"}
                          </span>
                        </div>
                      </div>
                    ) : (
                      /* Rich Card Preview */
                      <div className="relative overflow-hidden rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-900 to-indigo-900 p-4 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={previewDevice === "mobile" && bannerMobileUrl ? bannerMobileUrl : bannerUrl}
                            alt=""
                            className="size-14 rounded-xl object-cover border border-white/20 shrink-0"
                          />
                          <div className="min-w-0">
                            <span className="inline-block rounded-full bg-amber-400/20 px-2 py-0.5 text-[8px] font-black uppercase text-amber-300 border border-amber-400/30">
                              Sponsored
                            </span>
                            <h3 className="text-xs font-bold text-white truncate">{title || "Campaign Headline"}</h3>
                            <p className="text-[10px] text-blue-100/80 line-clamp-1">{subtitle || "Description here"}</p>
                          </div>
                        </div>
                        <span className="shrink-0 rounded-xl bg-white px-3 py-1.5 text-xs font-bold text-blue-900">
                          {ctaText || "Learn More"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : editingCampaign ? (
                    <Check className="size-3.5" />
                  ) : (
                    <Megaphone className="size-3.5" />
                  )}
                  <span>
                    {submitting
                      ? editingCampaign
                        ? "Saving Changes..."
                        : "Publishing Ad..."
                      : editingCampaign
                      ? "Save Changes"
                      : "Publish Campaign"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

