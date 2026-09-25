// ============================================================
// MGN Communication Engine — Messages Page
// app/(app)/messages/page.tsx
// ============================================================

import React, { Suspense } from "react";
import { CommunicationShell } from "@/modules/communication/components/CommunicationShell";
import { Loader2 } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Communication | Med Global Network",
  description:
    "Professional Communication Layer for clinicians, groups, events, camps, research, and healthcare organizations on MGN.life",
};

export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[calc(100dvh-4.5rem)] items-center justify-center">
          <Loader2 className="size-8 animate-spin text-[#1769c2]" />
        </div>
      }
    >
      <CommunicationShell />
    </Suspense>
  );
}
