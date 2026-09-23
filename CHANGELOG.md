# AJVAS CHOCOLATES — Chronological Project Change Log

## [2026-09-22] - Stage 5B: Cloudinary Admin Media Upload & Asset Ownership Security Audit

### Purpose
Harden Cloudinary integration against asset hijacking, domain spoofing, URL transformation manipulation, version boundary misclassification, product ID prefix collisions, and unverified asset deletion. Implement structured partial-success tracking, signature parameter locking (`public_id`, `folder`, `tags`, `timestamp`), and inline retry UI handling.

### Files Changed
* `src/lib/cloudinary/server.ts`:
  * Implemented `generateSignedUploadParams` with parameter signature locking over `public_id`, `folder`, `tags`, and `timestamp`.
  * Implemented `isCloudinaryTransformationSegment` parameter syntax parser.
  * Updated `validateCloudinaryUrlCorrespondence` to perform structural version boundary parsing, URL decoding, exact public ID matching, and narrowed delivery domain checks (`res.cloudinary.com` or `<cloudName>.cloudinary.com`).
  * Updated `verifyCloudinaryAssetProductOwnership` to verify both `resource.folder` / `resource.asset_folder` and `tags` (`prod_${productId}`) with delimiter enforcement (`/` and `_`) to prevent product ID prefix collisions (e.g., `prod_1` vs `prod_10`).
  * Added `isCloudinaryDeliveryUrl` helper for strict delivery URL classification.
* `src/lib/validation/image-url.ts`:
  * Updated `validateImageInput` to reject URLs with embedded credentials (`user:pass@host`) and enforce SVG inline data URL restrictions.
* `src/app/admin/products/actions.ts`:
  * Added `cleanupPublicId?: string` to `ProductImageActionResult` interface.
  * Updated `addProductImageAction` to use `isCloudinaryDeliveryUrl` and reject ambiguous external marker / Cloudinary URL combinations.
  * Updated `deleteProductImageAction` to return `cleanupPublicId` as a structured field on partial failure or skipped verification.
  * Added `cleanupOrphanedAssetAction` with server-side admin authorization and ownership verification.
* `src/components/admin/ProductImagesManager.tsx`:
  * Added `cleanupPublicId` state to track failed/skipped asset cleanup cleanly.
  * Added `handleRetryCloudinaryCleanup` handler with `isPending` state lock to prevent concurrent retry requests.
  * Rendered an inline **"Retry Cloudinary Cleanup"** button inside the amber warning banner.

### Upload Signature Parameter Locking
* **Signed Fields**: `public_id`, `folder`, `tags`, `timestamp`.
* **Signing Algorithm**: HMAC SHA-1 / SHA-256 computed via `cloudinary.v2.utils.api_sign_request(paramsToSign, apiSecret)`.
* **Browser Alignment**: `CloudinaryImageUploader.tsx` constructs `FormData` matching `file`, `api_key`, `timestamp`, `signature`, `folder`, `public_id`, and `tags`. Changing `public_id` or any signed parameter on the browser invalidates the signature and causes Cloudinary API upload rejection.

### SQL / Migrations
* None required. Code-only component state management sufficed. Existing Supabase schema preserved without database modifications.

### Validation Performed
* Executed 34-test unit test suite (`scratch_direct_test.ts`) importing `validateCloudinaryUrlCorrespondence`, `isCloudinaryDeliveryUrl`, `generateSignedUploadParams`, `isValidProductCloudinaryPublicId`, and `validateImageInput` directly from the codebase via `cmd /c npx tsx`.
* Verified test scenarios:
  1. Valid Cloudinary URL with version segment (`PASSED`)
  2. Valid Cloudinary URL with transformations (`PASSED`)
  3. Public ID containing `v123` segment WITH version boundary (`PASSED`)
  4. Public ID starting with `v123` segment WITHOUT version boundary (`PASSED`)
  5. Wrong cloud name in URL (`PASSED`)
  6. Generic `cloudinary.com` domain rejection (`PASSED`)
  7. Deceptive domain `fakecloudinary.com` (`PASSED`)
  8. Subdomain attack `res.cloudinary.com.attacker.com` (`PASSED`)
  9. Non-HTTPS protocol rejection (`PASSED`)
  10. Embedded credentials in URL rejection (`PASSED`)
  11. Suffix attack rejection (`PASSED`)
  12-16. Delivery URL classification checks (`PASSED`)
  17-20. HMAC Signature sensitivity tests: altering `public_id`, `folder`, `tags`, or `timestamp` changes the computed signature (`PASSED`)
  21-24. `generateSignedUploadParams` structure verification (`PASSED`)
  25-30. External image URL validation: HTTPS, HTTP, FTP rejection, credential rejection, SVG Data URL rejection, and raster PNG Data URL acceptance (`PASSED`)
  31-34. Product ID collision prevention: product ID 1 vs product ID 10 boundary tests (`PASSED`)

### Results
* All 34 unit tests passed (0 failures).

