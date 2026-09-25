"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { RecruiterJobBuilder } from "@/modules/opportunities/components/RecruiterJobBuilder";
import { Organization } from "@/modules/opportunities/types";

export default function CreateOpportunityPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const [organizations, setOrganizations] = React.useState<Organization[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (!isPending && !session) router.replace("/");
  }, [isPending, router, session]);

  React.useEffect(() => {
    if (!session?.user) return;
    const load = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("/api/opportunities/organizations");
        const data = await res.json();
        if (res.ok && data.organizations) {
          setOrganizations(data.organizations);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [session?.user]);

  if (isPending || !session) return <main className="min-h-dvh bg-[#f5f5f4]" />;

  return (
    <main className="min-h-dvh bg-[#f5f5f4] p-4 sm:p-8 pb-36 text-[#171717]">
      <div className="mx-auto max-w-3xl space-y-4">
        <button
          type="button"
          onClick={() => router.push("/recruiter")}
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#1769c2] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1769c2] rounded"
        >
          <ArrowLeft className="size-3.5" /> Back to Recruiter Studio
        </button>

        {isLoading ? (
          <div className="h-96 rounded-3xl bg-white/70 animate-pulse border border-[#ded8d1]" />
        ) : (
          <RecruiterJobBuilder organizations={organizations} />
        )}
      </div>
    </main>
  );
}
