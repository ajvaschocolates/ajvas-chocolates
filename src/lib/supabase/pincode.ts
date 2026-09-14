import { createClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "./env";

function getPublicCatalogClient() {
  const { supabaseUrl, supabasePublishableKey } = getSupabaseEnv();
  return createClient(supabaseUrl, supabasePublishableKey);
}

export interface PincodeLookupResult {
  recognized: boolean;
  district?: string;
  state?: string;
  error?: string;
}

/**
 * Validates a 6-digit Indian pincode against the public.pincodes database table.
 *
 * NOTE: Pincode lookup checks location recognition only. Final courier selection
 * and dynamic shipping calculation are determined during checkout based on
 * Destination Pincode + Selected Courier + Combined Package Metrics.
 */
export async function lookupPincode(pincode: string): Promise<PincodeLookupResult> {
  const cleanPin = pincode.trim().replace(/\D/g, "");
  if (!/^\d{6}$/.test(cleanPin)) {
    return {
      recognized: false,
      error: "Please enter a valid 6-digit pincode.",
    };
  }

  try {
    const supabase = getPublicCatalogClient();
    const { data, error } = await supabase
      .from("pincodes")
      .select("pincode, state, district, status")
      .eq("pincode", cleanPin)
      .eq("status", "active")
      .maybeSingle();

    if (error) {
      console.warn("Pincode query warning:", error.message);
      return {
        recognized: false,
        error: "Unable to verify pincode at this time.",
      };
    }

    if (!data) {
      return {
        recognized: false,
      };
    }

    return {
      recognized: true,
      district: data.district,
      state: data.state,
    };
  } catch (err) {
    console.warn("Pincode lookup error:", err);
    return {
      recognized: false,
      error: "Unable to verify pincode at this time.",
    };
  }
}
