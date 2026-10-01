import { createClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "./env";

export interface KeepAlivePingResult {
  success: boolean;
  message: string;
  timestamp: string;
  latencyMs?: number;
  error?: string;
}

/**
 * Executes a minimal, lightweight ping against the Supabase backend.
 * Queries a single record ID to verify database connectivity and keep the
 * Supabase project active without loading heavy tables or data.
 */
export async function pingSupabaseConnection(): Promise<KeepAlivePingResult> {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();

  try {
    const { supabaseUrl, supabasePublishableKey } = getSupabaseEnv();
    const supabase = createClient(supabaseUrl, supabasePublishableKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    // Extremely lightweight query: read 1 record ID
    const { error } = await supabase
      .from("categories")
      .select("id")
      .limit(1);

    const latencyMs = Date.now() - startTime;

    if (error) {
      console.error(`[Supabase Keep-Alive] Error at ${timestamp}:`, error.message);
      return {
        success: false,
        message: "Failed to connect to Supabase",
        timestamp,
        latencyMs,
        error: error.message,
      };
    }

    console.log(
      `[Supabase Keep-Alive] Ping succeeded at ${timestamp} (${latencyMs}ms). Verified active connection.`
    );

    return {
      success: true,
      message: "Supabase connection is active",
      timestamp,
      latencyMs,
    };
  } catch (err) {
    const latencyMs = Date.now() - startTime;
    const errorMsg = err instanceof Error ? err.message : "Unknown error";
    console.error(`[Supabase Keep-Alive] Exception at ${timestamp}:`, errorMsg);
    return {
      success: false,
      message: "Unexpected error during keep-alive ping",
      timestamp,
      latencyMs,
      error: errorMsg,
    };
  }
}

/**
 * Calculates milliseconds until the next 12:00 AM (midnight).
 */
export function getMillisUntilNextMidnight(): number {
  const now = new Date();
  const nextMidnight = new Date(now);
  nextMidnight.setHours(24, 0, 0, 0); // Next 00:00:00.000 local time
  return nextMidnight.getTime() - now.getTime();
}

// Global variable to avoid multiple timers during Next.js hot reloads
declare global {
  var __supabaseKeepAliveTimer: NodeJS.Timeout | undefined;
}

/**
 * Starts the internal in-memory daily scheduler.
 * Runs once at 12:00 AM every day.
 */
export function startKeepAliveScheduler() {
  if (typeof window !== "undefined") return; // Server only

  // Prevent multiple timer registrations during dev hot reload
  if (globalThis.__supabaseKeepAliveTimer) {
    return;
  }

  const scheduleNextRun = () => {
    const delay = getMillisUntilNextMidnight();
    console.log(
      `[Supabase Keep-Alive] Next automated 12:00 AM call scheduled in ${(
        delay /
        (1000 * 60 * 60)
      ).toFixed(2)} hours.`
    );

    globalThis.__supabaseKeepAliveTimer = setTimeout(async () => {
      try {
        await pingSupabaseConnection();
      } catch (e) {
        console.error("[Supabase Keep-Alive] Scheduled run error:", e);
      } finally {
        // Schedule next midnight run
        scheduleNextRun();
      }
    }, delay);
  };

  scheduleNextRun();
}
