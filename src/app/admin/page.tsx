import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/supabase/auth";

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
      <div className="max-w-md w-full p-8 rounded-xl border border-neutral-800 bg-neutral-900/60 backdrop-blur text-center space-y-4 shadow-xl">
        <h1 className="text-2xl font-bold tracking-wider text-amber-400">
          AJVAS ADMIN AREA
        </h1>
        <div className="h-px bg-neutral-800 w-full" />
        <p className="text-sm text-neutral-400">
          Admin session and authorization verified.
        </p>
      </div>
    </main>
  );
}
