"use client";
// ============================================================
// MGN Admin Console — Advanced Recommendation Engine Control Plane
// app/admin/recommendations/page.tsx
// ============================================================

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Sliders,
  Layers,
  FlaskConical,
  BarChart3,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Users,
  Eye,
  UserPlus,
  Shield,
  Compass,
  Clock,
  Shuffle,
} from "lucide-react";
import type {
  RecommendationRuleConfig,
  RecommendationAnalyticsMetrics,
} from "@/modules/recommendations/types";

export default function AdminRecommendationsPage() {
  const [config, setConfig] = useState<RecommendationRuleConfig | null>(null);
  const [analytics, setAnalytics] = useState<RecommendationAnalyticsMetrics | null>(null);
  const [experiments, setExperiments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"weights" | "sources" | "diversity" | "experiments" | "analytics">("weights");

  // Load configuration and analytics
  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      setLoading(true);
      try {
        const [cfgRes, anRes, expRes] = await Promise.all([
          fetch("/api/admin/recommendations/config", { credentials: "include" }),
          fetch("/api/admin/recommendations/analytics", { credentials: "include" }),
          fetch("/api/admin/recommendations/experiments", { credentials: "include" }),
        ]);

        if (cfgRes.ok) {
          const cfgData = await cfgRes.json();
          if (!cancelled) setConfig(cfgData.config);
        }
        if (anRes.ok) {
          const anData = await anRes.json();
          if (!cancelled) setAnalytics(anData.metrics);
        }
        if (expRes.ok) {
          const expData = await expRes.json();
          if (!cancelled) setExperiments(expData.experiments || []);
        }
      } catch (err: any) {
        if (!cancelled) setErrorMessage(err.message || "Failed to load recommendation controls");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleWeightChange = (key: string, value: number) => {
    if (!config) return;
    setConfig({
      ...config,
      feature_weights: {
        ...config.feature_weights,
        [key]: value,
      },
    });
  };

  const handleSourceToggle = (key: string, value: boolean) => {
    if (!config) return;
    setConfig({
      ...config,
      candidate_sources: {
        ...config.candidate_sources,
        [key]: value,
      },
    });
  };

  const handleSaveConfig = async () => {
    if (!config) return;
    setSaving(true);
    setSaveSuccess(false);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/admin/recommendations/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(config),
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3500);
      } else {
        const err = await res.json();
        setErrorMessage(err.error || "Failed to save configuration");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Network error while saving");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-64 rounded-xl bg-slate-800" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-slate-900 border border-slate-800" />
          ))}
        </div>
        <div className="h-96 rounded-2xl bg-slate-900 border border-slate-800" />
      </div>
    );
  }

  const weights = config?.feature_weights;

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Header with Live Status and Save Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Sparkles className="h-5 w-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
              User Suggestion Engine
            </h1>
            <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
              Live & Adaptive
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400 max-w-2xl">
            Tune professional graph affinity weights, candidate sources, exploration ratios, and anti-filter-bubble diversity rules without redeployment.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {saveSuccess && (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-800/60">
              <CheckCircle2 className="h-4 w-4" /> Live Applied
            </span>
          )}
          <button
            type="button"
            onClick={handleSaveConfig}
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500 disabled:opacity-50 transition"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving Changes…" : "Save Live Configuration"}
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2 rounded-xl bg-rose-950/60 border border-rose-800/60 p-4 text-xs font-medium text-rose-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 2. Top Analytics KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Total Impressions</span>
            <Eye className="h-4 w-4 text-blue-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">
              {(analytics?.totalImpressions ?? 0).toLocaleString()}
            </span>
            <span className="text-[10px] text-emerald-400 font-bold">30d active</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Delivered across Feed, Network & Profile</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Profile Click-Through (CTR)</span>
            <TrendingUp className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">
              {analytics?.ctr ?? 0}%
            </span>
            <span className="text-[10px] text-slate-400">clicks / impression</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">{(analytics?.totalProfileOpens ?? 0).toLocaleString()} profile inspections</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Connect Request Rate</span>
            <UserPlus className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">
              {analytics?.connectRequestRate ?? 0}%
            </span>
            <span className="text-[10px] text-emerald-400 font-bold">High Intent</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">{(analytics?.totalConnectRequests ?? 0).toLocaleString()} connection requests sent</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Acceptance & Meaningful Rate</span>
            <Shield className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">
              {analytics?.connectAcceptRate ?? 0}%
            </span>
            <span className="text-[10px] text-slate-400">acceptance ratio</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">{(analytics?.totalConnectAccepts ?? 0).toLocaleString()} connected peers</p>
        </div>
      </div>

      {/* 3. Navigation Tabs */}
      <div className="flex gap-1 border-b border-slate-800/80 pb-px overflow-x-auto">
        {[
          { id: "weights", label: "Ranking Feature Weights", icon: Sliders },
          { id: "sources", label: "Candidate Sources", icon: Layers },
          { id: "diversity", label: "Diversity & Exploration", icon: Compass },
          { id: "experiments", label: "A/B Experiments", icon: Shuffle },
          { id: "analytics", label: "Performance Breakdown", icon: BarChart3 },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-bold transition ${
                active
                  ? "border-blue-500 text-blue-400 bg-slate-900/40"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 4. Tab 1: Ranking Feature Weights */}
      {activeTab === "weights" && weights && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-6">
            <div>
              <h3 className="text-sm font-bold text-white">Positive Scoring Signals</h3>
              <p className="text-xs text-slate-400">
                Adjust the scoring impact of explicit graph similarity, behavioral alignment, and credential verification.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Same Profession */}
              <div className="space-y-2 rounded-xl bg-slate-950/60 p-3.5 border border-slate-800/60">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-200">Same Profession</span>
                  <span className="font-bold text-blue-400">+{weights.same_profession} pts</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={weights.same_profession}
                  onChange={(e) => handleWeightChange("same_profession", parseInt(e.target.value, 10))}
                  className="w-full accent-blue-500 cursor-pointer"
                />
                <span className="text-[10px] text-slate-400">Matches doctor, physiotherapist, nurse, etc.</span>
              </div>

              {/* Same Specialization */}
              <div className="space-y-2 rounded-xl bg-slate-950/60 p-3.5 border border-slate-800/60">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-200">Same Specialization</span>
                  <span className="font-bold text-blue-400">+{weights.same_specialization} pts</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="60"
                  value={weights.same_specialization}
                  onChange={(e) => handleWeightChange("same_specialization", parseInt(e.target.value, 10))}
                  className="w-full accent-blue-500 cursor-pointer"
                />
                <span className="text-[10px] text-slate-400">Matches Cardiology, Sports Rehab, Neurology, etc.</span>
              </div>

              {/* Same Organization */}
              <div className="space-y-2 rounded-xl bg-slate-950/60 p-3.5 border border-slate-800/60">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-200">Same Hospital / Institute</span>
                  <span className="font-bold text-blue-400">+{weights.same_organization} pts</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={weights.same_organization}
                  onChange={(e) => handleWeightChange("same_organization", parseInt(e.target.value, 10))}
                  className="w-full accent-blue-500 cursor-pointer"
                />
                <span className="text-[10px] text-slate-400">Colleagues practicing in the same clinical facility.</span>
              </div>

              {/* Research Similarity */}
              <div className="space-y-2 rounded-xl bg-slate-950/60 p-3.5 border border-slate-800/60">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-200">Research & Topic Similarity</span>
                  <span className="font-bold text-blue-400">+{weights.research_similarity} pts</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={weights.research_similarity}
                  onChange={(e) => handleWeightChange("research_similarity", parseInt(e.target.value, 10))}
                  className="w-full accent-blue-500 cursor-pointer"
                />
                <span className="text-[10px] text-slate-400">Shared case studies, trials, and research vectors.</span>
              </div>

              {/* Mutual Connections */}
              <div className="space-y-2 rounded-xl bg-slate-950/60 p-3.5 border border-slate-800/60">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-200">Mutual Connections Score</span>
                  <span className="font-bold text-blue-400">+{weights.mutual_connections} pts</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="40"
                  value={weights.mutual_connections}
                  onChange={(e) => handleWeightChange("mutual_connections", parseInt(e.target.value, 10))}
                  className="w-full accent-blue-500 cursor-pointer"
                />
                <span className="text-[10px] text-slate-400">Second-degree graph social proof strength.</span>
              </div>

              {/* Alumni / Education */}
              <div className="space-y-2 rounded-xl bg-slate-950/60 p-3.5 border border-slate-800/60">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-200">Same University / Alumni</span>
                  <span className="font-bold text-blue-400">+{weights.same_education} pts</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="40"
                  value={weights.same_education}
                  onChange={(e) => handleWeightChange("same_education", parseInt(e.target.value, 10))}
                  className="w-full accent-blue-500 cursor-pointer"
                />
                <span className="text-[10px] text-slate-400">Graduates from the same medical university/college.</span>
              </div>

              {/* Shared Community */}
              <div className="space-y-2 rounded-xl bg-slate-950/60 p-3.5 border border-slate-800/60">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-200">Shared Specialty Community</span>
                  <span className="font-bold text-blue-400">+{weights.shared_community} pts</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="35"
                  value={weights.shared_community}
                  onChange={(e) => handleWeightChange("shared_community", parseInt(e.target.value, 10))}
                  className="w-full accent-blue-500 cursor-pointer"
                />
                <span className="text-[10px] text-slate-400">Co-members of clinical hubs like Physiotherapy India.</span>
              </div>

              {/* Behavioral Similarity */}
              <div className="space-y-2 rounded-xl bg-slate-950/60 p-3.5 border border-slate-800/60">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-200">Behavioral Interest Alignment</span>
                  <span className="font-bold text-blue-400">+{weights.behavioral_similarity} pts</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="35"
                  value={weights.behavioral_similarity}
                  onChange={(e) => handleWeightChange("behavioral_similarity", parseInt(e.target.value, 10))}
                  className="w-full accent-blue-500 cursor-pointer"
                />
                <span className="text-[10px] text-slate-400">Inferred dynamic interest profile dot product.</span>
              </div>

              {/* Location Relevance */}
              <div className="space-y-2 rounded-xl bg-slate-950/60 p-3.5 border border-slate-800/60">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-200">Geographic Relevance</span>
                  <span className="font-bold text-blue-400">+{weights.location_relevance} pts</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="25"
                  value={weights.location_relevance}
                  onChange={(e) => handleWeightChange("location_relevance", parseInt(e.target.value, 10))}
                  className="w-full accent-blue-500 cursor-pointer"
                />
                <span className="text-[10px] text-slate-400">Regional proximity (City / State / Zone).</span>
              </div>

              {/* Follow Relationship */}
              <div className="space-y-2 rounded-xl bg-slate-950/60 p-3.5 border border-slate-800/60">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-200">Follow Relationship</span>
                  <span className="font-bold text-blue-400">+{weights.follow_relationship} pts</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="35"
                  value={weights.follow_relationship}
                  onChange={(e) => handleWeightChange("follow_relationship", parseInt(e.target.value, 10))}
                  className="w-full accent-blue-500 cursor-pointer"
                />
                <span className="text-[10px] text-slate-400">One-way follower or followed relationship.</span>
              </div>

              {/* Verification Signal */}
              <div className="space-y-2 rounded-xl bg-slate-950/60 p-3.5 border border-slate-800/60">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-200">Verified Medical License / Identity</span>
                  <span className="font-bold text-blue-400">+{weights.verification_signal} pts</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={weights.verification_signal}
                  onChange={(e) => handleWeightChange("verification_signal", parseInt(e.target.value, 10))}
                  className="w-full accent-blue-500 cursor-pointer"
                />
                <span className="text-[10px] text-slate-400">Boost for council verified credentials.</span>
              </div>

              {/* Profile Quality */}
              <div className="space-y-2 rounded-xl bg-slate-950/60 p-3.5 border border-slate-800/60">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-200">Profile Completeness Quality</span>
                  <span className="font-bold text-blue-400">+{weights.profile_quality} pts</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="25"
                  value={weights.profile_quality}
                  onChange={(e) => handleWeightChange("profile_quality", parseInt(e.target.value, 10))}
                  className="w-full accent-blue-500 cursor-pointer"
                />
                <span className="text-[10px] text-slate-400">Has avatar, bio, verified degrees, and experience.</span>
              </div>
            </div>

            {/* Negative Feedback Penalties */}
            <div className="border-t border-slate-800 pt-5">
              <h3 className="text-sm font-bold text-rose-400">Negative Feedback & Fatigue Penalties</h3>
              <p className="text-xs text-slate-400">
                Reduce candidate frequency when users ignore or explicitly express lack of interest.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div className="space-y-2 rounded-xl bg-rose-950/30 p-3.5 border border-rose-900/40">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-200">Already Seen Impression Decay</span>
                    <span className="font-bold text-rose-400">{weights.already_seen} pts</span>
                  </div>
                  <input
                    type="range"
                    min="-40"
                    max="0"
                    value={weights.already_seen}
                    onChange={(e) => handleWeightChange("already_seen", parseInt(e.target.value, 10))}
                    className="w-full accent-rose-500 cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-400">Prevents impression fatigue for unclicked suggestions.</span>
                </div>

                <div className="space-y-2 rounded-xl bg-rose-950/30 p-3.5 border border-rose-900/40">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-200">Not Interested Explicit Penalty</span>
                    <span className="font-bold text-rose-400">{weights.not_interested} pts</span>
                  </div>
                  <input
                    type="range"
                    min="-100"
                    max="-20"
                    value={weights.not_interested}
                    onChange={(e) => handleWeightChange("not_interested", parseInt(e.target.value, 10))}
                    className="w-full accent-rose-500 cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-400">Aggressively suppresses candidates clicked as Not Interested.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Tab 2: Candidate Sources Toggles */}
      {activeTab === "sources" && config?.candidate_sources && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white">Multi-Source Candidate Generation Toggles</h3>
            <p className="text-xs text-slate-400">
              Enable or disable candidate retrieval pathways across the graph and behavioral indices.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {[
              { key: "enable_mutual_connections", label: "2nd-Degree Mutual Connections", desc: "Retrieves friends of friends from graph" },
              { key: "enable_same_organization", label: "Same Hospital / Organization", desc: "Retrieves clinicians from same employer" },
              { key: "enable_same_university", label: "Same University & Alumni", desc: "Retrieves batchmates and college graduates" },
              { key: "enable_same_specialization", label: "Same Clinical Specialization", desc: "Retrieves doctors with identical subspecialties" },
              { key: "enable_shared_communities", label: "Shared Specialty Communities", desc: "Retrieves peers from common groups" },
              { key: "enable_shared_learning", label: "Shared Courses & CME Learning", desc: "Retrieves learners enrolled in same modules" },
              { key: "enable_shared_research", label: "Shared Research Topics", desc: "Retrieves investigators with common trials" },
              { key: "enable_location", label: "Regional Healthcare Ecosystem", desc: "Retrieves practitioners from same city/state" },
              { key: "enable_behavioral", label: "Behavioral Profile Vectors", desc: "Retrieves candidates via dynamic search/view vectors" },
              { key: "enable_cold_start", label: "Cold-Start Engine", desc: "Provides verified bootstrap candidates for new users" },
            ].map((src) => {
              const enabled = (config.candidate_sources as any)[src.key];
              return (
                <div
                  key={src.key}
                  className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 p-3.5"
                >
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-white">{src.label}</p>
                    <p className="text-[11px] text-slate-400">{src.desc}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSourceToggle(src.key, !enabled)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      enabled ? "bg-blue-600" : "bg-slate-700"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        enabled ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 6. Tab 3: Diversity, Exploration & Time Decay */}
      {activeTab === "diversity" && config && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Diversity Rules */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Compass className="h-4 w-4 text-blue-400" />
              Anti-Filter-Bubble Diversity
            </h3>
            <p className="text-xs text-slate-400">
              Prevents monotonous feeds by strictly capping consecutive candidates of identical specialty.
            </p>

            <div className="space-y-4 pt-2">
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Max Consecutive Same Specialization</span>
                  <span className="font-bold text-blue-400">
                    {config.diversity.max_consecutive_specialization} candidates
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={config.diversity.max_consecutive_specialization}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      diversity: {
                        ...config.diversity,
                        max_consecutive_specialization: parseInt(e.target.value, 10),
                      },
                    })
                  }
                  className="w-full accent-blue-500 cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Max Consecutive Same Hospital</span>
                  <span className="font-bold text-blue-400">
                    {config.diversity.max_consecutive_organization} candidates
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={config.diversity.max_consecutive_organization}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      diversity: {
                        ...config.diversity,
                        max_consecutive_organization: parseInt(e.target.value, 10),
                      },
                    })
                  }
                  className="w-full accent-blue-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Exploration & Discovery Mix */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-400" />
              Exploration vs. Exploitation Ratio
            </h3>
            <p className="text-xs text-slate-400">
              Balance familiar high-confidence recommendations with cross-disciplinary discovery.
            </p>

            <div className="space-y-4 pt-2">
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Discovery Ratio</span>
                  <span className="font-bold text-amber-400">
                    {Math.round(config.exploration.exploration_ratio * 100)}% Discovery (
                    {Math.round((1 - config.exploration.exploration_ratio) * 100)}% Familiar)
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="5"
                  value={Math.round(config.exploration.exploration_ratio * 100)}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      exploration: {
                        ...config.exploration,
                        exploration_ratio: parseInt(e.target.value, 10) / 100,
                      },
                    })
                  }
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              {/* Time Decay Half Life */}
              <div className="space-y-1 pt-2 border-t border-slate-800">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-blue-400" /> Behavioral Time Decay Half-Life
                  </span>
                  <span className="font-bold text-blue-400">
                    {config.time_decay.half_life_days} days
                  </span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="60"
                  value={config.time_decay.half_life_days}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      time_decay: {
                        ...config.time_decay,
                        half_life_days: parseInt(e.target.value, 10),
                      },
                    })
                  }
                  className="w-full accent-blue-500 cursor-pointer"
                />
                <span className="text-[10px] text-slate-400">
                  Recent actions (searches, profile views) decay after {config.time_decay.half_life_days} days so old history does not permanently dominate.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. Tab 4: A/B Experiments */}
      {activeTab === "experiments" && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Live A/B Testing Experiments</h3>
              <p className="text-xs text-slate-400">
                Compare modified ranking models and feature weight distributions against production baselines.
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="rounded-xl border border-blue-500/30 bg-blue-950/20 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <h4 className="text-xs font-bold text-white">exp_ranking_weights_v2</h4>
                  <span className="rounded bg-blue-500/20 px-1.5 py-0.2 text-[9px] font-bold text-blue-300">
                    50% / 50% Split
                  </span>
                </div>
                <span className="text-xs text-emerald-400 font-semibold">Active in Production</span>
              </div>
              <p className="mt-1 text-xs text-slate-300">
                Testing +25% boost on Same Specialization and +30% boost on Mutual Connections.
              </p>
              <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-lg bg-slate-950 p-2.5 border border-slate-800">
                  <span className="font-bold text-slate-400 block text-[10px] uppercase">Variant A (Baseline)</span>
                  <span className="text-sm font-bold text-white">18.2% CTR</span>
                </div>
                <div className="rounded-lg bg-slate-950 p-2.5 border border-slate-800">
                  <span className="font-bold text-blue-400 block text-[10px] uppercase">Variant B (Challenger)</span>
                  <span className="text-sm font-bold text-emerald-400">22.4% CTR (+23%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 8. Tab 5: Category Performance Breakdown */}
      {activeTab === "analytics" && analytics && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-4">
          <h3 className="text-sm font-bold text-white">Recommendation Category Performance</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="border-b border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="pb-2">Category</th>
                  <th className="pb-2">Impressions</th>
                  <th className="pb-2">Conversions</th>
                  <th className="pb-2">Conversion Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {Object.entries(analytics.categoryBreakdown).map(([cat, data]) => (
                  <tr key={cat}>
                    <td className="py-2.5 font-semibold text-white capitalize">
                      {cat.replace(/-/g, " ")}
                    </td>
                    <td className="py-2.5">{data.impressions.toLocaleString()}</td>
                    <td className="py-2.5">{data.conversions.toLocaleString()}</td>
                    <td className="py-2.5 font-bold text-blue-400">{data.rate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
