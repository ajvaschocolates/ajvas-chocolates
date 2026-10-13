import type { CartItem } from "@/types/cart";

export const CUSTOM_GIFT_PURPOSE_VALUE = "Custom";

/**
 * Deterministically resolves the initial gift purpose and custom description from active checkout items.
 *
 * Rules:
 * 1. If activeItems contains items with saved gift purposes:
 *    - If any item has a Custom purpose with a custom description, prioritize 'Custom'
 *      and retain that description so customer input is not discarded.
 *    - Otherwise, take the purpose from the first item with a saved purpose.
 *    - If the selected purpose is Custom, initialize description from the first item
 *      with a custom description.
 *    - Multiple descriptions are never combined or concatenated silently.
 * 2. If no items have a saved gift purpose, return empty strings.
 */
export function resolveInitialGiftSelection(items: CartItem[]): {
  purpose: string;
  description: string;
} {
  const itemsWithPurpose = items.filter(
    (item) => typeof item.customization === "string" && item.customization.trim().length > 0
  );

  if (itemsWithPurpose.length === 0) {
    return { purpose: "", description: "" };
  }

  // Check if any item has "Custom" with a non-empty description
  const customItemWithDesc = itemsWithPurpose.find((item) => {
    const isCust =
      item.customization === CUSTOM_GIFT_PURPOSE_VALUE ||
      item.customization?.toLowerCase().startsWith("custom");
    return isCust && Boolean(item.customDescription?.trim());
  });

  if (customItemWithDesc) {
    return {
      purpose: CUSTOM_GIFT_PURPOSE_VALUE,
      description: customItemWithDesc.customDescription?.trim() || "",
    };
  }

  // Otherwise, take the purpose of the first item with a saved purpose
  const primaryItem = itemsWithPurpose[0];
  const primaryPurpose = primaryItem.customization?.trim() || "";
  const isPrimaryCustom =
    primaryPurpose === CUSTOM_GIFT_PURPOSE_VALUE ||
    primaryPurpose.toLowerCase().startsWith("custom");

  if (isPrimaryCustom) {
    const descItem = itemsWithPurpose.find((i) => i.customDescription?.trim());
    return {
      purpose: CUSTOM_GIFT_PURPOSE_VALUE,
      description: descItem?.customDescription?.trim() || "",
    };
  }

  // Standard occasion (e.g., "Happy Birthday", "Anniversary")
  // If another item had a custom description in reserve, preserve it in description state
  // so if the user switches to Custom at checkout, their text is not lost
  const anyDescItem = items.find((i) => i.customDescription?.trim());
  return {
    purpose: primaryPurpose,
    description: anyDescItem?.customDescription?.trim() || "",
  };
}
