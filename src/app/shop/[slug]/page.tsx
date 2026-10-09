import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Container } from "@/components/ui/container";
import { ProductCard } from "@/components/ui/product-card";
import { JsonLd } from "@/components/seo/json-ld";
import { getCategoryBySlug, getProductsByCategoryId } from "@/lib/supabase/catalog";
import { SITE_URL, BRAND_NAME, DEFAULT_OG_IMAGE, truncateDescription } from "@/lib/seo";

export const revalidate = 60;

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    return {
      title: "Category Not Found",
      description: "The requested category could not be found.",
    };
  }

  const categoryUrl = `${SITE_URL}/shop/${slug}`;
  const description = truncateDescription(
    `Explore luxury ${category.name} curated by ${BRAND_NAME}. Premium artisanal chocolates and gift hampers delivered across India.`,
    155
  );
  const ogImage = category.image_url?.trim() || DEFAULT_OG_IMAGE;

  return {
    title: `${category.name} | Premium Chocolate Gifts`,
    description,
    alternates: {
      canonical: categoryUrl,
    },
    openGraph: {
      type: "website",
      locale: "en_IN",
      url: categoryUrl,
      siteName: BRAND_NAME,
      title: `${category.name} | ${BRAND_NAME}`,
      description,
      images: [
        {
          url: ogImage,
          alt: `${category.name} — ${BRAND_NAME}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${category.name} | ${BRAND_NAME}`,
      description,
      images: [ogImage],
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const products = await getProductsByCategoryId(category.id);
  const categoryUrl = `${SITE_URL}/shop/${slug}`;

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
    {
      "@type": "ListItem",
      position: 3,
      name: category.name,
      item: categoryUrl,
    },
  ];

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbItems,
  };

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: category.name,
    numberOfItems: products.length,
    itemListElement: products.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${SITE_URL}/products/${product.slug}`,
      name: product.name,
    })),
  };

  const crumbLink =
    "hover:text-[#fb0b88] transition-colors focus-visible:outline-none rounded-sm";

  return (
    <div className="flex min-h-screen flex-col bg-[#120805] text-[#faf4f0]">
      <JsonLd data={[breadcrumbSchema, itemListSchema]} />
      <Header />
      <main id="main-content" className="flex-1 py-8 sm:py-12 lg:py-14">
        <Container>
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" className="mb-6 sm:mb-8">
            <ol className="flex flex-wrap items-center gap-1.5 sm:gap-2 font-sans text-[10px] sm:text-xs uppercase tracking-[0.16em] text-[#d0c4b8]/70">
              <li>
                <Link href="/" className={crumbLink}>
                  Home
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight className="h-3.5 w-3.5 text-[#7a3a2c]" />
              </li>
              <li>
                <Link href="/shop" className={crumbLink}>
                  Shop
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight className="h-3.5 w-3.5 text-[#7a3a2c]" />
              </li>
              <li
                className="font-semibold text-[#faf4f0]"
                aria-current="page"
              >
                {category.name}
              </li>
            </ol>
          </nav>

          {/* Category Header Section */}
          <div className="mb-8 sm:mb-12 max-w-3xl">
            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl text-[#faf4f0] tracking-tight">
              {category.name}
            </h1>
            <p className="mt-3 font-sans text-sm sm:text-base text-[#d0c4b8]/90 leading-relaxed">
              Discover our collection of handcrafted {category.name.toLowerCase()}. Curated with artisanal chocolates and elegant presentation for celebrations and thoughtful gifting across India.
            </p>
          </div>

          {/* Product Listing */}
          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center border border-amber-900/30 rounded-sm bg-[#180e0a]/50">
              <p className="font-sans text-sm text-[#d0c4b8]/70">
                No products are currently available in {category.name}.
              </p>
              <Link
                href="/shop"
                className="mt-4 inline-block font-sans text-xs uppercase tracking-wider text-[#fb0b88] hover:underline"
              >
                Explore All Products
              </Link>
            </div>
          )}
        </Container>
      </main>
      <Footer />
    </div>
  );
}
