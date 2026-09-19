import AppHeader from "@/components/AppHeader";
import AppBottomNav from "@/components/AppBottomNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppHeader />
      {children}
      <AppBottomNav />
    </>
  );
}
