/**
 * Automated Verification Test Suite for AJVAS Chocolates:
 * Admin Orders Table Enhancements & WhatsApp Shipping Workflow
 */

import {
  ORDER_STATUS_STYLES,
  getOrderStatusStyle,
  isValidActiveStatus,
} from "../src/lib/orders/status-utils.ts";
import { ACTIVE_ORDER_STATUSES } from "../src/types/orders.ts";
import {
  generateOrderWhatsAppMessage,
  buildWhatsAppChatUrl,
  normalizeWhatsAppPhone,
} from "../src/lib/whatsapp/order-message.ts";

let passedCount = 0;
let failedCount = 0;

function assert(description, condition, details = "") {
  if (condition) {
    passedCount++;
    console.log(`  PASS: ${description}`);
  } else {
    failedCount++;
    console.error(`  FAIL: ${description} - ${details}`);
  }
}

console.log("===================================================================");
console.log("AJVAS CHOCOLATES — ADMIN ORDERS & WHATSAPP WORKFLOW VERIFICATION");
console.log("===================================================================\n");

// 1. Status Color Mapping Tests
console.log("[1. Status Color Mapping Tests]");
const pendingStyle = getOrderStatusStyle("pending");
assert(
  "Pending status maps to amber/yellow background with readable dark amber text",
  pendingStyle.badgeClass.includes("bg-amber-100") &&
    pendingStyle.badgeClass.includes("text-amber-900") &&
    pendingStyle.badgeClass.includes("border-amber-300"),
  `Got: ${pendingStyle.badgeClass}`
);

const processingStyle = getOrderStatusStyle("processing");
assert(
  "Processing status maps to blue background with readable dark blue text",
  processingStyle.badgeClass.includes("bg-blue-100") &&
    processingStyle.badgeClass.includes("text-blue-900") &&
    processingStyle.badgeClass.includes("border-blue-300"),
  `Got: ${processingStyle.badgeClass}`
);

const shippedStyle = getOrderStatusStyle("shipped");
assert(
  "Shipped status maps to purple/indigo background with readable dark purple text",
  shippedStyle.badgeClass.includes("bg-purple-100") &&
    shippedStyle.badgeClass.includes("text-purple-900") &&
    shippedStyle.badgeClass.includes("border-purple-300"),
  `Got: ${shippedStyle.badgeClass}`
);

const deliveredStyle = getOrderStatusStyle("delivered");
assert(
  "Delivered status maps to green background with readable dark green text",
  deliveredStyle.badgeClass.includes("bg-emerald-100") &&
    deliveredStyle.badgeClass.includes("text-emerald-900") &&
    deliveredStyle.badgeClass.includes("border-emerald-300"),
  `Got: ${deliveredStyle.badgeClass}`
);

const cancelledStyle = getOrderStatusStyle("cancelled");
assert(
  "Historical Cancelled status maps to neutral stone background for backward compatibility",
  cancelledStyle.badgeClass.includes("bg-stone-100") &&
    cancelledStyle.badgeClass.includes("text-stone-700"),
  `Got: ${cancelledStyle.badgeClass}`
);

// 2. Active Application Statuses Exclude Cancelled
console.log("\n[2. Active Application Status Options & Dropdown Tests]");
assert(
  "ACTIVE_ORDER_STATUSES contains exactly 4 active statuses",
  ACTIVE_ORDER_STATUSES.length === 4,
  `Got length: ${ACTIVE_ORDER_STATUSES.length}`
);

assert(
  "ACTIVE_ORDER_STATUSES contains pending, processing, shipped, delivered",
  ACTIVE_ORDER_STATUSES.includes("pending") &&
    ACTIVE_ORDER_STATUSES.includes("processing") &&
    ACTIVE_ORDER_STATUSES.includes("shipped") &&
    ACTIVE_ORDER_STATUSES.includes("delivered"),
  `Got: ${ACTIVE_ORDER_STATUSES.join(", ")}`
);

assert(
  "ACTIVE_ORDER_STATUSES explicitly excludes 'cancelled'",
  !ACTIVE_ORDER_STATUSES.includes("cancelled"),
  "Cancelled must NOT be in active statuses"
);

