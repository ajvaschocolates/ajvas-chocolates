"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { getAdminSession } from "@/lib/supabase/auth";
import { revalidatePath } from "next/cache";
import {
  CUSTOM_GIFT_PURPOSE_VALUE,
  GiftPurpose,
  GiftPurposeSettings,
  DEFAULT_STANDARD_GIFT_PURPOSES,
} from "@/types/gift-purpose";
import { isGiftPurposeUsedInOrders } from "@/lib/supabase/gift-purposes";

export interface GiftPurposeActionResult {
  success: boolean;
  error?: string;
  data?: unknown;
}

/**
 * Update global Custom Purpose Fee settings (Toggle enabled + Fixed fee in INR)
 */
export async function saveCustomPurposeFeeSettingsAction(
  settings: GiftPurposeSettings
): Promise<GiftPurposeActionResult> {
  const { user, isAdmin } = await getAdminSession();
  if (!user || !isAdmin) {
    return { success: false, error: "Unauthorized: Admin privileges required." };
  }

  const { custom_enabled, custom_fee } = settings;

  // Validation: Fee must be a finite, non-negative amount.
  const numericFee = Number(custom_fee);
  if (isNaN(numericFee) || !isFinite(numericFee) || numericFee < 0) {
    return {
      success: false,
      error: "Fee must be a valid, finite, non-negative amount in INR (>= 0).",
    };
  }

  try {
    const supabase = createServiceRoleClient();

    const { error } = await supabase
      .from("gift_purpose_settings")
      .upsert({
        id: 1,
        custom_enabled: Boolean(custom_enabled),
        custom_fee: Math.round(numericFee * 100) / 100,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.warn("[Admin Settings] Database error:", error.message);
      return {
        success: false,
        error: `Database error: ${error.message}. Please verify migration 003 is applied in Supabase.`,
      };
    }

    revalidatePath("/admin/gift-purposes");
    revalidatePath("/checkout");
    revalidatePath("/products");

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unexpected server error.",
    };
  }
}

/**
 * Add a new standard gift purpose option
 */
export async function createGiftPurposeAction(
  formData: FormData
): Promise<GiftPurposeActionResult> {
  const { user, isAdmin } = await getAdminSession();
  if (!user || !isAdmin) {
    return { success: false, error: "Unauthorized: Admin privileges required." };
  }

  const rawName = (formData.get("name") as string || "").trim();
  const sortOrder = parseInt(formData.get("sort_order") as string || "0", 10);
  const isActive = formData.get("is_active") !== "false";

  if (!rawName) {
    return { success: false, error: "Gift purpose name cannot be empty." };
  }

  if (rawName.toLowerCase() === CUSTOM_GIFT_PURPOSE_VALUE.toLowerCase()) {
    return {
      success: false,
      error: "The special name 'Custom' is reserved for custom fee orders and cannot be added as a standard option.",
    };
  }

  try {
    const supabase = createServiceRoleClient();

    // Check duplicate active name (case-insensitive, trimmed)
    const { data: existing } = await supabase
      .from("gift_purposes")
      .select("id, name, is_active")
      .ilike("name", rawName);

    if (existing && existing.length > 0) {
      return {
        success: false,
        error: `A gift purpose named "${rawName}" already exists.`,
      };
    }

    const { data: created, error } = await supabase
      .from("gift_purposes")
      .insert({
        name: rawName,
        sort_order: isNaN(sortOrder) ? 0 : sortOrder,
        is_active: isActive,
      })
      .select("*")
      .single();

    if (error) {
      return {
        success: false,
        error: error.message.includes("unique")
          ? `A gift purpose named "${rawName}" already exists.`
          : `Failed to create gift purpose: ${error.message}. Please check if migration 003 is applied.`,
      };
    }

    revalidatePath("/admin/gift-purposes");
    revalidatePath("/checkout");
    revalidatePath("/products");

    return { success: true, data: created };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unexpected server error.",
    };
  }
}

/**
 * Update an existing standard gift purpose option
 */
