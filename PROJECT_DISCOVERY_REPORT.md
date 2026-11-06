# AJVAS CHOCOLATES — TECHNICAL DISCOVERY & ARCHITECTURAL REPORT

**Audit Date**: November 2026  
**Auditor**: Senior Software Architect & Technical Lead  
**Repository**: `ajvas-chocolates`  
**Current Git Branch**: `unais/dev`  
**Target Environments**: Vercel (Production), Supabase (PostgreSQL / Auth), Cloudinary (Media CDN), Razorpay (Payment Gateway)

---

## Executive Summary

AJVAS CHOCOLATES is a production-ready, high-performance Next.js 15 e-commerce application tailored for the Indian luxury chocolate and celebratory gift market. The codebase demonstrates high engineering standards:
- Clear separation of concerns between client UI, server actions, and database queries.
- Strict isolation of sensitive server credentials (`SUPABASE_SERVICE_ROLE_KEY`, `RAZORPAY_KEY_SECRET`, `CLOUDINARY_API_SECRET`).
- Anti-tampering safeguards ensuring customer amounts and shipping charges are calculated authoritatively on the server.
- High level of test coverage with custom unit verification scripts validating address slip geometry, gift purpose persistence, order status transitions, and WhatsApp URL generation.

---

## 1. Architectural Highlights & Strengths

1. **Robust Layered Security**:
   - Middleware-level route protection for `/admin/*` with short-lived session cookie caching (`ajv_admin_verified`, 300s TTL) to prevent Postgres RPC saturation.
   - Dual-layer server action verification (`getAdminSession()`) ensuring that even if middleware is bypassed or misconfigured, unauthorized mutations are blocked.
2. **Defensive Financial Integrity**:
   - During checkout, cart amounts submitted by the browser are treated as untrusted. The backend recalculates items subtotal from the database, applies the single-occurrence custom gift purpose fee, adds regional state shipping, and sends the authoritative amount to Razorpay in paise.
3. **Double-Confirmation Webhook Architecture**:
   - Orders are confirmed through browser payment callbacks, but also protected by an asynchronous server-to-server Razorpay webhook (`/api/webhooks/razorpay`). If a user closes their browser or encounters network dropouts after debit, the webhook auto-creates or updates the order using notes embedded in the Razorpay order entity.
4. **Resilient Additive Database Migrations**:
   - SQL migrations (`002_add_gift_customization.sql`, `003_gift_purpose_and_custom_fee.sql`, `004_add_custom_gift_purpose_description.sql`) are purely additive and use idempotent `IF NOT EXISTS` syntax.
   - Server Actions include automatic fallback queries (`PGRST204` column retry) so that if newer columns are missing in an un-migrated environment, order placement succeeds without dropping payments.
5. **A4 Address Slip Printing Precision**:
   - Exact physical CSS `@page { size: A4 portrait; margin: 0; }` layout calculating 8 slips per sheet (2 columns $\times$ 4 rows, 105mm $\times$ 74.25mm) with mandatory 6-digit Indian PIN code validation and cut-lines.

---

## 2. Technical Observations & Potential Issues

