/**
 * Next.js Server Initialization Hook
 * Automatically boots the Supabase keep-alive scheduler when the server starts up.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { startKeepAliveScheduler } = await import("@/lib/supabase/keep-alive");
    startKeepAliveScheduler();
  }
}
