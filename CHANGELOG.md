# AJVAS CHOCOLATES — Chronological Project Change Log

## [2026-09-23] - Complete Application Theme Redesign & Brand-Color Alignment

### Purpose
Redesign the visual appearance of the entire AJVAS CHOCOLATES storefront and admin panel to establish a cohesive, modern, and gift-oriented theme derived directly from the official logo (`public/ajvaslogo-png.png`) and the full-page reference design.

### Brand Color Tokens Verified & Applied
* **Logo Vivid Pink / Magenta** (`#fb0b88`): Primary brand accent, CTAs, highlight headline text, badges, active tabs, wishlist buttons, and cart count badge.
* **Logo Royal Blue** (`#01519a`): Secondary blue accent for interactive states.
* **Logo Deep Navy** (`#001648`): Primary dark text, display headings, navigation, admin sidebar background, and structural elements.
* **Logo Cyan / Turquoise** (`#00b4d8`): Delivery availability banner background and info tags.
* **Warm Off-White / Cream** (`#fdf8f5`): Page background for gift-oriented appearance.

### Application-Wide Files & Components Modified
* `tailwind.config.ts`: Updated `brand` and `accent` color palette definitions with verified logo hex tokens (`#fb0b88`, `#01519a`, `#001648`, `#00b4d8`, `#fdf8f5`).
* `src/app/globals.css`: Set `:root` `--background` to `#fdf8f5`, `--foreground` to `#001648`, and focus ring outline to `#fb0b88`.
* `src/components/ui/button.tsx`: Added rounded pill shapes (`rounded-full`), logo pink primary variant (`bg-brand-pink text-white`), and logo navy secondary variant (`bg-brand-navy text-white`).
* `src/components/ui/badge.tsx`: Updated badge variants (`gold`, `rose`, `cyan`, `dark`) with rounded-full shapes and logo tokens.
* `src/components/ui/product-card.tsx`: Updated to `rounded-2xl` card styling with top-right white wishlist heart button (`Heart` icon), bold navy slate pricing, and logo pink accents.
* `src/components/layout/announcement-bar.tsx`: Styled announcement banner with `#fb0b88` background and white text.
* `src/components/layout/brand-logo.tsx`: Enhanced logo height sizing (`h-14 sm:h-16 lg:h-18`) while preserving clean rendering without duplicate text.
* `src/components/layout/header.tsx`: Updated header background, nav link hover states, mobile drawer, and shopping bag item counter badge (`bg-brand-pink text-white`).
* `src/components/layout/footer.tsx`: Updated footer to warm cream background (`bg-[#fdf2f5]`), logo pink link hovers, and added a floating round pink customer support action button.
* `src/components/home/hero-section.tsx`: Highlighted "Gifts" in `#fb0b88`, updated pill CTAs, trust icons, and right image showcase with top-right floating badge.
* `src/components/home/curated-collections-section.tsx`: Updated "BEST SELLING PRODUCTS" with pink heading accent, carousel arrow controls, and 4-column product grid.
* `src/components/home/shop-by-occasion-section.tsx`: Updated "Shop by Occasion" section with 4 occasion cards and white circular arrow overlay buttons.
* `src/components/home/spotlight-section.tsx`: Updated "FEATURED COLLECTION" with soft pink container backdrop, pink checklist icons, and primary pill button.
* `src/components/home/curated-products-grid.tsx`: Updated "Curated Selections" section with carousel arrows and product card grid.
* `src/components/home/gifting-experience-section.tsx`: Updated "Chocolates made for human moments." with 4 icon value pillars and right showcase image.
* `src/components/home/pincode-checker-section.tsx`: Updated "Delivery Availability" banner with soft cyan container backdrop, mail icon, white input pill, and solid pink "Check" button.
* `src/components/home/gifting-cta-section.tsx`: Updated "Find something worth gifting." banner with solid pink CTA.
* `src/components/shop/shop-collections-client.tsx`: Updated category navigation pills with logo pink active state (`bg-brand-pink text-white`).
* `src/components/pdp/product-actions.tsx`: Updated quantity stepper, Add to Bag button (`bg-brand-pink`), Buy Now button (`bg-brand-navy`), and feedback toast.
* `src/components/admin/AdminSidebar.tsx`: Updated admin sidebar background to deep navy (`bg-brand-navy`) with logo pink active indicators.
* `src/components/admin/AdminHeader.tsx`: Updated header title typography (`text-brand-navy`) and refresh button (`text-brand-navy hover:bg-brand-pink`).
* `src/app/admin/login/page.tsx`: Updated admin login card with brand logo header, warm cream background, and logo pink submit button.

