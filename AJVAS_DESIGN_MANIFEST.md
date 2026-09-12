# AJVAS CHOCOLATES — DESIGN AUTHORITY MANIFEST

## Purpose

This document defines the design authority for the AJVAS CHOCOLATES ecommerce application.

The Google Stitch project connected through Stitch MCP is the visual design reference for this application.

Stitch is used to inspect and reference the approved visual designs.

Stitch-generated source code is NOT production application code and must NOT be copied directly into the Next.js application.

---

# 1. DESIGN AUTHORITY ORDER

When making UI or UX implementation decisions, follow this priority order:

1. AJVAS CHOCOLATES product/business requirements and implementation specifications.
2. The locked Gold Standard Stitch screens listed in this document.
3. Existing production code and reusable project components.
4. Reasonable UI/UX improvements that preserve the approved design direction.
5. Historical Stitch screens are reference-only and must be ignored.

Never allow an older Stitch screen to override a current Gold Standard screen.

---

# 2. STITCH MCP PROJECT

Connected Stitch project:

- Project: Ajvas Chocolates Ecommerce System
- Project ID: projects/3671540171182036353
- Stitch is PRIVATE and owned by the project owner.
- Stitch MCP is connected to Antigravity.

The Stitch project currently contains more screen instances/assets than the approved implementation scope.

Do NOT assume that every Stitch screen is current or authoritative.

---

# 3. APPROVED CUSTOMER SCREENS

The following customer screens are authoritative:

1. Homepage
2. Shop Collections
3. Product Detail / PDP
4. Cart
5. Checkout
6. Order Confirmation

The approved Cart reference is:

- ajvas_chocolates_authoritative_cart_gold_standard_2

Do NOT use:

- ajvas_chocolates_authoritative_cart_gold_standard_1

The approved customer screens define the intended visual language, hierarchy, spacing, typography, imagery, component patterns, responsive behavior, and interaction direction.

---

# 4. APPROVED ADMIN SCREENS

The following admin screens are authoritative:

7. Operations Dashboard
8. Orders List
9. Order Detail / Fulfillment
10. Products List
11. Product Create/Edit
12. Categories
13. Customers
14. Couriers
15. Shipping Rates

The approved Customers reference is:

- ajvas_chocolates_admin_customers_gold_standard_2

Do NOT use:

- ajvas_chocolates_admin_customers_gold_standard_1

---

# 5. HISTORICAL / OBSOLETE STITCH SCREENS

Historical Stitch screens may remain inside the Stitch project.

They must NOT be treated as production design references.

Ignore obsolete variants and screens including, but not limited to:

- ajvas_chocolates_admin_customers_gold_standard_1
- ajvas_chocolates_authoritative_cart_gold_standard_1
- ajvas_chocolates_admin_cold_chain_shipping_pincode_matrix
- ajvas_chocolates_order_confirmed_cold_chain_tracking
- ajvas_chocolates_express_guest_checkout_1
- ajvas_chocolates_order_confirmed_gift_dispatch

If a historical screen conflicts with an approved Gold Standard screen, the Gold Standard screen wins.

Do not delete historical Stitch screens unless explicitly instructed to do so.

---

# 6. STITCH IMPLEMENTATION RULE

Use Stitch for:

- visual reference
- layout reference
- component hierarchy
- typography reference
- spacing reference
- responsive design reference
- imagery/reference assets
- design-system inspection

Do NOT use Stitch for:

- database logic
- authentication logic
- payment logic
- shipping calculation logic
- business rules
- Supabase architecture
- API architecture
- production state management
- production source-code generation

Never blindly copy Stitch-generated HTML, CSS, JavaScript, or prototype state logic.

Rebuild the approved design using the project's production architecture.

---

# 7. TECHNOLOGY DIRECTION

The production application uses:

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Radix UI where appropriate
- Lucide React
- Supabase
- Cloudinary
- Razorpay
- Vercel

Prefer existing project components and utilities before creating duplicates.

Avoid unnecessary architectural changes.

---

# 8. BRAND DIRECTION

AJVAS CHOCOLATES should feel like:

Premium chocolate gifting
+ warm luxury
+ contemporary ecommerce
+ subtle playful character from the existing AJVAS logo.

The experience should feel closer to opening a premium gift box than browsing a generic marketplace.

