import { resolvePincode } from "./shipping";

export interface PincodeLookupResult {
  recognized: boolean;
  pincodeId?: string;
  district?: string;
  state?: string;
  error?: string;
}

/**
 * Validates a 6-digit Indian pincode against the public.pincodes database table
 * via the server-side logistics boundary.
 *
 * NOTE: Pincode lookup checks location recognition only. Final courier selection
 * and dynamic shipping calculation are determined during checkout based on
 * Destination Pincode + Selected Courier + Combined Package Metrics.
 */
export async function lookupPincode(pincode: string): Promise<PincodeLookupResult> {
  const res = await resolvePincode(pincode);
  return {
    recognized: res.recognized,
    pincodeId: res.pincodeId,
    district: res.district,
    state: res.state,
    error: res.error,
  };
}
