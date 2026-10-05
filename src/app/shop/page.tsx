import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ShopCollectionsClient } from "@/components/shop/shop-collections-client";
import { 
  getActiveCategoriesResult, 
  getActiveProductsResult 
} from "@/lib/supabase/catalog";

import { SITE_URL, BRAND_NAME, DEFAULT_OG_IMAGE } from "@/lib/seo";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Shop Premium Chocolates & Gift Hampers",
  description:
    "Explore chocolate gift hampers, keepsake boxes, artisanal truffles, and curated confections for celebrations and memorable moments. Pan-India courier delivery.",
  alternates: {
    canonical: `${SITE_URL}/shop`,
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: `${SITE_URL}/shop`,
    siteName: BRAND_NAME,
    title: "Shop Premium Chocolates & Gift Hampers | AJVAS Chocolates",
    description:
      "Explore chocolate gift hampers, keepsake boxes, artisanal truffles, and curated confections for celebrations and memorable moments. Pan-India courier delivery.",
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "Shop AJVAS Chocolates Collections & Hampers",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Shop Premium Chocolates & Gift Hampers | AJVAS Chocolates",
    description:
      "Explore chocolate gift hampers, keepsake boxes, artisanal truffles, and curated confections for celebrations and memorable moments. Pan-India courier delivery.",
    images: [DEFAULT_OG_IMAGE],
  },
};


export default async function ShopPage({
  searchParams,
}: {
  searchParams?: Promise<{ category?: string }>;
}) {
  const resolvedParams = searchParams ? await searchParams : {};
  const initialCategory = resolvedParams?.category || null;

  const [categoriesRes, productsRes] = await Promise.all([
    getActiveCategoriesResult(),
    getActiveProductsResult(100),
  ]);

  const queryError = !categoriesRes.success || !productsRes.success 
    ? (categoriesRes.error || productsRes.error || "Failed to load catalog records")
    : null;

  return (
    <div className="flex min-h-screen flex-col bg-[#120805] text-[#faf4f0]">
      <Header />
      <main id="main-content" className="flex-1">
        <ShopCollectionsClient
          initialCategories={categoriesRes.data}
          initialProducts={productsRes.data}
          initialCategory={initialCategory}
          error={queryError}
        />
      </main>
      <Footer />
    </div>
  );
}
