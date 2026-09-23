"use server";

import { createClient } from "@/lib/supabase/server";
import { getAdminSession } from "@/lib/supabase/auth";
import { revalidatePath } from "next/cache";

export interface CourierActionResult {
  success: boolean;
  error?: string;
  courierId?: string;
}

export async function createCourierAction(formData: FormData): Promise<CourierActionResult> {
  const { user, isAdmin } = await getAdminSession();
  if (!user || !isAdmin) {
    return { success: false, error: "Unauthorized: Admin privileges required." };
  }

  const partner = (formData.get("courier_partner") as string || "").trim();
  const service = (formData.get("service_name") as string || "").trim();
  const status = (formData.get("status") as string || "active") as "active" | "inactive";

  if (!partner || !service) {
    return { success: false, error: "Courier partner and service name are required." };
  }

  try {
    const supabase = await createClient();

    const { data: newCourier, error: insertError } = await supabase
      .from("couriers")
      .insert({
        courier_partner: partner,
        service_name: service,
        status,
      })
      .select("id")
      .single();

    if (insertError || !newCourier) {
      const isDuplicate = insertError?.message?.includes("couriers_partner_service_unique");
      return {
        success: false,
        error: isDuplicate
          ? "This courier partner and service combination already exists."
          : insertError?.message || "Failed to create courier.",
      };
    }

    revalidatePath("/admin/couriers");
    revalidatePath("/admin/shipping-rates");

    return { success: true, courierId: newCourier.id };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unexpected error.",
    };
  }
}

export async function toggleCourierStatusAction(
  courierId: string,
  currentStatus: "active" | "inactive"
): Promise<CourierActionResult> {
  const { user, isAdmin } = await getAdminSession();
  if (!user || !isAdmin) {
    return { success: false, error: "Unauthorized: Admin privileges required." };
  }

  const newStatus = currentStatus === "active" ? "inactive" : "active";

  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("couriers")
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", courierId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/couriers");
    revalidatePath("/admin/shipping-rates");

    return { success: true, courierId };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unexpected error.",
    };
  }
}
