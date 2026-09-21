"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Lock, Mail, AlertCircle, Loader2, ShieldCheck } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setErrorMessage("Please enter both email address and password.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      // 1. Authenticate user credentials via Supabase Auth
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password: password,
        });

      if (authError || !authData.user) {
        setErrorMessage(
          authError?.message || "Invalid login credentials. Please try again."
        );
        setLoading(false);
        return;
      }

      // 2. Authorize admin privileges via public.is_admin() RPC helper
      const { data: isAdmin, error: adminError } = await supabase.rpc("is_admin");

      if (adminError || !isAdmin) {
        // Log out immediately if user is authenticated but not an admin
        await supabase.auth.signOut();
        setErrorMessage(
          "Access Denied: This account is not authorized as an administrator."
        );
        setLoading(false);
        return;
      }

      // 3. Successful login & authorization -> navigate to admin dashboard
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "An unexpected error occurred."
      );
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-neutral-950 text-neutral-100">
      <div className="w-full max-w-md p-8 rounded-2xl border border-neutral-800 bg-neutral-900/80 backdrop-blur-md shadow-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-500/10 text-amber-400 mb-2 border border-amber-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-wider text-amber-400 font-serif">
            AJVAS CHOCOLATES
          </h1>
          <p className="text-xs uppercase tracking-widest text-neutral-400">
            Admin Portal Access
          </p>
        </div>

        <div className="h-px bg-neutral-800/80 w-full" />

        {/* Error Alert */}
        {errorMessage && (
          <div className="flex items-start gap-3 p-3.5 rounded-lg bg-red-950/60 border border-red-800/50 text-red-200 text-sm">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <p className="leading-snug">{errorMessage}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-medium text-neutral-300 uppercase tracking-wider mb-1.5"
            >
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@ajvaschocolates.com"
                disabled={loading}
                className="w-full pl-10 pr-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm disabled:opacity-50 transition"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs font-medium text-neutral-300 uppercase tracking-wider mb-1.5"
            >
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                disabled={loading}
                className="w-full pl-10 pr-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm disabled:opacity-50 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold rounded-lg shadow-lg hover:shadow-amber-500/10 transition duration-200 flex items-center justify-center gap-2 text-sm disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Authenticating...
              </>
            ) : (
              "Sign In to Admin Portal"
            )}
          </button>
        </form>

        {/* Footer Note */}
        <p className="text-center text-xs text-neutral-500 pt-2">
          Protected area. Authorized admin users only.
        </p>
      </div>
    </main>
  );
}
