import { Suspense } from "react";
import { AuthPage } from "@/modules/auth/components/AuthPage";

export const metadata = {
  title: "Sign In | MedGlobalNetwork",
  description: "Sign in to your verified MedGlobalNetwork medical account.",
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-[#faf9f8]" />}>
      <AuthPage defaultMode="signin" />
    </Suspense>
  );
}
