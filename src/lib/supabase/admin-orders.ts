import { createClient } from "./server";
import { Order, OrderStatus, PaymentStatus } from "@/types/orders";

export interface DashboardMetrics {
  ordersToProcessCount: number;
  awaitingDispatchCount: number;
  paymentIssuesCount: number;
  shippingHoldsCount: number;
  missingTrackingCount: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalProductsCount: number;
  activeProductsCount: number;
  ordersTodayCount: number;
  revenueToday: number;
  recentOrders: Order[];
  activeCouriersCount: number;
  totalCustomersCount: number;
}

/**
 * Fetches all orders for Admin Order Management with filtering capabilities.
 */
export async function getAllAdminOrders(): Promise<Order[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        items:order_items (*)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Supabase admin orders query warning:", error.message);
      return [];
    }

    return (data as Order[]) || [];
  } catch (err) {
    console.error("Error fetching admin orders:", err);
    return [];
  }
}

/**
 * Fetches a single order by ID with complete order items and status history.
 */
export async function getAdminOrderById(id: string): Promise<Order | null> {
  try {
    if (!id) return null;

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        items:order_items (*),
        status_history:order_status_history (*)
      `)
      .eq("id", id)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    const order = data as Order;
    if (order.status_history && Array.isArray(order.status_history)) {
      order.status_history.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }

    return order;
  } catch (err) {
    console.error("Error fetching admin order by ID:", err);
    return null;
  }
}

/**
 * Computes authoritative real-time metrics for the Admin Triage Dashboard from Supabase.
 */
export async function getAdminDashboardMetrics(): Promise<DashboardMetrics> {
  const fallback: DashboardMetrics = {
    ordersToProcessCount: 0,
    awaitingDispatchCount: 0,
    paymentIssuesCount: 0,
    shippingHoldsCount: 0,
    missingTrackingCount: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    totalProductsCount: 0,
    activeProductsCount: 0,
    ordersTodayCount: 0,
    revenueToday: 0,
    recentOrders: [],
    activeCouriersCount: 0,
    totalCustomersCount: 0,
  };

  try {
    const supabase = await createClient();

    // Query 1: Orders and Order Summaries
    const { data: orders, error: ordersErr } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    // Query 2: Product Inventory Summaries
    const { data: products, error: prodsErr } = await supabase
      .from("products")
      .select("id, availability, status");

    // Query 3: Active Couriers Count
    const { count: activeCouriers } = await supabase
      .from("couriers")
      .select("*", { count: "exact", head: true })
      .eq("status", "active");

    // Query 4: Total Customers Count
    const { count: totalCustomers } = await supabase
      .from("customers")
      .select("*", { count: "exact", head: true });

    if (ordersErr) console.warn("Dashboard orders metrics warning:", ordersErr.message);
    if (prodsErr) console.warn("Dashboard products metrics warning:", prodsErr.message);

    const allOrders = (orders as Order[]) || [];
    const allProducts = products || [];

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    // Order metrics calculations
    const ordersToProcess = allOrders.filter(
      (o) => o.payment_status === "paid" && (o.order_status === "pending" || o.order_status === "processing")
    ).length;

    const awaitingDispatch = allOrders.filter(
      (o) => o.order_status === "processing"
    ).length;

    const paymentIssues = allOrders.filter(
      (o) => o.payment_status === "failed"
    ).length;

    const shippingHolds = allOrders.filter(
      (o) => o.order_status === "pending" && !o.courier_partner
    ).length;

    const missingTracking = allOrders.filter(
      (o) => (o.order_status === "processing" || o.order_status === "shipped") && !o.awb_number
    ).length;

    const ordersToday = allOrders.filter((o) => {
      const placed = new Date(o.created_at).getTime();
      return placed >= startOfToday;
    });

    const revenueToday = ordersToday
      .filter((o) => o.payment_status === "paid")
      .reduce((acc, o) => acc + Number(o.total_amount || 0), 0);

    // Product inventory metrics
    const lowStockCount = allProducts.filter((p) => p.availability === "low_stock").length;
    const outOfStockCount = allProducts.filter((p) => p.availability === "out_of_stock").length;
    const totalProductsCount = allProducts.length;
    const activeProductsCount = allProducts.filter((p) => p.status === "active").length;

    return {
      ordersToProcessCount: ordersToProcess,
      awaitingDispatchCount: awaitingDispatch,
      paymentIssuesCount: paymentIssues,
      shippingHoldsCount: shippingHolds,
      missingTrackingCount: missingTracking,
      lowStockCount,
      outOfStockCount,
      totalProductsCount,
      activeProductsCount,
      ordersTodayCount: ordersToday.length,
      revenueToday,
      recentOrders: allOrders.slice(0, 5),
      activeCouriersCount: activeCouriers || 0,
      totalCustomersCount: totalCustomers || 0,
    };
  } catch (err) {
    console.error("Error computing dashboard metrics:", err);
    return fallback;
  }
}