### Issue 1: Webhook Signature Verification Bypass Risk
- **Location**: [src/app/api/webhooks/razorpay/route.ts#L20-L31](file:///c:/Users/USER/OneDrive/Desktop/ajvas%20chocolates/src/app/api/webhooks/razorpay/route.ts#L20-L31)
- **Severity**: **Medium / Security Risk**
- **Observation**:
  ```typescript
  if (webhookSecret && signature) {
    const expectedSignature = crypto.createHmac("sha256", webhookSecret).update(rawBody).digest("hex");
    if (expectedSignature !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }
  }
  ```
  If `signature` is null or omitted in the HTTP header, or if `RAZORPAY_WEBHOOK_SECRET` is unset, the condition evaluates to `false` and execution proceeds to process the webhook payload.
- **Recommendation**:
  Enforce signature presence unconditionally:
  ```typescript
  if (!webhookSecret) {
    console.error("Missing RAZORPAY_WEBHOOK_SECRET");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }
  ```

### Issue 2: Cart Page Redirection Loop Consideration
- **Location**: [src/app/cart/page.tsx#L4](file:///c:/Users/USER/OneDrive/Desktop/ajvas%20chocolates/src/app/cart/page.tsx#L4)
- **Severity**: **Low / UX Awareness**
- **Observation**:
  The dedicated `/cart` route simply redirects to `/checkout`. All shopping bag management (item removal, quantity changes, gift customization, and order summary) is handled within the checkout view or header slide-out.
- **Recommendation**:
  Preserve this design if intentional, or ensure SEO canonical tags and sitemaps do not index `/cart` to prevent redirect crawl penalties. (Currently `/cart` is correctly omitted from `sitemap.ts`).

### Issue 3: Inactive Shipping Table Vestiges
- **Location**: [src/lib/supabase/shipping.ts#L186-L290](file:///c:/Users/USER/OneDrive/Desktop/ajvas%20chocolates/src/lib/supabase/shipping.ts#L186-L290)
- **Severity**: **Low / Technical Debt**
- **Observation**:
  The application has transitioned to the regional state shipping model (Rule A: Kerala, TN/Karnataka, Other). However, the legacy pincode/courier tables (`pincodes`, `couriers`, `shipping_rates`, `pincode_couriers`) and admin pages (`/admin/couriers`, `/admin/shipping-rates`) remain in the codebase.
- **Recommendation**:
  Clearly delineate active vs. legacy logistics code in documentation to avoid confusion for future developers.

### Issue 4: Local Powershell Execution Policy on Windows
- **Location**: Local development environment
- **Severity**: **Low / Developer Ergonomics**
- **Observation**:
  Running `npx` directly via PowerShell triggers `PSSecurityException` because script execution is disabled on standard Windows workstations.
- **Recommendation**:
  Execute node scripts directly (e.g. `node ./node_modules/typescript/bin/tsc --noEmit`) or prefix with `cmd /c npx <command>`.

---

## 3. Security & Compliance Review

| Category | Status | Finding |
| :--- | :--- | :--- |
| **Credential Storage** | **SECURE** | No production passwords, service role keys, or API secrets committed to git. All variables defined in `.env.local` and mirrored as dummy placeholders in `.env.example`. |
| **Client / Server Boundary** | **SECURE** | `SUPABASE_SERVICE_ROLE_KEY` and `RAZORPAY_KEY_SECRET` are strictly quarantined within server actions and route handlers. Runtime assertions throw if invoked in browser context. |
| **SQL Injection** | **SECURE** | Supabase JS client utilizes parameterized PostgREST calls; no raw SQL string concatenation found in application code. |
| **Cross-Site Scripting (XSS)** | **SECURE** | React 19 automatic HTML escaping. JSON-LD serialization uses `serializeJsonLd()` which replaces `<` with `\u003c`. |
| **Asset Hijacking** | **SECURE** | Cloudinary uploads enforce HMAC SHA-256 signatures with locked folder, public ID, and product ownership delimiters (`prod_${productId}_`). |
| **Route Authorization** | **SECURE** | Every admin server action explicitly checks `getAdminSession()` and queries `public.is_admin()`. |

---

## 4. Prioritized Recommendations for Future Engineering

1. **Harden Razorpay Webhook Signature Check**:
   Reject requests missing `x-razorpay-signature` or when `RAZORPAY_WEBHOOK_SECRET` is unset.
2. **ESLint Cleanup**:
   Remove 3 unused imports in `src/app/admin/gift-purposes/actions.ts` (`createClient`, `GiftPurpose`, `DEFAULT_STANDARD_GIFT_PURPOSES`).
3. **Automated CI/CD Integration**:
   Configure GitHub Actions or Vercel build checks to execute `cmd /c npx tsx scripts/verify-admin-orders-workflow.mjs` and `scripts/verify-slips.mjs` on pull requests.
4. **Logistics Table Migration Plan**:
   Document whether the store will eventually restore dynamic pincode rates or if the regional state shipping model (Rule A) is permanent. If permanent, deprecate legacy courier/pincode rate routes.

