import { createClient } from "./server";
import { Order } from "@/types/orders";

export interface DashboardMetrics {
  totalOrdersCount: number;
  totalRevenue: number;
  totalCompletedOrdersCount: number;
  totalPendingOrdersCount: number;
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
 * Fetches orders for Admin Order Management with optimized field projection.
 */
export async function getAllAdminOrders(limit = 100): Promise<Order[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("orders")
      .select(`
        id,
        order_number,
        customer_name,
        customer_phone,
        customer_email,
        shipping_pincode,
        shipping_city,
        shipping_state,
        total_amount,
        subtotal,
        shipping_amount,
        order_status,
        payment_status,
        payment_provider,
        courier_partner,
        courier_service_name,
        awb_number,
        tracking_url,
        created_at,
        items:order_items (
          id,
          product_id,
          product_name,
          product_slug,
          quantity,
          product:products (
            id,
            name,
            images:product_images (
              image_url,
              sort_order
            )
          )
        )
      `)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.warn("Supabase admin orders query warning:", error.message);
      return [];
    }

    const orders = (data as unknown as Order[]) || [];
    orders.forEach((o) => {
      if (o.items && Array.isArray(o.items)) {
        o.items.forEach((item) => {
          if (item.product?.images && Array.isArray(item.product.images)) {
            item.product.images.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
          }
        });
      }
    });

    return orders;
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
        items:order_items (
          *,
          product:products (
            id,
            name,
            weight_grams,
            length_cm,
            width_cm,
            height_cm,
            images:product_images (
              image_url,
              sort_order
            )
          )
        ),
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

    // Sort product images and resolve any missing product by product_slug if needed
    if (order.items && Array.isArray(order.items)) {
      const missingSlugItems = order.items.filter((i) => !i.product && i.product_slug);
      if (missingSlugItems.length > 0) {
        try {
          const slugs = Array.from(new Set(missingSlugItems.map((i) => i.product_slug!)));
          const { data: fallbackProducts } = await supabase
            .from("products")
            .select(`
              id,
              name,
              slug,
              weight_grams,
              length_cm,
              width_cm,
              height_cm,
              images:product_images (
                image_url,
                sort_order
              )
            `)
            .in("slug", slugs);

          if (fallbackProducts && fallbackProducts.length > 0) {
            const productBySlug = new Map(fallbackProducts.map((p) => [p.slug, p]));
            order.items.forEach((item) => {
              if (!item.product && item.product_slug && productBySlug.has(item.product_slug)) {
                item.product = productBySlug.get(item.product_slug)!;
              }
            });
          }
        } catch (slugErr) {
          console.warn("Fallback slug lookup warning:", slugErr);
        }
      }

      order.items.forEach((item) => {
        if (item.product?.images && Array.isArray(item.product.images)) {
          item.product.images.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
        }
      });
    }

    return order;
  } catch (err) {
    console.error("Error fetching admin order by ID:", err);
    return null;
  }
}

/**
 * Computes authoritative real-time metrics for the Admin Triage Dashboard from Supabase in parallel.
 */
export async function getAdminDashboardMetrics(): Promise<DashboardMetrics> {
  const fallback: DashboardMetrics = {
    totalOrdersCount: 0,
    totalRevenue: 0,
    totalCompletedOrdersCount: 0,
    totalPendingOrdersCount: 0,
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

    // Run all dashboard metric queries concurrently in parallel
    const [
      { data: orders, error: ordersErr },
      { data: products, error: prodsErr },
      { count: activeCouriers },
      { count: totalCustomers },
    ] = await Promise.all([
      supabase
        .from("orders")
        .select(`
          id,
          order_number,
          customer_name,
          customer_phone,
          customer_email,
          shipping_city,
          shipping_district,
          shipping_state,
          shipping_pincode,
          total_amount,
          payment_status,
          order_status,
          courier_partner,
          awb_number,
          created_at,
          items:order_items (
            id,
            product_id,
            product_name,
            product_slug,
            quantity,
            product:products (
              id,
              name,
              images:product_images (
                image_url,
                sort_order
              )
            )
          )
        `)
        .order("created_at", { ascending: false })
        .limit(200),
      supabase
        .from("products")
        .select("id, availability, status"),
      supabase
        .from("couriers")
        .select("*", { count: "exact", head: true })
        .eq("status", "active"),
      supabase
        .from("customers")
        .select("*", { count: "exact", head: true }),
    ]);

    if (ordersErr) console.warn("Dashboard orders metrics warning:", ordersErr.message);
    if (prodsErr) console.warn("Dashboard products metrics warning:", prodsErr.message);

    const allOrders = (orders as unknown as Order[]) || [];
    allOrders.forEach((o) => {
      if (o.items && Array.isArray(o.items)) {
        o.items.forEach((item) => {
          if (item.product?.images && Array.isArray(item.product.images)) {
            item.product.images.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
          }
        });
      }
    });
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

    // Total order metrics calculations
    const totalOrdersCount = allOrders.length;
    const totalRevenue = allOrders
      .filter((o) => o.payment_status === "paid")
      .reduce((acc, o) => acc + Number(o.total_amount || 0), 0);
    const totalCompletedOrdersCount = allOrders.filter(
      (o) => o.order_status === "delivered"
    ).length;
    const totalPendingOrdersCount = allOrders.filter(
      (o) => o.order_status === "pending"
    ).length;

    // Product inventory metrics
    const lowStockCount = allProducts.filter((p) => p.availability === "low_stock").length;
    const outOfStockCount = allProducts.filter((p) => p.availability === "out_of_stock").length;
    const totalProductsCount = allProducts.length;
    const activeProductsCount = allProducts.filter((p) => p.status === "active").length;

    return {
      totalOrdersCount,
      totalRevenue,
      totalCompletedOrdersCount,
      totalPendingOrdersCount,
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
      recentOrders: allOrders.slice(0, 10),
      activeCouriersCount: activeCouriers || 0,
      totalCustomersCount: totalCustomers || 0,
    };
  } catch (err) {
    console.error("Error computing dashboard metrics:", err);
    return fallback;
  }
}