Use the existing AJVAS visual identity as the foundation.

Core visual palette:

- deep chocolate
- espresso
- rich burgundy / wine
- near-black brown
- warm ivory / soft cream
- restrained pink, cyan/turquoise, and yellow/orange accents derived from the existing logo
- optional restrained champagne/gold accents

Do not create a rainbow interface.

Do not use neon styling.

Do not overuse gradients.

Do not make pink, cyan, yellow, or gold dominate the interface.

---

# 9. TYPOGRAPHY

Typography should feel contemporary, refined, premium, and highly readable.

Do not automatically inherit a Stitch font choice simply because Stitch reports it as the project theme.

Choose production typography based on the approved visual hierarchy and readability.

Typography must establish clear hierarchy between:

- display headings
- section headings
- product names
- prices
- supporting text
- labels
- controls
- navigation
- administrative data

---

# 10. IMAGERY

Use the supplied real AJVAS CHOCOLATES product imagery and brand imagery where available.

Important visual assets include:

- existing AJVAS Chocolates logo
- real chocolate gift hamper/product photos
- real Ajvas Chocolates shopping bag photo
- existing product presentation references

Do not invent new brand assets when existing assets are available.

Do not replace real product imagery with generic stock imagery.

Use responsive image sizing and optimization appropriate for Cloudinary.

---

# 11. RESPONSIVE DESIGN

Every production screen must be designed and verified for:

- 360px
- 375px
- 390px
- 412px
- 430px
- tablet widths
- desktop widths
- large desktop widths up to approximately 1440px

Mobile is not a scaled-down desktop.

Reflow content intentionally.

Preserve:

- readable typography
- comfortable touch targets
- clear CTA hierarchy
- accessible forms
- usable navigation
- stable product imagery
- appropriate spacing

Avoid horizontal overflow.

---

# 12. CUSTOMER EXPERIENCE PRINCIPLES

Customer experience should be:

- premium
- simple
- trustworthy
- visually focused
- easy to scan
- conversion-oriented
- mobile-friendly

Guest checkout is required.

Customers do NOT need customer accounts, login, or signup.

Avoid unnecessary steps.

---

# 13. CHECKOUT / SHIPPING DESIGN PRINCIPLES

Shipping is dynamically calculated.

The customer flow is:

ENTER PINCODE
→ LOCATION FOUND
→ CHOOSE DELIVERY PARTNER
→ SHIPPING CALCULATED
→ SEE TOTAL
→ PAY

Customer checkout supports:

- 6-digit pincode
- state auto-population
- district auto-population
- available courier/service selection
- dynamic shipping calculation
- guest customer details
- order summary
- Razorpay payment

For CART checkout:

The entire cart is treated as ONE combined shipment/package for shipping calculation.

For BUY NOW:

Use the selected product/package metrics.

Do not display technical dimensional-weight formulas to customers.

Do not imply that shipping is a fixed state-level fee.

Do not multiply a shipping fee by product quantity.

---

# 14. PAYMENT UX

Payment and order status are separate concepts.

Payment states may include:

- Ready to Pay
- Processing
- Verifying
- Success
- Failure
- Cancelled
- Pending

Order confirmation must only be shown after payment has been successfully verified.

Legitimate payment verification language is allowed, including:

- Payment is being verified
- Payment verification
- Payment Verified
- Payment Verified • Order Confirmed
- Payment: Pending Verification
- Payment Verified & Order Placed

Never claim unsupported payment security or compliance certifications.

---

# 15. ADMIN EXPERIENCE

Admin UI is operational rather than decorative.

Prioritize:

1. orders requiring action
2. recent orders
3. courier/shipping issues
4. inventory
5. sales/activity

Admin status concepts must remain distinct.

Do not combine payment status and order status.

Use:

- Guest Customers
- Shipment
- Tracking
- Order Status
- Payment Status

Do not introduce unsupported CRM, loyalty, membership, rewards, or marketing functionality.

---

# 16. REQUIRED UI STATES

Production components should account for appropriate states including:

- default
- hover
- focus
- active
- disabled
- loading
- empty
- search-empty
- validation error
- server error
- success
- unavailable
- permission denied
- unsaved changes
- recalculating
- processing
- pending

Do not expose internal QA/test controls in production UI.

---

# 17. FORBIDDEN LEGACY CONCEPTS

