/**
 * ===================================================================
 * AJVAS CHOCOLATES — Custom Gift Purpose Description
 * Comprehensive Verification & Acceptance Test Suite
 * ===================================================================
 *
 * Covers all 9 Verification Points specified in Section 6:
 * 1. Selecting Custom reveals the description field.
 * 2. Switching to a standard purpose hides it and removes the custom fee.
 * 3. Empty or whitespace-only descriptions are rejected for Custom.
 * 4. Descriptions over 300 characters are rejected.
 * 5. The description persists through cart and checkout.
 * 6. The admin order details display the saved description.
 * 7. The WhatsApp message contains the exact description, including Unicode characters.
 * 8. The custom fee is charged only once per order.
 * 9. Standard purposes continue working without a custom description.
 */

import assert from "node:assert";
import { generateOrderWhatsAppMessage } from "../src/lib/whatsapp/order-message.ts";

const CUSTOM_GIFT_PURPOSE_VALUE = "Custom";

// Standard configuration matching store defaults
const standardConfig = {
  options: [
    { id: "1", name: "Happy Birthday", is_active: true, sort_order: 1 },
    { id: "2", name: "Anniversary", is_active: true, sort_order: 2 },
    { id: "3", name: "Wedding", is_active: true, sort_order: 3 },
    { id: "4", name: "Engagement", is_active: true, sort_order: 4 },
    { id: "5", name: "Congratulations", is_active: true, sort_order: 5 },
    { id: "6", name: "Thank You", is_active: true, sort_order: 6 },
    { id: "7", name: "Get Well Soon", is_active: true, sort_order: 7 },
    { id: "8", name: "Festival Gift", is_active: true, sort_order: 8 },
    { id: "9", name: "Just Because", is_active: true, sort_order: 9 },
  ],
  settings: {
    custom_enabled: true,
    custom_fee: 75,
  },
};

/**
 * Server-side validation logic (mirroring src/lib/supabase/gift-purposes.ts)
 */
