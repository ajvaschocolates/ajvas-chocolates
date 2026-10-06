import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ProductDetailView } from "@/components/pdp/product-detail-view";
import { getProductBySlugResult, getRelatedProducts } from "@/lib/supabase/catalog";
import { SITE_URL, BRAND_NAME, DEFAULT_OG_IMAGE, truncateDescription, slugifyCategoryName } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";

export const revalidate = 60;


interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const productRes = await getProductBySlugResult(slug);

  if (!productRes.success || !productRes.data) {
    return {
      title: "Product Not Found",
      description: "The requested chocolate confection could not be found.",
    };
  }

  const product = productRes.data;
  const rawDescription =
    product.description && product.description.trim().length > 0
      ? product.description
      : `Explore ${product.name}${product.category?.name ? ` in ${product.category.name}` : ""}, curated with precision for celebrations and artisanal chocolate gifting. Pan-India courier delivery.`;
  const description = truncateDescription(rawDescription, 155);

  const productUrl = `${SITE_URL}/products/${product.slug}`;
  const primaryImage = product.images?.[0]?.image_url || DEFAULT_OG_IMAGE;
  const pageTitle = product.category?.name
    ? `${product.name} — ${product.category.name} | ${BRAND_NAME}`
    : `${product.name} | ${BRAND_NAME}`;

  return {
    title: pageTitle,
    description,
    alternates: {
      canonical: productUrl,
    },
    openGraph: {
      type: "website",
      locale: "en_IN",
      url: productUrl,
      siteName: BRAND_NAME,
      title: pageTitle,
      description,
      images: [
        {
          url: primaryImage,
          alt: `${product.name} — ${product.category?.name || "Artisanal Chocolate"} | ${BRAND_NAME}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description,
      images: [primaryImage],
    },
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

  const product = productRes.data;
  const productUrl = `${SITE_URL}/products/${product.slug}`;
  const imageUrls =
    product.images && product.images.length > 0
      ? product.images.map((img) => img.image_url)
      : [DEFAULT_OG_IMAGE];

  const availabilityMap: Record<string, string> = {
    in_stock: "https://schema.org/InStock",
    low_stock: "https://schema.org/LimitedAvailability",
    out_of_stock: "https://schema.org/OutOfStock",
  };
  const availabilityUrl =
    availabilityMap[product.availability] || "https://schema.org/InStock";

  let finalPrice = product.price;
  if (product.discount_type === "percentage" && product.discount_value > 0) {
    finalPrice = Math.max(0, product.price - (product.price * product.discount_value) / 100);
  } else if (product.discount_type === "fixed" && product.discount_value > 0) {
    finalPrice = Math.max(0, product.price - product.discount_value);
  }

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || undefined,
    image: imageUrls,
    brand: {
      "@type": "Brand",
      name: BRAND_NAME,
    },
    offers: {
      "@type": "Offer",
      price: finalPrice,
      priceCurrency: "INR",
      availability: availabilityUrl,
      url: productUrl,
    },
    ...(product.weight_grams && product.weight_grams > 0
      ? {
          weight: {
            "@type": "QuantitativeValue",
            value: product.weight_grams,
            unitCode: "GRM",
          },
        }
      : {}),
  };

  const breadcrumbItems = [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: SITE_URL,
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Shop",
      item: `${SITE_URL}/shop`,
    },
  ];

  if (product.category) {
    breadcrumbItems.push({
      "@type": "ListItem",
      position: 3,
      name: product.category.name,
      item: `${SITE_URL}/shop/${slugifyCategoryName(product.category.name)}`,
    });
    breadcrumbItems.push({
      "@type": "ListItem",
      position: 4,
      name: product.name,
      item: productUrl,
    });
  } else {
    breadcrumbItems.push({
      "@type": "ListItem",
      position: 3,
      name: product.name,
      item: productUrl,
    });
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbItems,
  };

  const relatedProducts = await getRelatedProducts(product.id, product.category_id, 3);

  return (
    <div className="flex min-h-screen flex-col bg-[#120805] text-[#faf4f0]">
      <JsonLd data={[productSchema, breadcrumbSchema]} />
      <Header />
      <main id="main-content" className="flex-1">
        <ProductDetailView product={product} relatedProducts={relatedProducts} />
      </main>
      <Footer />
    </div>
  );
}


