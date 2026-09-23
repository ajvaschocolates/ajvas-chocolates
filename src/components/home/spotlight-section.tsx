import { CheckCircle2, Gift } from "lucide-react";
import { Product } from "@/types/catalog";
import { formatINR } from "@/lib/utils";
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

  return (
    <section className="w-full bg-[#fdf2f6] py-14 lg:py-20 border-b border-brand-sand/60" id="spotlight">
      <Container>
        <div className="bg-white rounded-3xl p-6 sm:p-10 lg:p-14 shadow-subtle border border-brand-pink-light">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Spotlight Image */}
            <div className="lg:col-span-6 order-2 lg:order-1">
              <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-elevated bg-brand-pink-light/30 border border-brand-sand/60">
                <img
                  src={
                    featuredProduct?.images?.[0]?.image_url ||
                    "https://lh3.googleusercontent.com/aida-public/AB6AXuD24TCFqGpo1K0QhKNIXE-Bf3Zx11VI1RQMGckQr9SGEl1F_UydlSn9-xPwKB_19gpN8bxE1uajEXlFzM6jDYBlpLTb0IKOP1iatfYwH19iKoxSaZdFvZYLX0pp-lmUK5WUMdfxMTQQe4MbemVHRpb_MtraF0mACudl1NtUctAhHcj76tTZFoqsZI4a23maGt_pvLBlWUU3js9x-7YNTLq5ZrDMMDhZuWHTamQl_eGCvOod6yB-N0ST"
                  }
                  alt={
                    featuredProduct?.images?.[0]?.alt_text ||
                    "AJVAS Chocolates signature gift presentation"
                  }
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
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
