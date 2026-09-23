import { Gift, Truck, Lock, ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

export function HeroSection() {
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
                Celebration &amp; Gifting
              </span>
            </div>

            {/* H1 Main Headline */}
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-brand-navy leading-[1.1] mb-5">
              <span className="text-brand-pink">Gifts</span> worth opening slowly.
            </h1>

            {/* Description */}
            <p className="font-sans text-base sm:text-lg text-brand-muted leading-relaxed mb-8 max-w-lg">
              Chocolates crafted for life&apos;s celebrations and thoughtful gestures. Hand-assembled in keepsake presentation boxes with personalized greetings.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full sm:w-auto">
              <a href="#collections">
                <Button variant="primary" size="lg" className="w-full sm:w-auto gap-2 bg-brand-pink text-white hover:bg-brand-pink-hover shadow-md rounded-full">
                  <span>Shop Gifts</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </Button>
              </a>
              <a href="#gifts">
                <Button variant="outline" size="lg" className="w-full sm:w-auto rounded-full border-brand-navy/30 text-brand-navy hover:bg-white hover:border-brand-pink">
                  Explore Chocolates
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
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBqgb9Q_fPTLG8u1oxJQ4NcTtSITwo3_7oh9hsOCEttnPmJ7Lga1rkVsxd8FUGexLaKo3nMcZ4CRsTPJuiBeWjzQsLMhtlWHnprvmMQBAV6fl9j29X8rdNYWhieYKkEqUVGnUAGa4PYEgb2wzZJy_OGydPb_5Q5eFFRMei5c6XdNMhy4O1rMmTCkDmnKsC1yumFgFdKIVZK0WmITEhuWQFL45fLq2UwTQ8ETlP9RGcmbXpEOsD06-uy"
                alt="AJVAS Chocolates keepsake gift hamper presentation"
                className="w-full h-full object-cover"
                loading="eager"
              />

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
