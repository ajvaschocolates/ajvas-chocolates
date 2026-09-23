import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/supabase/auth";
import { getAllAdminCouriers } from "@/lib/supabase/admin-logistics";
import CourierListClient from "@/components/admin/CourierListClient";

export default async function AdminCouriersPage() {
  const { user, isAdmin } = await getAdminSession();

  if (!user) {
    redirect("/admin/login");
  }

  if (!isAdmin) {
    redirect("/");
  }

  const couriers = await getAllAdminCouriers();

  return <CourierListClient initialCouriers={couriers} />;
}
