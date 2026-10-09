import { Order } from "@/types/orders";

/**
 * Standard Tracking Labels supported in the admin UI
 */
export const TRACKING_LABEL_OPTIONS = [
  "Tracking ID",
  "AWB Number",
  "Shipment Number",
  "Shipment ID",
  "Reference ID",
  "Consignment Number",
  "Other",
] as const;

export type TrackingLabelOption = (typeof TRACKING_LABEL_OPTIONS)[number];

export interface WhatsAppMessageOptions {
  trackingLabel?: string;
  trackingValue?: string;
  trackingUrl?: string;
}

/**
 * Normalizes phone numbers to international digits-only format expected by WhatsApp.
 * Handles:
 * - 10-digit Indian local numbers -> prepends 91
 * - 11-digit numbers starting with 0 -> replaces 0 with 91
 * - Already formatted international numbers (+91, +1, +44, etc.) -> strips non-digits
 * - Validates minimum length and returns null if invalid.
 */
export function normalizeWhatsAppPhone(phone: string | null | undefined): string | null {
  if (!phone) return null;

  // Remove all non-digit characters
  const trimmed = phone.trim();
  let digits = trimmed.replace(/\D/g, "");

  if (!digits) return null;

  // If local Indian phone with leading 0 (e.g. 09876543210 -> 919876543210)
  if (digits.length === 11 && digits.startsWith("0")) {
    digits = `91${digits.slice(1)}`;
  } else if (digits.length === 10) {
    // 10-digit domestic phone number -> prepend India country code 91
    digits = `91${digits}`;
  } else if (digits.length > 10) {
    // Already contains country code (e.g. 919876543210, 15551234567, 447911123456)
    // Keep as is
  } else {
    // Under 10 digits is not a valid international phone number
    return null;
  }

  return digits;
}

/**
 * Formats a currency amount using the order's currency symbol.
 */
function formatCurrency(amount: number | null | undefined, currency?: string): string {
  const val = Number(amount || 0);
  const formatted = val.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  });
  const symbol = !currency || currency.toUpperCase() === "INR" ? "₹" : `${currency} `;
  return `${symbol}${formatted}`;
}

/**
 * Formats order date in a consistent, readable format.
 */
function formatOrderDate(dateString: string | null | undefined): string {
  if (!dateString) return "N/A";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
}

/**
 * Generates the professionally formatted WhatsApp order & tracking message.
 * Adheres strictly to the required specification and handles all optional fields.
 */
