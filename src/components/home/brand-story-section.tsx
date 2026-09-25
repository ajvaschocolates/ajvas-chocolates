"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { HomepageSection } from "@/types/cms";
import { Container } from "@/components/ui/container";

export interface BrandStorySectionProps {
  section?: HomepageSection | null;
}

export function BrandStorySection({ section }: BrandStorySectionProps) {
  const eyebrow = section?.eyebrow || "The Ajvas Philosophy";
  const title = section?.title || "Chocolates made for human moments.";
  const description =
    section?.description ||
    "Ajvas was founded on a simple premise: a box of chocolates should feel like a celebration before it's even opened. We make chocolate confections presented with woven ribbons and personalized notes.";
  const imageUrl = section?.image_url?.trim() || null;
  const [imageError, setImageError] = useState(false);

  const showImage = imageUrl && !imageError;

  return (
    <section className="w-full bg-brand-surface py-16 lg:py-24 border-b border-brand-sand/60" id="story">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Story Text */}
          <div className="lg:col-span-6 flex flex-col items-start">
            <span className="font-sans text-xs uppercase tracking-widest text-brand-gold font-bold">
              {eyebrow}
            </span>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-espresso mt-2 mb-5 leading-tight">
              {title}
            </h2>

            <p className="font-sans text-base text-brand-muted mb-4 leading-relaxed">
              {description}
            </p>

            <p className="font-sans text-base text-brand-muted mb-8 leading-relaxed">
              Each box is prepared with transit protection, ribbon tying, and your personalized greeting printed on heavy textured cardstock.
            </p>

            {/* 3 Pillars */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-brand-sand w-full">
              <div className="flex flex-col">
                <span className="font-serif text-xl sm:text-2xl font-bold text-brand-burgundy">
                  Gifting
                </span>
                <span className="font-sans text-xs text-brand-muted mt-0.5">
                  Keepsake packaging
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-xl sm:text-2xl font-bold text-brand-burgundy">
                  Pan-India
                </span>
                <span className="font-sans text-xs text-brand-muted mt-0.5">
                  Courier dispatch
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-xl sm:text-2xl font-bold text-brand-burgundy">
                  Checkout
                </span>
                <span className="font-sans text-xs text-brand-muted mt-0.5">
                  Guest checkout
                </span>
              </div>
            </div>
          </div>

          {/* Lifestyle / Packaging Image */}
          <div className="lg:col-span-6">
            <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-elevated bg-white border border-brand-border/60">
              {showImage ? (
                <img
                  src={imageUrl}
                  alt={title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={() => {
                    console.error("BRAND STORY IMAGE DEBUG", {
                      imageUrl,
                      imagePublicId: section?.image_public_id,
                      sectionData: section,
                    });
                    setImageError(true);
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#f8ece9] via-[#f2deda] to-[#e6cbc5] flex flex-col items-center justify-center p-8 text-center border border-brand-sand">
                  <div className="w-14 h-14 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-brand-burgundy mb-3 shadow-xs">
                    <Sparkles className="w-7 h-7" />
                  </div>
                  <h3 className="font-serif text-xl font-bold text-brand-espresso max-w-sm">
                    {title}
                  </h3>
                  <p className="font-sans text-xs text-brand-muted mt-1 max-w-xs">
                    Keepsake Box &amp; Personalized Note Presentation
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
