import { notFound } from "next/navigation";
import {
  getAdminProductById,
  getAllAdminCategories,
} from "@/lib/supabase/admin-catalog";
import ProductFormClient from "@/components/admin/ProductFormClient";

export const dynamic = "force-dynamic";

interface EditProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;

  const [product, categories] = await Promise.all([
    getAdminProductById(id),
    getAllAdminCategories(),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <ProductFormClient key={product.id} mode="edit" product={product} categories={categories} />
  );
}
