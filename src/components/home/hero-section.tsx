import { Gift, Truck, Lock, ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="w-full bg-brand-cream overflow-hidden py-12 lg:py-20 border-b border-brand-sand/50">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Hero Content */}
          <div className="lg:col-span-6 flex flex-col items-start z-10">
            {/* Category / Collection Tag */}
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-accent-rose"></span>
              <span className="font-sans text-xs uppercase tracking-widest text-brand-gold font-bold">
                Celebration &amp; Gifting
              </span>
            </div>

            {/* H1 Main Headline */}
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-brand-espresso leading-[1.1] mb-5">
              Gifts worth opening slowly.
            </h1>

            {/* Description */}
            <p className="font-sans text-base sm:text-lg text-brand-muted leading-relaxed mb-8 max-w-lg">
              Chocolates crafted for life&apos;s celebrations and thoughtful gestures. Hand-assembled in keepsake presentation boxes with personalized greetings.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full sm:w-auto">
              <a href="#collections">
                <Button variant="primary" size="lg" className="w-full sm:w-auto gap-2">
                  <span>Shop Gifts</span>
                  <ArrowRight className="w-4 h-4 text-brand-gold" />
                </Button>
              </a>
              <a href="#gifts">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Explore Chocolates
                </Button>
              </a>
            </div>

            {/* Trust Markers */}
            <div className="mt-10 pt-6 border-t border-brand-sand/70 w-full flex flex-wrap items-center gap-y-3 gap-x-6 text-brand-muted text-xs font-sans font-medium">
              <div className="flex items-center gap-2">
                <Gift className="w-4 h-4 text-brand-gold shrink-0" />
                <span>Gift greeting included</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-accent-cyan shrink-0" />
                <span>Pan-India courier delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-accent-rose shrink-0" />
                <span>Fast guest checkout</span>
              </div>
            </div>
          </div>

          {/* Right Hero Showcase Image */}
          <div className="lg:col-span-6 relative">
            <div className="relative w-full aspect-[4/3] sm:aspect-[16/11] rounded-2xl overflow-hidden bg-brand-surface shadow-elevated border border-brand-border/60">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBqgb9Q_fPTLG8u1oxJQ4NcTtSITwo3_7oh9hsOCEttnPmJ7Lga1rkVsxd8FUGexLaKo3nMcZ4CRsTPJuiBeWjzQsLMhtlWHnprvmMQBAV6fl9j29X8rdNYWhieYKkEqUVGnUAGa4PYEgb2wzZJy_OGydPb_5Q5eFFRMei5c6XdNMhy4O1rMmTCkDmnKsC1yumFgFdKIVZK0WmITEhuWQFL45fLq2UwTQ8ETlP9RGcmbXpEOsD06-uy"
                alt="AJVAS Chocolates Grand Velvet Hamper presentation"
                className="w-full h-full object-cover"
                loading="eager"
              />

              {/* Floating Product Highlight Tag */}
              <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-xs bg-brand-cream/95 backdrop-blur-md p-4 rounded-xl border border-brand-sand/80 shadow-drawer">
                <p className="font-sans text-[10px] font-bold uppercase tracking-widest text-brand-gold">
                  Curated Presentation
                </p>
                <p className="font-serif text-base font-semibold text-brand-espresso mt-0.5">
                  The Grand Velvet Hamper
                </p>
                <p className="font-sans font-bold text-base text-brand-burgundy mt-1">
                  ₹3,450{" "}
                  <span className="text-xs font-normal text-brand-muted">
                    • All inclusive
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
