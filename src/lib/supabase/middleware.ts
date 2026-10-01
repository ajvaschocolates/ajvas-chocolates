import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnv } from "./env";

/**
 * Refreshes Supabase auth session tokens and enforces /admin route authorization.
 * Optimized with session caching to avoid redundant database RPC round-trips.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const pathname = request.nextUrl.pathname;

  // Bypass session check for webhooks and health endpoints
  if (pathname.startsWith("/api/webhooks") || pathname.startsWith("/api/keep-alive")) {
    return supabaseResponse;
  }

  const allCookies = request.cookies.getAll();
  const hasAuthCookie = allCookies.some(
    (c) => c.name.includes("-auth-token") || c.name.startsWith("sb-")
  );

  // Skip auth network round-trip for unauthenticated guest visitors on public store pages
  if (!pathname.startsWith("/admin") && !hasAuthCookie) {
    return supabaseResponse;
  }

  const { supabaseUrl, supabasePublishableKey } = getSupabaseEnv();

  const supabase = createServerClient(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // Calling getUser() securely refreshes the session token
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Route protection for /admin routes
  if (pathname.startsWith("/admin")) {
    const isLoginPage = pathname === "/admin/login";

    if (!user) {
      // Unauthenticated users trying to access protected admin pages
      if (!isLoginPage) {
        const url = request.nextUrl.clone();
        url.pathname = "/admin/login";
        return NextResponse.redirect(url);
      }
    } else {
      // Fast check: Check if user was already verified as admin in this session (avoids redundant RPC network roundtrip)
      const adminCookie = request.cookies.get("ajv_admin_verified")?.value;
      let isAdmin = adminCookie === user.id;

      if (!isAdmin) {
        // Query database RPC only on initial login or when cache expires
        const { data: rpcAdmin } = await supabase.rpc("is_admin");
        isAdmin = !!rpcAdmin;
      }

      if (!isAdmin) {
        // Authenticated user is NOT authorized as an admin
        const url = request.nextUrl.clone();
        url.pathname = "/";
        return NextResponse.redirect(url);
      }

      // If user is already an authorized admin and visits /admin/login, redirect to /admin
      if (isLoginPage) {
        const url = request.nextUrl.clone();
        url.pathname = "/admin";
        return NextResponse.redirect(url);
      }

      // Forward verified admin headers so AdminLayout can skip duplicate DB round-trips
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("x-admin-verified", "1");
      if (user.email) {
        requestHeaders.set("x-admin-email", user.email);
      }
      requestHeaders.set("x-admin-id", user.id);

      const modifiedResponse = NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });

      // Cache admin authorization for 5 minutes (300 seconds) on /admin
      modifiedResponse.cookies.set("ajv_admin_verified", user.id, {
        path: "/admin",
        maxAge: 300,
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });

      // Forward any updated auth cookies
      supabaseResponse.cookies.getAll().forEach((cookie) => {
        modifiedResponse.cookies.set(cookie.name, cookie.value, cookie);
      });

      return modifiedResponse;
    }
  }

  return supabaseResponse;
}
