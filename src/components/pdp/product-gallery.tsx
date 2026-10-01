"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductImage } from "@/types/catalog";
import { BrandLogo } from "@/components/layout/brand-logo";

interface ProductGalleryProps {
  images?: ProductImage[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  const validImages = images && images.length > 0 ? images : [];
  const currentImage = validImages[selectedIndex] || validImages[0];

  // Zero-image fallback state
  if (validImages.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center aspect-square sm:aspect-[4/3] lg:aspect-square bg-[#1f110c] rounded-sm border border-[#3d1c12] p-8 text-center shadow-2xl">
        <div className="w-24 h-24 mb-4 flex items-center justify-center rounded-sm bg-[#140b07] border border-[#3d1c12]">
          <BrandLogo size="md" />
        </div>
        <p className="font-pally text-lg text-[#faf4f0] font-semibold">
          {productName}
        </p>
        <p className="font-sans text-xs text-[#a39085] mt-1">
          Product image unavailable
        </p>
      </div>
    );
  }

  const handlePrev = () => {
    setSelectedIndex((prev) => (prev === 0 ? validImages.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev === validImages.length - 1 ? 0 : prev + 1));
  };

  // Touch swipe support for mobile
  const minSwipeDistance = 40;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEndX(null);
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStartX || !touchEndX) return;
    const distance = touchStartX - touchEndX;
    if (distance > minSwipeDistance) {
      handleNext();
    } else if (distance < -minSwipeDistance) {
      handlePrev();
    }
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Main Showcase Viewport */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="relative w-full aspect-square bg-[#1f110c] rounded-sm border border-[#3d1c12] overflow-hidden shadow-2xl group select-none touch-pan-y"
      >
        <img
          src={currentImage.image_url}
          alt={currentImage.alt_text || productName}
          className="w-full h-full object-cover object-center transition-all duration-300 pointer-events-none"
        />

        {/* Floating Counter Badge */}
      


        {/* Previous / Next Controls on Main Image - hidden on mobile, shown on desktop hover */}
        {validImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous image"
              className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 min-w-[44px] min-h-[44px] rounded-sm bg-[#1b0e0a]/90 text-[#faf4f0] hover:text-[#fb0b88] border border-[#3d1c12] shadow-xl items-center justify-center transition-opacity opacity-0 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fb0b88]"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next image"
              className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 min-w-[44px] min-h-[44px] rounded-sm bg-[#1b0e0a]/90 text-[#faf4f0] hover:text-[#fb0b88] border border-[#3d1c12] shadow-xl items-center justify-center transition-opacity opacity-0 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fb0b88]"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail Selector Strip */}
      {validImages.length > 1 && (
        <div
          className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none"
          role="region"
          aria-label="Product image thumbnails"
        >
          {validImages.map((img, idx) => {
            const isSelected = idx === selectedIndex;
            return (
              <button
                key={img.id || idx}
                type="button"
                onClick={() => setSelectedIndex(idx)}
                aria-label={`View product image ${idx + 1} of ${validImages.length}`}
                aria-current={isSelected ? "true" : undefined}
                className={`relative w-20 h-20 min-w-[44px] min-h-[44px] rounded-sm overflow-hidden border-2 transition-all shrink-0 bg-[#1f110c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c99d52] ${
                  isSelected
                    ? "border-[#c99d52] ring-2 ring-[#c99d52]/30 shadow-md"
                    : "border-[#3d1c12] opacity-60 hover:opacity-100 hover:border-[#a39085]"
                }`}
              >
                <img
                  src={img.image_url}
                  alt={img.alt_text || `${productName} thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover object-center"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
