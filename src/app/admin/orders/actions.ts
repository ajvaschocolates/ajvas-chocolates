"use server";

import { createClient } from "@/lib/supabase/server";
import { getAdminSession } from "@/lib/supabase/auth";
import { revalidatePath } from "next/cache";
import { ActiveOrderStatus, OrderStatus, ACTIVE_ORDER_STATUSES, Order } from "@/types/orders";
import { isValidActiveStatus } from "@/lib/orders/status-utils";
import { getAdminOrdersForStoreDate } from "@/lib/supabase/admin-orders";
import { isValidDateKey } from "@/lib/orders/date-utils";

export interface OrderActionResult {
  success: boolean;
  error?: string;
  orderId?: string;
  newStatus?: OrderStatus;
}

export interface OrdersForDateResult {
  success: boolean;
  orders: Order[];
  error?: string;
}

/**
 * Server Action: loads every order placed on an IST calendar day ("YYYY-MM-DD").
 * Read-only; used by the Admin Orders date filter so historical days outside
 * the latest-N initial list are still complete.
 */
export async function getAdminOrdersForDateAction(dateKey: string): Promise<OrdersForDateResult> {
  const { user, isAdmin } = await getAdminSession();
  if (!user || !isAdmin) {
    return { success: false, orders: [], error: "Unauthorized: Admin privileges required." };
  }

  if (typeof dateKey !== "string" || !isValidDateKey(dateKey)) {
    return { success: false, orders: [], error: "Invalid date. Expected YYYY-MM-DD." };
  }

  const { orders, error } = await getAdminOrdersForStoreDate(dateKey);
  if (error) return { success: false, orders: [], error };
  return { success: true, orders };
}

/**
 * Server Action to update an order's status and record status change history.
 * Enforces admin authentication, authorization, and validation:
 * - Rejects any transition to "cancelled" (removed from active statuses).
 * - Only supports active statuses: pending, processing, shipped, delivered.
 * - Protects historical cancelled orders from unintended modifications.
 */
export async function updateOrderStatusAction(
  orderId: string,
  newStatus: string,
  note?: string
): Promise<OrderActionResult> {
  const { user, isAdmin } = await getAdminSession();
  if (!user || !isAdmin) {
    return { success: false, error: "Unauthorized: Admin privileges required." };
  }

  if (!orderId || !newStatus) {
    return { success: false, error: "Order ID and target status are required." };
  }

  // Validate status against supported active application statuses
  if (!isValidActiveStatus(newStatus)) {
    return {
      success: false,
      error: `Invalid status "${newStatus}". Active order statuses are: ${ACTIVE_ORDER_STATUSES.join(", ")}. "cancelled" is not supported.`,
    };
  }

  const validatedStatus: ActiveOrderStatus = newStatus;

  try {
    const supabase = await createClient();

    // Check existing order state
    const { data: currentOrder, error: fetchError } = await supabase
      .from("orders")
      .select("order_status")
      .eq("id", orderId)
      .single();

    if (fetchError || !currentOrder) {
      return { success: false, error: fetchError?.message || "Order not found." };
    }

    if (currentOrder.order_status === "cancelled") {
      return {
        success: false,
        error: "Cannot update status of a historical cancelled order.",
      };
    }

    // 1. Update status on order record
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        order_status: validatedStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    // 2. Append timeline entry in order_status_history
    await supabase.from("order_status_history").insert({
      order_id: orderId,
      status: validatedStatus,
      note: note || `Status updated to ${validatedStatus} by admin (${user.email})`,
      changed_by: user.id,
    });

    revalidatePath("/admin");
    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${orderId}`);

    return { success: true, orderId, newStatus: validatedStatus };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update order status.",
    };
  }
}

/**
 * Server Action to update shipping tracking metadata (AWB and Tracking URL).
 * Enforces business safeguards:
 * - Processing -> automatically advances to "shipped"
 * - Shipped -> updates tracking metadata and preserves "shipped"
 * - Delivered -> updates tracking metadata but NEVER regresses to "shipped"
 * - Pending -> updates tracking metadata and preserves "pending"
 * - Cancelled -> historical records are protected
 */
export async function updateOrderTrackingAction(
  orderId: string,
  awbNumber: string,
  trackingUrl?: string
): Promise<OrderActionResult> {
  const { user, isAdmin } = await getAdminSession();
  if (!user || !isAdmin) {
    return { success: false, error: "Unauthorized: Admin privileges required." };
  }

  if (!orderId || !awbNumber.trim()) {
    return { success: false, error: "Order ID and AWB Tracking Number are required." };
  }

  try {
    const supabase = await createClient();

    // Fetch current status to enforce transition safeguards
    const { data: orderData, error: fetchError } = await supabase
      .from("orders")
      .select("order_status")
      .eq("id", orderId)
      .single();

    if (fetchError || !orderData) {
      return { success: false, error: fetchError?.message || "Order not found." };
    }

    const currentStatus = orderData.order_status as OrderStatus;

    if (currentStatus === "cancelled") {
      return {
        success: false,
        error: "Cannot assign tracking to a historical cancelled order.",
      };
    }

    // Safeguard: Delivered must NEVER regress to Shipped
    // Only Processing automatically transitions to Shipped
    let targetStatus: OrderStatus = currentStatus;
    let shouldAdvanceToShipped = false;

    if (currentStatus === "processing") {
      targetStatus = "shipped";
      shouldAdvanceToShipped = true;
    }

    const updatePayload: Record<string, unknown> = {
      awb_number: awbNumber.trim(),
      tracking_url: trackingUrl?.trim() || null,
      updated_at: new Date().toISOString(),
    };

    if (shouldAdvanceToShipped) {
      updatePayload.order_status = "shipped";
    }

    const { error: updateError } = await supabase
      .from("orders")
      .update(updatePayload)
      .eq("id", orderId);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    // Append timeline entry
    let historyNote = `AWB ${awbNumber.trim()} updated by admin (${user.email}).`;
    if (shouldAdvanceToShipped) {
      historyNote = `AWB ${awbNumber.trim()} assigned by admin (${user.email}). Status advanced to shipped.`;
    } else if (currentStatus === "delivered") {
      historyNote = `AWB ${awbNumber.trim()} updated by admin (${user.email}). Status preserved as delivered.`;
    } else if (currentStatus === "pending") {
      historyNote = `AWB ${awbNumber.trim()} assigned by admin (${user.email}). Status preserved as pending.`;
    }

    await supabase.from("order_status_history").insert({
      order_id: orderId,
      status: targetStatus,
      note: historyNote,
      changed_by: user.id,
    });

    revalidatePath("/admin");
    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${orderId}`);

    return { success: true, orderId, newStatus: targetStatus };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update tracking info.",
    };
  }
}
