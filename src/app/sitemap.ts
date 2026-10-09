import type { MetadataRoute } from "next";
import { SITE_URL, slugifyCategoryName } from "@/lib/seo";
import { getActiveProducts, getActiveCategories } from "@/lib/supabase/catalog";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/shop`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/faq`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/care-instructions`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/shipping-delivery`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/refund-returns`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${SITE_URL}/terms-conditions`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];

  try {
    const [products, categories] = await Promise.all([
      getActiveProducts(1000),
      getActiveCategories(),
    ]);

    const categoryRoutes: MetadataRoute.Sitemap = categories.map((category) => ({
      url: `${SITE_URL}/shop/${slugifyCategoryName(category.name)}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    const productRoutes: MetadataRoute.Sitemap = products
      .filter((product) => Boolean(product.slug))
      .map((product) => {
        const rawDate = product.updated_at || product.created_at;
        const parsedDate = rawDate ? new Date(rawDate) : undefined;
        const validDate = parsedDate && !isNaN(parsedDate.getTime()) ? parsedDate : undefined;

        return {
          url: `${SITE_URL}/products/${product.slug}`,
          ...(validDate ? { lastModified: validDate } : {}),
          changeFrequency: "weekly",
          priority: 0.8,
        };
      });

    return [...staticRoutes, ...categoryRoutes, ...productRoutes];
  } catch (error) {
    console.error("Error generating dynamic sitemap entries:", error);
    return staticRoutes;
  }
}
