import { NextResponse } from "next/server";
import { pingSupabaseConnection } from "@/lib/supabase/keep-alive";

export const dynamic = "force-dynamic";

/**
 * Endpoint for automated Supabase keep-alive calls.
 * Can be triggered daily at 12:00 AM via:
 * 1. Built-in daily scheduler (instrumentation.ts)
 * 2. Vercel Cron (vercel.json)
 * 3. External cron-job/uptime service
 */
export async function GET() {
  const result = await pingSupabaseConnection();

  return NextResponse.json(result, {
    status: result.success ? 200 : 500,
  });
}

export async function POST() {
  const result = await pingSupabaseConnection();

  return NextResponse.json(result, {
    status: result.success ? 200 : 500,
  });
}
