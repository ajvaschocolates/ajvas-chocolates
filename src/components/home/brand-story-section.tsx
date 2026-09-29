"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, Flame, Heart, Gift } from "lucide-react";
import { HomepageSection } from "@/types/cms";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

export interface BrandStorySectionProps {
  section?: HomepageSection | null;
}

export function BrandStorySection({ section }: BrandStorySectionProps) {
  const eyebrow = section?.eyebrow || "THE AJVAS STORY";
  const rawTitle = section?.title || "Chocolates made for sweeter moments.";
  const description =
    section?.description ||
    "At Ajvas Chocolates, we believe in crafting more than just chocolates — we create moments of joy. Each bite is a blend of premium ingredients, thoughtful craftsmanship and a passion for spreading happiness.";
  const imageUrl =
    section?.image_url?.trim() ||
    "https://images.unsplash.com/photo-1548848221-0c2e497ed557?q=80&w=1000&auto=format&fit=crop";

  const [imageError, setImageError] = useState(false);
  const showImage = imageUrl && !imageError;

  const defaultPillars = [
    { icon: Sparkles, title: "Fine Ingredients", sub: "Finest cocoa & butter" },
    { icon: Flame, title: "Rich Flavours", sub: "Artisanal recipes" },
    { icon: Heart, title: "Crafted with Care", sub: "Handmade confections" },
    { icon: Gift, title: "Perfect for Every Occasion", sub: "Thoughtful gifting" },
  ];

  // Dynamic title renderer highlighting "moments."
  const renderFormattedTitle = (titleText: string) => {
    if (!titleText) return null;
    const words = titleText.trim().split(/\s+/);
    if (words.length >= 2) {
      const firstPart = words.slice(0, words.length - 1).join(" ");
      const lastPart = words[words.length - 1];
      return (
        <>
          {firstPart}{" "}
          <span className="font-serif italic font-normal text-amber-200">
            {lastPart}
          </span>
        </>
      );
    }
    return titleText;
  };

  return (
    <section className="w-full bg-[#160c08] py-14 sm:py-16 lg:py-24 border-b border-[#2d1810]" id="story">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Side Showcase Pure Editorial Image */}
          <div className="lg:col-span-6 relative">
            <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-xl border border-[#3d1c12] bg-[#1a0c07]">
              {showImage ? (
                <img
                  src={imageUrl}
                  alt={rawTitle}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-full h-full bg-[#1e0c13] flex flex-col items-center justify-center p-8 text-center text-white">
                  <Sparkles className="w-8 h-8 text-[#fb0b88] mb-2" />
                  <h3 className="font-serif text-2xl font-bold text-amber-200">AJVAS Craftsmanship</h3>
                </div>
              )}
            </div>
          </div>

          {/* Right Side Text & 4 Pillars */}
          <div className="lg:col-span-6 flex flex-col items-start">
            <div className="inline-flex items-center gap-2 mb-3">
              <span className="w-4 h-[1.5px] bg-[#fb0b88]" />
              <span className="font-sans text-xs uppercase tracking-widest text-[#fb0b88] font-bold">
                {eyebrow}
              </span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#faf4f0] leading-tight mb-4">
              {renderFormattedTitle(rawTitle)}
            </h2>

            <p className="font-sans text-sm sm:text-base text-[#d0c4b8]/85 leading-relaxed mb-8 font-normal">
              {description}
            </p>

            {/* 4 Icon Pillars */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-[#2d1810] w-full mb-8">
              {defaultPillars.map((p) => {
                const IconComp = p.icon;
                return (
                  <div key={p.title} className="flex flex-col items-center text-center p-2">
                    <div className="w-10 h-10 rounded-full bg-[#2a121a] border border-[#4a1c26] flex items-center justify-center text-[#fb0b88] mb-2.5 shadow-sm">
                      <IconComp className="w-4 h-4 stroke-[2]" />
                    </div>
                    <span className="font-serif text-xs font-bold text-[#faf4f0] leading-tight">
                      {p.title}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Button */}
            <Link href="/#story">
              <Button
                variant="outline"
                size="lg"
                className="rounded-full border-amber-200/50 text-[#faf4f0] bg-black/40 backdrop-blur-md hover:bg-amber-200/20 hover:border-amber-200/80 font-sans text-xs uppercase tracking-wider font-semibold px-8 py-3.5 shadow-md"
              >
                OUR STORY
              </Button>
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