export function generateOrderWhatsAppMessage(
  order: Order,
  options?: WhatsAppMessageOptions
): string {
  const customerName = (order.customer_name || "").trim() || "Customer";
  const orderDate = formatOrderDate(order.created_at);
  const orderStatus =
    order.order_status
      ? order.order_status.charAt(0).toUpperCase() + order.order_status.slice(1)
      : "Processing";

  const divider = "━━━━━━━━━━━━━━━━━━";

  // 1. Header
  const headerLines = [
    "🍫 *AJVAS CHOCOLATES*",
    "",
    `Hello ${customerName}! 👋`,
    "",
    "Thank you for choosing AJVAS Chocolates. Here are the details of your order.",
    "",
    divider,
    "📦 *ORDER DETAILS*",
    divider,
    "",
    `🧾 Order Number: ${order.order_number}`,
    `📅 Order Date: ${orderDate}`,
    `📌 Order Status: ${orderStatus}`,
    "",
  ];

  // 2. Items Ordered
  const itemLines = ["🛍️ *ITEMS ORDERED*"];
  const items = order.items && order.items.length > 0 ? order.items : [];

  if (items.length > 0) {
    items.forEach((item) => {
      const name = item.product_name || item.product?.name || "Artisanal Chocolate";
      const qty = item.quantity || 1;
      const unitPrice = formatCurrency(item.unit_price, order.currency);
      const lineTotalVal = item.line_total ?? (item.unit_price * qty);
      const lineTotal = formatCurrency(lineTotalVal, order.currency);

      itemLines.push(name);
      itemLines.push(`   Quantity: ${qty}`);
      itemLines.push(`   Unit Price: ${unitPrice}`);
      itemLines.push(`   Item Total: ${lineTotal}`);

      // If customer included a gift request / celebration note
      if (item.customization && item.customization.trim()) {
        itemLines.push(`   Gift Request: "${item.customization.trim()}"`);
      }
      itemLines.push("");
    });
  } else {
    // Fallback if order has no items array
    itemLines.push("Artisanal Chocolate Collection");
    itemLines.push(`   Quantity: 1`);
    itemLines.push(`   Item Total: ${formatCurrency(order.total_amount, order.currency)}`);
    itemLines.push("");
  }

  // 3. Price Summary
  const priceLines = [
    divider,
    "💰 *PRICE SUMMARY*",
    divider,
    "",
    `Items Subtotal: ${formatCurrency(order.subtotal, order.currency)}`,
  ];

  // Discount (only when applicable and > 0)
  if (order.discount_amount && Number(order.discount_amount) > 0) {
    priceLines.push(
      `Discount: -${formatCurrency(order.discount_amount, order.currency)}`
    );
  }

  // Shipping Charges (persisted order shipping amount)
  const shippingAmount = Number(order.shipping_amount || 0);
  priceLines.push(
    `Shipping Charges: ${formatCurrency(shippingAmount, order.currency)}`
  );

  // Total Amount (persisted order total)
  priceLines.push(
    `*TOTAL AMOUNT: ${formatCurrency(order.total_amount, order.currency)}*`
  );
  priceLines.push("");

  // 4. Delivery & Tracking
  const deliveryLines = [
    divider,
    "🚚 *DELIVERY & TRACKING*",
    divider,
    "",
  ];

  if (customerName) {
    deliveryLines.push(`Recipient: ${customerName}`);
  }

  const streetAddress = [order.shipping_address_line1, order.shipping_address_line2]
    .filter(Boolean)
    .map((s) => s?.trim())
    .filter(Boolean)
    .join(", ");

  if (streetAddress) {
    deliveryLines.push(`Address: ${streetAddress}`);
  }

  const district = (order.shipping_district || order.shipping_city || "").trim();
  if (district) {
    deliveryLines.push(`District: ${district}`);
  }

  const state = (order.shipping_state || "").trim();
  if (state) {
    deliveryLines.push(`State: ${state}`);
  }

  const pincode = (order.shipping_pincode || "").trim();
  if (pincode) {
    deliveryLines.push(`PIN Code: ${pincode}`);
  }

  // Tracking details
  const activeTrackingValue = (options?.trackingValue ?? order.awb_number ?? "").trim();
  const rawLabel = (options?.trackingLabel ?? "Tracking ID").trim();
  const activeTrackingLabel = rawLabel === "Other" || !rawLabel ? "Tracking ID" : rawLabel;
  const activeTrackingUrl = (options?.trackingUrl ?? order.tracking_url ?? "").trim();

  // If tracking value exists, output dynamic tracking line
  if (activeTrackingValue) {
    deliveryLines.push("");
    deliveryLines.push(`${activeTrackingLabel}: ${activeTrackingValue}`);
  }

  // If tracking URL exists, output track order link line
  if (activeTrackingUrl) {
    if (!activeTrackingValue) deliveryLines.push("");
    deliveryLines.push(`🔗 Track Your Order: ${activeTrackingUrl}`);
  }

  deliveryLines.push("");

  // 5. Footer
  const footerLines = [
    divider,
    "",
    "Thank you for shopping with us! ❤️",
    "",
    "Warm regards,",
    "*AJVAS Chocolates*",
    "Artisanal Chocolate Gifting",
  ];

  const fullMessage = [
    ...headerLines,
    ...itemLines,
    ...priceLines,
    ...deliveryLines,
    ...footerLines,
  ].join("\n");

  return fullMessage;
}

/**
 * Builds the Click-to-Chat WhatsApp URL with proper UTF-8 emoji and character encoding.
 */
export function buildWhatsAppChatUrl(phone: string, message: string): string {
  const cleanPhone = phone.replace(/[^0-9]/g, "");

  // Ensure the message string is processed as clean UTF-8
  const processedMessage = new TextDecoder("utf-8").decode(
    new TextEncoder().encode(message)
  );
  const encoded = encodeURIComponent(processedMessage);

  return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encoded}`;
}

/**
 * Safely opens WhatsApp with prefilled message in a new window/tab.
 */
export function openWhatsAppChat(
  rawPhone: string | null | undefined,
  message: string
): { success: boolean; error?: string; url?: string } {
  const normalizedPhone = normalizeWhatsAppPhone(rawPhone);

  if (!normalizedPhone) {
    return {
      success: false,
      error: "The order does not have a valid customer phone number for WhatsApp.",
    };
  }

  if (!message || !message.trim()) {
    return {
      success: false,
      error: "Cannot generate WhatsApp message: Order data is incomplete.",
    };
  }

  try {
    const url = buildWhatsAppChatUrl(normalizedPhone, message);
    if (typeof window !== "undefined") {
      const popup = window.open(url, "_blank", "noopener,noreferrer");
      if (!popup || popup.closed || typeof popup.closed === "undefined") {
        return {
          success: false,
          error: "Browser blocked opening WhatsApp. Please allow popups or use the direct link.",
          url,
        };
      }
    }
    return { success: true, url };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to open WhatsApp.",
    };
  }
}
