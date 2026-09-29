import React from "react";
import { Award, Gift, Truck, Heart } from "lucide-react";
import { Container } from "@/components/ui/container";

export function UspStrip() {
  const uspItems = [
    {
      icon: Award,
      title: "Premium Quality",
      subtitle: "Finest ingredients",
    },
    {
      icon: Gift,
      title: "Beautiful Packaging",
      subtitle: "Perfect for every occasion",
    },
    {
      icon: Truck,
      title: "Secure Delivery",
      subtitle: "Across India",
    },
    {
      icon: Heart,
      title: "Dedicated Support",
      subtitle: "We're always here for you",
    },
  ];

  return (
    <section className="w-full bg-[#180d09] py-6 sm:py-8 border-b border-[#2d1810]">
      <Container>
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-y divide-[#2d1810] lg:divide-y-0 lg:divide-x lg:divide-[#2d1810] items-center">
          {uspItems.map((item) => {
            const IconComp = item.icon;
            return (
              <div
                key={item.title}
                className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-3.5 p-3 sm:px-6 transition-colors hover:bg-white/[0.02]"
              >
                <div className="w-11 h-11 rounded-full bg-[#2a140d] border border-[#3d1c12] flex items-center justify-center text-[#c99d52] shrink-0 shadow-sm">
                  <IconComp className="w-5 h-5 stroke-[1.75]" />
                </div>
                <div className="flex flex-col">
                  <h4 className="font-serif text-sm sm:text-base font-bold text-[#faf4f0] leading-snug">
                    {item.title}
                  </h4>
                  <p className="font-sans text-xs text-[#d0c4b8]/75 mt-0.5 font-normal">
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
