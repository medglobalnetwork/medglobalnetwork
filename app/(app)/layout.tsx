import AppHeader from "@/components/AppHeader";
import AppBottomNav from "@/components/AppBottomNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppHeader />
      <div className="flex-1 pb-18 md:pb-0">{children}</div>
      <AppBottomNav />
    </>
  );
}
