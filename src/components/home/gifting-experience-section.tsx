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
  const eyebrow = section?.eyebrow || "OUR COLLECTIONS";
  const rawTitle = section?.title || "A Thoughtfully Curated Gifting Experience";
  const description =
    section?.description ||
    "From handcrafted truffles to assorted nuts and fruit chocolates, discover collections designed to make every occasion memorable.";
  const imageUrl =
    section?.image_url?.trim() ||
    "https://images.unsplash.com/photo-1549007994-cb92caebd54b?q=80&w=1000&auto=format&fit=crop";

  const [imageError, setImageError] = useState(false);
  const showImage = imageUrl && !imageError;

  return (
    <section className="w-full bg-[#faf4f0] py-12 lg:py-18 border-b border-[#ebdcd3]" id="gifting-experience">
      <Container>
        <div className="bg-[#fcfaf6] rounded-3xl overflow-hidden border border-[#ebdcd3] shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
            {/* Left Content Box */}
            <div className="lg:col-span-6 p-8 sm:p-12 lg:p-14 flex flex-col items-start order-2 lg:order-1">
              <span className="font-sans text-xs uppercase tracking-widest text-[#c99d52] font-bold mb-3">
                {eyebrow} —
              </span>

              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-espresso leading-tight mb-4">
                A Thoughtfully Curated{" "}
                <span className="font-serif italic font-normal text-[#c99d52]">
                  Gifting Experience
                </span>
              </h2>

              <p className="font-sans text-sm sm:text-base text-brand-muted leading-relaxed mb-8 font-normal max-w-lg">
                {description}
              </p>

              <Link href={section?.primary_cta_link || "/shop"}>
                <Button
                  variant="primary"
                  size="lg"
                  className="bg-[#4a1525] hover:bg-[#340c19] text-white font-sans text-xs uppercase tracking-wider font-bold rounded-full px-8 py-3.5 gap-2.5 shadow-md"
                >
                  <span>{section?.primary_cta_text || "EXPLORE COLLECTIONS"}</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </Button>
              </Link>
            </div>

            {/* Right Image Box */}
            <div className="lg:col-span-6 order-1 lg:order-2 relative h-64 sm:h-80 lg:h-[480px]">
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
                  <Sparkles className="w-8 h-8 text-brand-pink mb-3" />
                  <h3 className="font-serif text-2xl font-bold">AJVAS Gifting Experience</h3>
                  <p className="font-sans text-xs text-white/70 mt-1">Keepsake presentation boxes & personalized greetings</p>
                </div>
              )}

              {/* Floating Gift Tag Badge */}
              <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 bg-white/95 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border border-[#ebdcd3] shadow-md max-w-[200px] text-center hidden sm:block">
                <p className="font-serif italic text-xs font-semibold text-[#4a1525]">
                  &quot;A little sweetness for your special moments ♥&quot;
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
