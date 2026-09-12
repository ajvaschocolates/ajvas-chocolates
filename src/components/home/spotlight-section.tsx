import { CheckCircle2, Gift } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

export function SpotlightSection() {
  const features = [
    "Assorted handcrafted bonbons and confections",
    "Roasted almond & cacao dragee jar",
    "Keepsake gift presentation box with ribbon",
    "Personalized handwritten greeting card",
  ];

  return (
    <section className="w-full bg-brand-dark text-brand-cream py-16 lg:py-24 border-b border-brand-espresso" id="spotlight">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Spotlight Image */}
          <div className="lg:col-span-7 order-2 lg:order-1">
            <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-elevated bg-brand-espresso border border-brand-cocoa">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD24TCFqGpo1K0QhKNIXE-Bf3Zx11VI1RQMGckQr9SGEl1F_UydlSn9-xPwKB_19gpN8bxE1uajEXlFzM6jDYBlpLTb0IKOP1iatfYwH19iKoxSaZdFvZYLX0pp-lmUK5WUMdfxMTQQe4MbemVHRpb_MtraF0mACudl1NtUctAhHcj76tTZFoqsZI4a23maGt_pvLBlWUU3js9x-7YNTLq5ZrDMMDhZuWHTamQl_eGCvOod6yB-N0ST"
                alt="AJVAS Chocolates Signature Grand Hamper in gift presentation"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          </div>

          {/* Spotlight Details */}
          <div className="lg:col-span-5 order-1 lg:order-2 flex flex-col items-start">
            <span className="font-sans text-xs uppercase tracking-widest text-brand-gold font-bold">
              The Signature Hamper
            </span>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-cream mt-2 mb-4 leading-tight">
              Made for significant moments.
            </h2>

            <p className="font-sans text-base text-brand-sand/90 mb-6 leading-relaxed">
              From our signature ribbon closure to personal handwritten gift cards in textured ivory envelopes, our flagship gift hamper is assembled to make an impression.
            </p>

            {/* Feature Checklist */}
            <div className="w-full bg-brand-cocoa/50 rounded-xl p-5 mb-8 space-y-2.5 border border-brand-cocoa text-sm font-sans text-brand-sand">
              {features.map((feature) => (
                <div key={feature} className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-brand-gold shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            {/* Price tag */}
            <div className="flex items-baseline gap-3 mb-8">
              <span className="font-serif text-3xl sm:text-4xl text-brand-gold font-bold">
                ₹3,450
              </span>
              <span className="font-sans text-xs sm:text-sm text-brand-sand/80">
                All inclusive • Direct courier dispatch
              </span>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full">
              <a href="#collections">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto gap-2">
                  <Gift className="w-4 h-4" />
                  <span>Gift This Hamper</span>
                </Button>
              </a>
              <a href="#gifts">
                <Button variant="outline" size="lg" className="w-full sm:w-auto border-brand-sand/40 text-brand-cream hover:bg-brand-cocoa">
                  View Collection
                </Button>
              </a>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
