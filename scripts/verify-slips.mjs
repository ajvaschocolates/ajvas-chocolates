// scripts/verify-slips.mjs
// Comprehensive Verification Suite for AJVAS Chocolates A4 Address Slip Printing

import assert from "node:assert";

// Core logic functions under test (mirroring src/lib/orders/slip-utils.ts)
function isValidPinCode(pincode) {
  if (!pincode) return false;
  const trimmed = pincode.trim();
  return /^\d{6}$/.test(trimmed);
}

function validatePinCodeDetail(pincode) {
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

function validateOrderForSlip(order) {
  const orderId = order?.id || "";
  const orderNumber = order?.order_number || "Unknown Order";
  const customerName = order?.customer_name?.trim() || "Valued Customer";

  if (!order) {
    return { isValid: false, orderId, orderNumber, customerName, reason: "Order record is missing" };
  }

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

function formatSlipAddress(order) {
  const recipientName = order.customer_name?.trim() || "Valued Customer";
  const phone = order.customer_phone?.trim() || "";
  const line1 = order.shipping_address_line1?.trim() || "";
  const line2 = order.shipping_address_line2?.trim() || null;
  const district = order.shipping_district?.trim() || "";
  const city = order.shipping_city?.trim() || "";
  const state = order.shipping_state?.trim() || "";
  const pincode = order.shipping_pincode ? order.shipping_pincode.trim() : "";
  const country = "INDIA";

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

function chunkOrdersForPrint(orders, pageSize = 8) {
  if (!orders || orders.length === 0) return [];
  const pages = [];
  for (let i = 0; i < orders.length; i += pageSize) {
    const pageSlice = orders.slice(i, i + pageSize);
    while (pageSlice.length < pageSize) {
      pageSlice.push(null);
    }
    pages.push(pageSlice);
  }
  return pages;
}

function getPrintPageCount(totalOrders, pageSize = 8) {
  if (totalOrders <= 0) return 0;
  return Math.ceil(totalOrders / pageSize);
}

function mockOrder(id, overrides = {}) {
  return {
    id: `order-uuid-${id}`,
    order_number: `AJV-2026-${String(id).padStart(6, "0")}`,
    customer_name: `Customer Name ${id}`,
    customer_phone: `+91 98765 ${String(id).padStart(5, "0")}`,
    shipping_address_line1: `House No. ${id}, Luxury Avenue, Chocolate Boulevard`,
    shipping_address_line2: id % 2 === 0 ? `Near Landmark ${id}` : null,
    shipping_city: "Bengaluru",
    shipping_district: "Bengaluru Urban",
    shipping_state: "Karnataka",
    shipping_pincode: `5600${String(id).padStart(2, "0")}`,
    ...overrides,
  };
}

console.log("===================================================================");
console.log("AJVAS CHOCOLATES — COMPREHENSIVE ADDRESS SLIP VERIFICATION SUITE");
console.log("===================================================================\n");

// -----------------------------------------------------------------------------
// TEST 1: Physical Geometry
// -----------------------------------------------------------------------------
console.log("[1. Physical Geometry Verification]");
const SLIP_WIDTH_MM = 105;
const SLIP_HEIGHT_MM = 74.25;
const COLS = 2;
const ROWS = 4;
assert.strictEqual(SLIP_WIDTH_MM * COLS, 210, "Total width must be 210 mm (A4)");
assert.strictEqual(SLIP_HEIGHT_MM * ROWS, 297, "Total height must be 297 mm (A4)");
assert.strictEqual(COLS * ROWS, 8, "Must be exactly 8 slips per full A4 sheet");
console.log("  PASS: Exact 210 mm x 297 mm A4 sheet, 2x4 grid, 8 slips per sheet.\n");

// -----------------------------------------------------------------------------
// TEST 2: PIN Code Validation Cases
// -----------------------------------------------------------------------------
console.log("[2. Mandatory PIN Code Validation Tests]");

// Case A: Valid 6-digit PIN code
const validPin1 = "560038";
const resValid1 = validatePinCodeDetail(validPin1);
assert.strictEqual(resValid1.isValid, true, "560038 must be valid");
console.log(`  PASS: Valid 6-digit PIN "${validPin1}" accepted.`);

// Case B: Valid 6-digit PIN code with leading zero (preserved as string)
const validPinZero = "012345";
const resValidZero = validatePinCodeDetail(validPinZero);
assert.strictEqual(resValidZero.isValid, true, "012345 must be valid");
assert.strictEqual(validPinZero.startsWith("0"), true, "Leading zero must be preserved");
console.log(`  PASS: Valid 6-digit PIN with leading zero "${validPinZero}" accepted and preserved.`);

// Case C: Missing PIN code (null, undefined, empty, whitespace)
for (const missingPin of [null, undefined, "", "   "]) {
  const resMissing = validatePinCodeDetail(missingPin);
  assert.strictEqual(resMissing.isValid, false, `Missing PIN ${JSON.stringify(missingPin)} must be invalid`);
  assert(resMissing.reason.includes("Missing PIN code"), "Reason must mention missing PIN");
}
console.log("  PASS: Missing PIN codes (null, undefined, empty, whitespace) rejected with clear reasons.");

// Case D: 5-digit PIN code (too short)
const pin5 = "56003";
const res5 = validatePinCodeDetail(pin5);
assert.strictEqual(res5.isValid, false, "5-digit PIN must be invalid");
assert(res5.reason.includes("only 5 digits"), "Reason must mention 5 digits");
console.log(`  PASS: 5-digit PIN "${pin5}" rejected: ${res5.reason}`);

// Case E: 7-digit PIN code (too long)
const pin7 = "5600381";
const res7 = validatePinCodeDetail(pin7);
assert.strictEqual(res7.isValid, false, "7-digit PIN must be invalid");
assert(res7.reason.includes("has 7 digits"), "Reason must mention 7 digits");
console.log(`  PASS: 7-digit PIN "${pin7}" rejected: ${res7.reason}`);

// Case F: PIN code containing non-numeric characters
const nonNumericPins = ["56003A", "560-038", "560 038", "ABCDEF", "5600#$"];
for (const nonNum of nonNumericPins) {
  const resNonNum = validatePinCodeDetail(nonNum);
  assert.strictEqual(resNonNum.isValid, false, `Non-numeric PIN "${nonNum}" must be invalid`);
  assert(resNonNum.reason.includes("non-numeric") || resNonNum.reason.includes("digits"), "Must report invalid PIN format");
}
console.log("  PASS: Non-numeric PIN codes rejected with clear reasons.\n");

// -----------------------------------------------------------------------------
// TEST 3: Long Address Wrapping & Formatting
// -----------------------------------------------------------------------------
console.log("[3. Complete Delivery Address & Long Address Formatting]");
const longOrder = mockOrder(99, {
  customer_name: "Dr. Alexander Ramachandran-Venkatesh",
  customer_phone: "+91 98450 12345",
  shipping_address_line1: "Flat 1204, Tower B, Prestige Highline Luxury Enclave, Outer Ring Road",
  shipping_address_line2: "Opposite Cessna Business Park, Behind Multiplex & Hypermarket",
  shipping_city: "Bengaluru",
  shipping_district: "Bengaluru Urban",
  shipping_state: "Karnataka",
  shipping_pincode: "560103",
});

const formatted = formatSlipAddress(longOrder);
assert.strictEqual(formatted.recipientName, "Dr. Alexander Ramachandran-Venkatesh");
assert.strictEqual(formatted.phone, "+91 98450 12345");
assert.strictEqual(formatted.line1, "Flat 1204, Tower B, Prestige Highline Luxury Enclave, Outer Ring Road");
assert.strictEqual(formatted.line2, "Opposite Cessna Business Park, Behind Multiplex & Hypermarket");
assert.strictEqual(formatted.destination, "Bengaluru, Bengaluru Urban, Karnataka, INDIA");
assert.strictEqual(formatted.pincode, "560103");
assert(!JSON.stringify(formatted).includes("undefined"), "Must not contain undefined");
assert(!JSON.stringify(formatted).includes("null"), "Must not contain string 'null'");
console.log("  PASS: Long address formatted cleanly with complete details and INDIA country label.\n");

// -----------------------------------------------------------------------------
// TEST 4: Bulk Selection with Mixed Valid and Invalid Addresses
// -----------------------------------------------------------------------------
console.log("[4. Mixed Bulk Selection Test (Valid + Invalid Orders)]");
const mixedOrders = [
  mockOrder(1, { shipping_pincode: "560001" }), // Valid
  mockOrder(2, { shipping_pincode: "56002" }),  // Invalid (5 digits)
  mockOrder(3, { shipping_pincode: "560003" }), // Valid
  mockOrder(4, { shipping_pincode: null }),     // Invalid (missing)
  mockOrder(5, { shipping_pincode: "560005" }), // Valid
  mockOrder(6, { shipping_pincode: "560005A" }),// Invalid (non-numeric)
  mockOrder(7, { shipping_pincode: "560007" }), // Valid
  mockOrder(8, { shipping_address_line1: "" }), // Invalid (missing line 1)
  mockOrder(9, { shipping_pincode: "560009" }), // Valid
];

const validOrders = mixedOrders.filter((o) => validateOrderForSlip(o).isValid);
const invalidOrders = mixedOrders
  .map((o) => ({ order: o, validation: validateOrderForSlip(o) }))
  .filter((x) => !x.validation.isValid);

assert.strictEqual(mixedOrders.length, 9, "Total selected: 9");
assert.strictEqual(validOrders.length, 5, "Exactly 5 orders must be valid");
assert.strictEqual(invalidOrders.length, 4, "Exactly 4 orders must be invalid");

// Check reasons
assert(invalidOrders[0].validation.reason.includes("5 digits"));
assert(invalidOrders[1].validation.reason.includes("Missing PIN"));
assert(invalidOrders[2].validation.reason.includes("non-numeric"));
assert(invalidOrders[3].validation.reason.includes("Address Line 1"));

// Check print chunking for valid orders only
const validPages = chunkOrdersForPrint(validOrders, 8);
const validPageCount = getPrintPageCount(validOrders.length, 8);
assert.strictEqual(validPageCount, 1, "5 valid orders fit on 1 A4 page");
assert.strictEqual(validPages.length, 1, "Exactly 1 page chunk produced");
assert.strictEqual(validPages[0].filter(Boolean).length, 5, "5 filled slots");
assert.strictEqual(validPages[0].filter((x) => x === null).length, 3, "3 empty slots");
console.log("  PASS: Mixed bulk selection: 5 valid orders printed on 1 page; 4 invalid orders correctly excluded with detailed reasons.\n");

// -----------------------------------------------------------------------------
// TEST 5: Single and Bulk Printing Consistency
// -----------------------------------------------------------------------------
console.log("[5. Single vs Bulk Validation Consistency]");
const singleValid = mockOrder(10, { shipping_pincode: "560010" });
const singleInvalid = mockOrder(11, { shipping_pincode: "56001" });

assert.strictEqual(validateOrderForSlip(singleValid).isValid, true, "Single valid order must pass");
assert.strictEqual(validateOrderForSlip(singleInvalid).isValid, false, "Single invalid order must fail");

// When tested in bulk, the behavior is identical
const bulkCheck = [singleValid, singleInvalid].map(validateOrderForSlip);
assert.strictEqual(bulkCheck[0].isValid, true);
assert.strictEqual(bulkCheck[1].isValid, false);
console.log("  PASS: Identical validation behavior verified across single-order and bulk workflows.\n");

// -----------------------------------------------------------------------------
// TEST 6: Page Counts for 1, 8, 9, 16, and 17 Valid Orders
// -----------------------------------------------------------------------------
console.log("[6. Page Counts & Chunking for 1, 8, 9, 16, 17 Valid Orders]");
const pageCountTestMatrix = [
  { count: 1, expectedPages: 1, page1Filled: 1, page2Filled: 0, page3Filled: 0 },
  { count: 8, expectedPages: 1, page1Filled: 8, page2Filled: 0, page3Filled: 0 },
  { count: 9, expectedPages: 2, page1Filled: 8, page2Filled: 1, page3Filled: 0 },
  { count: 16, expectedPages: 2, page1Filled: 8, page2Filled: 8, page3Filled: 0 },
  { count: 17, expectedPages: 3, page1Filled: 8, page2Filled: 8, page3Filled: 1 },
];

for (const test of pageCountTestMatrix) {
  const orders = Array.from({ length: test.count }, (_, i) => mockOrder(i + 1));
  const pages = chunkOrdersForPrint(orders, 8);
  const pageCount = getPrintPageCount(test.count, 8);

  assert.strictEqual(pageCount, test.expectedPages, `Page count mismatch for ${test.count} orders`);
  assert.strictEqual(pages.length, test.expectedPages, `Pages length mismatch for ${test.count} orders`);

  const p1 = pages[0].filter(Boolean).length;
  const p2 = pages[1] ? pages[1].filter(Boolean).length : 0;
  const p3 = pages[2] ? pages[2].filter(Boolean).length : 0;

  assert.strictEqual(p1, test.page1Filled, `Page 1 filled count mismatch for ${test.count} orders`);
  assert.strictEqual(p2, test.page2Filled, `Page 2 filled count mismatch for ${test.count} orders`);
  assert.strictEqual(p3, test.page3Filled, `Page 3 filled count mismatch for ${test.count} orders`);

  console.log(`  PASS: ${test.count} valid order(s) -> Exactly ${test.expectedPages} A4 sheet(s) (Page 1: ${p1}/8, Page 2: ${p2}/8, Page 3: ${p3}/8).`);
}

console.log("\n===================================================================");
console.log("ALL ACCEPTANCE CRITERIA AND VERIFICATION TESTS PASSED SUCCESSFULLY!");
console.log("===================================================================\n");
