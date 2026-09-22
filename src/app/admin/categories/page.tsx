import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/supabase/auth";
import { getAdminCategoriesWithCounts } from "@/lib/supabase/admin-catalog";
import CategoryListClient from "@/components/admin/CategoryListClient";

export default async function AdminCategoriesPage() {
  const { user, isAdmin } = await getAdminSession();

  if (!user) {
    redirect("/admin/login");
  }

  if (!isAdmin) {
    redirect("/");
  }

  const categories = await getAdminCategoriesWithCounts();

  return <CategoryListClient initialCategories={categories} />;
}