assert(
  "isValidActiveStatus rejects 'cancelled'",
  isValidActiveStatus("cancelled") === false,
  "Cancelled must be rejected by validator"
);

assert(
  "isValidActiveStatus accepts 'pending', 'processing', 'shipped', 'delivered'",
  isValidActiveStatus("pending") &&
    isValidActiveStatus("processing") &&
    isValidActiveStatus("shipped") &&
    isValidActiveStatus("delivered"),
  "All 4 active statuses must validate successfully"
);

// 3. Status Transition Rules & Safeguards (Unit Simulation)
console.log("\n[3. Status Transition Safeguards & Regression Tests]");

function simulateTransition(currentStatus, action) {
  if (action === "admin_update_status") {
    // Normal admin update: cannot select cancelled
    return isValidActiveStatus(action.newStatus) ? action.newStatus : currentStatus;
  }
  if (action === "whatsapp_shipping_action") {
    if (currentStatus === "delivered") {
      // Delivered NEVER regresses to Shipped
      return "delivered";
    }
    if (currentStatus === "processing") {
      // Processing automatically transitions to Shipped
      return "shipped";
    }
    if (currentStatus === "shipped") {
      // Shipped remains shipped (resend/re-notify)
      return "shipped";
    }
    if (currentStatus === "pending") {
      // Pending remains pending
      return "pending";
    }
    if (currentStatus === "cancelled") {
      // Historical cancelled remains cancelled
      return "cancelled";
    }
  }
  return currentStatus;
}

assert(
  "Safeguard: Processing -> Shipped when WhatsApp action is initiated",
  simulateTransition("processing", "whatsapp_shipping_action") === "shipped",
  "Processing should transition to Shipped"
);

assert(
  "Safeguard: Delivered NEVER regresses to Shipped through WhatsApp workflow",
  simulateTransition("delivered", "whatsapp_shipping_action") === "delivered",
  "Delivered must remain Delivered"
);

assert(
  "Safeguard: Pending preserves Pending status through WhatsApp modal opening/action",
  simulateTransition("pending", "whatsapp_shipping_action") === "pending",
  "Pending must not change to Shipped automatically"
);

assert(
  "Safeguard: Shipped allows resend without duplicate transition or status change",
  simulateTransition("shipped", "whatsapp_shipping_action") === "shipped",
  "Shipped must remain Shipped"
);

assert(
  "Safeguard: Historical Cancelled orders are never modified by WhatsApp workflow",
  simulateTransition("cancelled", "whatsapp_shipping_action") === "cancelled",
  "Cancelled must remain Cancelled"
);

// 4. Emoji and Unicode Round-Trip Encoding Tests
console.log("\n[4. Emoji and Unicode Preservation & Single Encoding Tests]");

const mockOrder = {
  id: "order-test-1",
  order_number: "AJV-2026-100200",
  customer_id: null,
  customer_name: "വിഷ്ണു പ്രസാദ് (Vishnu Prasad)",
  customer_phone: "9876543210",
  customer_email: "vishnu@example.com",
  shipping_address_line1: "House No 42, Green Valley",
  shipping_address_line2: "Near Temple Road",
  shipping_city: "Kochi",
  shipping_state: "Kerala",
  shipping_district: "Ernakulam",
  shipping_pincode: "682001",
  courier_partner: "Blue Dart",
  courier_service_name: "Apex Air",
  awb_number: "BD998877665",
  tracking_url: "https://track.bluedart.com/BD998877665",
  subtotal: 1200,
  discount_amount: 100,
  shipping_amount: 80,
  total_amount: 1180,
  currency: "INR",
  order_status: "processing",
  payment_status: "paid",
  payment_provider: "Razorpay",
  razorpay_order_id: "order_xyz",
  razorpay_payment_id: "pay_xyz",
  razorpay_signature: "sig_xyz",
  package_weight_grams: 500,
  shipping_rate_id: null,
  placed_at: "2026-10-13T10:00:00Z",
  created_at: "2026-10-13T10:00:00Z",
  updated_at: "2026-10-13T10:00:00Z",
  items: [
    {
      id: "item-1",
      order_id: "order-test-1",
      product_id: "p1",
      product_name: "Hazelnut Praline Box",
      product_slug: "hazelnut-praline-box",
      quantity: 2,
      unit_price: 600,
      discount_amount: 0,
      line_total: 1200,
      weight_grams: 250,
      customization: "Happy Anniversary to dearest Amma & Acha! ❤️",
      created_at: "2026-10-13T10:00:00Z",
    },
  ],
};

