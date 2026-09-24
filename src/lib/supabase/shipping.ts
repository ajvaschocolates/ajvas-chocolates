import { createClient } from "./server";
import { createServiceRoleClient } from "./service-role";
import { INDIA_STATES_DISTRICTS } from "@/data/india-states-districts";
import { AvailableCourier, PincodeResolution, ShippingCalculationResult, ShippingZone } from "@/types/checkout";
import { Product } from "@/types/catalog";

export interface StateShippingItemInput {
  productId: string;
  quantity: number;
}

export interface UnitChargeValidationResult {
  valid: boolean;
  charge: number;
  error?: string;
}

/**
 * Maps an Indian State/UT string to its corresponding shipping zone.
 * - Kerala -> "kerala"
 * - Tamil Nadu & Karnataka -> "tn_kar"
 * - All other States & UTs -> "other"
 */
export function resolveShippingZone(stateName: string): ShippingZone {
  const clean = stateName.trim().toLowerCase();
  if (clean === "kerala") return "kerala";
  if (clean === "tamil nadu" || clean === "karnataka") return "tn_kar";
  return "other";
}

/**
 * Validates and extracts the regional unit shipping charge for a product.
 * Enforces that 0.00 is valid (Free Shipping), but null/undefined/NaN/Infinity/negative fail explicitly.
 */
export function getProductUnitShippingCharge(
  product: Partial<Product>,
  zone: ShippingZone
): UnitChargeValidationResult {
  let rawValue: unknown;
  switch (zone) {
    case "kerala":
      rawValue = product.shipping_kerala;
      break;
    case "tn_kar":
      rawValue = product.shipping_tn_kar;
      break;
    case "other":
    default:
      rawValue = product.shipping_other;
      break;
  }

  if (rawValue === null || rawValue === undefined) {
    return {
      valid: false,
      charge: 0,
      error: "Shipping rate is unconfigured for this region.",
    };
  }

  const numValue = Number(rawValue);

  if (isNaN(numValue) || !Number.isFinite(numValue) || numValue < 0) {
    return {
      valid: false,
      charge: 0,
      error: "Invalid shipping rate configuration.",
    };
  }

  return {
    valid: true,
    charge: numValue,
  };
}

/**
 * Authoritative Server-Side State Shipping Calculator (Rule A - PER_UNIT)
 *
 * Uses standard Supabase server client (createClient).
 * Zero dependency on pincodes, couriers, pincode_couriers, or shipping_rates tables.
 *
 * Formula: Total Shipping = SUM(applicable product regional shipping charge * quantity)
 */
