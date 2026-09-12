import { ArrowRight, Sparkles } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

export function GiftingCtaSection() {
  return (
    <section className="w-full bg-brand-cream py-16 lg:py-24">
      <Container>
        <div className="max-w-3xl mx-auto text-center flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-brand-sand/50 flex items-center justify-center text-brand-gold mb-5 border border-brand-border/60 shadow-subtle">
            <Sparkles className="w-6 h-6" />
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-espresso mb-4 leading-tight">
            Find something worth gifting.
          </h2>

          <p className="font-sans text-base sm:text-lg text-brand-muted max-w-xl mx-auto mb-8 leading-relaxed">
            Browse our curated chocolate curations for celebrations, personal milestones, and festive gifting.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
            <a href="#collections">
              <Button variant="primary" size="lg" className="w-full sm:w-auto gap-2">
                <span>Shop All Gifts</span>
                <ArrowRight className="w-4 h-4 text-brand-gold" />
              </Button>
            </a>
            <a href="#contact">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Customer Support
              </Button>
            </a>
          </div>
        </div>
      </Container>
    </section>
  );
}