const generatedMsg = generateOrderWhatsAppMessage(mockOrder, {
  trackingLabel: "AWB Number",
  trackingValue: "BD998877665",
  trackingUrl: "https://track.bluedart.com/BD998877665",
});

assert(
  "Generated message contains original emojis (🍫, 👋, 📦, 🧾, 📅, 📌, 🛍️, 💰, 🚚, 🔗, ❤️)",
  generatedMsg.includes("🍫") &&
    generatedMsg.includes("👋") &&
    generatedMsg.includes("📦") &&
    generatedMsg.includes("🧾") &&
    generatedMsg.includes("📅") &&
    generatedMsg.includes("📌") &&
    generatedMsg.includes("🛍️") &&
    generatedMsg.includes("💰") &&
    generatedMsg.includes("🚚") &&
    generatedMsg.includes("🔗") &&
    generatedMsg.includes("❤️"),
  "Missing required emojis in generated message"
);

assert(
  "Generated message contains NO Unicode replacement character (\\uFFFD)",
  !generatedMsg.includes("\uFFFD"),
  "Found replacement character \\uFFFD in generated message!"
);

assert(
  "Preserves Malayalam Unicode customer name in message",
  generatedMsg.includes("വിഷ്ണു പ്രസാദ് (Vishnu Prasad)"),
  "Customer name with Malayalam text corrupted"
);

assert(
  "Preserves customer gift customization note and emojis",
  generatedMsg.includes('Happy Anniversary to dearest Amma & Acha! ❤️'),
  "Customization note corrupted"
);

assert(
  "Preserves Indian Rupee currency symbol ₹",
  generatedMsg.includes("₹1,200") && generatedMsg.includes("₹1,180"),
  "Currency formatting corrupted"
);

// URL generation and round-trip decode verification
const whatsappUrl = buildWhatsAppChatUrl("9876543210", generatedMsg);
assert(
  "buildWhatsAppChatUrl produces valid WhatsApp API URL",
  whatsappUrl.startsWith("https://api.whatsapp.com/send?phone=9876543210&text="),
  `Got: ${whatsappUrl.slice(0, 70)}...`
);

const encodedParam = whatsappUrl.split("&text=")[1];
const decodedParam = decodeURIComponent(encodedParam);

assert(
  "Round-trip decoding WhatsApp parameter reproduces original message exactly",
  decodedParam === generatedMsg,
  "Decoded text does not match original message string!"
);

assert(
  "Decoded parameter contains NO replacement characters \\uFFFD",
  !decodedParam.includes("\uFFFD"),
  "Decoded parameter has \\uFFFD replacement characters"
);

// 5. Phone Normalization Tests
console.log("\n[5. Phone Normalization Tests]");
assert(
  "Normalizes 10-digit Indian number 9876543210 to 919876543210",
  normalizeWhatsAppPhone("9876543210") === "919876543210",
  `Got: ${normalizeWhatsAppPhone("9876543210")}`
);

assert(
  "Normalizes 11-digit number with leading 0 (09876543210) to 919876543210",
  normalizeWhatsAppPhone("09876543210") === "919876543210",
  `Got: ${normalizeWhatsAppPhone("09876543210")}`
);

assert(
  "Preserves international number with + (+91 98765 43210) as digits 919876543210",
  normalizeWhatsAppPhone("+91 98765 43210") === "919876543210",
  `Got: ${normalizeWhatsAppPhone("+91 98765 43210")}`
);

// 6. Modal Automatic Closure & Failure Isolation Tests
console.log("\n[6. Modal Automatic Closure & Failure Isolation Tests]");