### Known Limitations & Unverified Behavior
* Live Cloudinary Admin API asset lookups (`cloudinary.api.resource()`) and asset destruction (`cloudinary.uploader.destroy()`) require active production environment credentials (`CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET`).
* Transient cleanup retry state (`cleanupPublicId`) is held in component React state and is lost if the admin reloads the page.

## [2026-09-23] - Stage 6: Production Readiness Audit & Storefront Blocker Fixes

### Purpose
Perform application readiness audit ahead of Vercel deployment (with Razorpay integration explicitly deferred to tomorrow). Audit storefront, admin portal, Supabase integration, RLS security policies, and mobile UX. Resolve critical blockers hindering customer checkout and product interaction.

### Files Changed
* `src/components/pdp/product-actions.tsx`:
  * Fixed "Buy Now" CTA to call `setBuyNowItem(product, quantity)` and execute Next.js router navigation (`router.push("/checkout?mode=buy-now")`) directly to guest checkout, replacing obsolete deferred release placeholder modal.
* `src/components/ui/product-card.tsx`:
  * Updated `ProductCard` to fallback to `useCart().addItem(product)` when `onAddToBag` prop is not explicitly passed by parent components.
  * Added instant feedback state (`isAdded` displaying "Added!") to confirm item addition to shopping bag across home and shop grid views.

### Verification Performed
* Executed TypeScript static analysis (`npx tsc --noEmit`): clean exit code 0, 0 compilation errors.
* Verified storefront routing and navigation across `/`, `/shop`, `/products/[slug]`, `/cart`, and `/checkout`.
* Verified Supabase RLS security policies, anonymous catalog access, and service-role logistics boundaries.

## [2026-09-23] - Stage 7: Complete Admin Panel Implementation & Operations Verification

### Purpose
Finish, harden, and verify the complete Admin Panel before Vercel deployment today (with Razorpay integration deferred until tomorrow). Connect Admin Dashboard to real Supabase metrics, implement Order Management (`/admin/orders` & `/admin/orders/[id]`), Courier Partner Management (`/admin/couriers`), Shipping Rate Matrix (`/admin/shipping-rates`), and Customer Records (`/admin/customers`). Ensure all Server Actions enforce strict admin authorization.

### Files Created & Changed
* `src/types/orders.ts` & `src/types/logistics.ts`:
  * Created authoritative TypeScript interfaces for `Order`, `OrderItem`, `OrderStatusHistory`, `Courier`, `Pincode`, `ShippingRate`, and `Customer`.
* `src/lib/supabase/admin-orders.ts` & `src/lib/supabase/admin-logistics.ts`:
  * Implemented server-side data helpers `getAllAdminOrders`, `getAdminOrderById`, `getAdminDashboardMetrics`, `getAllAdminCouriers`, `getAllAdminShippingRates`, `getAllAdminPincodes`, and `getAllAdminCustomers`.
* `src/app/admin/orders/actions.ts`, `src/app/admin/couriers/actions.ts`, `src/app/admin/shipping-rates/actions.ts`:
  * Created protected Server Actions: `updateOrderStatusAction`, `updateOrderTrackingAction`, `createCourierAction`, `toggleCourierStatusAction`, `createShippingRateAction`, and `toggleShippingRateStatusAction`. Every action enforces admin session verification (`getAdminSession()`).
* `src/app/admin/page.tsx` & `src/components/admin/AdminSidebar.tsx`:
  * Replaced hardcoded static metrics in the Admin Dashboard with real-time Supabase calculations (`getAdminDashboardMetrics()`).
  * Updated sidebar navigation links and removed obsolete static badge placeholders.
* `src/app/admin/orders/page.tsx`, `src/app/admin/orders/[id]/page.tsx`, `src/components/admin/OrderListClient.tsx`, `src/components/admin/OrderDetailClient.tsx`:
  * Created complete Order Management UI supporting order filtering, search, recipient details, purchased item breakdown, financial summary, status transition dropdown, AWB tracking assignment, and historical status timeline.
* `src/app/admin/couriers/page.tsx`, `src/components/admin/CourierListClient.tsx`:
  * Created Courier Partner Management UI for adding new carrier tiers and toggling active/inactive availability.
* `src/app/admin/shipping-rates/page.tsx`, `src/components/admin/ShippingRateListClient.tsx`:
  * Created Shipping Rate Matrix UI for configuring pincode-based weight thresholds and shipping fees.
* `src/app/admin/customers/page.tsx`, `src/components/admin/CustomerListClient.tsx`:
  * Created Guest Customer Management UI for viewing customer contact records and placed order counts.

### Verification Performed
* Executed TypeScript static analysis (`cmd /c npx tsc --noEmit`): clean exit code 0, 0 compilation errors across all new and existing routes.
* Verified admin authentication check & protected route redirection in `middleware.ts` and Server Actions.
* Verified complete navigation flow across `/admin`, `/admin/orders`, `/admin/orders/[id]`, `/admin/products`, `/admin/categories`, `/admin/couriers`, `/admin/shipping-rates`, and `/admin/customers`.


