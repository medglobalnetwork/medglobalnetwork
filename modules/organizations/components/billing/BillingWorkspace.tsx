"use client";

import React, { useState } from "react";
import {
  CreditCard,
  CheckCircle2,
  Shield,
  Zap,
  Check,
  AlertCircle,
  FileText,
  Clock,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { OrganizationRecord, SubscriptionPlan, PLAN_LIMITS, OrgRole, OrgPermission } from "../../types";
import { hasOrgPermission } from "../../lib/org-permissions";

interface Props {
  organization: OrganizationRecord;
  userRole?: OrgRole;
  customPermissions?: OrgPermission[];
}

export function BillingWorkspace({ organization, userRole, customPermissions }: Props) {
  const [currentPlan, setCurrentPlan] = useState<SubscriptionPlan>(organization.plan || "Basic");
  const [upgrading, setUpgrading] = useState(false);
  const [upgradeSuccess, setUpgradeSuccess] = useState(false);

  const canManageBilling = hasOrgPermission(userRole, customPermissions, "BILLING_MANAGE");

  const plans: {
    id: SubscriptionPlan;
    name: string;
    priceMonthly: string;
    priceYearly: string;
    description: string;
    features: string[];
    isPopular?: boolean;
  }[] = [
    {
      id: "Basic",
      name: "Basic",
      priceMonthly: "Free",
      priceYearly: "Free",
      description: "Essential workspace for solo clinics & verified practitioners",
      features: [
        "Up to 5 Team Members",
        "2 Active Job Openings",
        "2 Clinical Events per month",
        "1 Health Camp per month",
        "1 LMS Course",
        "Community Groups",
      ],
    },
    {
      id: "Professional",
      name: "Professional",
      priceMonthly: "₹4,999 / mo",
      priceYearly: "₹49,990 / yr",
      description: "Advanced clinical operations for multi-specialty clinics & institutes",
      isPopular: true,
      features: [
        "Up to 25 Team Members",
        "15 Active Job Openings",
        "10 Events per month",
        "5 Health Camps per month",
        "2 Multi-Track Conferences / yr",
        "10 LMS Courses & Live Classes",
        "Custom Roles & Granular RBAC",
        "Advanced Operational Analytics",
      ],
    },
    {
      id: "Business",
      name: "Business",
      priceMonthly: "₹14,999 / mo",
      priceYearly: "₹1,49,990 / yr",
      description: "Full enterprise power for hospitals, medical colleges & pharma",
      features: [
        "Up to 100 Team Members",
        "50 Active Job Openings",
        "50 Events per month",
        "20 Health Camps per month",
        "10 Conferences / yr",
        "50 LMS Courses",
        "Dedicated Account Lead",
        "API Integration & Webhooks",
      ],
    },
    {
      id: "Enterprise",
      name: "Enterprise",
      priceMonthly: "Custom",
      priceYearly: "Custom",
      description: "Bespoke deployment for healthcare networks & government bodies",
      features: [
        "Unlimited Team Members",
        "Unlimited Jobs & Requisitions",
        "Unlimited Events & Camps",
        "Unlimited Conferences & Tracks",
        "Dedicated SLA & 24/7 Phone Support",
        "Custom B2B Contract & GST Invoicing",
      ],
    },
  ];

  const handleSelectPlan = async (plan: SubscriptionPlan) => {
    if (!canManageBilling) return;
    if (plan === currentPlan) return;
    setUpgrading(true);
    try {
      const res = await fetch(`/api/org/${organization.id}/billing`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      if (res.ok) {
        setCurrentPlan(plan);
        setUpgradeSuccess(true);
        setTimeout(() => setUpgradeSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpgrading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold mb-2">
          <CreditCard className="size-3.5" />
          <span>Workspace Subscriptions & Tier Entitlements</span>
        </div>
        <h1 className="text-2xl font-extrabold text-white">Subscription & Plan Management</h1>
        <p className="text-xs text-slate-400 mt-1">
          Scale your operational capabilities across recruiting, multi-track conferences, medical camps, and LMS courses.
        </p>
      </div>

      {upgradeSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="size-4" /> Workspace entitlements updated successfully!
        </div>
      )}

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map((p) => {
          const isCurrent = currentPlan === p.id;
          return (
            <div
              key={p.id}
              className={`rounded-2xl p-5 flex flex-col justify-between transition-all relative ${
                isCurrent
                  ? "bg-slate-900 border-2 border-blue-500 shadow-xl shadow-blue-950/40"
                  : p.isPopular
                  ? "bg-slate-900/90 border border-purple-500/40"
                  : "bg-slate-900/60 border border-slate-800"
              }`}
            >
              {p.isPopular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-600 text-white shadow-sm">
                  Recommended
                </span>
              )}

              <div>
                <h3 className="text-base font-bold text-white">{p.name}</h3>
                <p className="text-xs text-slate-400 min-h-[32px] mt-1">{p.description}</p>
                <div className="mt-4 pb-4 border-b border-slate-800">
                  <span className="text-xl font-black text-white">{p.priceMonthly}</span>
                </div>

                <ul className="mt-4 space-y-2.5 text-xs text-slate-300">
                  {p.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="size-3.5 text-blue-400 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800">
                {isCurrent ? (
                  <button
                    disabled
                    className="w-full py-2 rounded-xl bg-slate-800 text-slate-400 text-xs font-bold cursor-default"
                  >
                    Current Active Plan
                  </button>
                ) : (
                  <button
                    onClick={() => handleSelectPlan(p.id)}
                    disabled={upgrading || !canManageBilling}
                    className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors disabled:opacity-50"
                  >
                    {upgrading ? "Updating..." : `Switch to ${p.name}`}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Entitlement limits table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-white">Active Plan Entitlements & Resource Limits</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400">Team Members Limit</span>
            <p className="text-lg font-bold text-white mt-1">
              {PLAN_LIMITS[currentPlan]?.maxMembers} members
            </p>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400">Active Job Postings</span>
            <p className="text-lg font-bold text-white mt-1">
              {PLAN_LIMITS[currentPlan]?.maxActiveJobs} active
            </p>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400">Clinical Events / Mo</span>
            <p className="text-lg font-bold text-white mt-1">
              {PLAN_LIMITS[currentPlan]?.maxEventsPerMonth} / month
            </p>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400">Medical Camps / Mo</span>
            <p className="text-lg font-bold text-white mt-1">
              {PLAN_LIMITS[currentPlan]?.maxCampsPerMonth} / month
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