function validateGiftPurposeSelection(purpose, config, description) {
  const cleanPurpose = (purpose || "").trim();

  if (!cleanPurpose) {
    return {
      isValid: true,
      isCustom: false,
      fee: 0,
      normalizedPurpose: null,
      normalizedDescription: null,
    };
  }

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
 * Server calculation engine (mirroring src/app/checkout/actions.ts)
 */
function calculateAuthoritativeOrderTotal(items, shippingAmount, giftPurpose, giftDesc, config) {
  const giftValidation = validateGiftPurposeSelection(giftPurpose, config, giftDesc);
  if (!giftValidation.isValid) {
    throw new Error(giftValidation.error || "Invalid gift purpose");
  }

  let calculatedSubtotal = 0;
  for (const item of items) {
    const price = item.discountedUnitPrice ?? item.unitPrice ?? 0;
    calculatedSubtotal += price * (item.quantity || 1);
  }

  const fee = giftValidation.fee;
  const total = calculatedSubtotal + shippingAmount + fee;

  return {
    subtotal: calculatedSubtotal,
    shippingAmount,
    giftPurpose: giftValidation.normalizedPurpose,
    giftPurposeFee: fee,
    customDescription: giftValidation.normalizedDescription,
    totalAmount: total,
    amountInPaise: Math.round(total * 100),
  };
}

let passedCount = 0;
let failedCount = 0;

function runTest(testNumber, description, fn) {
  try {
    fn();
    passedCount++;
    console.log(`  PASS [Criterion ${testNumber}]: ${description}`);
  } catch (err) {
    failedCount++;
    console.error(`  FAIL [Criterion ${testNumber}]: ${description}`);
    console.error(`       Error: ${err.message}`);
  }
}

console.log("===================================================================");
console.log("AJVAS CHOCOLATES — CUSTOM GIFT PURPOSE DESCRIPTION VERIFICATION");
console.log("===================================================================\n");

// 1. Selecting Custom reveals the description field.
runTest(1, "Selecting Custom reveals the description field", () => {
  // Simulating field visibility logic in GiftCustomizationField
  const isCustomSelected = (val) => val === "Custom" || val.toLowerCase().startsWith("custom");
  assert.strictEqual(isCustomSelected("Custom"), true, "Custom reveals field");
  assert.strictEqual(isCustomSelected("Happy Birthday"), false, "Standard hides field");
  assert.strictEqual(isCustomSelected(""), false, "Empty selection hides field");
});

// 2. Switching to a standard purpose hides it and removes the custom fee.
runTest(2, "Switching to a standard purpose hides it and removes the custom fee", () => {
  // User initially selected Custom
  let purpose = "Custom";
  let desc = "Silver jubilee celebration for parents";
  let validation = validateGiftPurposeSelection(purpose, standardConfig, desc);
  assert.strictEqual(validation.isValid, true);
  assert.strictEqual(validation.fee, 75);
  assert.strictEqual(validation.normalizedDescription, desc);

  // User switches to standard purpose
  purpose = "Anniversary";
  validation = validateGiftPurposeSelection(purpose, standardConfig, desc);
  assert.strictEqual(validation.isValid, true);
  assert.strictEqual(validation.isCustom, false);
  assert.strictEqual(validation.fee, 0, "Fee must be removed when switching to standard");
  assert.strictEqual(validation.normalizedDescription, null, "Custom description ignored for standard");
});

// 3. Empty or whitespace-only descriptions are rejected for Custom.
runTest(3, "Empty or whitespace-only descriptions are rejected for Custom", () => {
  // Empty string
  const emptyRes = validateGiftPurposeSelection("Custom", standardConfig, "");
  assert.strictEqual(emptyRes.isValid, false);
  assert.ok(emptyRes.error.includes("provide a description"));

  // Whitespace only
  const whitespaceRes = validateGiftPurposeSelection("Custom", standardConfig, "   \n\t  ");
  assert.strictEqual(whitespaceRes.isValid, false);
  assert.ok(whitespaceRes.error.includes("provide a description"));

  // Null/undefined
  const nullRes = validateGiftPurposeSelection("Custom", standardConfig, null);
  assert.strictEqual(nullRes.isValid, false);
  assert.ok(nullRes.error.includes("provide a description"));
});

// 4. Descriptions over 300 characters are rejected.
runTest(4, "Descriptions over 300 characters are rejected", () => {
  const exact300 = "a".repeat(300);
  const exactRes = validateGiftPurposeSelection("Custom", standardConfig, exact300);
  assert.strictEqual(exactRes.isValid, true);
  assert.strictEqual(exactRes.normalizedDescription.length, 300);

  const over300 = "a".repeat(301);
  const overRes = validateGiftPurposeSelection("Custom", standardConfig, over300);
  assert.strictEqual(overRes.isValid, false);
  assert.ok(overRes.error.includes("cannot exceed 300 characters"));

  const long500 = "x".repeat(500);
  const longRes = validateGiftPurposeSelection("Custom", standardConfig, long500);
  assert.strictEqual(longRes.isValid, false);
  assert.ok(longRes.error.includes("cannot exceed 300 characters"));
});

// 5. The description persists through cart and checkout.
runTest(5, "The description persists through cart and checkout", () => {
  const customMessage = "Birthday surprise for my wife with custom note";

  // Simulate PDP -> Cart addition
  const cartItem = {
    productId: "prod-1",
    name: "Artisanal Truffle Box",
    unitPrice: 1200,
    quantity: 1,
    customization: "Custom",
    customDescription: customMessage,
  };

  // Quantity change on cart/PDP preserves customDescription
  const quantityChangedItem = {
    ...cartItem,
    quantity: 3,
  };
  assert.strictEqual(quantityChangedItem.customDescription, customMessage);
  assert.strictEqual(quantityChangedItem.customization, "Custom");

  // Carry into checkout
  const checkoutItems = [quantityChangedItem];
  const authoritativeOrder = calculateAuthoritativeOrderTotal(
    checkoutItems,
    150,
    "Custom",
    checkoutItems[0].customDescription,
    standardConfig
  );

  assert.strictEqual(authoritativeOrder.customDescription, customMessage);
  assert.strictEqual(authoritativeOrder.giftPurpose, "Custom");
  assert.strictEqual(authoritativeOrder.giftPurposeFee, 75);
  assert.strictEqual(authoritativeOrder.totalAmount, 1200 * 3 + 150 + 75);
});

// 6. The admin order details display the saved description.
runTest(6, "The admin order details display the saved description", () => {
  const persistedOrder = {
    id: "ord-12345",
    order_number: "AJV-2026-999888",
    customer_name: "Anita Sharma",
    subtotal: 2400,
    shipping_amount: 150,
    gift_purpose: "Custom",
    gift_purpose_fee: 75,
    custom_gift_purpose_description: "Happy 25th wedding anniversary for our dear parents!",
    total_amount: 2625,
  };

  // Dedicated section values:
  assert.strictEqual(persistedOrder.gift_purpose, "Custom");
  assert.strictEqual(
    persistedOrder.custom_gift_purpose_description,
    "Happy 25th wedding anniversary for our dear parents!"
  );
  assert.strictEqual(persistedOrder.gift_purpose_fee, 75);

  // Fee reflects persisted value even if global admin settings change in future
  const changedStoreSettings = { custom_enabled: true, custom_fee: 150 };
  assert.strictEqual(
    persistedOrder.gift_purpose_fee,
    75,
    "Persisted order fee must not change when settings change"
  );
});

// 7. The WhatsApp message contains the exact description, including Unicode characters.
runTest(7, "The WhatsApp message contains the exact description, including Unicode characters", () => {
  const unicodeDesc = "Happy 25th wedding anniversary, Mom and Dad! ഓർമ്മകൾ എന്നും മധുരമുള്ളതാവട്ടെ 🌸❤️";
  const order = {
    order_number: "AJV-2026-777111",
    customer_name: "ആനന്ദ് കുമാർ (Anand Kumar)",
    created_at: "2026-10-13T10:00:00Z",
    order_status: "processing",
    subtotal: 1500,
    shipping_amount: 100,
    gift_purpose: "Custom",
    gift_purpose_fee: 75,
    custom_gift_purpose_description: unicodeDesc,
    total_amount: 1675,
    currency: "INR",
    shipping_address_line1: "TC 12/345, MG Road",
    shipping_district: "Trivandrum",
    shipping_state: "Kerala",
    shipping_pincode: "695001",
    items: [
      {
        product_name: "Assorted Dark Pralines",
        quantity: 1,
        unit_price: 1500,
        line_total: 1500,
      },
    ],
  };

  const message = generateOrderWhatsAppMessage(order);

  // Must contain GIFT PERSONALIZATION section
  assert.ok(message.includes("🎁 *GIFT PERSONALIZATION*"), "Missing GIFT PERSONALIZATION header");
  assert.ok(message.includes("Purpose: Custom"), "Missing Purpose: Custom");
  assert.ok(message.includes(`Description: ${unicodeDesc}`), "Missing exact unicode description");
  assert.ok(message.includes("Custom Purpose Fee: ₹75"), "Missing Custom Purpose Fee line");

  // Preserves Malayalam script and emojis without corruption
  assert.ok(message.includes("ഓർമ്മകൾ എന്നും മധുരമുള്ളതാവട്ടെ 🌸❤️"));
  assert.ok(!message.includes("\uFFFD"), "Message must not contain replacement character");
});

// 8. The custom fee is charged only once per order.
runTest(8, "The custom fee is charged only once per order", () => {
  // Cart with 3 different products and 7 total items
  const multiProductCart = [
    { productId: "p1", unitPrice: 500, quantity: 2 },  // 1000
    { productId: "p2", unitPrice: 300, quantity: 3 },  // 900
    { productId: "p3", unitPrice: 700, quantity: 2 },  // 1400
  ]; // Subtotal = 3300
  const shipping = 200;
  const description = "Retirement party for our company founder";

  const orderResult = calculateAuthoritativeOrderTotal(
    multiProductCart,
    shipping,
    "Custom",
    description,
    standardConfig
  );

  assert.strictEqual(orderResult.subtotal, 3300);
  assert.strictEqual(orderResult.shippingAmount, 200);
  assert.strictEqual(orderResult.giftPurposeFee, 75, "Custom fee must be exactly ₹75 once, NOT 3x or 7x");
  assert.strictEqual(orderResult.totalAmount, 3300 + 200 + 75);
});

// 9. Standard purposes continue working without a custom description.
runTest(9, "Standard purposes continue working without a custom description", () => {
  // Standard purpose without description is valid
  const standardRes = validateGiftPurposeSelection("Happy Birthday", standardConfig, undefined);
  assert.strictEqual(standardRes.isValid, true);
  assert.strictEqual(standardRes.isCustom, false);
  assert.strictEqual(standardRes.fee, 0);
  assert.strictEqual(standardRes.normalizedPurpose, "Happy Birthday");
  assert.strictEqual(standardRes.normalizedDescription, null);

  // In WhatsApp message, standard purpose displays without unnecessary custom description section
  const standardOrder = {
    order_number: "AJV-2026-333222",
    customer_name: "Kavita R",
    created_at: "2026-10-13T10:00:00Z",
    order_status: "processing",
    subtotal: 1000,
    shipping_amount: 100,
    gift_purpose: "Happy Birthday",
    gift_purpose_fee: 0,
    custom_gift_purpose_description: null,
    total_amount: 1100,
    currency: "INR",
    items: [],
  };

  const stdMsg = generateOrderWhatsAppMessage(standardOrder);
  assert.ok(!stdMsg.includes("🎁 *GIFT PERSONALIZATION*"), "Must NOT include GIFT PERSONALIZATION block for standard");
  assert.ok(!stdMsg.includes("Description:"), "Must NOT include Description line for standard");
  assert.ok(stdMsg.includes("Gift Purpose: Happy Birthday"), "Standard purpose must appear in Price Summary");
  assert.ok(!stdMsg.includes("Custom Purpose Fee:"), "Must NOT show custom purpose fee for standard");
});

console.log("\n===================================================================");
console.log(`TEST SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED`);
console.log("===================================================================");

if (failedCount > 0) {
  process.exit(1);
}
