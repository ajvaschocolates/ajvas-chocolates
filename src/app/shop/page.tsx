import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ShopCollectionsClient } from "@/components/shop/shop-collections-client";
import { 
  getActiveCategoriesResult, 
  getActiveProductsResult 
} from "@/lib/supabase/catalog";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Shop & Collections — AJVAS CHOCOLATES",
  description:
    "Explore chocolate gift hampers, keepsake boxes, and curated confections for celebrations and memorable moments. Pan-India courier delivery.",
};

export default async function ShopPage() {
  const [categoriesRes, productsRes] = await Promise.all([
    getActiveCategoriesResult(),
    getActiveProductsResult(100),
  ]);

  const queryError = !categoriesRes.success || !productsRes.success 
    ? (categoriesRes.error || productsRes.error || "Failed to load catalog records")
    : null;

  return (
    <div className="flex min-h-screen flex-col bg-brand-cream text-brand-espresso">
      <Header />
      <main id="main-content" className="flex-1">
        <ShopCollectionsClient
          initialCategories={categoriesRes.data}
          initialProducts={productsRes.data}
          error={queryError}
        />
      </main>
      <Footer />
    </div>
  );
}
