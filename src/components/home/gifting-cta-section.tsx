import { ArrowRight, Sparkles } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

export function GiftingCtaSection() {
  return (
    <section className="w-full bg-[#fdf2f6]/40 py-16 lg:py-24">
      <Container>
        <div className="max-w-3xl mx-auto text-center flex flex-col items-center">
          <div className="w-10 h-10 rounded-full bg-brand-pink-light flex items-center justify-center text-brand-pink mb-4 border border-brand-pink/20 shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-brand-navy mb-3 leading-tight">
            Find something worth gifting.
          </h2>

          <p className="font-sans text-base sm:text-lg text-brand-muted max-w-xl mx-auto mb-8 leading-relaxed font-medium">
            Browse our curated collection or reach out for a custom, personalized hamper.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
            <a href="/shop">
              <Button variant="primary" size="lg" className="w-full sm:w-auto gap-2 bg-brand-pink text-white hover:bg-brand-pink-hover shadow-md rounded-full px-8">
                <span>Shop All Gifts</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </Button>
            </a>
            <a href="#story">
              <Button variant="outline" size="lg" className="w-full sm:w-auto rounded-full border-brand-navy/30 text-brand-navy hover:bg-white px-8">
                Our Story
              </Button>
            </a>
          </div>
        </div>
      </Container>
    </section>
  );
}
