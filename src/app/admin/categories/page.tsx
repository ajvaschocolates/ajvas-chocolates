import { getAdminCategoriesWithCounts } from "@/lib/supabase/admin-catalog";
import CategoryListClient from "@/components/admin/CategoryListClient";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await getAdminCategoriesWithCounts();

  return (
    <main className="p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-6 sm:space-y-8 flex-1">
      <CategoryListClient initialCategories={categories} />
    </main>
  );
}