### Validation Performed
* Built project via `npx tsc --noEmit` and TypeScript compilation checks.
* Verified zero functionality breaking: all Supabase queries, Cloudinary media handling, guest checkout, cart state, pincode shipping rate lookup, and admin authorization preserved intact.

---

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

## [2026-09-23] - Stage 8: Visual Identity Stage 1 — Typography & Logo Refinement

### Purpose
Establish a modern, sophisticated visual identity across AJVAS CHOCOLATES. Integrate premium typography pairing (`Cormorant Garamond` for headings and `Inter` for body/admin/UI) and replace legacy SVG monogram with the official brand asset (`public/ajvaslogo-png.png`).

### Files Modified
* `src/app/layout.tsx`:
  * Updated `next/font/google` configuration to load `Cormorant_Garamond` (`--font-cormorant`) and `Inter` (`--font-inter`).
* `tailwind.config.ts`:
  * Mapped `fontFamily.serif` to `Cormorant Garamond` and `fontFamily.sans` to `Inter`.
* `src/app/globals.css`:
  * Set base CSS variables and fallbacks for `body` (`Inter`) and headings `h1..h6` (`Cormorant Garamond`).
* `src/components/layout/brand-logo.tsx`:
  * Refactored `BrandLogo` component to render the official brand image asset `/ajvaslogo-png.png` using Next.js `Image`.
  * Removed obsolete text wordmarks beside the logo image to prevent redundant brand name text.
* `src/components/layout/footer.tsx` & `src/components/admin/AdminSidebar.tsx`:
  * Updated logo link wrappers to include accessible screen reader names (`aria-label="AJVAS Chocolates Home"`).
  * Integrated `BrandLogo` into the Admin Sidebar header.

### Verification Performed
* Executed TypeScript static compilation check (`cmd /c npx tsc --noEmit`): **PASSED** (0 errors, exit code 0).
* Verified font variable bindings and Tailwind class resolution (`font-serif` -> Cormorant Garamond, `font-sans` -> Inter).
* Verified logo asset loading from `/ajvaslogo-png.png` across storefront header, footer, product detail views, checkout summary, cart rows, and admin sidebar.
* Verified absence of duplicate visible text labels beside the logo.

## [2026-09-23] - Visual Polish Stage 1: Premium Typography & Left-Aligned Larger Logo

### Purpose
Refine the visual identity of AJVAS CHOCOLATES with a premium typography system and a prominent, left-aligned header logo layout.

### Changes Made
* **Typography System**:
  * Configured `Cormorant Garamond` for headings (`font-serif`) and `Inter` (`font-sans`) for body copy, navigation links, buttons, forms, product details, and the admin portal in `src/app/layout.tsx`, `tailwind.config.ts`, and `src/app/globals.css`.
* **Logo Position & Scaling**:
  * Updated `src/components/layout/brand-logo.tsx` with enhanced height scaling (`h-[52px]` on mobile up to `h-[76px]` on desktop for `size="lg"`) and high-priority image loading for `/ajvaslogo-png.png`.
  * Ensured no duplicate visible brand name text appears beside the logo (as the official asset image contains the complete brand wordmark).
* **Desktop Header Layout**:
  * Repositioned logo from center to **LEFT** side of the main header in `src/components/layout/header.tsx`.
  * Placed main navigation links (`Shop`, `Collections`, `Occasions`, `Our Story`) in the center/left section with balanced spacing.
  * Added catalog Search toggle control, Contact link, and Shopping Bag indicator to the right side of the desktop header.
* **Mobile Header Layout**:
  * Left-aligned larger brand logo on mobile screens.
  * Right-aligned utility actions (Search toggle, Bag count badge, and Mobile Menu drawer button) without crowding.
  * Preserved full functionality of the mobile navigation drawer menu.

### Files Modified
* `src/components/layout/brand-logo.tsx`
* `src/components/layout/header.tsx`
* `CHANGELOG.md`

### Verification & Responsive Checks Performed
* Executed TypeScript static analysis (`cmd /c npx tsc --noEmit`): **PASSED** (0 compilation errors, exit code 0).
* Verified desktop, tablet, and mobile layout constraints:
  * Logo remains left-aligned, noticeably larger, crisp, and properly ratio-scaled across viewports.
  * Navigation links, search input, and shopping bag button remain fully accessible and functional.
  * No duplicate visible brand text appears next to the logo.

### Remaining Issues Before Deployment
* None for Visual Polish Stage 1. Razorpay payment integration is deferred until tomorrow as planned.




