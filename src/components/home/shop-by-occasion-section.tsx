"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Category } from "@/types/catalog";
import { Container } from "@/components/ui/container";

export interface ShopByOccasionSectionProps {
  categories?: Category[];
}

export function ShopByOccasionSection({ categories }: ShopByOccasionSectionProps) {
  const [failedImageIds, setFailedImageIds] = useState<Record<string, boolean>>({});
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Curated fallback categories if CMS category array is empty
  const fallbackCategories = [
    {
      id: "cat-1",
      name: "Box Hampers",
      image_url: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?q=80&w=600&auto=format&fit=crop",
    },
    {
      id: "cat-2",
      name: "Trolly Hampers",
      image_url: "https://images.unsplash.com/photo-1582293041079-7814c2f12063?q=80&w=600&auto=format&fit=crop",
    },
    {
      id: "cat-3",
      name: "Festive Specials",
      image_url: "https://images.unsplash.com/photo-1548848221-0c2e497ed557?q=80&w=600&auto=format&fit=crop",
    },
    {
      id: "cat-4",
      name: "Assorted Boxes",
      image_url: "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?q=80&w=600&auto=format&fit=crop",
    },
  ];

  const displayCategories =
    categories && categories.length > 0
      ? categories.map((cat, idx) => ({
          ...cat,
          image_url: cat.image_url || fallbackCategories[idx % fallbackCategories.length]?.image_url,
        }))
      : fallbackCategories;

  // Gentle auto-scroll when user is not interacting (both mobile & desktop)
  const checkOverflow = useCallback(() => {
    if (scrollRef.current) {
      const { scrollWidth, clientWidth } = scrollRef.current;
      return scrollWidth > clientWidth + 12;
    }
    return false;
  }, []);

  useEffect(() => {
    if (isHovered) return;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const interval = setInterval(() => {
      if (scrollRef.current && checkOverflow()) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 4) {
          scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          scrollRef.current.scrollBy({ left: 1, behavior: "auto" });
        }
      }
    }, 30);

    return () => clearInterval(interval);
  }, [isHovered, checkOverflow]);

  return (
    <section
      className="relative w-full py-14 sm:py-16 lg:py-20 overflow-hidden"
      id="occasions"
      style={{ backgroundImage: "url('/bg-cover.png')", backgroundSize: "cover", backgroundPosition: "center" }}
    >
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/60 pointer-events-none" />
      <Container className="relative z-10">
        {/* Section Header:
            Mobile  → left-aligned
            Desktop → centered (preserved from before) */}
        <div className="flex flex-col items-start sm:items-center text-left sm:text-center mb-6 sm:mb-10">
          <h2 className="font-heading text-3xl sm:text-4xl text-[#faf4f0]">
            Shop by{" "}
            <span className="font-heading font-normal text-amber-200">
              Occasion
            </span>
          </h2>
          <p className="font-subtitle text-xs sm:text-xl text-[#ffffe3] mt-2 font-normal tracking-wide">
            Because every moment deserves something sweeter.
          </p>
        </div>

        {/* Category Card Carousel
            Mobile  → 2 cards visible at once, horizontal scroll
            Desktop → existing layout (auto-scroll when overflowing) */}
        <div
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onTouchStart={() => setIsHovered(true)}
          onTouchEnd={() => setIsHovered(false)}
          className="relative w-full"
        >
          <div
            ref={scrollRef}
            className="flex gap-3 sm:gap-5 overflow-x-auto pb-4 pt-1 scrollbar-none snap-x snap-mandatory sm:justify-center"
          >
            {displayCategories.map((item) => {
              const imageUrl = item.image_url?.trim() || null;
              const hasValidImage = Boolean(imageUrl) && !failedImageIds[item.id];
              return (
                <Link
                  key={item.id}
                  href={`/shop?category=${encodeURIComponent(item.id)}`}
                  // Mobile: calc(50% - gap/2) so exactly 2 cards fit on screen
                  // Desktop: sm:w-[260px] lg:w-[300px] as before
                  className="group relative rounded-sm overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 w-[calc(50%-6px)] sm:w-[260px] lg:w-[300px] shrink-0 snap-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fb0b88] aspect-[4/3]"
                >
                  {/* Category Image */}
                  {hasValidImage ? (
                    <img
                      src={imageUrl!}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      loading="lazy"
                      onError={() =>
                        setFailedImageIds((prev) => ({ ...prev, [item.id]: true }))
                      }
                    />
                  ) : (
                    <div className="w-full h-full bg-[#1e0c13] flex flex-col items-center justify-center p-4 text-center">
                      <Sparkles className="w-6 h-6 text-[#fb0b88] mb-1" />
                      <span className="font-heading text-xs text-amber-200">AJVAS Confections</span>
                    </div>
                  )}

                  {/* Dark gradient overlay at bottom */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Category Name overlaid on image at bottom */}
                  <div className="absolute bottom-0 left-0 right-0 px-3 py-3 flex justify-center">
                    <h3 className="font-heading text-sm sm:text-lg text-white leading-snug text-center">
                      {item.name}
                    </h3>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}