Do NOT reintroduce legacy Stitch terminology or unsupported product claims.

Forbidden concepts include:

- Cold-Chain
- Cold Chain
- Cold Storage
- Cold Storage Node
- Cold Parcel
- Temperature-Controlled
- Temperature Controlled
- Zero-Melt
- Zero Melt
- No-Melt
- No Melt
- 18°C
- Single-Origin
- Single Origin
- Single-Estate
- Single Estate
- Terroir
- Anamalai
- Malabar Estate
- Kerala Cacao
- Kashmiri
- Wild Himalayan
- South Indian Cacao
- Royal Recipes
- Chef Special
- Heritage Edition
- Haute Confectionery
- Confectionery Concierge
- Atelier
- Chocolatiers
- FSSAI
- Express Gifting
- Express Delivery
- Same-Day
- Same Day
- Next-Day
- Next Day
- Transit Guarantee
- Complimentary Packaging
- Artisanal Gift Packaging
- Gift Concierge
- Patron
- Guest Patron
- Service Tier
- Delivery Tier
- operational availability

Do not invent:

- delivery guarantees
- support hours
- legal company names
- security certifications
- compliance claims
- customer verification claims
- courier guarantees
- CRM/loyalty programs
- marketing automation claims

The literal word "Express" may be used when it is part of an actual configured courier/service name, such as a carrier-provided service name.

---

# 18. CONTENT PRINCIPLE

Never fabricate business facts simply to fill whitespace.

If a value is unavailable:

- omit it
- use an appropriate empty state
- or use neutral UI structure

Whitespace is preferable to fabricated claims.

---

# 19. BACKEND DATA PRINCIPLE

When production data is available, use real backend data.

Do not replace available Supabase data with mock data.

Use:

- minimal queries
- selected columns
- appropriate indexes
- caching/revalidation
- debounced pincode lookup
- cached lookup results
- efficient relationships
- no unnecessary polling

Optimize for Supabase and Vercel free-tier usage.

Do not store image blobs in Supabase.

Use Cloudinary for product media.

---

# 20. ACCESSIBILITY

Production UI must include:

- semantic HTML
- keyboard navigation
- visible focus states
- accessible form labels
- appropriate ARIA only where necessary
- sufficient contrast
- touch-friendly controls
- meaningful error messages
- accessible dialogs/drawers
- accessible loading states

Do not rely on color alone to communicate status.

---

# 21. IMPLEMENTATION WORKFLOW

Before implementing any screen:

1. Inspect the existing project structure.
2. Inspect relevant existing components.
3. Inspect the corresponding authoritative Stitch screen through Stitch MCP.
4. Compare the Stitch design against this manifest and the business requirements.
5. Reuse existing production components where appropriate.
6. Implement the screen in Next.js/TypeScript/Tailwind.
7. Connect real backend data where available.
8. Implement required states.
9. Verify desktop and mobile layouts.
10. Run lint and build verification.

Do not make unrelated architectural changes.

---

# 22. MCP SAFETY RULE

Before using Stitch MCP for implementation work:

- identify the exact authoritative screen being referenced
- ignore historical variants
- do not modify Stitch designs unless explicitly requested
- do not create new Stitch screens unless explicitly requested
- do not regenerate the Stitch project
- do not export Stitch code into the production application

Stitch is the visual design authority, not the application architecture authority.

---

# 23. FINAL RULE

When uncertain between:

A. a visually attractive but unsupported business concept

and

B. a simpler design that accurately represents the supported product,

always choose B.

The production application must be:

Premium.
Clear.
Responsive.
Accessible.
Data-driven.
Operationally accurate.
Faithful to the approved AJVAS design direction.
Free of unsupported legacy claims.

---

# 24. AUTHORITATIVE STITCH SCREEN RESOURCE MAP

The following table provides the authoritative mapping between the approved AJVAS CHOCOLATES application screens and their exact Stitch project screen resource IDs from Stitch project `projects/3671540171182036353`.

