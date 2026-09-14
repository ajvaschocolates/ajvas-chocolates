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

  const validImages = images && images.length > 0 ? images : [];
  const currentImage = validImages[selectedIndex] || validImages[0];

  // Zero-image fallback state
  if (validImages.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center aspect-square sm:aspect-[4/3] lg:aspect-square bg-brand-surface rounded-2xl border border-brand-sand/80 p-8 text-center shadow-subtle">
        <div className="w-24 h-24 mb-4 flex items-center justify-center rounded-2xl bg-brand-cream/80 border border-brand-sand/60">
          <BrandLogo size="md" />
        </div>
        <p className="font-serif text-lg text-brand-espresso font-semibold">
          {productName}
        </p>
        <p className="font-sans text-xs text-brand-muted mt-1">
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

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Main Showcase Viewport */}
      <div className="relative w-full aspect-square bg-brand-surface rounded-2xl border border-brand-sand/80 overflow-hidden shadow-subtle group">
        <img
          src={currentImage.image_url}
          alt={currentImage.alt_text || productName}
          className="w-full h-full object-cover object-center transition-all duration-300"
        />

        {/* Floating Counter Badge */}
        {validImages.length > 1 && (
          <div className="absolute top-4 right-4 bg-brand-espresso/80 backdrop-blur-md text-brand-cream text-[11px] font-sans font-medium px-2.5 py-1 rounded-full shadow-sm">
            {selectedIndex + 1} / {validImages.length}
          </div>
        )}

        {/* Previous / Next Controls on Main Image */}
        {validImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-white/90 text-brand-espresso hover:text-brand-burgundy shadow-card flex items-center justify-center transition-opacity opacity-90 sm:opacity-0 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-burgundy"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next image"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-white/90 text-brand-espresso hover:text-brand-burgundy shadow-card flex items-center justify-center transition-opacity opacity-90 sm:opacity-0 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-burgundy"
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
                className={`relative w-20 h-20 min-w-[44px] min-h-[44px] rounded-xl overflow-hidden border-2 transition-all shrink-0 bg-brand-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-burgundy ${
                  isSelected
                    ? "border-brand-burgundy ring-2 ring-brand-burgundy/20 shadow-sm"
                    : "border-brand-sand/80 opacity-70 hover:opacity-100 hover:border-brand-muted"
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
