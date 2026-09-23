import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { VerificationService } from "@/modules/onboarding/lib/verification-service";
import GracePeriodBanner from "@/components/GracePeriodBanner";
import { AppShell } from "@/components/AppShell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/");
  }

  // Super admin bypass
  const isSuperAdmin = session.user.email?.toLowerCase() === "patreshubham141@gmail.com";

  if (!isSuperAdmin) {
    const identity = await VerificationService.getIdentity(session.user.id);

    if (!identity || identity.verification_status === "DRAFT") {
      redirect("/onboarding");
    }

    // Lockout only if 3-day deadline passed (VERIFICATION_INCOMPLETE), or SUSPENDED / REJECTED
    if (
      identity.verification_status === "VERIFICATION_INCOMPLETE" ||
      identity.verification_status === "REJECTED" ||
      identity.verification_status === "SUSPENDED"
    ) {
      redirect("/onboarding/status");
    }
  }

  return (
    <>
      <GracePeriodBanner />
      <AppShell>{children}</AppShell>
    </>
  );
}
