import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/supabase/auth";
import { getAllAdminOrders } from "@/lib/supabase/admin-orders";
import OrderListClient from "@/components/admin/OrderListClient";

export default async function AdminOrdersPage() {
  const { user, isAdmin } = await getAdminSession();

  if (!user) {
    redirect("/admin/login");
  }

  if (!isAdmin) {
    redirect("/");
  }

  const orders = await getAllAdminOrders();

  return <OrderListClient initialOrders={orders} />;
}
