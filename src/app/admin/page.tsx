import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/supabase/auth";
import SignOutButton from "@/components/admin/SignOutButton";
import { ShieldCheck, UserCheck } from "lucide-react";

export default async function AdminPage() {
  const { user, isAdmin } = await getAdminSession();

  if (!user) {
    redirect("/admin/login");
  }

  if (!isAdmin) {
    redirect("/");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-neutral-950 text-neutral-100">
      <div className="max-w-md w-full p-8 rounded-2xl border border-neutral-800 bg-neutral-900/80 backdrop-blur-md text-center space-y-6 shadow-2xl">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <ShieldCheck className="w-6 h-6" />
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-wider text-amber-400 font-serif">
            AJVAS ADMIN AREA
          </h1>
          <p className="text-xs uppercase tracking-widest text-neutral-400">
            Authorization Verified
          </p>
        </div>

        <div className="h-px bg-neutral-800 w-full" />

        <div className="bg-neutral-950/80 border border-neutral-800/80 rounded-xl p-4 text-left space-y-2">
          <div className="flex items-center gap-2 text-neutral-400 text-xs uppercase tracking-wider font-semibold">
            <UserCheck className="w-4 h-4 text-amber-400" />
            Authenticated Administrator
          </div>
          <p className="text-sm font-medium text-neutral-200 truncate pl-6">
            {user.email}
          </p>
        </div>

        <div className="pt-2 flex justify-center">
          <SignOutButton />
        </div>
      </div>
    </main>
  );
}

