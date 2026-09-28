"use client";

import { useState } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { Container } from "@/components/ui/container";

export function TestimonialsSection() {
  const reviews = [
    {
      id: 1,
      stars: 5,
      quote: "Beautifully packed and the taste was amazing! Perfect gift for my family!",
      author: "Fatima",
      location: "Kochi",
    },
    {
      id: 2,
      stars: 5,
      quote: "The truffles are simply heavenly. Highly recommended!",
      author: "Anju",
      location: "Bengaluru",
    },
    {
      id: 3,
      stars: 5,
      quote: "Excellent quality and presentation. Will definitely order again!",
      author: "Sameera",
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
    <section className="w-full bg-[#faf4f0] py-12 lg:py-18 border-b border-[#ebdcd3]" id="reviews">
      <Container>
        {/* Section Header */}
        <div className="flex items-end justify-between mb-8 sm:mb-10">
          <div>
            <span className="font-sans text-xs uppercase tracking-widest text-brand-pink font-bold block mb-1">
              OUR CUSTOMERS —
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-espresso">
              Loved by{" "}
              <span className="font-serif italic font-normal text-brand-pink">
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
              className="w-8 h-8 rounded-full border border-[#ebdcd3] bg-white flex items-center justify-center text-brand-espresso hover:border-brand-pink hover:text-brand-pink transition-colors shadow-xs"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next customer review"
              className="w-8 h-8 rounded-full border border-[#ebdcd3] bg-white flex items-center justify-center text-brand-espresso hover:border-brand-pink hover:text-brand-pink transition-colors shadow-xs"
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
              className="bg-white border border-[#ebdcd3] rounded-2xl p-6 shadow-xs flex flex-col justify-between"
            >
              <div>
                {/* 5 Star Rating */}
                <div className="flex items-center gap-1 text-amber-400 mb-3">
                  {[...Array(rev.stars)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 stroke-amber-400" />
                  ))}
                </div>

                {/* Review Quote */}
                <p className="font-serif italic text-base text-brand-espresso leading-relaxed mb-4">
                  &quot;{rev.quote}&quot;
                </p>
              </div>

              {/* Author & Location */}
              <div className="pt-3 border-t border-[#ebdcd3]/50 font-sans text-xs font-semibold text-brand-muted">
                {rev.author} • <span className="font-normal text-brand-muted/80">{rev.location}</span>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
