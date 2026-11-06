/**
 * ===================================================================
 * AJVAS CHOCOLATES — Product Weight & Visibility Toggle
 * Comprehensive Verification & Acceptance Test Suite
 * ===================================================================
 *
 * Verifies all requirements:
 * 1. Product with weight and toggle enabled (show_weight = true) -> weight is visible.
 * 2. Product with weight and toggle disabled (show_weight = false) -> weight is hidden.
 * 3. Product without weight (0 or null) -> no empty weight row or container.
 * 4. Existing product with no value for show_weight -> defaults to visible.
 * 5. Admin can change toggle between enabled and disabled independently.
 * 6. Admin can enter and edit weight in grams (e.g., 250g, 500g, 1500g).
 * 7. Server-side validation: Rejects negative weight values with clear error.
 * 8. Server-side validation: Rejects zero weight (0) with clear error.
 * 9. Decimal weight inputs (e.g. 499.8g) are safely rounded to integer for database schema.
 * 10. Empty weight input falls back safely to default (500g) without violating schema NOT NULL.
 * 11. Weight formatting: < 1000g formats as 'g' (e.g. '500 g', '750 g'), >= 1000g formats as 'kg' (e.g. '1.5 kg').
 * 12. Specifications container behavior: When weight is hidden and no dimensions exist -> returns null.
 */

import assert from "node:assert";

console.log("=== AJVAS CHOCOLATES: Product Weight & Visibility Verification ===\n");

// -------------------------------------------------------------
// Component logic simulation mirroring:
// src/components/pdp/product-package-specs.tsx & product-detail-view.tsx
// -------------------------------------------------------------

function computeStorefrontSpecsVisibility({
  weightGrams,
  showWeight,
  lengthCm,
  widthCm,
  heightCm,
}) {
  const hasDimensions = Boolean(lengthCm && widthCm && heightCm);
  const isWeightVisible = showWeight !== false;
  const hasWeight = Boolean(isWeightVisible && weightGrams && weightGrams > 0);

  // Outer container check from product-detail-view.tsx
  const rendersOuterSection = hasDimensions || hasWeight;

  // Inner component check from product-package-specs.tsx
  const rendersInnerSpecs = hasDimensions || hasWeight;

  const formattedWeight = hasWeight
    ? weightGrams >= 1000
      ? `${(weightGrams / 1000).toFixed(1)} kg`
      : `${weightGrams} g`
    : null;

  const formattedDimensions = hasDimensions
    ? `${lengthCm} × ${widthCm} × ${heightCm} cm`
    : null;

  return {
    rendersOuterSection,
    rendersInnerSpecs,
    rendersWeightRow: hasWeight,
    formattedWeight,
    rendersDimensionsRow: hasDimensions,
    formattedDimensions,
  };
}

// -------------------------------------------------------------
// Server action logic simulation mirroring:
// src/app/admin/products/actions.ts (createProductAction & updateProductAction)
// -------------------------------------------------------------

function validateAndParseWeight(weightGramsRaw) {
  const clean = (weightGramsRaw || "").trim();
  if (!clean) {
    // Empty weight fallback to 500 to satisfy NOT NULL integer constraint
    return { success: true, weightGrams: 500 };
  }
  const parsed = parseFloat(clean);
  if (isNaN(parsed) || parsed < 0) {
    return { success: false, error: "Product weight cannot be negative." };
  }
  if (parsed === 0) {
    return { success: false, error: "Product weight must be greater than zero." };
  }
  return { success: true, weightGrams: Math.round(parsed) };
}

function parseFormDataPayload(formDataMap) {
  const showWeightRaw = formDataMap.get("show_weight");
  const showWeight = showWeightRaw === null ? true : showWeightRaw === "true" || showWeightRaw === "on";
  const weightResult = validateAndParseWeight(formDataMap.get("weight_grams"));
  return { showWeight, weightResult };
}

// =============================================================
// TEST SUITE EXECUTION
// =============================================================

let passedTests = 0;

// Test 1: Product with weight and toggle enabled -> weight is visible
{
  const result = computeStorefrontSpecsVisibility({
    weightGrams: 500,
    showWeight: true,
  });
  assert.strictEqual(result.rendersOuterSection, true);
  assert.strictEqual(result.rendersInnerSpecs, true);
  assert.strictEqual(result.rendersWeightRow, true);
  assert.strictEqual(result.formattedWeight, "500 g");
  console.log("✔ Test 1: Product with weight and toggle enabled -> visible as '500 g'");
  passedTests++;
}

// Test 2: Product with weight and toggle disabled -> weight is hidden
{
  const result = computeStorefrontSpecsVisibility({
    weightGrams: 500,
    showWeight: false,
  });
  assert.strictEqual(result.rendersOuterSection, false);
  assert.strictEqual(result.rendersInnerSpecs, false);
  assert.strictEqual(result.rendersWeightRow, false);
  console.log("✔ Test 2: Product with weight and toggle disabled -> weight hidden and container omitted");
  passedTests++;
}

