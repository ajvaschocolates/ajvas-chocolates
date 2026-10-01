import { headers } from "next/headers";
import { getAdminSession } from "@/lib/supabase/auth";
import AdminLayoutClient from "@/components/admin/AdminLayoutClient";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const reqHeaders = await headers();
  const isVerifiedAdmin = reqHeaders.get("x-admin-verified") === "1";
  const verifiedEmail = reqHeaders.get("x-admin-email");

  if (isVerifiedAdmin) {
    return (
      <AdminLayoutClient userEmail={verifiedEmail || null}>
        {children}
      </AdminLayoutClient>
    );
  }

  // Fallback check if request didn't go through middleware with headers
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