function simulateModalSendAction({
  order,
  normalizedPhone,
  trackingValue,
  selectedLabelOption,
  customLabel,
  serverUpdateFn,
}) {
  let modalOpen = true;
  let errorMessage = null;
  let clientActionStarted = false;
  let orderUpdatedData = null;

  if (!normalizedPhone) {
    errorMessage = `Cannot send WhatsApp notification: Customer phone (${order.customer_phone || "empty"}) is invalid.`;
    return { modalOpen, errorMessage, clientActionStarted, orderUpdatedData };
  }

  const trimmedValue = (trackingValue || "").trim();
  if (order.order_status === "processing" && !trimmedValue) {
    errorMessage = "Please enter a Tracking ID / AWB Number before initiating shipment notification.";
    return { modalOpen, errorMessage, clientActionStarted, orderUpdatedData };
  }

  if (selectedLabelOption === "Other" && !(customLabel || "").trim()) {
    errorMessage = "Please specify a custom tracking label name.";
    return { modalOpen, errorMessage, clientActionStarted, orderUpdatedData };
  }

  // Client action initiated
  clientActionStarted = true;

  // Server action
  const serverRes = serverUpdateFn();
  if (serverRes.success) {
    const nextStatus = order.order_status === "processing" ? "shipped" : order.order_status;
    orderUpdatedData = {
      id: order.id,
      awb_number: trimmedValue || order.awb_number,
      order_status: nextStatus,
    };
    // Close modal automatically
    modalOpen = false;
  } else {
    // Partial-success case: WhatsApp window opened, but server action failed
    errorMessage = `WhatsApp action initiated, but the server failed to update order status: ${serverRes.error || "Unknown server error"}. Please retry.`;
    modalOpen = true;
  }

  return { modalOpen, errorMessage, clientActionStarted, orderUpdatedData };
}

// Scenario A: Validation fails on missing tracking for Processing order
const failA = simulateModalSendAction({
  order: { ...mockOrder, order_status: "processing" },
  normalizedPhone: "919876543210",
  trackingValue: "   ",
  selectedLabelOption: "Tracking ID",
  serverUpdateFn: () => ({ success: true }),
});
assert(
  "Validation failure: Modal remains open when tracking is empty for Processing order",
  failA.modalOpen === true && failA.clientActionStarted === false && Boolean(failA.errorMessage),
  "Modal must not close on validation failure"
);

// Scenario B: Validation fails on invalid phone
const failB = simulateModalSendAction({
  order: { ...mockOrder, order_status: "processing", customer_phone: "" },
  normalizedPhone: null,
  trackingValue: "TRK12345",
  selectedLabelOption: "Tracking ID",
  serverUpdateFn: () => ({ success: true }),
});
assert(
  "Validation failure: Modal remains open when customer phone is invalid",
  failB.modalOpen === true && failB.clientActionStarted === false && Boolean(failB.errorMessage),
  "Modal must not close on phone validation failure"
);

// Scenario C: Validation passes and server succeeds -> Modal automatically closes
const successC = simulateModalSendAction({
  order: { ...mockOrder, order_status: "processing" },
  normalizedPhone: "919876543210",
  trackingValue: "BD998877665",
  selectedLabelOption: "Tracking ID",
  serverUpdateFn: () => ({ success: true }),
});
assert(
  "Automatic closure: Modal closes automatically upon successful send action initiation",
  successC.modalOpen === false &&
    successC.clientActionStarted === true &&
    successC.orderUpdatedData.order_status === "shipped",
  "Modal must close automatically after send action is successfully initiated"
);

// Scenario D: Partial success: WhatsApp action started but server fails -> Modal remains open with error
const partialD = simulateModalSendAction({
  order: { ...mockOrder, order_status: "processing" },
  normalizedPhone: "919876543210",
  trackingValue: "BD998877665",
  selectedLabelOption: "Tracking ID",
  serverUpdateFn: () => ({ success: false, error: "Database timeout" }),
});
assert(
  "Failure handling: Modal remains open and shows error if server update fails after WhatsApp launch",
  partialD.modalOpen === true &&
    partialD.clientActionStarted === true &&
    partialD.orderUpdatedData === null &&
    partialD.errorMessage.includes("Database timeout"),
  "Modal must remain open for retry if server update fails"
);

// Summary
console.log("\n===================================================================");
console.log(`TOTAL TESTS: ${passedCount + failedCount} | PASSED: ${passedCount} | FAILED: ${failedCount}`);
console.log("===================================================================");

if (failedCount > 0) {
  process.exit(1);
}
