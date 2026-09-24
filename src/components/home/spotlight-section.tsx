import { CheckCircle2, Gift, Sparkles } from "lucide-react";
import { Product } from "@/types/catalog";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

export interface SpotlightSectionProps {
  featuredProduct?: Product | null;
}

export function SpotlightSection({ featuredProduct }: SpotlightSectionProps) {
  const features = [
    "Presentation gift box with woven ribbon",
    "Personalized message card included",
    "Direct domestic courier dispatch",
    "Delivery across supported pincodes",
  ];

  const imageUrl = featuredProduct?.images?.[0]?.image_url;
  const imageAlt =
    featuredProduct?.images?.[0]?.alt_text ||
    featuredProduct?.name ||
    "AJVAS Chocolates signature gift presentation";

  return (
    <section className="w-full bg-[#fdf2f6] py-14 lg:py-20 border-b border-brand-sand/60" id="spotlight">
      <Container>
        <div className="bg-white rounded-3xl p-6 sm:p-10 lg:p-14 shadow-subtle border border-brand-pink-light">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Spotlight Image */}
            <div className="lg:col-span-6 order-2 lg:order-1">
              <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-elevated bg-brand-pink-light/30 border border-brand-sand/60">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={imageAlt}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#fdf2f6] via-[#f7e4eb] to-[#eed2de] flex flex-col items-center justify-center p-8 text-center border border-brand-pink/20">
                    <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-brand-pink mb-3 shadow-md">
                      <Sparkles className="w-7 h-7" />
                    </div>
                    <h3 className="font-serif text-xl font-bold text-brand-navy max-w-xs">
                      Treat Every Moment with Something Special
                    </h3>
                    <p className="font-sans text-xs text-brand-muted mt-1 max-w-xs font-medium">
                      Handcrafted Confections &amp; Signature Gift Hampers
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Spotlight Details */}
            <div className="lg:col-span-6 order-1 lg:order-2 flex flex-col items-start">
              <span className="font-sans text-xs uppercase tracking-widest text-brand-pink font-extrabold">
                Featured Collection
              </span>

              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-brand-navy mt-1.5 mb-4 leading-tight">
                Treat Every Moment with Something Special
              </h2>

              <p className="font-sans text-base text-brand-muted mb-6 leading-relaxed">
                From chocolate barks to roasted nuts, our handcrafted confections bring joy to everyday moments.
              </p>

              {/* Feature Checklist */}
              <div className="w-full bg-brand-pink-light/50 rounded-2xl p-5 mb-8 space-y-3 border border-brand-pink/20 text-sm font-sans font-bold text-brand-navy">
                {features.map((feature) => (
                  <div key={feature} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-brand-pink shrink-0 fill-brand-pink/20" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full">
                <a href="#collections">
                  <Button variant="primary" size="lg" className="w-full sm:w-auto gap-2 bg-brand-pink text-white hover:bg-brand-pink-hover shadow-md rounded-full">
                    <Gift className="w-4 h-4" />
                    <span>Explore Collection</span>
                  </Button>
                </a>
                <a href="#contact">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto rounded-full border-brand-navy/30 text-brand-navy hover:bg-white"
                  >
                    Customer Support
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
