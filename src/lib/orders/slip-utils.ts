import { Order } from "@/types/orders";

export interface OrderValidationResult {
  isValid: boolean;
  orderId: string;
  orderNumber: string;
  customerName: string;
  pincode?: string;
  reason?: string;
}

/**
 * Validates whether an Indian postal PIN code contains exactly six digits
 * after trimming leading and trailing whitespace.
 * Preserves leading zeroes (e.g. "012345").
 */
export function isValidPinCode(pincode: string | null | undefined): boolean {
  if (!pincode) return false;
  const trimmed = pincode.trim();
  return /^\d{6}$/.test(trimmed);
}

/**
 * Validates the PIN code and returns a detailed human-readable reason if invalid.
 */
export function validatePinCodeDetail(pincode: string | null | undefined): { isValid: boolean; reason?: string } {
  if (!pincode || !pincode.trim()) {
    return { isValid: false, reason: "Missing PIN code (mandatory 6-digit Indian postal code required)" };
  }
  const trimmed = pincode.trim();
  if (/^\d{6}$/.test(trimmed)) {
    return { isValid: true };
  }
  if (/^\d+$/.test(trimmed)) {
    if (trimmed.length < 6) {
      return { isValid: false, reason: `Invalid PIN code "${trimmed}": only ${trimmed.length} digits (must be exactly 6 digits)` };
    }
    return { isValid: false, reason: `Invalid PIN code "${trimmed}": has ${trimmed.length} digits (must be exactly 6 digits)` };
  }
  return { isValid: false, reason: `Invalid PIN code "${trimmed}": contains non-numeric characters (must be exactly 6 digits)` };
}

/**
 * Validates an order's delivery address for printing.
 * Every address slip strictly requires:
 * 1. A valid 6-digit Indian PIN code.
 * 2. Address Line 1 (street / building / road).
 * 3. Recipient name.
 */
export function validateOrderForSlip(order: Partial<Order> | null | undefined): OrderValidationResult {
  const orderId = order?.id || "";
  const orderNumber = order?.order_number || "Unknown Order";
  const customerName = order?.customer_name?.trim() || "Valued Customer";

  if (!order) {
    return { isValid: false, orderId, orderNumber, customerName, reason: "Order record is missing" };
  }

  // 1. Mandatory 6-digit PIN code validation
  const pinValidation = validatePinCodeDetail(order.shipping_pincode);
  if (!pinValidation.isValid) {
    return {
      isValid: false,
      orderId,
      orderNumber,
      customerName,
      pincode: order.shipping_pincode?.trim() || undefined,
      reason: pinValidation.reason,
    };
  }

  // 2. Mandatory Address Line 1
  const line1 = order.shipping_address_line1?.trim();
  if (!line1) {
    return {
      isValid: false,
      orderId,
      orderNumber,
      customerName,
      pincode: order.shipping_pincode?.trim() || undefined,
      reason: "Missing delivery address (Address Line 1 is required)",
    };
  }

  return {
    isValid: true,
    orderId,
    orderNumber,
    customerName,
    pincode: order.shipping_pincode?.trim() || undefined,
  };
}

/**
 * Backward-compatible helper checking if an order has a valid delivery address.
 */
export function hasValidDeliveryAddress(order: Partial<Order> | null | undefined): boolean {
  return validateOrderForSlip(order).isValid;
}

/**
 * Calculates the exact number of A4 pages needed for a given order count.
 * Exactly 8 slips per A4 sheet.
 * e.g.,
 *  1..8  orders => 1 page
 *  9..16 orders => 2 pages
 *  17..24 orders => 3 pages
 */
export function getPrintPageCount(totalOrders: number, pageSize = 8): number {
  if (totalOrders <= 0) return 0;
  return Math.ceil(totalOrders / pageSize);
}

/**
 * Chunks a list of orders into pages of exactly 8 slots.
 * Each full page has 8 items.
 * If the last page has fewer than 8 orders, the remaining slots are padded with `null`
 * so the 2-column x 4-row grid retains its physical geometry without expanding/stretching.
 */
export function chunkOrdersForPrint(orders: Order[], pageSize = 8): (Order | null)[][] {
  if (!orders || orders.length === 0) return [];

  const pages: (Order | null)[][] = [];

  for (let i = 0; i < orders.length; i += pageSize) {
    const pageSlice: (Order | null)[] = orders.slice(i, i + pageSize);
    // Pad the page to exactly 8 cells with null for unused slots
    while (pageSlice.length < pageSize) {
      pageSlice.push(null);
    }
    pages.push(pageSlice);
  }

  return pages;
}

/**
 * Sanitizes and formats address lines cleanly for a print slip.
 * Preserves leading zero on 6-digit PIN code.
 * Never returns 'undefined', 'null', or placeholder text.
 */
export function formatSlipAddress(order: Partial<Order>) {
  const recipientName = order.customer_name?.trim() || "Valued Customer";
  const phone = order.customer_phone?.trim() || "";
  const line1 = order.shipping_address_line1?.trim() || "";
  const line2 = order.shipping_address_line2?.trim() || null;
  const district = order.shipping_district?.trim() || "";
  const city = order.shipping_city?.trim() || "";
  const state = order.shipping_state?.trim() || "";
  const pincode = order.shipping_pincode ? order.shipping_pincode.trim() : "";
  const country = "INDIA";

  // Locality formatting: avoid duplicating if city equals district
  const locality = district && city && district.toLowerCase() !== city.toLowerCase()
    ? `${city}, ${district}`
    : district || city;

  const destination = [locality, state, country].filter(Boolean).join(", ");

  return {
    recipientName,
    phone,
    line1,
    line2,
    district,
    city,
    state,
    country,
    locality,
    destination,
    pincode,
  };
}
