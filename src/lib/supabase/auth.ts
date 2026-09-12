import { User } from "@supabase/supabase-js";
import { createClient } from "./server";

export interface AdminAuthSession {
  user: User | null;
  isAdmin: boolean;
}

/**
 * Server-side helper to verify authentication and admin authorization.
 * Checks both Supabase Auth authentication and public.admin_users membership
 * via the security-definer public.is_admin() function.
 */
export async function getAdminSession(): Promise<AdminAuthSession> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { user: null, isAdmin: false };
    }

    const { data: isAdmin, error: adminError } = await supabase.rpc("is_admin");

    if (adminError || !isAdmin) {
      return { user, isAdmin: false };
    }

    return { user, isAdmin: true };
  } catch {
    return { user: null, isAdmin: false };
  }
}
