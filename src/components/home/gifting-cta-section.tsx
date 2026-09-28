"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Gift, Sparkles, PackageCheck, Headphones } from "lucide-react";
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

  const ctaPillars = [
    { icon: Gift, title: "Unique Collections" },
    { icon: Sparkles, title: "Custom Gifting" },
    { icon: PackageCheck, title: "Bulk Orders" },
    { icon: Headphones, title: "Dedicated Support" },
  ];

  // Helper to format title with italic accent
  const renderFormattedTitle = (titleText: string) => {
    if (titleText.toLowerCase().includes("worth gifting")) {
      return (
        <>
          Find something{" "}
          <span className="font-serif italic font-normal text-amber-200">
            worth gifting.
          </span>
        </>
      );
    }
    const words = titleText.split(" ");
    if (words.length >= 2) {
      const firstPart = words.slice(0, words.length - 2).join(" ");
      const lastPart = words.slice(words.length - 2).join(" ");
      return (
        <>
          {firstPart ? `${firstPart} ` : ""}
          <span className="font-serif italic font-normal text-amber-200">
            {lastPart}
          </span>
        </>
      );
    }
    return titleText;
  };

  return (
    <section className="relative w-full bg-[#1c0d15] text-white py-14 sm:py-16 lg:py-20 overflow-hidden border-t border-[#3b1c2b]">
      {/* CMS Admin-Controlled Background Image Canvas */}
      {showBgImage && (
        <img
          src={imageUrl!}
          alt={rawTitle}
          className="absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-700"
          loading="lazy"
          onError={() => setImageError(true)}
        />
      )}

      {/* Moderate Dark Chocolate Overlay Tint — Keeps Photograph Details Clearly Visible */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1c0d15]/50 via-[#1c0d15]/40 to-[#1c0d15]/55 pointer-events-none" />

      <Container className="relative z-10">
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
          {/* Main Title Heading with drop shadow for legibility over photograph */}
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3 leading-tight [text-shadow:_0_2px_12px_rgba(0,0,0,0.8)]">
            {renderFormattedTitle(rawTitle)}
          </h2>

          {/* Subtitle */}
          <p className="font-sans text-sm sm:text-base text-white/95 max-w-xl mx-auto mb-8 font-medium leading-relaxed [text-shadow:_0_1px_8px_rgba(0,0,0,0.8)]">
            {description}
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full sm:w-auto mb-12">
            <Link href={primaryCtaLink} className="w-full sm:w-auto">
              <Button
                variant="primary"
                size="lg"
                className="w-full sm:w-auto gap-2 bg-[#fb0b88] hover:bg-[#d90974] text-white font-sans text-xs uppercase tracking-wider font-bold rounded-full px-8 py-3.5 shadow-xl transition-transform active:scale-95"
              >
                <span>{primaryCtaText}</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </Button>
            </Link>
            <Link href="/#story" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto rounded-full border-white/50 text-white bg-black/30 backdrop-blur-md hover:bg-white/20 hover:border-white/80 font-sans text-xs uppercase tracking-wider font-semibold px-7 py-3.5 shadow-md"
              >
                OUR STORY
              </Button>
            </Link>
          </div>

          {/* Bottom Features Strip inside CTA Banner */}
          <div className="w-full pt-8 border-t border-white/20 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-sans font-semibold text-white/95 [text-shadow:_0_1px_6px_rgba(0,0,0,0.8)]">
            {ctaPillars.map((item) => {
              const IconComp = item.icon;
              return (
                <div key={item.title} className="flex items-center justify-center gap-2">
                  <IconComp className="w-4 h-4 text-[#fb0b88] shrink-0" />
                  <span>{item.title}</span>
                </div>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}
