import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/supabase/auth";
import { getAllAdminCategories } from "@/lib/supabase/admin-catalog";
import ProductFormClient from "@/components/admin/ProductFormClient";

export default async function NewProductPage() {
  const { user, isAdmin } = await getAdminSession();

  if (!user) {
    redirect("/admin/login");
  }

  if (!isAdmin) {
    redirect("/");
  }

  const categories = await getAllAdminCategories();

  return <ProductFormClient mode="create" categories={categories} />;
}
