/**
 * Environment variable validation for Supabase configuration.
 * Fails fast with clear actionable error messages if required variables are missing.
 */
export function getSupabaseEnv(): { supabaseUrl: string; supabasePublishableKey: string } {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || supabaseUrl.trim() === "") {
    throw new Error(
      "Missing environment variable: NEXT_PUBLIC_SUPABASE_URL. Please set it in your .env.local file."
    );
  }

  if (!supabasePublishableKey || supabasePublishableKey.trim() === "") {
    throw new Error(
      "Missing environment variable: NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY. Please set it in your .env.local file."
    );
  }

  return { supabaseUrl, supabasePublishableKey };
}
