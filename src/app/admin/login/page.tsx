"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Lock, Mail, AlertCircle, Loader2 } from "lucide-react";

import { BrandLogo } from "@/components/layout/brand-logo";

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
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-[#fdf8f5] text-brand-navy">
      <div className="w-full max-w-md p-8 rounded-3xl border border-brand-sand/80 bg-white shadow-elevated space-y-6">
        {/* Header */}
        <div className="text-center space-y-3 flex flex-col items-center">
          <BrandLogo size="lg" />
          <p className="text-xs font-bold uppercase tracking-widest text-brand-pink bg-brand-pink-light px-3 py-1 rounded-full border border-brand-pink/20">
            Admin Portal Access
          </p>
        </div>

        <div className="h-px bg-brand-sand/60 w-full" />

        {/* Error Alert */}
        {errorMessage && (
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <p className="leading-snug">{errorMessage}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-bold text-brand-navy uppercase tracking-wider mb-1.5"
            >
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-brand-muted">
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
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-brand-sand/80 rounded-full text-brand-navy placeholder-brand-muted/50 focus:outline-none focus:border-brand-pink focus:ring-1 focus:ring-brand-pink text-sm font-medium disabled:opacity-50 transition"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs font-bold text-brand-navy uppercase tracking-wider mb-1.5"
            >
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-brand-muted">
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
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-brand-sand/80 rounded-full text-brand-navy placeholder-brand-muted/50 focus:outline-none focus:border-brand-pink focus:ring-1 focus:ring-brand-pink text-sm font-medium disabled:opacity-50 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-brand-pink hover:bg-brand-pink-hover text-white font-extrabold rounded-full shadow-md transition duration-200 flex items-center justify-center gap-2 text-sm disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
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
        <p className="text-center text-xs text-brand-muted pt-2 font-medium">
          Protected area. Authorized admin users only.
        </p>
      </div>
    </main>
  );
}
