import {
  getRazorpayPublicEnv,
  getRazorpayServerEnv,
  RazorpayPublicEnv,
  RazorpayServerEnv,
} from "./env";

/**
 * AJVAS CHOCOLATES — Razorpay Configuration Helper
 *
 * Provides safe server-side configuration retrieval functions.
 *
 * IMPORTANT SECURITY RULES:
 * - `getRazorpayPublicConfig()` returns client-safe public configuration (keyId).
 * - `getRazorpayServerConfig()` returns full server configuration (keyId, keySecret, webhookSecret).
 *   `keySecret` and `webhookSecret` MUST NEVER be passed into client component props,
 *   API responses, Server Action return values, logs, or HTML markup.
 */

/**
 * Returns public Razorpay configuration (client-safe).
 * Can be safely called in server components, server actions, or client components.
 */
export function getRazorpayPublicConfig(): RazorpayPublicEnv {
  return getRazorpayPublicEnv();
}

/**
 * Returns full server-side Razorpay configuration.
 * SERVER-ONLY function. MUST NEVER be returned to browser or exposed in API payloads.
 */
export function getRazorpayServerConfig(): RazorpayServerEnv {
  return getRazorpayServerEnv();
}
