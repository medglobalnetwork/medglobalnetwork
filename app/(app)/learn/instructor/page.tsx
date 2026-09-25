"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { InstructorBuilder } from "@/modules/learn/components/InstructorBuilder";

export default function InstructorPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  React.useEffect(() => {
    if (!isPending && !session) router.replace("/");
  }, [isPending, router, session]);

  if (isPending || !session) {
    return <main className="min-h-dvh bg-[#f5f5f4]" />;
  }

  return (
    <main className="min-h-dvh bg-[#f5f5f4] pb-36 text-[#171717]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        <div>
          <button
            type="button"
            onClick={() => router.push("/learn")}
            className="text-xs font-semibold text-[#1769c2] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1769c2] rounded"
          >
            ← Back to Learn Home
          </button>
        </div>

        <InstructorBuilder />
      </div>
    </main>
  );
}
