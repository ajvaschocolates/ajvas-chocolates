"use client";

import { useState, useEffect } from "react";
import { Container } from "@/components/ui/container";
import { HomepageSection, TestimonialItem, TestimonialsSectionData } from "@/types/cms";
import {
  DEFAULT_LEFT_IMAGE,
  DEFAULT_RIGHT_IMAGE,
  DEFAULT_TESTIMONIALS,
} from "@/lib/constants/testimonials";

export interface TestimonialsSectionProps {
  section?: HomepageSection | null;
}

export function TestimonialsSection({ section }: TestimonialsSectionProps) {
  // Extract content from section prop if provided
  const content = (section?.content_json as TestimonialsSectionData) || null;

  const leftImageUrl =
    content?.left_image_url?.trim() || DEFAULT_LEFT_IMAGE;
  const rightImageUrl =
    content?.right_image_url?.trim() || DEFAULT_RIGHT_IMAGE;

  const allReviews: TestimonialItem[] =
    content?.testimonials && content.testimonials.length > 0
      ? content.testimonials
      : DEFAULT_TESTIMONIALS;

  // Filter only active reviews for display
  const reviews = allReviews.filter((r) => r.status !== "inactive");
  const displayReviews = reviews.length > 0 ? reviews : DEFAULT_TESTIMONIALS;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-cycle through reviews every 6 seconds
  useEffect(() => {
    if (isPaused || displayReviews.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displayReviews.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaused, displayReviews.length]);

  const activeReview = displayReviews[currentIndex] || displayReviews[0];

  return (
    <section
      className="w-full bg-[#120805] py-8 sm:py-10 lg:py-12"
      id="reviews"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 items-stretch">
          {/* Left Decorative Image (Round Chocolate Gift Tin) - Desktop Only */}
          <div className="hidden lg:block relative rounded-sm overflow-hidden shadow-xl lg:h-[290px] bg-[#1a0e09]">
            <img
              src={leftImageUrl}
              alt="Artisanal chocolate gift tin"
              className="w-full h-full object-cover object-center transition-transform duration-700 hover:scale-105"
              loading="lazy"
            />
          </div>

          {/* Center Testimonial Card */}
          <div className="relative rounded-sm bg-[#1e1b19] p-4 sm:p-5 lg:p-6 flex flex-col justify-between items-center text-center shadow-xl h-auto min-h-[250px] sm:min-h-[270px] lg:h-[290px] border border-white/5 w-full">
            {/* Top: Customer Avatar with Terracotta Ring */}
            <div className="pt-1">
              <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-[#d97746] shadow-md mx-auto shrink-0 bg-[#2b1810]">
                {activeReview.avatar_url ? (
                  <img
                    src={activeReview.avatar_url}
                    alt={activeReview.author}
                    className="w-full h-full object-cover transition-opacity duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-serif text-lg font-bold text-amber-200">
                    {activeReview.author.charAt(0)}
                  </div>
                )}
              </div>
            </div>

            {/* Middle: Quotation Mark & Review Quote */}
            <div className="my-auto py-2 px-2 sm:px-3 max-w-sm sm:max-w-md flex items-start gap-2.5 sm:gap-3 text-left">
              <span className="font-serif text-2xl sm:text-3xl text-[#d97746] leading-none select-none shrink-0 font-bold">
                “
              </span>
              <div className="flex-1">
                <p className="font-sans text-xs sm:text-[13px] text-[#e8ded6] leading-relaxed transition-opacity duration-300 line-clamp-3">
                  {activeReview.quote}
                </p>
                {(activeReview.author || activeReview.location) && (
                  <p className="mt-2 font-serif text-[11px] font-semibold text-amber-200/90 tracking-wide">
                    — {activeReview.author}
                    {activeReview.location && (
                      <span className="text-white/60 font-sans font-normal text-[10px] ml-1.5">
                        ({activeReview.location})
                      </span>
                    )}
                  </p>
                )}
              </div>
            </div>

            {/* Bottom: Dash / Pill Carousel Indicators */}
            <div className="flex items-center justify-center gap-1.5 pb-1">
              {displayReviews.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  aria-label={`Go to review ${idx + 1}`}
                  className={`h-1 transition-all duration-300 rounded-full ${idx === currentIndex
                    ? "w-6 sm:w-7 bg-[#d97746]"
                    : "w-3.5 sm:w-4 bg-white/30 hover:bg-white/60"
                    }`}
                />
              ))}
            </div>
          </div>

          {/* Right Decorative Image (Golden Truffles in Glass) - Desktop Only */}
          <div className="hidden lg:block relative rounded-sm overflow-hidden shadow-xl lg:h-[290px] bg-[#1a0e09]">
            <img
              src={rightImageUrl}
              alt="Golden chocolate truffles confections"
              className="w-full h-full object-cover object-center transition-transform duration-700 hover:scale-105"
              loading="lazy"
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
