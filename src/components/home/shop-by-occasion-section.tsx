"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { Category } from "@/types/catalog";
import { Container } from "@/components/ui/container";

export interface ShopByOccasionSectionProps {
  categories?: Category[];
}

export function ShopByOccasionSection({ categories }: ShopByOccasionSectionProps) {
  const [failedImageIds, setFailedImageIds] = useState<Record<string, boolean>>({});
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Curated fallback categories if CMS category array is empty
  const fallbackCategories = [
    {
      id: "cat-1",
      name: "Box Hampers",
      subtitle: "Perfect for loved ones",
      image_url: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?q=80&w=600&auto=format&fit=crop",
    },
    {
      id: "cat-2",
      name: "Trolly Hampers",
      subtitle: "Travel in sweetness",
      image_url: "https://images.unsplash.com/photo-1582293041079-7814c2f12063?q=80&w=600&auto=format&fit=crop",
    },
    {
      id: "cat-3",
      name: "Festive Specials",
      subtitle: "Celebrate with sweetness",
      image_url: "https://images.unsplash.com/photo-1548848221-0c2e497ed557?q=80&w=600&auto=format&fit=crop",
    },
    {
      id: "cat-4",
      name: "Assorted Boxes",
      subtitle: "A treat for every taste",
      image_url: "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?q=80&w=600&auto=format&fit=crop",
    },
  ];

  const displayCategories =
    categories && categories.length > 0
      ? categories.map((cat, idx) => ({
          ...cat,
          subtitle: fallbackCategories[idx % fallbackCategories.length]?.subtitle || "Handcrafted confections",
          image_url: cat.image_url || fallbackCategories[idx % fallbackCategories.length]?.image_url,
        }))
      : fallbackCategories;

  // Check if cards overflow container
  const checkOverflow = useCallback(() => {
    if (scrollRef.current) {
      const { scrollWidth, clientWidth } = scrollRef.current;
      setIsOverflowing(scrollWidth > clientWidth + 12);
    }
  }, []);

  useEffect(() => {
    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, [checkOverflow, displayCategories]);

  // Gentle auto-scroll when content overflows and user is not interacting
  useEffect(() => {
    if (!isOverflowing || isHovered) return;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const interval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 4) {
          scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          scrollRef.current.scrollBy({ left: 1, behavior: "auto" });
        }
      }
    }, 30);

    return () => clearInterval(interval);
  }, [isOverflowing, isHovered]);

  const handleScrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -320, behavior: "smooth" });
    }
  };

  const handleScrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 320, behavior: "smooth" });
    }
  };

  return (
    <section className="w-full bg-[#120805] py-14 sm:py-16 lg:py-20 border-b border-[#2d1810]" id="occasions">
      <Container>
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-10 gap-4">
          <div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#faf4f0]">
              Shop by{" "}
              <span className="font-serif italic font-normal text-amber-200">
                Occasion
              </span>
            </h2>
            <p className="font-sans text-xs sm:text-sm text-[#d0c4b8]/80 mt-1 font-normal">
              Because every moment deserves something sweeter.
            </p>
          </div>
          <div className="flex items-center gap-3 self-start sm:self-end">
            {isOverflowing && (
              <div className="hidden sm:flex items-center gap-2 mr-2">
                <button
                  type="button"
                  onClick={handleScrollLeft}
                  aria-label="Scroll categories left"
                  className="w-9 h-9 rounded-full bg-[#20100a] border border-[#3d1c12] text-[#faf4f0] hover:border-amber-200 hover:text-amber-200 flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fb0b88]"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleScrollRight}
                  aria-label="Scroll categories right"
                  className="w-9 h-9 rounded-full bg-[#20100a] border border-[#3d1c12] text-[#faf4f0] hover:border-amber-200 hover:text-amber-200 flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fb0b88]"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 font-sans text-xs uppercase tracking-widest font-bold text-amber-200 hover:text-[#fb0b88] transition-colors min-h-[44px] px-3 py-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fb0b88]"
            >
              <span>VIEW ALL</span>
              <ArrowRight className="w-4 h-4 text-[#fb0b88]" />
            </Link>
          </div>
        </div>

        {/* Dynamic Category Card Showcase: Centered when fitting, Horizontal Carousel when overflowing */}
        <div
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onTouchStart={() => setIsHovered(true)}
          onTouchEnd={() => setIsHovered(false)}
          className="relative w-full"
        >
          <div
            ref={scrollRef}
            className={`flex gap-5 sm:gap-6 overflow-x-auto pb-4 pt-1 scrollbar-none snap-x snap-mandatory ${
              isOverflowing ? "justify-start" : "justify-center flex-wrap sm:flex-nowrap"
            }`}
          >
            {displayCategories.map((item) => {
              const imageUrl = item.image_url?.trim() || null;
              const hasValidImage = Boolean(imageUrl) && !failedImageIds[item.id];
              return (
                <Link
                  key={item.id}
                  href={`/shop?category=${encodeURIComponent(item.id)}`}
                  className="group flex flex-col bg-[#1b0e0a] border border-[#3d1c12] hover:border-amber-200/50 rounded-2xl overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 w-[260px] sm:w-[320px] lg:w-[360px] shrink-0 snap-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fb0b88]"
                >
                  {/* Category Image Container */}
                  <div className="relative w-full aspect-[16/10] bg-[#140b07] overflow-hidden">
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
                        <span className="font-serif text-xs text-amber-200">AJVAS Confections</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1b0e0a] via-transparent to-transparent opacity-80" />
                  </div>

                  {/* Card Content Footer */}
                  <div className="p-5 flex items-center justify-between gap-3 bg-[#1b0e0a] flex-1 border-t border-[#2d1810]">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-serif text-lg sm:text-xl font-bold text-[#faf4f0] group-hover:text-amber-200 transition-colors leading-snug truncate">
                        {item.name}
                      </h3>
                      {item.subtitle && (
                        <p className="font-sans text-xs text-[#d0c4b8]/75 mt-0.5 line-clamp-1">
                          {item.subtitle}
                        </p>
                      )}
                    </div>
                    <span className="w-9 h-9 rounded-full bg-[#2a140d] border border-[#3d1c12] group-hover:bg-[#fb0b88] group-hover:border-[#fb0b88] text-amber-200 group-hover:text-white flex items-center justify-center shrink-0 transition-colors duration-300 shadow-sm group-hover:translate-x-0.5 transform">
                      <ArrowRight className="w-4.5 h-4.5" />
                    </span>
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
