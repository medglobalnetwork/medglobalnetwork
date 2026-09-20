"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  ArrowRight,
  Bone,
  Brain,
  Briefcase,
  Building2,
  CheckCircle2,
  FlaskConical,
  GraduationCap,
  HeartPulse,
  MapPin,
  Plus,
  PlusCircle,
  Search,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Syringe,
  Zap,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { JobCard } from "@/modules/opportunities/components/JobCard";
import { EmptyState } from "@/modules/network/components/EmptyState";
import { Job, Organization } from "@/modules/opportunities/types";

export default function OpportunitiesPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const [recommendedJobs, setRecommendedJobs] = React.useState<Job[]>([]);
  const [featuredJobs, setFeaturedJobs] = React.useState<Job[]>([]);
  const [internships, setInternships] = React.useState<Job[]>([]);
  const [organizations, setOrganizations] = React.useState<Organization[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [locationQuery, setLocationQuery] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (!isPending && !session) router.replace("/");
  }, [isPending, router, session]);

  React.useEffect(() => {
    if (!session?.user) return;

    const loadData = async () => {
      setIsLoading(true);
      try {
        // 1. Recommended Jobs
        const recRes = await fetch("/api/opportunities/jobs?recommended=true&pageSize=4");
        const recData = await recRes.json();
        if (recRes.ok && recData.jobs) {
          setRecommendedJobs(recData.jobs);
        }

        // 2. Featured / Popular Jobs
        const featRes = await fetch("/api/opportunities/jobs?sort=popular&pageSize=6");
        const featData = await featRes.json();
        if (featRes.ok && featData.jobs) {
          setFeaturedJobs(featData.jobs);
        }

        // 3. Clinical Internships
        const internRes = await fetch("/api/opportunities/jobs?opportunityType=clinical_internship&pageSize=4");
        const internData = await internRes.json();
        if (internRes.ok && internData.jobs) {
          setInternships(internData.jobs);
        }

        // 4. Top Organizations
        const orgRes = await fetch("/api/opportunities/organizations");
        const orgData = await orgRes.json();
        if (orgRes.ok && orgData.organizations) {
          setOrganizations(orgData.organizations.slice(0, 4));
        }
      } catch (err) {
        console.error("Failed to load opportunities:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [session?.user]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set("query", searchQuery.trim());
    if (locationQuery.trim()) params.set("city", locationQuery.trim());
    router.push(`/opportunities/jobs?${params.toString()}`);
  };

  if (isPending || !session) {
    return (
      <main className="min-h-screen bg-[#f5f5f4] p-6">
        <div className="mx-auto max-w-7xl space-y-6 animate-pulse">
          <div className="h-36 rounded-3xl bg-white/60" />
          <div className="h-48 rounded-3xl bg-white/60" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="h-56 rounded-2xl bg-white/60" />
            <div className="h-56 rounded-2xl bg-white/60" />
            <div className="h-56 rounded-2xl bg-white/60" />
          </div>
        </div>
      </main>
    );
  }

  const specialties = [
    { name: "Sports Rehabilitation", icon: Activity, count: "Physiotherapy" },
    { name: "Cardiology", icon: HeartPulse, count: "Medicine & Surgery" },
    { name: "Orthopedics", icon: Bone, count: "Joints & Spine" },
    { name: "Clinical Research", icon: FlaskConical, count: "Trials & GCP" },
    { name: "Neurology", icon: Brain, count: "Neuro Rehab" },
    { name: "Critical Care", icon: Syringe, count: "ICU & Nursing" },
  ];

  return (
    <main className="min-h-screen bg-[#f5f5f4] pb-36 text-[#171717]">
      {/* ─────────────────────────────────────────────
          1. HERO SEARCH & DISCOVERY BANNER
          ───────────────────────────────────────────── */}
      <section className="border-b border-[#ded8d1] bg-gradient-to-br from-[#0f4c81] via-[#1769c2] to-[#1e3a8a] text-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold tracking-wide text-white backdrop-blur-xs">
              <Briefcase className="h-3.5 w-3.5" /> Verified Healthcare Careers & Clinical Fellowships
            </span>
            <h1 className="text-2xl font-black tracking-tight text-white sm:text-4xl">
              Advance Your Clinical Career
            </h1>
            <p className="text-xs text-white/80 sm:text-sm">
              Discover verified openings across top hospitals, specialized physiotherapy centers, and medical research institutes.
            </p>

            {/* Faceted Dual Search Bar Form */}
            <form onSubmit={handleSearch} className="flex flex-col gap-2 pt-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Role, specialty, or hospital e.g. 'Sports Physiotherapist', 'Apollo'..."
                  className="h-11 w-full rounded-2xl border border-white/20 bg-white/10 pl-10 pr-4 text-xs text-white placeholder:text-white/60 backdrop-blur-xs focus:bg-white focus:text-[#171717] focus:outline-none sm:text-sm"
                />
              </div>

              <div className="relative sm:w-56">
                <MapPin className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60" />
                <input
                  type="text"
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  placeholder="City e.g. 'Raipur', 'Delhi'..."
                  className="h-11 w-full rounded-2xl border border-white/20 bg-white/10 pl-10 pr-4 text-xs text-white placeholder:text-white/60 backdrop-blur-xs focus:bg-white focus:text-[#171717] focus:outline-none sm:text-sm"
                />
              </div>

              <button
                type="submit"
                className="inline-flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-2xl bg-white px-6 text-xs font-bold text-[#1769c2] shadow-sm transition hover:bg-[#eef5fc]"
              >
                Find Jobs
              </button>
            </form>
          </div>

          {/* Quick Navigation Pills */}
          <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-white/10 pt-4 text-xs">
            <button
              type="button"
              onClick={() => router.push("/opportunities/jobs")}
              className="inline-flex items-center gap-1 font-semibold text-white hover:underline"
            >
              Explore All Jobs <ArrowRight className="h-3.5 w-3.5" />
            </button>
            <span className="text-white/40">·</span>
            <button
              type="button"
              onClick={() => router.push("/opportunities/internships")}
              className="font-semibold text-white/90 hover:text-white hover:underline"
            >
              Clinical Internships & Fellowships
            </button>
            <span className="text-white/40">·</span>
            <button
              type="button"
              onClick={() => router.push("/opportunities/applications")}
              className="font-semibold text-white/90 hover:text-white hover:underline"
            >
              My Applications
            </button>
            <span className="text-white/40">·</span>
            <button
              type="button"
              onClick={() => router.push("/opportunities/saved")}
              className="font-semibold text-white/90 hover:text-white hover:underline"
            >
              Saved Jobs
            </button>
            <span className="text-white/40">·</span>
            <button
              type="button"
              onClick={() => router.push("/recruiter/jobs/create")}
              className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold text-white hover:bg-white/30"
            >
              <PlusCircle className="h-3.5 w-3.5" /> Hospital Recruiter Portal
            </button>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────
          2. MAIN DISCOVERY CONTENT
          ───────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-10">
        {/* Specialty Navigation */}
        <section aria-label="Specialties">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-[#171717]">Explore Roles by Specialty</h2>
            <p className="text-xs text-[#77716b]">Targeted clinical openings across medical domains</p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {specialties.map((spec) => {
              const IconComp = spec.icon;
              return (
                <button
                  key={spec.name}
                  type="button"
                  onClick={() => router.push(`/opportunities/jobs?specialization=${encodeURIComponent(spec.name)}`)}
                  className="group flex flex-col items-center justify-center rounded-2xl border border-[#ded8d1] bg-white p-4 text-center shadow-2xs transition hover:-translate-y-1 hover:border-[#1769c2] hover:shadow-xs"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eef5fc] text-[#1769c2] transition group-hover:bg-[#1769c2] group-hover:text-white">
                    <IconComp className="h-5 w-5" />
                  </div>
                  <p className="mt-2 text-xs font-bold text-[#171717] group-hover:text-[#1769c2]">
                    {spec.name}
                  </p>
                  <p className="text-[10px] text-[#77716b]">{spec.count}</p>
                </button>
              );
            })}
          </div>
        </section>

        {/* Recommended for User's Verified Profile */}
        {recommendedJobs.length > 0 && (
          <section aria-label="Recommended Opportunities">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#171717] flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#1769c2]" /> Recommended for Your Clinical Profile
                </h2>
                <p className="text-xs text-[#77716b]">
                  Matched with your medical degrees, council verification, and clinical specializations
                </p>
              </div>
              <button
                type="button"
                onClick={() => router.push("/opportunities/jobs?recommended=true")}
                className="text-xs font-semibold text-[#1769c2] hover:underline"
              >
                View More →
              </button>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-2">
              {recommendedJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          </section>
        )}

        {/* Featured & Popular Openings */}
        <section aria-label="Popular Openings">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#171717]">Active Healthcare Openings</h2>
              <p className="text-xs text-[#77716b]">Most recent clinical and research opportunities</p>
            </div>
            <button
              type="button"
              onClick={() => router.push("/opportunities/jobs")}
              className="text-xs font-semibold text-[#1769c2] hover:underline"
            >
              Browse All ({featuredJobs.length}) →
            </button>
          </div>

          {featuredJobs.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-2">
              {featuredJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          ) : !isLoading ? (
            <EmptyState
              icon={<Briefcase className="h-10 w-10 text-[#77716b]" />}
              title="No active openings right now"
              description="Be the first verified hospital or clinic recruiter to post a clinical opening on MGN."
              actionText="+ Post an Opportunity"
              onAction={() => router.push("/recruiter/jobs/create")}
            />
          ) : null}
        </section>

        {/* Clinical Internships Spotlight */}
        {internships.length > 0 && (
          <section aria-label="Internships">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#171717] flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-[#15803d]" /> Clinical Internships & Fellowships
                </h2>
                <p className="text-xs text-[#77716b]">
                  Hands-on hospital rotations, observerships, and fellowship programs for medical graduates
                </p>
              </div>
              <button
                type="button"
                onClick={() => router.push("/opportunities/internships")}
                className="text-xs font-semibold text-[#1769c2] hover:underline"
              >
                View All Internships →
              </button>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-2">
              {internships.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          </section>
        )}

        {/* Verified Healthcare Employers */}
        {organizations.length > 0 && (
          <section aria-label="Hiring Organizations">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#171717]">Featured Hospitals & Institutes</h2>
                <p className="text-xs text-[#77716b]">Accredited healthcare networks actively recruiting</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {organizations.map((org) => (
                <div
                  key={org.id}
                  onClick={() => router.push(`/opportunities/organizations/${org.slug || org.id}`)}
                  className="group flex cursor-pointer flex-col justify-between rounded-3xl border border-[#ded8d1] bg-white p-5 shadow-2xs transition hover:border-[#1769c2] hover:shadow-xs"
                >
                  <div>
                    <div className="flex items-center gap-3">
                      {org.logo_url ? (
                        <img
                          src={org.logo_url}
                          alt={org.name}
                          className="h-12 w-12 rounded-2xl object-cover border border-[#e8e6e3]"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef5fc] font-bold text-[#1769c2]">
                          {org.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-1">
                          <h3 className="font-bold text-xs text-[#171717] group-hover:text-[#1769c2] line-clamp-1">
                            {org.name}
                          </h3>
                          {org.verification_status === "verified" && (
                            <ShieldCheck className="h-3.5 w-3.5 fill-[#1769c2]/15 text-[#1769c2] shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] text-[#77716b]">{org.city}, {org.state || "India"}</p>
                      </div>
                    </div>

                    <p className="mt-3 text-xs text-[#5d5854] line-clamp-2">
                      {org.description}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-[#f5f4f3] pt-3 text-xs">
                    <span className="font-bold text-[#1769c2]">
                      {org.active_jobs_count || 1} Openings
                    </span>
                    <span className="text-[11px] font-semibold text-[#77716b] group-hover:text-[#1769c2]">
                      View Profile →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
