import { createClient } from "@supabase/supabase-js";

/**
 * Creates a server-only Supabase client initialized with the privileged Service Role Key.
 *
 * CRITICAL SECURITY & ARCHITECTURAL BOUNDARY:
 * - NEVER import this client or file into Client Components ("use client").
 * - NEVER prefix the key with NEXT_PUBLIC_.
 * - NEVER send, leak, or log the service role key.
 * - Used exclusively on the server (Server Actions, Server Components, Route Handlers)
 *   for protected logistics data (pincodes, couriers, shipping_rates) without exposing
 *   internal shipping rule tables or dimensional formulas to the browser.
 */
export function createServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || supabaseUrl.trim() === "") {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL environment variable."
    );
  }

  if (!serviceRoleKey || serviceRoleKey.trim() === "") {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY environment variable. Required for secure server-side logistics lookups."
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
