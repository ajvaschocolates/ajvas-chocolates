import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: [
        "/",
        "/shop",
        "/products/",
        "/about",
        "/contact",
        "/faq",
        "/care-instructions",
        "/shipping-delivery",
        "/refund-returns",
        "/privacy-policy",
        "/terms-conditions",
      ],
      disallow: ["/admin/", "/api/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
