import { getAllAdminOrders } from "@/lib/supabase/admin-orders";
import OrderListClient from "@/components/admin/OrderListClient";

export const dynamic = "force-dynamic";

/** Number of most-recent orders loaded into the table (unchanged existing default). */
const ADMIN_ORDERS_LOAD_LIMIT = 100;

export default async function AdminOrdersPage() {
  const orders = await getAllAdminOrders(ADMIN_ORDERS_LOAD_LIMIT);
  return <OrderListClient initialOrders={orders} loadLimit={ADMIN_ORDERS_LOAD_LIMIT} />;
}
