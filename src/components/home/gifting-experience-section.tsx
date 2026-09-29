"use client";

import { useState } from "react";
import Link from "next/link";
import { HomepageSection } from "@/types/cms";
import { Container } from "@/components/ui/container";

export interface GiftingExperienceSectionProps {
  section?: HomepageSection | null;
  giftingSection?: HomepageSection | null;
  storySection?: HomepageSection | null;
}

export function GiftingExperienceSection({
  section,
  giftingSection,
  storySection,
}: GiftingExperienceSectionProps) {
  const gift = giftingSection || section;
  const story = storySection;

  // Card 1: TRUFFLES (Gifting Experience)
  const card1Title =
    gift?.eyebrow && gift.eyebrow.toUpperCase() !== "GIFT MORE THAN CHOCOLATES" && gift.eyebrow.length <= 16
      ? gift.eyebrow
      : (gift?.title && gift.title.length <= 15 ? gift.title : "TRUFFLES");
  const card1Desc =
    gift?.description ||
    "Velvety single-origin cocoa truffles handcrafted for your sweetest celebrations.";
  const card1Link = gift?.primary_cta_link || "/shop";
  const card1Image =
    gift?.image_url?.trim() ||
    "https://images.unsplash.com/photo-1549007994-cb92caebd54b?q=80&w=1000&auto=format&fit=crop";

  // Card 2: CHOCO BITES (Brand Story / Artisanal Confections)
  const card2Title =
    story?.eyebrow && story.eyebrow.toUpperCase() !== "THE AJVAS STORY" && story.eyebrow.length <= 16
      ? story.eyebrow
      : (story?.title && story.title.length <= 15 ? story.title : "CHOCO BITES");
  const card2Desc =
    story?.description ||
    "Artisanal barks, crunchy cookies and assorted confections baked to golden perfection.";
  const card2Link = story?.primary_cta_link || "/shop";
  const card2Image =
    story?.image_url?.trim() ||
    "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?q=80&w=1000&auto=format&fit=crop";

  const [img1Error, setImg1Error] = useState(false);
  const [img2Error, setImg2Error] = useState(false);

  return (
    <section
      className="w-full bg-[#120805] py-8 sm:py-12 lg:py-16"
      id="editorial-showcase"
    >
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 lg:gap-8">
          {/* Card 1: Truffles (Image on Left, Text on Right) */}
          <div className="group relative overflow-hidden rounded-sm bg-[#e5e0d8] shadow-md transition-all duration-300 hover:shadow-xl min-h-[220px] sm:min-h-[250px] lg:min-h-[270px] flex items-center">
            {/* Left Image Area */}
            <div className="absolute inset-y-0 left-0 w-1/2 sm:w-[46%] overflow-hidden">
              <img
                src={
                  img1Error
                    ? "https://images.unsplash.com/photo-1549007994-cb92caebd54b?q=80&w=1000&auto=format&fit=crop"
                    : card1Image
                }
                alt={card1Title}
                className="w-full h-full object-cover object-left group-hover:scale-105 transition-transform duration-700 ease-out"
                loading="lazy"
                onError={() => setImg1Error(true)}
              />
              {/* Soft horizontal blend into card surface */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#e5e0d8]" />
            </div>

            {/* Right Text Area */}
            <div className="relative z-10 w-full ml-auto pl-[46%] sm:pl-[44%] pr-4 sm:pr-6 lg:pr-8 py-6 sm:py-8 flex flex-col justify-center">
              <h3 className="font-serif text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-extrabold tracking-[0.05em] sm:tracking-[0.08em] text-[#1a120e] uppercase mb-1.5 sm:mb-2 whitespace-nowrap">
                {card1Title}
              </h3>
              <p className="font-serif italic text-xs sm:text-sm text-[#5a4840] leading-snug mb-3 sm:mb-4 max-w-[260px] line-clamp-2">
                {card1Desc}
              </p>
              <Link
                href={card1Link}
                className="inline-block font-serif italic text-xs sm:text-sm font-semibold text-[#d90974] hover:text-[#fb0b88] transition-colors w-fit"
              >
                Read more
              </Link>
            </div>
          </div>

          {/* Card 2: Choco Bites (Text on Left, Image on Right) */}
          <div className="group relative overflow-hidden rounded-sm bg-[#e5e0d8] shadow-md transition-all duration-300 hover:shadow-xl min-h-[220px] sm:min-h-[250px] lg:min-h-[270px] flex items-center">
            {/* Left Text Area */}
            <div className="relative z-10 w-full pr-[46%] sm:pr-[44%] pl-4 sm:pl-6 lg:pl-8 py-6 sm:py-8 flex flex-col justify-center">
              <h3 className="font-serif text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-extrabold tracking-[0.05em] sm:tracking-[0.08em] text-[#1a120e] uppercase mb-1.5 sm:mb-2 whitespace-nowrap">
                {card2Title}
              </h3>
              <p className="font-serif italic text-xs sm:text-sm text-[#5a4840] leading-snug mb-3 sm:mb-4 max-w-[260px] line-clamp-2">
                {card2Desc}
              </p>
              <Link
                href={card2Link}
                className="inline-block font-serif italic text-xs sm:text-sm font-semibold text-[#d90974] hover:text-[#fb0b88] transition-colors w-fit"
              >
                Read more
              </Link>
            </div>

            {/* Right Image Area */}
            <div className="absolute inset-y-0 right-0 w-1/2 sm:w-[46%] overflow-hidden">
              <img
                src={
                  img2Error
                    ? "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?q=80&w=1000&auto=format&fit=crop"
                    : card2Image
                }
                alt={card2Title}
                className="w-full h-full object-cover object-right group-hover:scale-105 transition-transform duration-700 ease-out"
                loading="lazy"
                onError={() => setImg2Error(true)}
              />
              {/* Soft horizontal blend into card surface */}
              <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-[#e5e0d8]" />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
