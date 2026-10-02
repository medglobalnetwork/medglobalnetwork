"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  Plus,
  ShieldCheck,
  Users,
  ArrowRight,
  Search,
  Sparkles,
  MapPin,
  Globe,
  Briefcase,
  X,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import {
  OrganizationRecord,
  OrganizationType,
  ALL_ORGANIZATION_TYPES,
} from "@/modules/organizations/types";
import { getRoleBadgeClass, getRoleDisplayName } from "@/modules/organizations/lib/org-permissions";

export default function OrganizationsHubPage() {
  const router = useRouter();
  const [myOrgs, setMyOrgs] = useState<OrganizationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Create Org Modal Wizard
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [orgType, setOrgType] = useState<OrganizationType>("Hospital");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [specialties, setSpecialties] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  const loadMyOrgs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/organizations", { credentials: "include" });
      const data = await res.json();
      if (Array.isArray(data)) {
        setMyOrgs(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMyOrgs();
  }, []);

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    setIsCreating(true);
    setCreateError("");

    try {
      const specialtiesArray = specialties
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await fetch("/api/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          organization_type: orgType,
          description: description || undefined,
          email: email || undefined,
          phone: phone || undefined,
          website: website || undefined,
          city: city || undefined,
          state: state || undefined,
          license_number: licenseNumber || undefined,
          specialties: specialtiesArray,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setCreateError(data.error || "Failed to create organisation");
      } else if (data.organization?.id) {
        setIsCreateOpen(false);
        router.push(`/org/${data.organization.id}`);
      }
    } catch (err: any) {
      setCreateError(err.message || "Network error");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Hero / Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border border-slate-800 p-6 sm:p-10">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold">
              <Building2 className="size-3.5" />
              <span>MGN B2B Healthcare Operations Hub</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Organisations & Workspaces
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Role-based operations workspaces for hospitals, clinics, medical colleges, diagnostic chains, research institutes, and NGOs. One verified platform for hiring, CME conferences, health camps, and LMS education.
            </p>
          </div>

          <button
            onClick={() => {
              setStep(1);
              setIsCreateOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold shadow-xl shadow-blue-900/40 transition-all hover:scale-105 shrink-0"
          >
            <Plus className="size-5" />
            <span>Create Organisation</span>
          </button>
        </div>
      </div>

      {/* My Workspaces Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Your Active Workspaces</h2>
            <p className="text-xs text-slate-400">
              Select an organisation to enter its role-based operations dashboard.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-slate-500 text-xs animate-pulse bg-slate-900 rounded-2xl border border-slate-800">
            Loading your workspaces...
          </div>
        ) : myOrgs.length === 0 ? (
          <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
            <Building2 className="size-12 mx-auto text-slate-600" />
            <div className="space-y-1 max-w-sm mx-auto">
              <h3 className="text-base font-bold text-white">No Organisation Workspaces</h3>
              <p className="text-xs text-slate-400">
                You haven't created or joined an organisation workspace yet. Register your hospital, clinic, or institute to unlock B2B operational modules.
              </p>
            </div>
            <button
              onClick={() => {
                setStep(1);
                setIsCreateOpen(true);
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md transition-all"
            >
              <Plus className="size-4" />
              <span>Register First Organisation</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {myOrgs.map((org) => {
              const isVerified = org.verification_status === "verified";
              const roleBadgeClass = getRoleBadgeClass(org.my_role);
              const roleLabel = getRoleDisplayName(org.my_role);

              return (
                <div
                  key={org.id}
                  className="group bg-slate-900 border border-slate-800 hover:border-blue-500/50 rounded-2xl p-6 flex flex-col justify-between transition-all hover:shadow-xl hover:shadow-blue-950/30"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="size-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-black text-lg shadow-md shrink-0 border border-white/10 overflow-hidden">
                        {org.logo_url ? (
                          <img
                            src={org.logo_url}
                            alt={org.name}
                            className="size-full object-cover"
                          />
                        ) : (
                          <span>{org.name.charAt(0).toUpperCase()}</span>
                        )}
                      </div>

                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${roleBadgeClass}`}
                      >
                        {roleLabel}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors truncate">
                          {org.name}
                        </h3>
                        {isVerified && (
                          <ShieldCheck className="size-4 text-emerald-400 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {org.organization_type} • {org.city || "India"}
                      </p>
                    </div>

                    {org.description && (
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {org.description}
                      </p>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-xs text-slate-400 flex items-center gap-1.5">
                      <Users className="size-3.5 text-blue-400" />
                      <span>{org.member_count || 1} Members</span>
                    </span>

                    <Link
                      href={`/org/${org.id}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-sm transition-all"
                    >
                      <span>Open Workspace</span>
                      <ArrowRight className="size-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Creation Modal Wizard */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <Building2 className="size-6 text-blue-400" />
                <div>
                  <h2 className="text-lg font-bold text-white">Create Healthcare Organisation</h2>
                  <p className="text-[11px] text-slate-400">Step {step} of 3 • Workspace Provisioning</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white bg-slate-800"
              >
                <X className="size-4" />
              </button>
            </div>

            {createError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 font-medium">
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateOrg} className="space-y-4 text-xs">
              {step === 1 && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1.5">
                      Organisation Legal / Trading Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Apollo Multi-Speciality Hospitals"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1.5">
                      Organisation Type *
                    </label>
                    <select
                      value={orgType}
                      onChange={(e) => setOrgType(e.target.value as OrganizationType)}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                    >
                      {ALL_ORGANIZATION_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1.5">
                      Short Description / Mission
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Overview of clinical services and facility..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1.5">
                        Official Contact Email
                      </label>
                      <input
                        type="email"
                        placeholder="admin@hospital.org"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1.5">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        placeholder="+91 98765 43210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1.5">
                      Website URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://www.hospital.org"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1.5">City</label>
                      <input
                        type="text"
                        placeholder="e.g. Mumbai, New Delhi"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1.5">State</label>
                      <input
                        type="text"
                        placeholder="e.g. Maharashtra"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1.5">
                      Clinical Establishment / Hospital License No. (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. CEA/MH/2024/98432"
                      value={licenseNumber}
                      onChange={(e) => setLicenseNumber(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-300 mb-1.5">
                      Clinical Specialties (comma-separated)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Cardiology, Neurology, Oncology, Orthopedics"
                      value={specialties}
                      onChange={(e) => setSpecialties(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <h4 className="font-bold text-white text-xs">Included in Basic Workspace:</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      ✓ Instant Owner access • ✓ Up to 5 team members • ✓ 2 active job openings • ✓ 2 clinical events & 1 camp per month • ✓ Organization profile & community group.
                    </p>
                  </div>
                </div>
              )}

              {/* Step Controls */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={() => setStep((s) => s - 1)}
                    className="px-4 py-2 rounded-xl text-slate-400 hover:text-white font-medium"
                  >
                    Back
                  </button>
                ) : (
                  <div />
                )}

                {step < 3 ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (!name) {
                        setCreateError("Please enter organisation name");
                        return;
                      }
                      setCreateError("");
                      setStep((s) => s + 1);
                    }}
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all"
                  >
                    Continue
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-900/40 transition-all disabled:opacity-50"
                  >
                    {isCreating ? "Provisioning..." : "Launch Workspace"}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
