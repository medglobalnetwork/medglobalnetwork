import { Suspense } from "react";
import { AuthPage } from "@/modules/auth/components/AuthPage";

export const metadata = {
  title: "Join Network | MedGlobalNetwork",
  description: "Create your verified MedGlobalNetwork medical account.",
};

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-[#faf9f8]" />}>
      <AuthPage defaultMode="signup" />
    </Suspense>
  );
}
