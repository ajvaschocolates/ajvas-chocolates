"use server";

import {
  resolvePincode,
  getCouriersForPincode,
  calculateShippingRateServer,
} from "@/lib/supabase/shipping";
import { AvailableCourier, PincodeResolution, ShippingCalculationResult } from "@/types/checkout";

export async function resolvePincodeAction(pincode: string): Promise<PincodeResolution> {
  return await resolvePincode(pincode);
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
