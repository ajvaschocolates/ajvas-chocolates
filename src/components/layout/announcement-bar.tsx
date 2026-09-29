import React from "react";
import { Truck, Gift, Sparkles, Heart } from "lucide-react";

export function AnnouncementBar() {
  return (
    <div className="w-full bg-[#3d101e] text-[#faf4f0] border-b border-[#5e1e30] py-2 px-4 select-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 text-[11px] sm:text-xs font-sans font-medium tracking-wide">
        {/* Left Distributed Benefits */}
        <div className="flex items-center gap-3 sm:gap-5">
          <div className="flex items-center gap-1.5 text-amber-200/90">
            <Truck className="w-3.5 h-3.5 text-[#fb0b88] shrink-0" />
            <span className="whitespace-nowrap font-medium text-[#fcfaf6]">Free shipping across India on orders above ₹3,500</span>
          </div>
          <span className="text-[#c99d52]/40 hidden md:inline">•</span>
          <div className="hidden md:flex items-center gap-1.5 text-amber-200/90">
            <Gift className="w-3.5 h-3.5 text-[#fb0b88] shrink-0" />
            <span className="whitespace-nowrap text-[#fcfaf6]/90">Beautifully Packaged</span>
          </div>
          <span className="text-[#c99d52]/40 hidden lg:inline">•</span>
          <div className="hidden lg:flex items-center gap-1.5 text-amber-200/90">
            <Sparkles className="w-3.5 h-3.5 text-[#fb0b88] shrink-0" />
            <span className="whitespace-nowrap text-[#fcfaf6]/90">Premium Ingredients</span>
          </div>
        </div>

        {/* Right Tagline Highlight */}
        <div className="flex items-center gap-1.5 shrink-0 text-amber-200 font-serif italic text-xs sm:text-sm">
          <span>A little sweetness for every special moment.</span>
          <Heart className="w-3 h-3 fill-[#fb0b88] text-[#fb0b88] inline shrink-0" />
        </div>
      </div>
    </div>
  );
}

