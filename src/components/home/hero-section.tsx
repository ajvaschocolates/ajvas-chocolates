import { Gift, Truck, Lock, ArrowRight, Sparkles } from "lucide-react";
import { HeroBanner } from "@/types/cms";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

export interface HeroSectionProps {
  banner?: HeroBanner | null;
}

export function HeroSection({ banner }: HeroSectionProps) {
  const eyebrow = banner?.eyebrow || "Celebration & Gifting";
  const title = banner?.title || "Gifts worth opening slowly.";
  const description =
    banner?.description ||
    "Chocolates crafted for life's celebrations and thoughtful gestures. Hand-assembled in keepsake presentation boxes with personalized greetings.";
  const primaryCtaText = banner?.primary_cta_text || "Shop Gifts";
  const primaryCtaLink = banner?.primary_cta_link || "#collections";
  const secondaryCtaText = banner?.secondary_cta_text || "Explore Chocolates";
  const secondaryCtaLink = banner?.secondary_cta_link || "#gifts";
  const imageUrl = banner?.image_url;

  return (
    <section className="w-full bg-[#fdf2f5]/60 overflow-hidden py-12 lg:py-20 border-b border-brand-sand/50">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Hero Content */}
          <div className="lg:col-span-6 flex flex-col items-start z-10">
            {/* Category / Collection Tag */}
            <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 bg-brand-pink-light rounded-full border border-brand-pink/20">
              <span className="w-2 h-2 rounded-full bg-brand-pink"></span>
              <span className="font-sans text-xs uppercase tracking-widest text-brand-pink font-bold">
                {eyebrow}
              </span>
            </div>

            {/* H1 Main Headline */}
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-brand-navy leading-[1.1] mb-5">
              {title}
            </h1>

            {/* Description */}
            <p className="font-sans text-base sm:text-lg text-brand-muted leading-relaxed mb-8 max-w-lg">
              {description}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full sm:w-auto">
              <a href={primaryCtaLink}>
                <Button variant="primary" size="lg" className="w-full sm:w-auto gap-2 bg-brand-pink text-white hover:bg-brand-pink-hover shadow-md rounded-full">
                  <span>{primaryCtaText}</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </Button>
              </a>
              <a href={secondaryCtaLink}>
                <Button variant="outline" size="lg" className="w-full sm:w-auto rounded-full border-brand-navy/30 text-brand-navy hover:bg-white hover:border-brand-pink">
                  {secondaryCtaText}
                </Button>
              </a>
            </div>

            {/* Trust Markers */}
            <div className="mt-10 pt-6 border-t border-brand-sand/70 w-full flex flex-wrap items-center gap-y-3 gap-x-6 text-brand-navy text-xs font-sans font-semibold">
              <div className="flex items-center gap-2">
                <Gift className="w-4 h-4 text-brand-pink shrink-0" />
                <span>Gift message included</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-brand-cyan shrink-0" />
                <span>Pan-India courier delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-brand-pink shrink-0" />
                <span>Secure checkout</span>
              </div>
            </div>
          </div>

          {/* Right Hero Showcase Image */}
          <div className="lg:col-span-6 relative">
            <div className="relative w-full aspect-[4/3] sm:aspect-[16/11] rounded-3xl overflow-hidden bg-white shadow-elevated border border-brand-sand/80">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={title}
                  className="w-full h-full object-cover"
                  loading="eager"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#fdf2f6] via-[#f7e4eb] to-[#e8d5de] flex flex-col items-center justify-center p-8 text-center border border-brand-pink/20">
                  <div className="w-16 h-16 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-brand-pink mb-4 shadow-sm">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <h3 className="font-serif text-2xl font-extrabold text-brand-navy max-w-sm">
                    {title}
                  </h3>
                  <p className="font-sans text-xs text-brand-muted mt-2 max-w-xs">
                    AJVAS Artisanal Confections & Keepsake Presentation Box
                  </p>
                </div>
              )}

              {/* Top Right Floating Badge */}
              <div className="absolute top-4 right-4 bg-amber-100/90 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-amber-200/80 shadow-md max-w-[150px] text-center hidden sm:block">
                <p className="font-serif text-xs font-bold text-amber-900 leading-tight">Made with Love</p>
                <p className="font-sans text-[10px] text-amber-800/80 mt-0.5">for your special moments</p>
              </div>

              {/* Floating Presentation Badge */}
              <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-xs bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-brand-sand/80 shadow-drawer">
                <p className="font-sans text-[10px] font-bold uppercase tracking-widest text-brand-pink">
                  Gift Presentation
                </p>
                <p className="font-serif text-base font-bold text-brand-navy mt-0.5">
                  Sweet Moments, Happier People
                </p>
                <p className="font-sans text-xs text-brand-muted mt-1">
                  Keepsake box with ribbon closure &amp; greeting card
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
