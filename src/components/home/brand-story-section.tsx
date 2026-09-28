"use client";

import { useState } from "react";
import { Leaf, Shield, Truck, Gift } from "lucide-react";
import { HomepageSection } from "@/types/cms";
import { Container } from "@/components/ui/container";

export interface BrandStorySectionProps {
  section?: HomepageSection | null;
}

export function BrandStorySection({ section }: BrandStorySectionProps) {
  const eyebrow = section?.eyebrow || "THE AJVAS STORY";
  const rawTitle = section?.title || "Chocolates made for human moments.";
  const description =
    section?.description ||
    "Ajvas was founded on a simple premise: a box of chocolates should feel like a celebration before it's even opened. Each box is prepared with transit protection, ribbon tying, and personalized greeting printed on heavy textured cardstock.";
  const imageUrl =
    section?.image_url?.trim() ||
    "https://images.unsplash.com/photo-1548848221-0c2e497ed557?q=80&w=1000&auto=format&fit=crop";

  const [imageError, setImageError] = useState(false);
  const showImage = imageUrl && !imageError;

  const pillars = [
    { icon: Leaf, title: "Premium", sub: "Ingredients" },
    { icon: Shield, title: "Hygienic", sub: "Production" },
    { icon: Truck, title: "Pan-India", sub: "Delivery" },
    { icon: Gift, title: "Perfect for", sub: "Every Occasion" },
  ];

  return (
    <section className="w-full bg-[#fdf8f5] py-12 lg:py-20 border-b border-[#ebdcd3]" id="story">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Side Showcase Pure Editorial Image */}
          <div className="lg:col-span-6 relative">
            <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-md border border-[#ebdcd3] bg-[#2a121a]">
              {showImage ? (
                <img
                  src={imageUrl}
                  alt={rawTitle}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-full h-full bg-[#2a121a] flex flex-col items-center justify-center p-8 text-center text-white">
                  <h3 className="font-serif text-2xl font-bold">AJVAS Craftsmanship</h3>
                </div>
              )}
            </div>
          </div>

          {/* Right Side Text & 4 Pillars */}
          <div className="lg:col-span-6 flex flex-col items-start">
            <span className="font-sans text-xs uppercase tracking-widest text-brand-pink font-bold mb-2">
              {eyebrow} —
            </span>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-espresso leading-tight mb-4">
              Chocolates made for{" "}
              <span className="font-serif italic font-normal text-[#c99d52]">
                human moments.
              </span>
            </h2>

            <p className="font-sans text-sm sm:text-base text-brand-muted leading-relaxed mb-8 font-normal">
              {description}
            </p>

            {/* 4 Icon Pillars */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-[#ebdcd3] w-full">
              {pillars.map((p) => {
                const IconComp = p.icon;
                return (
                  <div key={p.title} className="flex flex-col items-center text-center p-2">
                    <div className="w-10 h-10 rounded-full bg-[#fff0f6] border border-[#fbcfe8]/60 flex items-center justify-center text-brand-pink mb-2">
                      <IconComp className="w-4 h-4 stroke-[2]" />
                    </div>
                    <span className="font-serif text-xs font-bold text-brand-espresso leading-tight">
                      {p.title}
                    </span>
                    <span className="font-sans text-[11px] text-brand-muted mt-0.5">
                      {p.sub}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
