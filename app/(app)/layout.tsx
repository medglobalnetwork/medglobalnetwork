import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { VerificationService } from "@/modules/onboarding/lib/verification-service";
import AppHeader from "@/components/AppHeader";
import AppBottomNav from "@/components/AppBottomNav";
import GracePeriodBanner from "@/components/GracePeriodBanner";

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
      <AppHeader />
      <div className="flex-1 pb-18 md:pb-0">{children}</div>
      <AppBottomNav />
    </>
  );
}
