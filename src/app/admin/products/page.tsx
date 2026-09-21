import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/supabase/auth";
import {
  getAllAdminProducts,
  getAllAdminCategories,
} from "@/lib/supabase/admin-catalog";
import ProductListClient from "@/components/admin/ProductListClient";

export default async function AdminProductsPage() {
  const { user, isAdmin } = await getAdminSession();

  if (!user) {
    redirect("/admin/login");
  }

  if (!isAdmin) {
    redirect("/");
  }

  const products = await getAllAdminProducts();
  const categories = await getAllAdminCategories();

  return (
    <ProductListClient initialProducts={products} categories={categories} />
  );
}
