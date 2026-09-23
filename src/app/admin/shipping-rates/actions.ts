"use server";

import { createClient } from "@/lib/supabase/server";
import { getAdminSession } from "@/lib/supabase/auth";
import { revalidatePath } from "next/cache";

export interface ShippingRateActionResult {
  success: boolean;
  error?: string;
  rateId?: string;
}

export async function createShippingRateAction(formData: FormData): Promise<ShippingRateActionResult> {
  const { user, isAdmin } = await getAdminSession();
  if (!user || !isAdmin) {
    return { success: false, error: "Unauthorized: Admin privileges required." };
  }

  const pincodeId = (formData.get("pincode_id") as string || "").trim();
  const courierId = (formData.get("courier_id") as string || "").trim();
  const minWeightGrams = parseInt(formData.get("min_weight_grams") as string || "0", 10);
  const maxWeightGrams = parseInt(formData.get("max_weight_grams") as string || "0", 10) || null;
  const shippingAmount = parseFloat(formData.get("shipping_amount") as string || "0");
  const status = (formData.get("status") as string || "active") as "active" | "inactive";

  if (!pincodeId || !courierId) {
    return { success: false, error: "Pincode and courier partner selection are required." };
  }

  if (isNaN(minWeightGrams) || minWeightGrams <= 0) {
    return { success: false, error: "Valid minimum weight (in grams) is required." };
  }

  if (isNaN(shippingAmount) || shippingAmount < 0) {
    return { success: false, error: "Valid shipping rate amount is required." };
  }

  try {
    const supabase = await createClient();

    const { data: newRate, error: insertError } = await supabase
      .from("shipping_rates")
      .insert({
        pincode_id: pincodeId,
        courier_id: courierId,
        min_weight_grams: minWeightGrams,
        max_weight_grams: maxWeightGrams,
        shipping_amount: shippingAmount,
        status,
      })
      .select("id")
      .single();

    if (insertError || !newRate) {
      return {
        success: false,
        error: insertError?.message || "Failed to create shipping rate rule.",
      };
    }

    revalidatePath("/admin/shipping-rates");
    return { success: true, rateId: newRate.id };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unexpected error.",
    };
  }
}

export async function toggleShippingRateStatusAction(
  rateId: string,
  currentStatus: "active" | "inactive"
): Promise<ShippingRateActionResult> {
  const { user, isAdmin } = await getAdminSession();
  if (!user || !isAdmin) {
    return { success: false, error: "Unauthorized: Admin privileges required." };
  }

  const newStatus = currentStatus === "active" ? "inactive" : "active";

  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("shipping_rates")
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", rateId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/shipping-rates");
    return { success: true, rateId };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unexpected error.",
    };
  }
}
