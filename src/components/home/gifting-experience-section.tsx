"use client";

import { useState } from "react";
import { Heart, Sparkles, Diamond, Smile } from "lucide-react";
import { HomepageSection } from "@/types/cms";
import { Container } from "@/components/ui/container";

export interface GiftingExperienceSectionProps {
  section?: HomepageSection | null;
}

export function GiftingExperienceSection({ section }: GiftingExperienceSectionProps) {
  const title = section?.title || "Chocolates made for human moments.";
  const description =
    section?.description ||
    "More than chocolates, we create moments of joy. Crafted with care, premium ingredients, and a belief in the power of thoughtful gifting.";
  const imageUrl = section?.image_url?.trim() || null;
  const [imageError, setImageError] = useState(false);

  const showImage = imageUrl && !imageError;

  const defaultPillars = [
    { icon: Heart, title: "Gifting", sub: "Made Meaningful" },
    { icon: Sparkles, title: "Pan-India", sub: "Delivery" },
    { icon: Diamond, title: "Premium", sub: "Ingredients" },
    { icon: Smile, title: "For Every", sub: "Special Moment" },
  ];

  return (
    <section className="w-full bg-white py-14 lg:py-20 border-b border-brand-sand/60">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Text & Pillars */}
          <div className="lg:col-span-7">
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-brand-navy leading-tight mb-3">
              {title}
            </h2>
            <p className="font-sans text-sm sm:text-base text-brand-muted leading-relaxed max-w-xl mb-8">
              {description}
            </p>

            {/* 4 Icon Pillars */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              {defaultPillars.map((p) => {
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
            <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-elevated border border-brand-sand/80 bg-brand-pink-light/20">
              {showImage ? (
                <img
                  src={imageUrl}
                  alt={title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={() => {
                    console.error("GIFTING EXPERIENCE IMAGE DEBUG", {
                      imageUrl,
                      imagePublicId: section?.image_public_id,
                      sectionData: section,
                    });
                    setImageError(true);
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#fdf2f6] via-[#f7e4eb] to-[#eed2de] flex flex-col items-center justify-center p-8 text-center border border-brand-pink/20">
                  <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-brand-pink mb-3 shadow-md">
                    <Sparkles className="w-7 h-7" />
                  </div>
                  <h3 className="font-serif text-xl font-bold text-brand-navy max-w-xs">
                    AJVAS Gift Presentation
                  </h3>
                  <p className="font-sans text-xs text-brand-muted mt-1 max-w-xs font-medium">
                    Hand-assembled keepsake box with ribbon closure
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
