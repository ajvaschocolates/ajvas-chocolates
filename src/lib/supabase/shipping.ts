import { createServiceRoleClient } from "./service-role";
import { AvailableCourier, PincodeResolution, ShippingCalculationResult } from "@/types/checkout";

/**
 * Resolves a 6-digit Indian destination pincode against the database.
 */
export async function resolvePincode(pincode: string): Promise<PincodeResolution> {
  const cleanPin = pincode.trim().replace(/\D/g, "");
  if (!/^\d{6}$/.test(cleanPin)) {
    return {
      pincode: cleanPin,
      district: "",
      state: "",
      recognized: false,
      error: "Please enter a valid 6-digit pincode.",
    };
  }

  try {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase
      .from("pincodes")
      .select("id, pincode, state, district, status")
      .eq("pincode", cleanPin)
      .eq("status", "active")
      .maybeSingle();

    if (error) {
      console.warn("Pincode resolution query warning:", error.message);
      return {
        pincode: cleanPin,
        district: "",
        state: "",
        recognized: false,
        error: "Unable to verify destination pincode at this time.",
      };
    }

    if (!data) {
      return {
        pincode: cleanPin,
        district: "",
        state: "",
        recognized: false,
      };
    }

    return {
      pincodeId: data.id,
      pincode: data.pincode,
      district: data.district,
      state: data.state,
      recognized: true,
    };
  } catch (err) {
    console.warn("Pincode resolution error:", err);
    return {
      pincode: cleanPin,
      district: "",
      state: "",
      recognized: false,
      error: "Unable to verify destination pincode.",
    };
  }
}

/**
 * Fetches available active couriers for a recognized destination pincode.
 */
export async function getCouriersForPincode(pincodeId: string): Promise<AvailableCourier[]> {
  if (!pincodeId) return [];

  try {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase
      .from("pincode_couriers")
      .select(`
        courier_id,
        courier:couriers (
          id,
          courier_partner,
          service_name,
          status
        )
      `)
      .eq("pincode_id", pincodeId)
      .eq("status", "active");

    if (error) {
      console.warn("Available couriers query warning:", error.message);
      return [];
    }

    if (!data) return [];

    const couriers: AvailableCourier[] = [];
    for (const item of data) {
      // Supabase join typing
      const c = item.courier as unknown as {
        id: string;
        courier_partner: string;
        service_name: string;
        status: string;
      } | null;

      if (c && c.status === "active") {
        couriers.push({
          id: c.id,
          courierPartner: c.courier_partner,
          serviceName: c.service_name,
        });
      }
    }

    couriers.sort((a, b) => a.courierPartner.localeCompare(b.courierPartner));
    return couriers;
  } catch (err) {
    console.warn("Error fetching couriers for pincode:", err);
    return [];
  }
}

/**
 * Secure Server-side Shipping Rate Calculator
 *
 * Checks destination pincode, selected courier, and combined package weight
 * against active rules in public.shipping_rates without exposing table rules
 * or dimensional formulas to the browser.
 */
export async function calculateShippingRateServer(
  pincodeId: string,
  courierId: string,
  totalWeightGrams: number
): Promise<ShippingCalculationResult> {
  if (!pincodeId || !courierId || totalWeightGrams <= 0) {
    return {
      success: false,
      error: "Destination, courier, and package weight are required for calculation.",
    };
  }

  try {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase
      .from("shipping_rates")
      .select("shipping_amount, min_weight_grams, max_weight_grams, status")
      .eq("pincode_id", pincodeId)
      .eq("courier_id", courierId)
      .lte("min_weight_grams", totalWeightGrams)
      .eq("status", "active")
      .order("shipping_amount", { ascending: true });

    if (error) {
      console.warn("Shipping rate calculation query warning:", error.message);
      return {
        success: false,
        error: "Unable to calculate shipping rate for the selected courier.",
      };
    }

    if (!data || data.length === 0) {
      return {
        success: false,
        error: "No applicable shipping rate found for this weight and destination.",
      };
    }

    // Find the first rate matching max_weight_grams criteria
    const matchingRate = data.find(
      (rate) => rate.max_weight_grams === null || rate.max_weight_grams >= totalWeightGrams
    );

    if (!matchingRate) {
      return {
        success: false,
        error: "Package weight exceeds the supported courier threshold for this destination.",
      };
    }

    return {
      success: true,
      shippingAmount: Number(matchingRate.shipping_amount),
    };
  } catch (err) {
    console.warn("Shipping rate calculation error:", err);
    return {
      success: false,
      error: "Shipping calculation could not be completed.",
    };
  }
}
