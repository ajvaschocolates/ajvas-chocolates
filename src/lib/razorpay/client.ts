import Razorpay from "razorpay";
import { getRazorpayServerEnv } from "./env";

/**
 * AJVAS CHOCOLATES — Server-Only Razorpay Client Instance Creator
 *
 * CRITICAL SECURITY CONSTRAINTS:
 * 1. This module is SERVER-ONLY and must NEVER be imported into client components or browser bundles.
 * 2. `RAZORPAY_KEY_SECRET` is read exclusively on the server and must never be exposed or logged.
 * 3. Does NOT implement payment execution or order creation (Phase 4).
 */

/**
 * Creates and returns an authenticated instance of the Razorpay Node.js SDK for server-side operations.
 * Fails fast with explicit runtime errors if credentials are missing or if executed in browser.
 */
export function createRazorpayServerClient(): Razorpay {
  if (typeof window !== "undefined") {
    throw new Error(
      "CRITICAL SECURITY ERROR: Razorpay server client can only be instantiated on the server side."
    );
  }

  const { keyId, keySecret } = getRazorpayServerEnv();

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
}
