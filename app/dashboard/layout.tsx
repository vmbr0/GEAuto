import { getCurrentUser } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import DashboardTopBar from "@/components/layout/DashboardTopBar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex" data-theme="dark">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardTopBar user={user} />
        <main className="flex-1 overflow-auto">
          <div className="container-custom py-8 lg:py-10">{children}</div>
        </main>
      </div>
    </div>
  );
}
