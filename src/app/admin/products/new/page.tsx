import { getAllAdminCategories } from "@/lib/supabase/admin-catalog";
import ProductFormClient from "@/components/admin/ProductFormClient";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const categories = await getAllAdminCategories();
  return <ProductFormClient mode="create" categories={categories} />;
}
