import React from "react";
import { Truck, Gift, Sparkles } from "lucide-react";

export function AnnouncementBar() {
  return (
    <div className="w-full bg-[#4a1525] text-white/90 border-b border-[#5e1e30] py-2 px-4 select-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 text-[11px] sm:text-xs font-sans font-medium tracking-wide">
        {/* Left Distributed Benefits */}
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-[#fb0b88] shrink-0" />
            <span className="whitespace-nowrap">Pan India Delivery</span>
          </div>
          <span className="text-white/20 hidden sm:inline">•</span>
          <div className="hidden sm:flex items-center gap-1.5">
            <Gift className="w-3.5 h-3.5 text-[#fb0b88] shrink-0" />
            <span className="whitespace-nowrap">Beautifully Packaged</span>
          </div>
          <span className="text-white/20 hidden md:inline">•</span>
          <div className="hidden md:flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#fb0b88] shrink-0" />
            <span className="whitespace-nowrap">Premium Ingredients</span>
          </div>
        </div>

        {/* Right Free Shipping Highlight */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-white/90 font-semibold">
            Free Shipping on Orders Above ₹3,500
          </span>
        </div>
      </div>
    </div>
  );
}
