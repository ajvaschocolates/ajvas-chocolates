"use server";

import {
  resolvePincode,
  getCouriersForPincode,
  calculateShippingRateServer,
} from "@/lib/supabase/shipping";
import { lookupPincode, PincodeLookupResult } from "@/lib/supabase/pincode";
import { AvailableCourier, PincodeResolution, ShippingCalculationResult } from "@/types/checkout";

/**
 * Server-side action to resolve destination pincode for checkout.
 */
export async function resolvePincodeAction(pincode: string): Promise<PincodeResolution> {
  return await resolvePincode(pincode);
}

/**
 * Server-side action for PDP pincode availability lookup.
 */
export async function lookupPincodeAction(pincode: string): Promise<PincodeLookupResult> {
  return await lookupPincode(pincode);
}

/**
 * Server-side action to get active couriers for a recognized destination pincode.
 */
export async function getCouriersForPincodeAction(pincodeId: string): Promise<AvailableCourier[]> {
  return await getCouriersForPincode(pincodeId);
}

/**
 * Server-side action to calculate shipping rate based on package weight and courier selection.
 * Raw rate tables are never sent to the client.
 */
export async function calculateShippingRateAction(
  pincodeId: string,
  courierId: string,
  totalWeightGrams: number
): Promise<ShippingCalculationResult> {
  return await calculateShippingRateServer(pincodeId, courierId, totalWeightGrams);
}
