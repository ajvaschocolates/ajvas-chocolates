import { createClient as createServerClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import type {
  GiftPurpose,
  GiftPurposeSettings,
  GiftPurposeConfig,
} from "@/types/gift-purpose";
import {
  CUSTOM_GIFT_PURPOSE_VALUE,
  DEFAULT_STANDARD_GIFT_PURPOSES,
  DEFAULT_GIFT_PURPOSE_SETTINGS,
} from "@/types/gift-purpose";

/**
 * Validates a chosen gift purpose and computes its authoritative server-side fee.
 * This is a pure mathematical and rules function used across storefront, checkout,
 * Razorpay order creation, and payment verification.
 */
export function validateGiftPurposeSelection(
  purpose: string | null | undefined,
  config: GiftPurposeConfig,
  description?: string | null
): {
  isValid: boolean;
  isCustom: boolean;
  fee: number;
  normalizedPurpose: string | null;
  normalizedDescription?: string | null;
  error?: string;
} {
  const cleanPurpose = (purpose || "").trim();

  // If no purpose selected (optional occasion)
  if (!cleanPurpose) {
    return {
      isValid: true,
      isCustom: false,
      fee: 0,
      normalizedPurpose: null,
      normalizedDescription: null,
    };
  }

  // Check if Custom option
  if (cleanPurpose.toLowerCase() === CUSTOM_GIFT_PURPOSE_VALUE.toLowerCase()) {
    if (!config.settings.custom_enabled) {
      return {
        isValid: false,
        isCustom: true,
        fee: 0,
        normalizedPurpose: CUSTOM_GIFT_PURPOSE_VALUE,
        normalizedDescription: null,
        error: "Custom gift purpose is currently disabled by store policy.",
      };
    }

    const fee = Number(config.settings.custom_fee);
    if (isNaN(fee) || fee < 0) {
      return {
        isValid: false,
        isCustom: true,
        fee: 0,
        normalizedPurpose: CUSTOM_GIFT_PURPOSE_VALUE,
        normalizedDescription: null,
        error: "Invalid custom fee configuration on server.",
      };
    }

    const cleanDescription = (description || "").trim();
    if (!cleanDescription) {
      return {
        isValid: false,
        isCustom: true,
        fee,
        normalizedPurpose: CUSTOM_GIFT_PURPOSE_VALUE,
        normalizedDescription: null,
        error: "Please provide a description for your custom gift purpose.",
      };
    }

    if (cleanDescription.length > 300) {
      return {
        isValid: false,
        isCustom: true,
        fee,
        normalizedPurpose: CUSTOM_GIFT_PURPOSE_VALUE,
        normalizedDescription: cleanDescription,
        error: "Custom gift purpose description cannot exceed 300 characters.",
      };
    }

    return {
      isValid: true,
      isCustom: true,
      fee,
      normalizedPurpose: CUSTOM_GIFT_PURPOSE_VALUE,
      normalizedDescription: cleanDescription,
    };
  }

  // Standard purpose lookup (case-insensitive, trimmed)
  const matched = config.options.find(
    (opt) =>
      opt.is_active &&
      opt.name.trim().toLowerCase() === cleanPurpose.toLowerCase()
  );

  if (!matched) {
    return {
      isValid: false,
      isCustom: false,
      fee: 0,
      normalizedPurpose: cleanPurpose,
      normalizedDescription: null,
      error: `"${cleanPurpose}" is not a recognized or active gift purpose.`,
    };
  }

  return {
    isValid: true,
    isCustom: false,
    fee: 0,
    normalizedPurpose: matched.name,
    normalizedDescription: null,
  };
}

/**
 * Fetch storefront-facing Gift Purpose configuration:
 * Only returns active standard options sorted by sort_order,
 * plus current Custom fee settings.
 * Resilient to database migration state (falls back safely if tables don't exist yet).
 */
export async function getGiftPurposeConfig(): Promise<GiftPurposeConfig> {
  try {
    const supabase = await createServerClient();

    // 1. Fetch active options
    const { data: optionsData, error: optionsError } = await supabase
      .from("gift_purposes")
      .select("id, name, is_active, sort_order")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });

    // 2. Fetch settings
    const { data: settingsData, error: settingsError } = await supabase
      .from("gift_purpose_settings")
      .select("custom_enabled, custom_fee")
      .eq("id", 1)
      .maybeSingle();

    const options: GiftPurpose[] =
      !optionsError && optionsData && optionsData.length > 0
        ? (optionsData as GiftPurpose[])
        : (DEFAULT_STANDARD_GIFT_PURPOSES as GiftPurpose[]);

    const settings: GiftPurposeSettings =
      !settingsError && settingsData
        ? {
            custom_enabled: Boolean(settingsData.custom_enabled),
            custom_fee: Number(settingsData.custom_fee ?? DEFAULT_GIFT_PURPOSE_SETTINGS.custom_fee),
          }
        : DEFAULT_GIFT_PURPOSE_SETTINGS;

    return { options, settings };
  } catch (err) {
    console.warn("[Gift Purposes] Fallback used due to database error:", err);
    return {
      options: DEFAULT_STANDARD_GIFT_PURPOSES as GiftPurpose[],
      settings: DEFAULT_GIFT_PURPOSE_SETTINGS,
    };
  }
}

/**
 * Fetch all gift purposes for admin management (includes inactive items).
 */
export async function getAllAdminGiftPurposes(): Promise<GiftPurpose[]> {
  try {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from("gift_purposes")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });

    if (error || !data) {
      console.warn("[Admin Gift Purposes] Falling back to defaults:", error?.message);
      return DEFAULT_STANDARD_GIFT_PURPOSES as GiftPurpose[];
    }

    return data as GiftPurpose[];
  } catch (err) {
    console.error("[Admin Gift Purposes] Unexpected query error:", err);
    return DEFAULT_STANDARD_GIFT_PURPOSES as GiftPurpose[];
  }
}

/**
 * Fetch admin gift purpose global settings.
 */
export async function getAdminGiftPurposeSettings(): Promise<GiftPurposeSettings> {
  try {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from("gift_purpose_settings")
      .select("custom_enabled, custom_fee")
      .eq("id", 1)
      .maybeSingle();

    if (error || !data) {
      return DEFAULT_GIFT_PURPOSE_SETTINGS;
    }

    return {
      custom_enabled: Boolean(data.custom_enabled),
      custom_fee: Number(data.custom_fee ?? DEFAULT_GIFT_PURPOSE_SETTINGS.custom_fee),
    };
  } catch {
    return DEFAULT_GIFT_PURPOSE_SETTINGS;
  }
}

/**
 * Check if a gift purpose is currently used in existing orders.
 * Used before deleting a purpose to preserve historical data.
 */
export async function isGiftPurposeUsedInOrders(purposeName: string): Promise<boolean> {
  try {
    const supabase = createServiceRoleClient();
    const { count, error } = await supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .ilike("gift_purpose", purposeName.trim());

    if (error) {
      // If column doesn't exist yet, it's not used
      return false;
    }

    return (count || 0) > 0;
  } catch {
    return false;
  }
}
