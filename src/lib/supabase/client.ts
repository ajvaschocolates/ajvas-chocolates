import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv } from "./env";

/**
 * Creates a browser-side Supabase client for Client Components.
 * Uses cookies managed by @supabase/ssr.
 */
export function createClient() {
  const { supabaseUrl, supabasePublishableKey } = getSupabaseEnv();
  return createBrowserClient(supabaseUrl, supabasePublishableKey);
}
