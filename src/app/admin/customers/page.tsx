import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/supabase/auth";
import { getAllAdminCustomers } from "@/lib/supabase/admin-logistics";
import CustomerListClient from "@/components/admin/CustomerListClient";

export default async function AdminCustomersPage() {
  const { user, isAdmin } = await getAdminSession();

  if (!user) {
    redirect("/admin/login");
  }

  if (!isAdmin) {
    redirect("/");
  }

  const customers = await getAllAdminCustomers();

  return <CustomerListClient initialCustomers={customers} />;
}