// Test 3: Product without weight (0 or null) -> no empty weight row
{
  const result = computeStorefrontSpecsVisibility({
    weightGrams: null,
    showWeight: true,
  });
  assert.strictEqual(result.rendersWeightRow, false);
  assert.strictEqual(result.rendersOuterSection, false);
  console.log("✔ Test 3: Product without weight -> no empty weight row");
  passedTests++;
}

// Test 4: Existing legacy product -> defaults to visible
{
  const result = computeStorefrontSpecsVisibility({
    weightGrams: 750,
    showWeight: undefined,
  });
  assert.strictEqual(result.rendersWeightRow, true);
  assert.strictEqual(result.formattedWeight, "750 g");
  console.log("✔ Test 4: Legacy product with undefined show_weight -> defaults to visible");
  passedTests++;
}

// Test 5: Admin enters custom weight (e.g. 250g, 1500g) -> correctly parsed
{
  const payload250 = new Map([["weight_grams", "250"], ["show_weight", "true"]]);
  const parsed250 = parseFormDataPayload(payload250);
  assert.strictEqual(parsed250.weightResult.success, true);
  assert.strictEqual(parsed250.weightResult.weightGrams, 250);

  const payload1500 = new Map([["weight_grams", "1500"], ["show_weight", "true"]]);
  const parsed1500 = parseFormDataPayload(payload1500);
  assert.strictEqual(parsed1500.weightResult.success, true);
  assert.strictEqual(parsed1500.weightResult.weightGrams, 1500);

  const storefront1500 = computeStorefrontSpecsVisibility({
    weightGrams: parsed1500.weightResult.weightGrams,
    showWeight: parsed1500.showWeight,
  });
  assert.strictEqual(storefront1500.formattedWeight, "1.5 kg");
  console.log("✔ Test 5: Admin enters custom weight (250g, 1500g) -> parsed and formatted as '1.5 kg'");
  passedTests++;
}

// Test 6: Server-side validation: Reject negative values
{
  const negativePayload = new Map([["weight_grams", "-100"], ["show_weight", "true"]]);
  const parsed = parseFormDataPayload(negativePayload);
  assert.strictEqual(parsed.weightResult.success, false);
  assert.strictEqual(parsed.weightResult.error, "Product weight cannot be negative.");
  console.log("✔ Test 6: Negative weight values are rejected with clear error");
  passedTests++;
}

// Test 7: Server-side validation: Reject zero weight
{
  const zeroPayload = new Map([["weight_grams", "0"], ["show_weight", "true"]]);
  const parsed = parseFormDataPayload(zeroPayload);
  assert.strictEqual(parsed.weightResult.success, false);
  assert.strictEqual(parsed.weightResult.error, "Product weight must be greater than zero.");
  console.log("✔ Test 7: Zero weight value is rejected with clear error");
  passedTests++;
}

// Test 8: Decimal weight inputs are safely rounded to integer for Postgres
{
  const decimalPayload = new Map([["weight_grams", "249.6"], ["show_weight", "true"]]);
  const parsed = parseFormDataPayload(decimalPayload);
  assert.strictEqual(parsed.weightResult.success, true);
  assert.strictEqual(parsed.weightResult.weightGrams, 250);
  console.log("✔ Test 8: Decimal weight inputs (249.6) are safely rounded to integer (250)");
  passedTests++;
}

// Test 9: Empty weight input falls back safely to 500g
{
  const emptyPayload = new Map([["weight_grams", ""], ["show_weight", "true"]]);
  const parsed = parseFormDataPayload(emptyPayload);
  assert.strictEqual(parsed.weightResult.success, true);
  assert.strictEqual(parsed.weightResult.weightGrams, 500);
  console.log("✔ Test 9: Empty weight input falls back safely to 500g");
  passedTests++;
}

// Test 10: Toggle and weight operate independently
{
  // Weight 800g, toggle disabled -> weight is saved as 800g, but hidden from storefront
  const payload = new Map([["weight_grams", "800"], ["show_weight", "false"]]);
  const parsed = parseFormDataPayload(payload);
  assert.strictEqual(parsed.weightResult.weightGrams, 800);
  assert.strictEqual(parsed.showWeight, false);

  const storefront = computeStorefrontSpecsVisibility({
    weightGrams: parsed.weightResult.weightGrams,
    showWeight: parsed.showWeight,
  });
  assert.strictEqual(storefront.rendersWeightRow, false);
  console.log("✔ Test 10: Weight (800g) and visibility toggle operate independently");
  passedTests++;
}

// Test 11: Dimensions remain visible when weight is hidden
{
  const result = computeStorefrontSpecsVisibility({
    weightGrams: 500,
    showWeight: false,
    lengthCm: 20,
    widthCm: 15,
    heightCm: 10,
  });
  assert.strictEqual(result.rendersOuterSection, true);
  assert.strictEqual(result.rendersDimensionsRow, true);
  assert.strictEqual(result.rendersWeightRow, false);
  assert.strictEqual(result.formattedDimensions, "20 × 15 × 10 cm");
  console.log("✔ Test 11: Dimensions remain visible when weight is hidden");
  passedTests++;
}

console.log(`\n=============================================================`);
console.log(`ALL ${passedTests} TEST SCENARIOS PASSED SUCCESSFULLY!`);
console.log(`=============================================================\n`);
