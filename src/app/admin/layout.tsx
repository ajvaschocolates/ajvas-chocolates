import { getAdminSession } from "@/lib/supabase/auth";
import AdminLayoutClient from "@/components/admin/AdminLayoutClient";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAdmin } = await getAdminSession();

  // If user is not authenticated or not an admin (e.g. on /admin/login page), render children directly without admin shell
  if (!user || !isAdmin) {
    return <>{children}</>;
  }

  return (
    <AdminLayoutClient userEmail={user.email}>
      {children}
    </AdminLayoutClient>
  );
}
