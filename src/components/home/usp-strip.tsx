import React from "react";
import { Truck, Leaf, Gift, ShieldCheck } from "lucide-react";
import { Container } from "@/components/ui/container";

export function UspStrip() {
  const uspItems = [
    {
      icon: Truck,
      title: "Pan India Delivery",
      subtitle: "Across 28000+ pincodes",
    },
    {
      icon: Leaf,
      title: "Premium Ingredients",
      subtitle: "Finest quality sourcing",
    },
    {
      icon: Gift,
      title: "Beautiful Packaging",
      subtitle: "Perfection in every detail",
    },
    {
      icon: ShieldCheck,
      title: "Secure Checkout",
      subtitle: "Safe & seamless payments",
    },
  ];

  return (
    <section className="w-full bg-[#fdf8f5] py-8 sm:py-10 border-b border-[#ebdcd3]/70">
      <Container>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 items-center justify-center">
          {uspItems.map((item) => {
            const IconComp = item.icon;
            return (
              <div
                key={item.title}
                className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-3.5 p-2 rounded-2xl transition-colors hover:bg-white/60"
              >
                <div className="w-12 h-12 rounded-full bg-[#fff0f6] border border-[#fbcfe8]/60 flex items-center justify-center text-[#fb0b88] shrink-0 shadow-xs">
                  <IconComp className="w-5 h-5 stroke-[1.75]" />
                </div>
                <div className="flex flex-col">
                  <h4 className="font-serif text-base font-bold text-brand-espresso leading-snug">
                    {item.title}
                  </h4>
                  <p className="font-sans text-xs text-brand-muted mt-0.5 font-normal">
                    {item.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
