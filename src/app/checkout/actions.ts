"use server";

import {
  calculateStateShippingServer,
  StateShippingItemInput,
  resolvePincode,
  getCouriersForPincode,
  calculateShippingRateServer,
} from "@/lib/supabase/shipping";
import { lookupPincode, PincodeLookupResult } from "@/lib/supabase/pincode";
import { AvailableCourier, PincodeResolution, ShippingCalculationResult } from "@/types/checkout";

/**
 * Server Action: Calculates state-based shipping amount for checkout (Rule A - PER_UNIT).
 */
export async function calculateStateShippingAction(
  stateName: string,
  items: StateShippingItemInput[]
): Promise<ShippingCalculationResult> {
  return await calculateStateShippingServer(stateName, items);
}

/* Legacy Server Actions (Preserved for compatibility) */

export async function resolvePincodeAction(pincode: string): Promise<PincodeResolution> {
  return await resolvePincode(pincode);
}

export async function lookupPincodeAction(pincode: string): Promise<PincodeLookupResult> {
  return await lookupPincode(pincode);
}

export async function getCouriersForPincodeAction(pincodeId: string): Promise<AvailableCourier[]> {
  return await getCouriersForPincode(pincodeId);
}

export async function calculateShippingRateAction(
  pincodeId: string,
  courierId: string,
  totalWeightGrams: number
): Promise<ShippingCalculationResult> {
  return await calculateShippingRateServer(pincodeId, courierId, totalWeightGrams);
}
