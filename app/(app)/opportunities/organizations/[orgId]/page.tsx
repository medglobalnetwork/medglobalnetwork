"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Globe,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { JobCard } from "@/modules/opportunities/components/JobCard";
import { Organization, Job } from "@/modules/opportunities/types";

export default function OrganizationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orgId = params?.orgId as string;

  const [organization, setOrganization] = React.useState<Organization | null>(null);
  const [jobs, setJobs] = React.useState<Job[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (!orgId) return;
    const load = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/opportunities/organizations/${orgId}`);
        const data = await res.json();
        if (res.ok && data.organization) {
          setOrganization(data.organization);
          setJobs(data.jobs || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [orgId]);

  if (isLoading) {
    return <main className="min-h-screen bg-[#f5f5f4]" />;
  }

  if (!organization) {
    return (
      <main className="min-h-screen bg-[#f5f5f4] p-8 text-center text-[#171717]">
        <h2>Organization Not Found</h2>
      </main>
    );
  }

  const isVerified = organization.verification_status === "verified";

  return (
    <main className="min-h-screen bg-[#f5f5f4] pb-36 text-[#171717]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        <button
          type="button"
          onClick={() => router.push("/opportunities")}
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#1769c2] hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Opportunities Discovery
        </button>

        {/* Organization Profile Card */}
        <div className="overflow-hidden rounded-3xl border border-[#ded8d1] bg-white p-6 shadow-xs sm:p-8 space-y-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            {organization.logo_url ? (
              <img
                src={organization.logo_url}
                alt={organization.name}
                className="h-20 w-20 shrink-0 rounded-2xl border border-[#ded8d1] object-cover shadow-2xs sm:h-24 sm:w-24"
              />
            ) : (
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-[#ded8d1] bg-[#eef5fc] text-2xl font-bold text-[#1769c2] sm:h-24 sm:w-24">
                {organization.name.slice(0, 2).toUpperCase()}
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black tracking-tight text-[#171717] sm:text-2xl">
                  {organization.name}
                </h1>
                {isVerified && (
                  <span title="Verified Healthcare Employer" className="inline-flex items-center">
                    <ShieldCheck className="h-5 w-5 fill-[#1769c2]/15 text-[#1769c2]" />
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-[#77716b]">
                <span>{organization.organization_type}</span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-[#1769c2]" />
                  {organization.city ? `${organization.city}, ${organization.state || "India"}` : "India"}
                </span>
                {organization.website && (
                  <>
                    <span>·</span>
                    <a
                      href={organization.website}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[#1769c2] hover:underline"
                    >
                      <Globe className="h-3.5 w-3.5" /> Website
                    </a>
                  </>
                )}
              </div>

              {organization.description && (
                <p className="max-w-3xl text-xs leading-relaxed text-[#44403c]">
                  {organization.description}
                </p>
              )}

              {/* Specialties */}
              {organization.specialties && organization.specialties.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {organization.specialties.map((s) => (
                    <span
                      key={s}
                      className="rounded-full bg-[#eef5fc] px-3 py-0.5 text-[11px] font-semibold text-[#1769c2]"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Active Openings from this Organization */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-[#171717]">
            Active Openings at {organization.name} ({jobs.length})
          </h2>

          {jobs.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-[#ded8d1] bg-white p-8 text-center text-xs text-[#77716b]">
              No current openings posted by this organization.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
