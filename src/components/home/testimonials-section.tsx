"use client";

import { useState } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { Container } from "@/components/ui/container";

export function TestimonialsSection() {
  const reviews = [
    {
      id: 1,
      stars: 5,
      quote: "Absolutely delicious! The packaging was beautiful and perfect for gifting.",
      author: "Sree M.",
      location: "Kochi",
    },
    {
      id: 2,
      stars: 5,
      quote: "Rich taste and premium quality. Ajvas never disappoints!",
      author: "Rohit R.",
      location: "Bengaluru",
    },
    {
      id: 3,
      stars: 5,
      quote: "The best chocolates for every occasion. Highly recommended!",
      author: "Fathima R.",
      location: "Calicut",
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? reviews.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === reviews.length - 1 ? 0 : prev + 1));
  };

  return (
    <section className="w-full bg-[#120805] py-14 sm:py-16 lg:py-20 border-b border-[#2d1810]" id="reviews">
      <Container>
        {/* Section Header */}
        <div className="flex items-end justify-between mb-8 sm:mb-10">
          <div>
            <span className="font-sans text-xs uppercase tracking-widest text-[#fb0b88] font-bold block mb-1">
              HAPPY CUSTOMERS —
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#faf4f0]">
              Loved by{" "}
              <span className="font-serif italic font-normal text-[#fb0b88]">
                Chocolate Lovers
              </span>
            </h2>
          </div>

          {/* Carousel Control Arrows */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous customer review"
              className="w-9 h-9 rounded-full border border-[#3d1c12] bg-[#20100a] text-[#faf4f0] hover:border-[#fb0b88] hover:text-[#fb0b88] flex items-center justify-center transition-colors shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next customer review"
              className="w-9 h-9 rounded-full border border-[#3d1c12] bg-[#20100a] text-[#faf4f0] hover:border-[#fb0b88] hover:text-[#fb0b88] flex items-center justify-center transition-colors shadow-sm"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Reviews Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-[#1b0e0a] border border-[#3d1c12] hover:border-amber-200/40 rounded-2xl p-6 shadow-md flex flex-col justify-between transition-colors duration-300"
            >
              <div>
                {/* 5 Star Rating */}
                <div className="flex items-center gap-1 text-amber-400 mb-3.5">
                  {[...Array(rev.stars)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 stroke-amber-400" />
                  ))}
                </div>

                {/* Review Quote */}
                <p className="font-serif italic text-base text-[#faf4f0] leading-relaxed mb-6 font-normal">
                  &quot;{rev.quote}&quot;
                </p>
              </div>

              {/* Author & Location */}
              <div className="pt-3.5 border-t border-[#2d1810] font-sans text-xs font-semibold text-[#d0c4b8]">
                {rev.author} • <span className="font-normal text-[#d0c4b8]/70">{rev.location}</span>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