| Number | Approved Screen Name | Exact Stitch Screen Title | Exact Stitch Screen Resource ID | Match Confidence | Historical/Obsolete Variants That Must NOT Be Used | Important Implementation Conflicts to Ignore |
| :---: | :--- | :--- | :--- | :---: | :--- | :--- |
| **1** | **Homepage** | `Ajvas Chocolates — Master Homepage Refinement` | `projects/3671540171182036353/screens/568775641e484a8aaadf260a8ee1f024` | Confident | • `Ajvas Chocolates — Home` (`b1a34d783a764a9a80d27bc77120c24d`)<br>• `Ajvas Chocolates — Artisanal Confections & Gifting` (`e71352d2dd8447abbef036a611ae2799`) | Ignore `EB Garamond` in export (use `Playfair Display`), fake phone numbers, "Artisanal Confiserie" / "Gifting Concierge" claims, and client-side mock pincode function. |
| **2** | **Shop Collections** | `Ajvas Chocolates — Shop & Collections Gold Standard` | `projects/3671540171182036353/screens/68b1058f82ca481ca656828f8e4fc8a9` | Confident | • `Ajvas Chocolates — Shop All Confections` (`21632ef9685346998c2a8b369cde5fc0`)<br>• `Ajvas Chocolates — Shop & Curated Collections` (`af2d457693dd486d93688205438ac338`) | Ignore static mock category filters and single-origin/terroir claims. Data must come dynamically from Supabase `categories` and `products`. |
| **3** | **Product Detail / PDP** | `Ajvas Chocolates — The Grand Velvet Hamper (Product Detail Gold Standard)` | `projects/3671540171182036353/screens/89ddfbddac9748ce84ff5815ed9e3cb6` | Confident | • `Ajvas Chocolates — The Grand Velvet Hamper (Product Detail)` (`751cfc9310b341eb99e1faa040ac084d`, `ceb301da864142df8ea12c061f6806f2`)<br>• `Ajvas Chocolates — The Royal Heritage Velvet Hamper` (`d8cef916f71548cf8dd7e467a63f4ecb`) | Ignore fixed shipping fees and cold-chain/zero-melt badges. Pincode and shipping estimates must use dynamic backend calculation with package metrics. |
| **4** | **Cart** | `Ajvas Chocolates — Authoritative Cart Gold Standard` *(v2)* | `projects/3671540171182036353/screens/95a54d2a6f2f42619e64c1621a1f10fe` | Confident | • `Ajvas Chocolates — Authoritative Cart Gold Standard (v1)` (`4627e77837c2410c9a94c944321877c2`)<br>• `Ajvas Chocolates — Cart & Bag Experience Gold Standard` (`f3dac37be31c4b3fb89be5bc33f4e64c`)<br>• `Ajvas Chocolates — Cart Drawer & Bag Experience` (`6285a98a6a1f481087c84ce3fed18e4c`) | Ignore multiplying shipping per product item. The entire cart must be evaluated as **one consolidated shipment package**. |
| **5** | **Checkout** | `Ajvas Chocolates — Authoritative Checkout Gold Standard` | `projects/3671540171182036353/screens/e1f560f5e22341b3960211a28a98f8a5` | Confident | • `Ajvas Chocolates — Express Guest Checkout` (`7242332027584aa886bd84f8bb56b408`, `382bfc41096f45b09cc246f7f257a072`)<br>• `Ajvas Chocolates — Cart Checkout (Consolidated Package Shipping)` (`69020a758c904bcdbefb5ef918d9690a`)<br>• `Ajvas Chocolates — Buy Now Direct Checkout` (`e3c9a3da14fb4bc88e3a169f822bde36`)<br>• Mobile Checkouts (`ad38ba93546c490394d715e5d8143a25`, `f261cdab76b94d34a3e36bd75def9797`, `6c60a82c64e949a9a46c1404089bd278`) | Ignore customer account creation options (Guest checkout only). Never expose internal dimensional weight formulas to customers. Dynamic courier rates come from server-side Supabase lookup. |
| **6** | **Order Confirmation** | `Ajvas Chocolates — Authoritative Order Confirmation Gold Standard` | `projects/3671540171182036353/screens/e68d035d5e5e4b0daaa4e757a5c64ca7` | Confident | • `Ajvas Chocolates — Order Confirmed & Gift Dispatch` (`21de7a84857748c6812818327241a6fe`)<br>• `Ajvas Chocolates — Order Confirmed & Cold-Chain Tracking` (`3a2783f407e249148feb00d78ccf8fdf`) | Ignore transit guarantees, temperature tracking, and unsupported payment badges. Order confirmation must display only after verified Razorpay webhook/server verification. |
| **7** | **Operations Dashboard** | `Ajvas Chocolates Admin — Operations Dashboard Gold Standard` | `projects/3671540171182036353/screens/171f505316fd46978702cd5df6354159` | Confident | • `Ajvas Chocolates Admin — Operations Dashboard` (`a4f3e65db5504046a32b26cf06f28ee0`, `1c8d252dd66247d8aaffbf4070712d75`) | Ignore fake CRM/loyalty counters. Keep order status (`pending`, `processing`, `shipped`, `delivered`, `cancelled`) strictly distinct from payment status (`pending`, `paid`, `failed`). |
| **8** | **Orders List** | `Ajvas Chocolates Admin — Orders List Gold Standard` | `projects/3671540171182036353/screens/460493546101491f9ce320556d5283fd` | Confident | • Older operational orders lists | Ignore customer account/login associations (all orders are guest customers with address snapshot in `orders`). |
| **9** | **Order Detail / Fulfillment** | `Ajvas Chocolates Admin — Order Detail & Fulfillment Gold Standard` | `projects/3671540171182036353/screens/f097b26b7a644c8eaf63fcf5c93f2f6e` | Confident | • `Ajvas Chocolates Admin — Order Fulfillment & WhatsApp Dispatch` (`51303fc146c84421ba03db2911877e44`, `58f915776b3a454fa5cbc9242621305a`) | Ignore automated WhatsApp concierge dispatch promises. Fulfillments track courier partner, service name, AWB number, and tracking URL in `orders`. |
| **10** | **Products List** | `Ajvas Chocolates Admin — Products List Gold Standard` | `projects/3671540171182036353/screens/839cec65a9764284b02d1d02ccd8c6db` | Confident | • `Ajvas Chocolates Admin — Confectionery Catalog & Media Manager` (`d105cd0393a0446fb092b70a57567fad`) | Ignore fabricated product attributes (e.g. single-estate tags, culinary awards). Reflect real schema fields: price, discount, weight_grams, dimensions, and availability. |
| **11** | **Product Create/Edit** | `Ajvas Chocolates Admin — Product Create / Edit Gold Standard` | `projects/3671540171182036353/screens/736ab48670b44ded9c96a30752564031` | Confident | • Older media manager forms | Media files are uploaded to Cloudinary; only `cloudinary_public_id` and `image_url` are stored in `product_images`. Package metrics (weight & dimensions) are required for shipping calculations. |
| **12** | **Categories** | `Ajvas Chocolates Admin — Categories Gold Standard` | `projects/3671540171182036353/screens/0dfe84e1760147b0ab79cc3422b35d6f` | Confident | • None | Schema uses simple flat categories (`id`, `name`, `status`). Do not create unsupported nested subcategories. |
| **13** | **Customers** | `Ajvas Chocolates Admin — Customers Gold Standard` *(v2)* | `projects/3671540171182036353/screens/3f057d5683a94532911f640ead0b0730` | Confident | • `Ajvas Chocolates Admin — Customers Gold Standard (v1)` (`e83d5a3d4d0d4f37931b2ab6aa82d5f4`) | Ignore loyalty programs, membership points, customer login credentials, and marketing automation. Displays guest checkout records (`full_name`, `phone`, `email`). |
| **14** | **Couriers** | `Ajvas Chocolates Admin — Couriers Gold Standard` | `projects/3671540171182036353/screens/92b335a362814acb87daf72479c1a096` | Confident | • None | Maps to `couriers` table (`courier_partner`, `service_name`, `status`). Do not assume direct third-party carrier API integrations. |
| **15** | **Shipping Rates** | `Ajvas Chocolates Admin — Shipping Rates Gold Standard` | `projects/3671540171182036353/screens/b6de8441fad94aa89f062045e3ccd827` | Confident | • `Ajvas Chocolates Admin — Cold-Chain Shipping & Pincode Matrix` (`a01cea991bab435090e802be8002e5da`)<br>• `Ajvas Chocolates Admin — Pincode Shipping Rates & Courier Matrix` (`48b0c4c813934690807b8dae06d9e83f`) | Ignore cold-chain temperature tiers. Rates are determined by Destination Pincode + Courier/Service + Combined Shipment Package Metrics (`min_weight_grams`, `max_weight_grams`, volume/dimensions). |