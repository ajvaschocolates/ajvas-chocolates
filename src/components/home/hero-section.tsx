"use client";

import { useState } from "react";
import { HeroBanner } from "@/types/cms";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

export interface HeroSectionProps {
  banner?: HeroBanner | null;
  banners?: HeroBanner[];
}

export function HeroSection({ banner, banners }: HeroSectionProps) {
  const allBanners = banners && banners.length > 0 ? banners : banner ? [banner] : [];
  const [imageError, setImageError] = useState(false);

  // Slide bar is hidden, so the first banner is always shown
  const currentBanner = allBanners[0] || banner || null;

  const rawTitle = currentBanner ? currentBanner.title : "Small Bites Big Emotions";
  const description = currentBanner
    ? currentBanner.description
    : "Handcrafted chocolates for every celebration, every milestone and every moment that matters.";
  const ctaText = currentBanner ? currentBanner.secondary_cta_text : "EXPLORE CHOCOLATES";
  const ctaLink = currentBanner ? currentBanner.secondary_cta_link : "/shop";
  const imageUrl = currentBanner?.image_url?.trim() || null;

  const showImage = imageUrl && !imageError;

  // Title stays on ONE line; last two words keep the amber accent
  const renderFormattedTitle = (titleText: string) => {
    if (!titleText) return null;
    const words = titleText.trim().split(/\s+/);
    if (words.length >= 4) {
      const firstPart = words.slice(0, words.length - 2).join(" ");
      const lastPart = words.slice(words.length - 2).join(" ");
      return (
        <>
          {firstPart}{" "}
          <span className="font-heading font-normal text-amber-200">{lastPart}</span>
        </>
      );
    }
    if (words.length >= 2) {
      const firstPart = words.slice(0, words.length - 1).join(" ");
      const lastPart = words[words.length - 1];
      return (
        <>
          {firstPart}{" "}
          <span className="font-heading font-normal text-amber-200">{lastPart}</span>
        </>
      );
    }
    return titleText;
  };

  return (
    // Height = 72vh on mobile (increased but not full), full device viewport height on desktop
    <section className="relative w-full h-[72vh] sm:h-[100dvh] min-h-[520px] sm:min-h-[100dvh] bg-black text-white overflow-hidden flex items-end justify-center">
      {/* Full-bleed background image */}
      {showImage ? (
        <img
          src={imageUrl}
          alt={rawTitle || "AJVAS Hero Banner"}
          className="absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-700"
          loading="eager"
          onError={() => setImageError(true)}
        />
      ) : (
        <img
          src="/bg-cover.png"
          alt="AJVAS Artisanal Confections"
          className="absolute inset-0 w-full h-full object-cover object-center"
          loading="eager"
        />
      )}

      {/* Even overlay so text stays readable */}
      <div className="absolute inset-0 bg-black/50 pointer-events-none" />

      {/* Content: bottom center */}
      <Container className="relative z-10 pt-4 pb-8 sm:pt-10 sm:pb-14">
        <div className="mx-auto max-w-3xl flex flex-col items-center text-center">
          {rawTitle && (
            <h1 className="font-heading whitespace-normal sm:whitespace-nowrap text-3xl sm:text-[clamp(1.5rem,6.5vw,3.75rem)] tracking-tight text-white leading-[1.1] mb-3 sm:mb-4 [text-shadow:_0_2px_16px_rgba(0,0,0,0.8)] ">
              {renderFormattedTitle(rawTitle)}
            </h1>
          )}

          {description && (
            <p className="font-subtitle text-xs sm:text-xl text-[#ffffe3] leading-relaxed mb-4 sm:mb-6 max-w-lg font-normal [text-shadow:_0_2px_10px_rgba(0,0,0,0.9)] line-clamp-2 sm:line-clamp-none">
              {description}
            </p>
          )}

          {ctaText && (
            <a href={ctaLink || "/shop"}>
              <Button
                variant="primary"
                size="lg"
                className="!border-0 !rounded-full !h-auto bg-[#fb0b88] hover:bg-[#d90974] text-white !font-pally !text-xs sm:!text-sm uppercase tracking-wider font-semibold px-5 py-2.5 sm:px-6 sm:py-3 shadow-xl transition-colors duration-300"
              >
                {ctaText}
              </Button>
            </a>
          )}
        </div>
      </Container>
    </section>
  );
}