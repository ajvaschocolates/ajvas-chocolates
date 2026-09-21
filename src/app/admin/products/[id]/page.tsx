import { redirect, notFound } from "next/navigation";
import { getAdminSession } from "@/lib/supabase/auth";
import {
  getAdminProductById,
  getAllAdminCategories,
} from "@/lib/supabase/admin-catalog";
import ProductFormClient from "@/components/admin/ProductFormClient";

interface EditProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { user, isAdmin } = await getAdminSession();

  if (!user) {
    redirect("/admin/login");
  }

  if (!isAdmin) {
    redirect("/");
  }

  const { id } = await params;
  const product = await getAdminProductById(id);
  const categories = await getAllAdminCategories();

  if (!product) {
    notFound();
  }

  return (
    <ProductFormClient mode="edit" product={product} categories={categories} />
  );
}
