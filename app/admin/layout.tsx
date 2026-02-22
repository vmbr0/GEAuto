import { requireRole } from "@/lib/auth-helpers";
import { UserRole } from "@prisma/client";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole(UserRole.ADMIN);

  return (
    <div className="min-h-screen bg-[#0B0F14] flex" data-theme="dark">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        <div className="container-custom py-8 lg:py-10">{children}</div>
      </main>
    </div>
  );
}
