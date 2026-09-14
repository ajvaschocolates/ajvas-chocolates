import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ProductDetailView } from "@/components/pdp/product-detail-view";
import { getProductBySlugResult } from "@/lib/supabase/catalog";

export const revalidate = 60;

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const productRes = await getProductBySlugResult(slug);

  if (!productRes.success || !productRes.data) {
    return {
      title: "Product Not Found — AJVAS CHOCOLATES",
      description: "The requested chocolate confection could not be found.",
    };
  }

  const product = productRes.data;
  return {
    title: `${product.name} — AJVAS CHOCOLATES`,
    description:
      product.description?.slice(0, 160) ||
      `Explore ${product.name}, curated with precision for celebrations and gifting. Pan-India courier delivery.`,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const productRes = await getProductBySlugResult(slug);

  if (!productRes.success && productRes.error) {
    throw new Error(productRes.error);
  }

  if (!productRes.data || productRes.data.status !== "active") {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col bg-brand-cream text-brand-espresso">
      <Header />
      <main id="main-content" className="flex-1">
        <ProductDetailView product={productRes.data} />
      </main>
      <Footer />
    </div>
  );
}
