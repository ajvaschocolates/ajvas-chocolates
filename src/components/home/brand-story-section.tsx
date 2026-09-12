import { Container } from "@/components/ui/container";

export function BrandStorySection() {
  return (
    <section className="w-full bg-brand-surface py-16 lg:py-24 border-b border-brand-sand/60" id="story">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Story Text */}
          <div className="lg:col-span-6 flex flex-col items-start">
            <span className="font-sans text-xs uppercase tracking-widest text-brand-gold font-bold">
              The Ajvas Philosophy
            </span>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-espresso mt-2 mb-5 leading-tight">
              Chocolates made for human moments.
            </h2>

            <p className="font-sans text-base text-brand-muted mb-4 leading-relaxed">
              Ajvas was founded on a simple premise: a box of chocolates should feel like a celebration before it&apos;s even opened. We make honest, handcrafted confections assembled with custom woven ribbons and personalized notes.
            </p>

            <p className="font-sans text-base text-brand-muted mb-8 leading-relaxed">
              Every box is carefully packed by our team with transit protection, signature ribbon tying, and your personalized greeting printed on heavy textured cardstock.
            </p>

            {/* 3 Pillars */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-brand-sand w-full">
              <div className="flex flex-col">
                <span className="font-serif text-xl sm:text-2xl font-bold text-brand-burgundy">
                  Small Batches
                </span>
                <span className="font-sans text-xs text-brand-muted mt-0.5">
                  Handcrafted confections
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-xl sm:text-2xl font-bold text-brand-burgundy">
                  Pan-India
                </span>
                <span className="font-sans text-xs text-brand-muted mt-0.5">
                  Direct courier dispatch
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-xl sm:text-2xl font-bold text-brand-burgundy">
                  Guest-First
                </span>
                <span className="font-sans text-xs text-brand-muted mt-0.5">
                  Frictionless checkout
                </span>
              </div>
            </div>
          </div>

          {/* Lifestyle / Packaging Image */}
          <div className="lg:col-span-6">
            <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-elevated bg-white border border-brand-border/60">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDStnchmpvuQiHPSwZWLXqPNYNNtIAM8R1zfAnWkcJklCX0G2gsguGTaN4RZkf3g3R63w56OHHFoOgMu1263gSJ6i47R8tzLtbSb2XGWgWm5grX4h7K_qBkyxqfz4TupAkb-8cxhRvz6q1kKOtNAD4jwBoFVbCzlaPuY1sk0xmsi3RdJbtbQiRz7KgrlDbP53TfytiQjUOxYnsjfEYvtnyp-Dg2UWKYQ6GXoi_Q4rWgkQ3KBY8UBYrx"
                alt="AJVAS Chocolates keepsake packaging and personalized greeting cards"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
