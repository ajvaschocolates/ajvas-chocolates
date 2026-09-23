"use server";

import { createClient } from "@/lib/supabase/server";
import { getAdminSession } from "@/lib/supabase/auth";
import { revalidatePath } from "next/cache";
import { OrderStatus } from "@/types/orders";

export interface OrderActionResult {
  success: boolean;
  error?: string;
  orderId?: string;
}

/**
 * Server Action to update an order's status and record status change history.
 * Enforces admin authentication and authorization.
 */
export async function updateOrderStatusAction(
  orderId: string,
  newStatus: OrderStatus,
  note?: string
): Promise<OrderActionResult> {
  const { user, isAdmin } = await getAdminSession();
  if (!user || !isAdmin) {
    return { success: false, error: "Unauthorized: Admin privileges required." };
  }

  if (!orderId || !newStatus) {
    return { success: false, error: "Order ID and target status are required." };
  }

  try {
    const supabase = await createClient();

    // 1. Update status on order record
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        order_status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    // 2. Append timeline entry in order_status_history
    await supabase.from("order_status_history").insert({
      order_id: orderId,
      status: newStatus,
      note: note || `Status updated to ${newStatus} by admin (${user.email})`,
      changed_by: user.id,
    });

    revalidatePath("/admin");
    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${orderId}`);

    return { success: true, orderId };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update order status.",
    };
  }
}

/**
 * Server Action to update shipping tracking metadata (AWB and Tracking URL).
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

    const { error: updateError } = await supabase
      .from("orders")
      .update({
        awb_number: awbNumber.trim(),
        tracking_url: trackingUrl?.trim() || null,
        order_status: "shipped", // Auto-advance to shipped when tracking is assigned
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    // Log history
    await supabase.from("order_status_history").insert({
      order_id: orderId,
      status: "shipped",
      note: `AWB ${awbNumber.trim()} assigned by admin (${user.email}). Order marked as shipped.`,
      changed_by: user.id,
    });

    revalidatePath("/admin");
    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${orderId}`);

    return { success: true, orderId };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update tracking info.",
    };
  }
}
