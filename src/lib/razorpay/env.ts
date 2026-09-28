/**
 * AJVAS CHOCOLATES — Razorpay Environment Validation Utility
 *
 * Validates Razorpay credentials with strict client/server boundary enforcement.
 * Server credentials (RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET) are strictly prohibited
 * from execution or import in browser contexts.
 */

export interface RazorpayPublicEnv {
  keyId: string;
}

export interface RazorpayServerEnv {
  keyId: string;
  keySecret: string;
  webhookSecret: string;
}

/**
 * Validates and returns public client-safe Razorpay configuration.
 * Safe for use in browser client components and server actions.
 */
export function getRazorpayPublicEnv(): RazorpayPublicEnv {
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

  if (!keyId || keyId.trim() === "") {
    throw new Error(
      "Missing required environment variable: NEXT_PUBLIC_RAZORPAY_KEY_ID. Please set it in your environment configuration."
    );
  }

  return { keyId: keyId.trim() };
}

/**
 * Validates and returns server-only Razorpay configuration.
 * MUST NEVER be called or imported in browser context.
 */
export function getRazorpayServerEnv(): RazorpayServerEnv {
  if (typeof window !== "undefined") {
    throw new Error(
      "CRITICAL SECURITY VIOLATION: getRazorpayServerEnv() was invoked in a browser context. Server credentials must never be accessed on the client."
    );
  }

  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!keyId || keyId.trim() === "") {
    throw new Error(
      "Missing required environment variable: NEXT_PUBLIC_RAZORPAY_KEY_ID. Please set it in your server environment configuration."
    );
  }

  if (!keySecret || keySecret.trim() === "") {
    throw new Error(
      "Missing required server environment variable: RAZORPAY_KEY_SECRET. Please set it in your server environment configuration."
    );
  }

  if (!webhookSecret || webhookSecret.trim() === "") {
    throw new Error(
      "Missing required server environment variable: RAZORPAY_WEBHOOK_SECRET. Please set it in your server environment configuration."
    );
  }

  return {
    keyId: keyId.trim(),
    keySecret: keySecret.trim(),
    webhookSecret: webhookSecret.trim(),
  };
}
