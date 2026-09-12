import { getActiveProducts } from "@/lib/supabase/catalog";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/home/hero-section";
import { CuratedCollectionsSection } from "@/components/home/curated-collections-section";
import { ShopByOccasionSection } from "@/components/home/shop-by-occasion-section";
import { SpotlightSection } from "@/components/home/spotlight-section";
import { CuratedProductsGrid } from "@/components/home/curated-products-grid";
import { BrandStorySection } from "@/components/home/brand-story-section";
import { GiftingExperienceSection } from "@/components/home/gifting-experience-section";
import { PincodeCheckerSection } from "@/components/home/pincode-checker-section";
import { GiftingCtaSection } from "@/components/home/gifting-cta-section";

export const revalidate = 60; // ISR revalidation every 60 seconds

export default async function HomePage() {
  const products = await getActiveProducts(12);

  return (
    <div className="flex flex-col min-h-screen bg-brand-cream selection:bg-brand-gold selection:text-brand-espresso">
      {/* Fixed/Sticky Navigation Header */}
      <Header />

      {/* Main Content Sections in Approved Top-to-Bottom Order */}
      <main className="flex-1 w-full">
        {/* 1. Hero Section */}
        <HeroSection />

        {/* 2. Curated Collections / Featured Selections */}
        <CuratedCollectionsSection products={products} />

        {/* 3. Shop by Occasion */}
        <ShopByOccasionSection />

        {/* 4. Flagship Product Spotlight */}
        <SpotlightSection featuredProduct={products[0] || null} />

        {/* 5. Curated Products Grid */}
        <CuratedProductsGrid products={products} />

        {/* 6. Brand & Gifting Philosophy */}
        <BrandStorySection />

        {/* 7. Gifting Experience & Values */}
        <GiftingExperienceSection />

        {/* 8. Delivery Pincode Availability Checker */}
        <PincodeCheckerSection />

        {/* 9. Final Gifting CTA */}
        <GiftingCtaSection />
      </main>

      {/* 10. Footer */}
      <Footer />
    </div>
  );
}
