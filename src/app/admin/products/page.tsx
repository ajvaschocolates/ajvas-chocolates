import {
  getAllAdminProducts,
  getAllAdminCategories,
} from "@/lib/supabase/admin-catalog";
import ProductListClient from "@/components/admin/ProductListClient";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const [products, categories] = await Promise.all([
    getAllAdminProducts(),
    getAllAdminCategories(),
  ]);

  return (
    <ProductListClient
      key={products.map((p) => p.id + (p.updated_at || "")).join(",")}
      initialProducts={products}
      categories={categories}
    />
  );
}
