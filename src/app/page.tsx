import { getActiveProducts } from "@/lib/supabase/catalog";
import {
  getActiveHeroBanners,
  getHomepageSections,
  getHomepageCategories,
} from "@/lib/supabase/cms";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/home/hero-section";
import { UspStrip } from "@/components/home/usp-strip";
import { ShopByOccasionSection } from "@/components/home/shop-by-occasion-section";
import { CuratedCollectionsSection } from "@/components/home/curated-collections-section";
import { GiftingExperienceSection } from "@/components/home/gifting-experience-section";
import { BrandStorySection } from "@/components/home/brand-story-section";
import { TestimonialsSection } from "@/components/home/testimonials-section";
import { GiftingCtaSection } from "@/components/home/gifting-cta-section";

export const dynamic = "force-dynamic";
export const revalidate = 0; // Real-time CMS updates without stale ISR cache

export default async function HomePage() {
  const [products, heroBanners, sections, categories] = await Promise.all([
    getActiveProducts(12),
    getActiveHeroBanners(),
    getHomepageSections(),
    getHomepageCategories(),
  ]);

  const heroBanner = heroBanners[0] || null;
  const brandStorySection = sections["brand_story"] || null;
  const giftingExpSection = sections["gifting_experience"] || null;
  const giftingCtaSection = sections["gifting_cta"] || null;

  return (
    <div className="flex flex-col min-h-screen bg-[#faf4f0] selection:bg-[#fb0b88] selection:text-white">
      {/* Header with Navigation & Announcement Bar */}
      <Header />

      {/* Main Homepage Flow */}
      <main className="flex-1 w-full">
        {/* 1. Hero Section */}
        <HeroSection banner={heroBanner} banners={heroBanners} />

        {/* 2. USP / Benefit Strip */}
        <UspStrip />

        {/* 3. Shop by Occasion */}
        <ShopByOccasionSection categories={categories} />

        {/* 4. Best Selling Products */}
        <CuratedCollectionsSection products={products} />

        {/* 5. Gifting Experience Section */}
        <GiftingExperienceSection section={giftingExpSection} />

        {/* 6. Brand Story Section */}
        <BrandStorySection section={brandStorySection} />

        {/* 7. Loved by Chocolate Lovers (Testimonials) */}
        <TestimonialsSection />

        {/* 8. Final Gifting CTA Banner */}
        <GiftingCtaSection section={giftingCtaSection} />
      </main>

      {/* Footer with Mobile Accordion */}
      <Footer />
    </div>
  );
}
