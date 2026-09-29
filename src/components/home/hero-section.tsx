"use client";

import { useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { HeroBanner } from "@/types/cms";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

export interface HeroSectionProps {
  banner?: HeroBanner | null;
  banners?: HeroBanner[];
}

export function HeroSection({ banner, banners }: HeroSectionProps) {
  const allBanners = banners && banners.length > 0 ? banners : banner ? [banner] : [];
  const [activeIndex, setActiveIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  const currentBanner = allBanners[activeIndex] || banner || null;

  const eyebrow = currentBanner ? currentBanner.eyebrow : "PREMIUM CHOCOLATES";
  const rawTitle = currentBanner ? currentBanner.title : "Small Bites Big Emotions";
  const description = currentBanner
    ? currentBanner.description
    : "Handcrafted chocolates for every celebration, every milestone and every moment that matters.";
  const primaryCtaText = currentBanner ? currentBanner.primary_cta_text : "SHOP NOW";
  const primaryCtaLink = currentBanner ? currentBanner.primary_cta_link : "/shop";
  const secondaryCtaText = currentBanner ? currentBanner.secondary_cta_text : "OUR STORY";
  const secondaryCtaLink = currentBanner ? currentBanner.secondary_cta_link : "/#story";
  const imageUrl = currentBanner?.image_url?.trim() || null;

  const showImage = imageUrl && !imageError;

  // Render formatted title with italic accent dynamically from titleText without hardcoding
  const renderFormattedTitle = (titleText: string) => {
    if (!titleText) return null;
    const words = titleText.trim().split(/\s+/);
    if (words.length >= 4) {
      const firstPart = words.slice(0, words.length - 2).join(" ");
      const lastPart = words.slice(words.length - 2).join(" ");
      return (
        <>
          {firstPart}
          <span className="block font-serif italic font-normal text-amber-200">
            {lastPart}
          </span>
        </>
      );
    }
    if (words.length >= 2) {
      const firstPart = words.slice(0, words.length - 1).join(" ");
      const lastPart = words.slice(words.length - 1).join(" ");
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

  const handleNext = () => {
    if (allBanners.length > 1) {
      setActiveIndex((prev) => (prev + 1) % allBanners.length);
      setImageError(false);
    }
  };

  const handlePrev = () => {
    if (allBanners.length > 1) {
      setActiveIndex((prev) => (prev - 1 + allBanners.length) % allBanners.length);
      setImageError(false);
    }
  };

  return (
    <section className="relative w-full min-h-[520px] sm:min-h-[580px] lg:min-h-[640px] bg-[#160c08] text-white overflow-hidden flex items-center border-b border-[#2d1810]">
      {/* Edge-to-Edge Full-Bleed Bright Photographic Background Image Canvas */}
      {showImage ? (
        <img
          src={imageUrl}
          alt={rawTitle || "AJVAS Hero Banner"}
          className="absolute inset-0 w-full h-full object-cover object-right sm:object-center transition-opacity duration-700"
          loading="eager"
          onError={() => setImageError(true)}
        />
      ) : (
        <img
          src="https://images.unsplash.com/photo-1549007994-cb92caebd54b?q=80&w=1600&auto=format&fit=crop"
          alt="AJVAS Artisanal Confections"
          className="absolute inset-0 w-full h-full object-cover object-right sm:object-center"
          loading="eager"
        />
      )}

      {/* Light & Subtle Localized Overlay Gradient - Leaves right side product imagery visually bright & un-muddled */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#160c08]/85 via-[#160c08]/50 to-transparent sm:from-[#160c08]/80 sm:via-[#160c08]/40 sm:to-transparent pointer-events-none" />

      {/* Hero Content Overlay */}
      <Container className="relative z-10 py-14 sm:py-20 lg:py-24">
        <div className="max-w-xl lg:max-w-2xl flex flex-col items-start text-left">
          {/* Eyebrow Tag */}
          {eyebrow && (
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="w-5 h-[1.5px] bg-amber-300/80" />
              <span className="font-sans text-xs uppercase tracking-widest text-amber-200/95 font-bold">
                {eyebrow}
              </span>
            </div>
          )}

          {/* H1 Headline with local text drop-shadow for contrast over photography */}
          {rawTitle && (
            <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.05] mb-5 [text-shadow:_0_2px_16px_rgba(0,0,0,0.8)]">
              {renderFormattedTitle(rawTitle)}
            </h1>
          )}

          {/* Description */}
          {description && (
            <p className="font-sans text-sm sm:text-base text-white/90 leading-relaxed mb-8 max-w-md font-normal [text-shadow:_0_1px_8px_rgba(0,0,0,0.8)]">
              {description}
            </p>
          )}

          {/* CTA Buttons */}
          {(primaryCtaText || secondaryCtaText) && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto mb-10">
              {primaryCtaText && (
                <a href={primaryCtaLink || "#"} className="w-full sm:w-auto">
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full sm:w-auto gap-2.5 bg-[#fb0b88] hover:bg-[#d90974] text-white font-sans text-xs uppercase tracking-wider font-bold rounded-full px-8 py-4 shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
                  >
                    <span>{primaryCtaText}</span>
                    <ArrowRight className="w-4 h-4 text-white" />
                  </Button>
                </a>
              )}

              {secondaryCtaText && (
                <a href={secondaryCtaLink || "#"} className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto rounded-full border-amber-200/40 text-white bg-black/40 backdrop-blur-md hover:bg-amber-200/20 hover:border-amber-200/80 font-sans text-xs uppercase tracking-wider font-semibold px-7 py-4 shadow-md transition-all duration-300"
                  >
                    {secondaryCtaText}
                  </Button>
                </a>
              )}
            </div>
          )}

          {/* Carousel Slide Indicators */}
          <div className="flex items-center gap-4 pt-4 border-t border-white/20 w-full max-w-sm">
            <div className="flex items-center gap-2">
              {(allBanners.length > 0 ? allBanners : [1]).map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    if (allBanners.length > 1) {
                      setActiveIndex(idx);
                      setImageError(false);
                    }
                  }}
                  aria-label={`Go to banner slide ${idx + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === activeIndex
                      ? "w-8 bg-[#fb0b88]"
                      : "w-2.5 bg-white/40 hover:bg-white/70"
                  }`}
                />
              ))}
            </div>

            {allBanners.length > 1 && (
              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label="Previous slide"
                  className="w-8 h-8 rounded-full border border-white/30 bg-black/40 backdrop-blur-md hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="Next slide"
                  className="w-8 h-8 rounded-full border border-white/30 bg-black/40 backdrop-blur-md hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}