export async function updateGiftPurposeAction(
  id: string,
  formData: FormData
): Promise<GiftPurposeActionResult> {
  const { user, isAdmin } = await getAdminSession();
  if (!user || !isAdmin) {
    return { success: false, error: "Unauthorized: Admin privileges required." };
  }

  const rawName = (formData.get("name") as string || "").trim();
  const sortOrder = parseInt(formData.get("sort_order") as string || "0", 10);
  const isActive = formData.get("is_active") === "true";

  if (!id) {
    return { success: false, error: "Purpose identifier is required." };
  }

  if (!rawName) {
    return { success: false, error: "Gift purpose name cannot be empty." };
  }

  if (rawName.toLowerCase() === CUSTOM_GIFT_PURPOSE_VALUE.toLowerCase()) {
    return {
      success: false,
      error: "The special name 'Custom' is reserved and cannot be used for standard options.",
    };
  }

  try {
    const supabase = createServiceRoleClient();

    // Check duplicate against OTHER rows
    const { data: duplicates } = await supabase
      .from("gift_purposes")
      .select("id, name")
      .ilike("name", rawName)
      .neq("id", id);

    if (duplicates && duplicates.length > 0) {
      return {
        success: false,
        error: `Another gift purpose is already using the name "${rawName}".`,
      };
    }

    const { data: updated, error } = await supabase
      .from("gift_purposes")
      .update({
        name: rawName,
        sort_order: isNaN(sortOrder) ? 0 : sortOrder,
        is_active: isActive,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/gift-purposes");
    revalidatePath("/checkout");
    revalidatePath("/products");

    return { success: true, data: updated };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unexpected server error.",
    };
  }
}

/**
 * Toggle Active / Inactive status of a gift purpose
 */
export async function toggleGiftPurposeStatusAction(
  id: string,
  currentStatus: boolean
): Promise<GiftPurposeActionResult> {
  const { user, isAdmin } = await getAdminSession();
  if (!user || !isAdmin) {
    return { success: false, error: "Unauthorized: Admin privileges required." };
  }

  try {
    const supabase = createServiceRoleClient();
    const newStatus = !currentStatus;

    const { error } = await supabase
      .from("gift_purposes")
      .update({
        is_active: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/gift-purposes");
    revalidatePath("/checkout");
    revalidatePath("/products");

    return { success: true, data: { newStatus } };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unexpected server error.",
    };
  }
}

/**
 * Delete a gift purpose safely.
 * If used in past orders, blocks deletion and advises deactivation to preserve history.
 */
export async function deleteGiftPurposeAction(
  id: string,
  purposeName: string
): Promise<GiftPurposeActionResult> {
  const { user, isAdmin } = await getAdminSession();
  if (!user || !isAdmin) {
    return { success: false, error: "Unauthorized: Admin privileges required." };
  }

  try {
    // Safety check: is this purpose referenced in orders?
    const isUsed = await isGiftPurposeUsedInOrders(purposeName);
    if (isUsed) {
      return {
        success: false,
        error: `"${purposeName}" cannot be permanently deleted because it has been used in past customer orders. To preserve historical order data, please disable (deactivate) it instead.`,
      };
    }

    const supabase = createServiceRoleClient();
    const { error } = await supabase
      .from("gift_purposes")
      .delete()
      .eq("id", id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/gift-purposes");
    revalidatePath("/checkout");
    revalidatePath("/products");

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unexpected server error.",
    };
  }
}

/**
 * Reorder purposes in bulk
 */
export async function reorderGiftPurposesAction(
  items: Array<{ id: string; sort_order: number }>
): Promise<GiftPurposeActionResult> {
  const { user, isAdmin } = await getAdminSession();
  if (!user || !isAdmin) {
    return { success: false, error: "Unauthorized: Admin privileges required." };
  }

  try {
    const supabase = createServiceRoleClient();
    for (const item of items) {
      await supabase
        .from("gift_purposes")
        .update({ sort_order: item.sort_order, updated_at: new Date().toISOString() })
        .eq("id", item.id);
    }

    revalidatePath("/admin/gift-purposes");
    revalidatePath("/checkout");
    revalidatePath("/products");

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unexpected server error.",
    };
  }
}
