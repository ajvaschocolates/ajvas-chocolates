import { Heart, Sparkles, Diamond, Smile } from "lucide-react";
import { Container } from "@/components/ui/container";

export function GiftingExperienceSection() {
  const pillars = [
    {
      icon: Heart,
      title: "Gifting",
      sub: "Made Meaningful",
    },
    {
      icon: Sparkles,
      title: "Pan-India",
      sub: "Delivery",
    },
    {
      icon: Diamond,
      title: "Premium",
      sub: "Ingredients",
    },
    {
      icon: Smile,
      title: "For Every",
      sub: "Special Moment",
    },
  ];

  return (
    <section className="w-full bg-white py-14 lg:py-20 border-b border-brand-sand/60">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Text & Pillars */}
          <div className="lg:col-span-7">
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-brand-navy leading-tight mb-3">
              Chocolates made for human moments.
            </h2>
            <p className="font-sans text-sm sm:text-base text-brand-muted leading-relaxed max-w-xl mb-8">
              More than chocolates, we create moments of joy. Crafted with care, premium ingredients, and a belief in the power of thoughtful gifting.
            </p>

            {/* 4 Icon Pillars */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              {pillars.map((p) => {
                const IconComp = p.icon;
                return (
                  <div key={p.title} className="flex flex-col items-center text-center p-3">
                    <div className="w-10 h-10 rounded-full bg-brand-pink-light flex items-center justify-center text-brand-pink mb-2">
                      <IconComp className="w-5 h-5" />
                    </div>
                    <span className="font-sans text-xs font-extrabold text-brand-navy">{p.title}</span>
                    <span className="font-sans text-[11px] text-brand-muted mt-0.5">{p.sub}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Box Image */}
          <div className="lg:col-span-5">
            <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-elevated border border-brand-sand/80">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBqgb9Q_fPTLG8u1oxJQ4NcTtSITwo3_7oh9hsOCEttnPmJ7Lga1rkVsxd8FUGexLaKo3nMcZ4CRsTPJuiBeWjzQsLMhtlWHnprvmMQBAV6fl9j29X8rdNYWhieYKkEqUVGnUAGa4PYEgb2wzZJy_OGydPb_5Q5eFFRMei5c6XdNMhy4O1rMmTCkDmnKsC1yumFgFdKIVZK0WmITEhuWQFL45fLq2UwTQ8ETlP9RGcmbXpEOsD06-uy"
                alt="AJVAS Chocolates presentation box"
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
