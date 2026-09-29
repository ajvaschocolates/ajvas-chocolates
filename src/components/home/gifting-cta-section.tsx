"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HomepageSection } from "@/types/cms";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

export interface GiftingCtaSectionProps {
  section?: HomepageSection | null;
}

export function GiftingCtaSection({ section }: GiftingCtaSectionProps) {
  const [imageError, setImageError] = useState(false);

  const rawTitle = section?.title || "Find something worth gifting.";
  const description =
    section?.description ||
    "Browse our curated collection or reach out for a custom, personalized hamper.";
  const primaryCtaText = section?.primary_cta_text || "SHOP ALL GIFTS";
  const primaryCtaLink = section?.primary_cta_link || "/shop";
  const imageUrl = section?.image_url?.trim() || null;

  const showBgImage = Boolean(imageUrl) && !imageError;

  // Helper to format title with italic accent dynamically from title string
  const renderFormattedTitle = (titleText: string) => {
    if (!titleText) return null;
    const lower = titleText.toLowerCase();
    if (lower.includes("worth gifting")) {
      const idx = lower.indexOf("worth gifting");
      const firstPart = titleText.substring(0, idx);
      const accentPart = titleText.substring(idx);
      return (
        <>
          {firstPart}
          <span className="font-pally font-normal text-amber-200">
            {accentPart}
          </span>
        </>
      );
    }
    const words = titleText.trim().split(/\s+/);
    if (words.length >= 2) {
      const firstPart = words.slice(0, words.length - 2).join(" ");
      const lastPart = words.slice(words.length - 2).join(" ");
      return (
        <>
          {firstPart ? `${firstPart} ` : ""}
          <span className="font-pally italic font-normal text-amber-200">
            {lastPart}
          </span>
        </>
      );
    }
    return titleText;
  };

  return (
    <section className="relative w-full bg-[#160c08] text-white py-16 sm:py-20 lg:py-24 overflow-hidden border-t border-[#2d1810]">
      {/* CMS Admin-Controlled Background Image Canvas */}
      {showBgImage ? (
        <img
          src={imageUrl!}
          alt={rawTitle}
          className="absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-700"
          loading="lazy"
          onError={() => setImageError(true)}
        />
      ) : (
        <img
          src="https://images.unsplash.com/photo-1548848221-0c2e497ed557?q=80&w=1600&auto=format&fit=crop"
          alt="AJVAS Gifting Confections"
          className="absolute inset-0 w-full h-full object-cover object-center"
          loading="lazy"
        />
      )}

      {/* Moderate Dark Chocolate Overlay Tint — Keeps Photograph Details Clearly Visible */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#160c08]/80 via-[#160c08]/70 to-[#160c08]/85 pointer-events-none" />

      <Container className="relative z-10">
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
          {/* Main Title Heading with font-pally and drop shadow */}
          <h2 className="font-pally text-3xl sm:text-4xl text-white mb-4 leading-tight [text-shadow:_0_2px_16px_rgba(0,0,0,0.9)]">
            {renderFormattedTitle(rawTitle)}
          </h2>

          {/* Subtitle */}
          <p className="font-subtitle text-xs sm:text-xl text-[#ffffe3] max-w-xl mx-auto mb-9 font-normal leading-relaxed [text-shadow:_0_1px_8px_rgba(0,0,0,0.8)]">
            {description}
          </p>

          {/* Primary CTA Button */}
          <div className="flex items-center justify-center w-full sm:w-auto">
            <Link href={primaryCtaLink} className="w-full sm:w-auto">
              <Button
                variant="primary"
                size="lg"
                className="w-full sm:w-auto gap-2.5 bg-[#fb0b88] hover:bg-[#d90974] text-white font-pally text-xs uppercase tracking-wider !text-sm rounded-full px-8 py-3 shadow-xl transition-all hover:scale-105 active:scale-95"
              >
                <span>{primaryCtaText}</span>
              
              </Button>
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}