export async function calculateStateShippingServer(
  stateName: string,
  rawItems: StateShippingItemInput[]
): Promise<ShippingCalculationResult> {
  if (!stateName || !rawItems || !Array.isArray(rawItems) || rawItems.length === 0) {
    return { success: false, error: "State selection and cart items are required for shipping calculation." };
  }

  const cleanState = stateName.trim();
  const validStateEntry = INDIA_STATES_DISTRICTS.find(
    (s) => s.state.toLowerCase() === cleanState.toLowerCase()
  );
  if (!validStateEntry) {
    return { success: false, error: "Please select a valid Indian State or Union Territory." };
  }

  // Aggregate and validate quantities server-side
  const aggregatedMap = new Map<string, number>();
  for (const item of rawItems) {
    if (!item.productId || typeof item.productId !== "string") {
      return { success: false, error: "Invalid product identifier in cart." };
    }
    if (typeof item.quantity !== "number" || !Number.isInteger(item.quantity) || item.quantity <= 0) {
      return { success: false, error: "Invalid product quantity requested." };
    }
    if (item.quantity > 99) {
      return { success: false, error: "Requested item quantity exceeds maximum limit of 99." };
    }
    const currentQty = aggregatedMap.get(item.productId) || 0;
    const combinedQty = currentQty + item.quantity;
    if (combinedQty > 99) {
      return { success: false, error: "Combined item quantity exceeds maximum limit of 99." };
    }
    aggregatedMap.set(item.productId, combinedQty);
  }

  const uniqueProductIds = Array.from(aggregatedMap.keys());

  try {
    const supabase = await createClient();
    const { data: products, error: queryError } = await supabase
      .from("products")
      .select("id, name, status, availability, shipping_kerala, shipping_tn_kar, shipping_other")
      .in("id", uniqueProductIds);

    if (queryError || !products) {
      return { success: false, error: "Failed to fetch authoritative product shipping details." };
    }

    const zone = resolveShippingZone(validStateEntry.state);
    let totalShipping = 0;

    for (const productId of uniqueProductIds) {
      const prod = products.find((p) => p.id === productId);

      if (!prod) {
        return {
          success: false,
          error: "One or more items in your cart could not be verified in the product catalog.",
        };
      }

      if (prod.status !== "active") {
        return {
          success: false,
          error: `Product "${prod.name}" is currently unavailable for purchase.`,
        };
      }

      if (prod.availability === "out_of_stock") {
        return {
          success: false,
          error: `Product "${prod.name}" is currently out of stock.`,
        };
      }

      const rateValidation = getProductUnitShippingCharge(prod, zone);
      if (!rateValidation.valid) {
        return {
          success: false,
          error: `Unable to calculate shipping for "${prod.name}": ${rateValidation.error}`,
        };
      }

      const quantity = aggregatedMap.get(productId)!;
      totalShipping += rateValidation.charge * quantity;
    }

    return {
      success: true,
      shippingAmount: totalShipping,
      zone,
    };
  } catch (err) {
    return {
      success: false,
      error: "Unexpected error encountered while calculating state shipping fee.",
    };
  }
}

/* ============================================================
 * LEGACY HELPERS (Preserved for backward compatibility / RLS)
 * ============================================================ */

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

    if (error || !data) {
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
  } catch {
    return {
      pincode: cleanPin,
      district: "",
      state: "",
      recognized: false,
    };
  }
}

export async function getCouriersForPincode(pincodeId: string): Promise<AvailableCourier[]> {
  if (!pincodeId) return [];
  try {
    const supabase = createServiceRoleClient();
    const { data } = await supabase
      .from("pincode_couriers")
      .select("courier_id, courier:couriers (id, courier_partner, service_name, status)")
      .eq("pincode_id", pincodeId)
      .eq("status", "active");

    if (!data) return [];
    const couriers: AvailableCourier[] = [];
    for (const item of data) {
      const c = item.courier as unknown as { id: string; courier_partner: string; service_name: string; status: string } | null;
      if (c && c.status === "active") {
        couriers.push({ id: c.id, courierPartner: c.courier_partner, serviceName: c.service_name });
      }
    }
    return couriers;
  } catch {
    return [];
  }
}

export async function calculateShippingRateServer(
  pincodeId: string,
  courierId: string,
  totalWeightGrams: number
): Promise<ShippingCalculationResult> {
  if (!pincodeId || !courierId || totalWeightGrams <= 0) {
    return { success: false, error: "Destination, courier, and package weight are required." };
  }
  try {
    const supabase = createServiceRoleClient();
    const { data } = await supabase
      .from("shipping_rates")
      .select("shipping_amount, min_weight_grams, max_weight_grams, status")
      .eq("pincode_id", pincodeId)
      .eq("courier_id", courierId)
      .lte("min_weight_grams", totalWeightGrams)
      .eq("status", "active");

    if (!data || data.length === 0) {
      return { success: false, error: "No applicable shipping rate found." };
    }
    const matchingRate = data.find((r) => r.max_weight_grams === null || r.max_weight_grams >= totalWeightGrams);
    if (!matchingRate) {
      return { success: false, error: "Package weight exceeds threshold." };
    }
    return { success: true, shippingAmount: Number(matchingRate.shipping_amount) };
  } catch {
    return { success: false, error: "Calculation failed." };
  }
}
