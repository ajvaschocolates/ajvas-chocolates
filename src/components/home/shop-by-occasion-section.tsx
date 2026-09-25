"use client";

import { useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { Category } from "@/types/catalog";
import { Container } from "@/components/ui/container";

export interface ShopByOccasionSectionProps {
  categories?: Category[];
}

export function ShopByOccasionSection({ categories }: ShopByOccasionSectionProps) {
  const [failedImageIds, setFailedImageIds] = useState<Record<string, boolean>>({});

  // Use active categories if provided, otherwise fallback array of titles
  const displayItems =
    categories && categories.length > 0
      ? categories
      : [
          { id: "1", name: "Festive Celebrations", image_url: null },
          { id: "2", name: "Weddings & Anniversaries", image_url: null },
          { id: "3", name: "Birthdays", image_url: null },
          { id: "4", name: "Corporate Gifting", image_url: null },
        ];

  return (
    <section className="w-full bg-[#fdf8f5] py-14 lg:py-20 border-b border-brand-sand/60" id="occasions">
      <Container>
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-brand-navy">
            Shop by <span className="text-brand-pink">Occasion</span>
          </h2>
          <p className="font-sans text-sm text-brand-muted mt-1.5 font-medium">
            Because every moment deserves something sweeter
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {displayItems.slice(0, 4).map((item) => {
            const imageUrl = item.image_url?.trim() || null;
            const hasValidImage = Boolean(imageUrl) && !failedImageIds[item.id];
            return (
              <a
                key={item.id || item.name}
                href="/shop"
                className="group relative h-72 rounded-2xl overflow-hidden shadow-subtle hover:shadow-elevated transition-all duration-300 flex flex-col justify-end p-5 border border-brand-sand/60 bg-gradient-to-br from-brand-navy to-[#1a2d42]"
              >
                {/* Background Image if available */}
                {hasValidImage ? (
                  <img
                    src={imageUrl!}
                    alt={item.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                    onError={() => {
                      console.error("SHOP BY OCCASION CATEGORY IMAGE DEBUG", {
                        categoryName: item.name,
                        imageUrl,
                        categoryData: item,
                      });
                      setFailedImageIds((prev) => ({ ...prev, [item.id]: true }));
                    }}
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-tr from-brand-navy via-[#2c1d27] to-[#4a2638] flex flex-col items-center justify-center p-6 text-center">
                    <Sparkles className="w-8 h-8 text-brand-pink/60 mb-2" />
                    <span className="font-serif text-sm text-white/80 font-bold">AJVAS Confections</span>
                  </div>
                )}

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/90 via-brand-navy/30 to-transparent pointer-events-none" />

                {/* Content */}
                <div className="relative z-10 flex items-end justify-between gap-3 w-full">
                  <h3 className="font-serif text-xl font-bold text-white leading-snug">
                    {item.name}
                  </h3>
                  <span className="w-8 h-8 rounded-full bg-white text-brand-navy group-hover:bg-brand-pink group-hover:text-white flex items-center justify-center shrink-0 shadow-md transition-all duration-300">
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </a>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
