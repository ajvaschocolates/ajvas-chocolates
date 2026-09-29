"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { HomepageSection } from "@/types/cms";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

export interface GiftingExperienceSectionProps {
  section?: HomepageSection | null;
}

export function GiftingExperienceSection({ section }: GiftingExperienceSectionProps) {
  const eyebrow = section?.eyebrow || "GIFT MORE THAN CHOCOLATES";
  const rawTitle = section?.title || "A Thoughtfully Curated Gifting Experience";
  const description =
    section?.description ||
    "Beautifully packed hampers for birthdays, anniversaries, festivals and every special moment.";
  const imageUrl =
    section?.image_url?.trim() ||
    "https://images.unsplash.com/photo-1549007994-cb92caebd54b?q=80&w=1000&auto=format&fit=crop";

  const [imageError, setImageError] = useState(false);
  const showImage = imageUrl && !imageError;

  // Render title with dynamic italic accent helper
  const renderFormattedTitle = (titleText: string) => {
    if (!titleText) return null;
    const lower = titleText.toLowerCase();
    if (lower.includes("gifting experience")) {
      const idx = titleText.toLowerCase().indexOf("gifting experience");
      const firstPart = titleText.substring(0, idx);
      const accentPart = titleText.substring(idx);
      return (
        <>
          {firstPart}
          <span className="font-serif italic font-normal text-amber-200">
            {accentPart}
          </span>
        </>
      );
    }
    const words = titleText.trim().split(/\s+/);
    if (words.length >= 3) {
      const firstPart = words.slice(0, words.length - 2).join(" ");
      const lastPart = words.slice(words.length - 2).join(" ");
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
    <section className="w-full bg-[#120805] py-14 sm:py-16 lg:py-20 border-b border-[#2d1810]" id="gifting-experience">
      <Container>
        <div className="bg-[#1e0c13] rounded-3xl overflow-hidden border border-[#3d1c22] shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
            {/* Left Content Box */}
            <div className="lg:col-span-6 p-8 sm:p-12 lg:p-14 flex flex-col items-start order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 mb-3">
                <span className="w-4 h-[1.5px] bg-amber-200" />
                <span className="font-sans text-xs uppercase tracking-widest text-amber-200 font-bold">
                  {eyebrow}
                </span>
              </div>

              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#faf4f0] leading-tight mb-4">
                {renderFormattedTitle(rawTitle)}
              </h2>

              <p className="font-sans text-sm sm:text-base text-[#d0c4b8]/85 leading-relaxed mb-8 font-normal max-w-lg">
                {description}
              </p>

              <Link href={section?.primary_cta_link || "/shop"}>
                <Button
                  variant="primary"
                  size="lg"
                  className="bg-[#fb0b88] hover:bg-[#d90974] text-white font-sans text-xs uppercase tracking-wider font-bold rounded-full px-8 py-3.5 gap-2.5 shadow-lg transition-transform hover:scale-105"
                >
                  <span>{section?.primary_cta_text || "EXPLORE GIFT HAMPERS"}</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </Button>
              </Link>
            </div>

            {/* Right Image Box */}
            <div className="lg:col-span-6 order-1 lg:order-2 relative h-72 sm:h-80 lg:h-[500px]">
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
                  <Sparkles className="w-8 h-8 text-[#fb0b88] mb-3" />
                  <h3 className="font-serif text-2xl font-bold text-amber-200">AJVAS Gifting Experience</h3>
                  <p className="font-sans text-xs text-white/70 mt-1">Keepsake presentation boxes &amp; personalized greetings</p>
                </div>
              )}

              {/* Floating Gift Tag Badge */}
              <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 bg-[#160c08]/90 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border border-amber-200/40 shadow-xl max-w-[210px] text-center hidden sm:block">
                <p className="font-serif italic text-xs font-semibold text-amber-200">
                  &quot;A little sweetness for your special moments ❤️&quot;
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
