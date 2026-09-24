import {
  resolveShippingZone,
  getProductUnitShippingCharge,
  calculateStateShippingServer,
  StateShippingItemInput,
} from "./shipping";
import { Product } from "@/types/catalog";
import { INDIA_STATES_DISTRICTS } from "@/data/india-states-districts";

/**
 * Automated Verification Test Suite for State-Based Shipping Architecture
 */
export async function runShippingArchitectureTests() {
  const results: Array<{ test: string; passed: boolean; details: string }> = [];

  const assert = (testName: string, condition: boolean, details: string) => {
    results.push({ test: testName, passed: condition, details });
  };

  // 1. Zone Resolution Tests
  assert(
    "Zone Resolution: Kerala",
    resolveShippingZone("Kerala") === "kerala" && resolveShippingZone("kerala ") === "kerala",
    "Kerala maps to 'kerala' zone"
  );
  assert(
    "Zone Resolution: Tamil Nadu",
    resolveShippingZone("Tamil Nadu") === "tn_kar" && resolveShippingZone("tamil nadu") === "tn_kar",
    "Tamil Nadu maps to 'tn_kar' zone"
  );
  assert(
    "Zone Resolution: Karnataka",
    resolveShippingZone("Karnataka") === "tn_kar",
    "Karnataka maps to 'tn_kar' zone"
  );
  assert(
    "Zone Resolution: Other States (Maharashtra & Delhi)",
    resolveShippingZone("Maharashtra") === "other" && resolveShippingZone("Delhi") === "other",
    "Maharashtra and Delhi map to 'other' zone"
  );

  // 2. Unit Charge Validation Tests
  const mockProdA: Partial<Product> = {
    id: "prod-a",
    name: "Product A",
    shipping_kerala: 50,
    shipping_tn_kar: 80,
    shipping_other: 120,
  };

  const mockProdB: Partial<Product> = {
    id: "prod-b",
    name: "Product B",
    shipping_kerala: 80,
    shipping_tn_kar: 100,
    shipping_other: 150,
  };

  const mockFreeProd: Partial<Product> = {
    id: "prod-free",
    name: "Free Shipping Product",
    shipping_kerala: 0,
    shipping_tn_kar: 0,
    shipping_other: 0,
  };

  const mockMissingRateProd: Partial<Product> = {
    id: "prod-missing",
    name: "Unconfigured Product",
    shipping_kerala: undefined,
  };

  const mockInvalidRateProd: Partial<Product> = {
    id: "prod-invalid",
    name: "Corrupted Rate Product",
    shipping_kerala: NaN,
  };

  assert(
    "Unit Charge: Valid Numeric Rates",
    getProductUnitShippingCharge(mockProdA, "kerala").charge === 50 &&
      getProductUnitShippingCharge(mockProdA, "tn_kar").charge === 80 &&
      getProductUnitShippingCharge(mockProdA, "other").charge === 120,
    "Correctly extracts 50, 80, 120 for zones"
  );

  assert(
    "Unit Charge: Free Shipping (0.00) is Valid",
    getProductUnitShippingCharge(mockFreeProd, "kerala").valid === true &&
      getProductUnitShippingCharge(mockFreeProd, "kerala").charge === 0,
    "0.00 is treated as valid Free Shipping"
  );

  assert(
    "Unit Charge: Missing/Undefined Rate Fails",
    getProductUnitShippingCharge(mockMissingRateProd, "kerala").valid === false,
    "Missing rate returns valid: false instead of silent 0"
  );

  assert(
    "Unit Charge: NaN/Invalid Rate Fails",
    getProductUnitShippingCharge(mockInvalidRateProd, "kerala").valid === false,
    "NaN rate returns valid: false instead of silent 0"
  );

  // 3. Rule A Calculation Tests (Mathematical Engine Verification)
  // Scenario: Product A (Kerala ₹50 x 2 = ₹100) + Product B (Kerala ₹80 x 1 = ₹80) = ₹180
  const qtyA = 2;
  const qtyB = 1;
  const rateA_Kerala = getProductUnitShippingCharge(mockProdA, "kerala").charge;
  const rateB_Kerala = getProductUnitShippingCharge(mockProdB, "kerala").charge;
  const totalRuleA_Kerala = rateA_Kerala * qtyA + rateB_Kerala * qtyB;

  assert(
    "Rule A Formula: Kerala ₹50 × 2 + ₹80 × 1 = ₹180",
    totalRuleA_Kerala === 180,
    `Calculated sum: ${totalRuleA_Kerala} (Expected 180)`
  );

  // Scenario: TN & KA Zone (Product A ₹80 x 2 = ₹160) + (Product B ₹100 x 1 = ₹100) = ₹260
  const rateA_TnKar = getProductUnitShippingCharge(mockProdA, "tn_kar").charge;
  const rateB_TnKar = getProductUnitShippingCharge(mockProdB, "tn_kar").charge;
  const totalRuleA_TnKar = rateA_TnKar * qtyA + rateB_TnKar * qtyB;

  assert(
    "Rule A Formula: TN/KA Zone ₹80 × 2 + ₹100 × 1 = ₹260",
    totalRuleA_TnKar === 260,
    `Calculated sum: ${totalRuleA_TnKar} (Expected 260)`
  );

  // Scenario: Other State Zone (Product A ₹120 x 2 = ₹240) + (Product B ₹150 x 1 = ₹150) = ₹390
  const rateA_Other = getProductUnitShippingCharge(mockProdA, "other").charge;
  const rateB_Other = getProductUnitShippingCharge(mockProdB, "other").charge;
  const totalRuleA_Other = rateA_Other * qtyA + rateB_Other * qtyB;

  assert(
    "Rule A Formula: Other States Zone ₹120 × 2 + ₹150 × 1 = ₹390",
    totalRuleA_Other === 390,
    `Calculated sum: ${totalRuleA_Other} (Expected 390)`
  );

  // 4. Quantity Validation Tests
  const resInvalidQty = await calculateStateShippingServer("Kerala", [{ productId: "p1", quantity: -1 }]);
  assert(
    "Quantity Validation: Negative Quantity Rejected",
    resInvalidQty.success === false && Boolean(resInvalidQty.error?.includes("Invalid product quantity")),
    "Rejects negative quantity"
  );

  const resFloatQty = await calculateStateShippingServer("Kerala", [{ productId: "p1", quantity: 2.5 }]);
  assert(
    "Quantity Validation: Fractional Quantity Rejected",
    resFloatQty.success === false && Boolean(resFloatQty.error?.includes("Invalid product quantity")),
    "Rejects non-integer quantity"
  );

  const resMaxQty = await calculateStateShippingServer("Kerala", [{ productId: "p1", quantity: 150 }]);
  assert(
    "Quantity Validation: Quantity > 99 Rejected",
    resMaxQty.success === false && Boolean(resMaxQty.error?.includes("exceeds maximum limit")),
    "Rejects quantity over 99"
  );

  // 5. State / District Dataset Coverage Test
  assert(
    "State / District Data: Dataset Includes Kerala & TN",
    INDIA_STATES_DISTRICTS.some((s) => s.state === "Kerala" && s.districts.includes("Ernakulam")) &&
      INDIA_STATES_DISTRICTS.some((s) => s.state === "Tamil Nadu" && s.districts.includes("Chennai")),
    "Contains valid states and districts"
  );

  return results;
}
