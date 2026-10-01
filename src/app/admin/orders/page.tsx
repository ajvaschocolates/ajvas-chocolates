import { getAllAdminOrders } from "@/lib/supabase/admin-orders";
import OrderListClient from "@/components/admin/OrderListClient";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await getAllAdminOrders();
  return <OrderListClient initialOrders={orders} />;
}
