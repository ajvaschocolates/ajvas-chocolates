import React from "react";
import { cn } from "@/lib/utils";

export interface BrandLogoProps {
  className?: string;
  showWordmark?: boolean;
  size?: "sm" | "md" | "lg";
}

export function BrandLogo({
  className,
  showWordmark = true,
  size = "md",
}: BrandLogoProps) {
  const iconSizes = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  };

  const titleSizes = {
    sm: "text-lg",
    md: "text-xl sm:text-2xl",
    lg: "text-2xl sm:text-3xl",
  };

  return (
    <div className={cn("flex items-center gap-3 select-none", className)}>
      {/* Precision Brand Crest Mark SVG */}
      <svg
        className={cn(iconSizes[size], "shrink-0 transition-transform duration-300 group-hover:scale-105")}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Outer Roundel Shield */}
        <circle cx="24" cy="24" r="22" fill="#2B1810" stroke="#C2A468" strokeWidth="1.5" />
        <circle cx="24" cy="24" r="19.5" fill="none" stroke="#C2A468" strokeWidth="0.75" strokeDasharray="2 2" />
        
        {/* Jewel Accents: Rose & Cyan Dots */}
        <circle cx="24" cy="7.5" r="1.5" fill="#D8677E" />
        <circle cx="24" cy="40.5" r="1.5" fill="#298C82" />
        <circle cx="7.5" cy="24" r="1.5" fill="#C2A468" />
        <circle cx="40.5" cy="24" r="1.5" fill="#C2A468" />

        {/* Central Monogram / Cocoa Crest */}
        <path
          d="M24 13L27.5 20H20.5L24 13Z"
          fill="#C2A468"
        />
        <path
          d="M20 20L15 31H18L19.5 27.5H28.5L30 31H33L28 20H20ZM21 24.5L24 17.5L27 24.5H21Z"
          fill="#FCF9F4"
        />
        <path
          d="M24 28.5C22.5 28.5 21.5 29.5 21.5 31C21.5 33 23.5 34.5 26 34.5C28.5 34.5 30.5 33 30.5 31C30.5 29.5 29.5 28.5 28 28.5H24Z"
          fill="#C2A468"
        />
      </svg>

      {/* Wordmark */}
      {showWordmark && (
        <div className="flex flex-col items-start leading-none">
          <span className={cn("font-serif font-bold tracking-tight text-brand-espresso leading-none", titleSizes[size])}>
            AJVAS
          </span>
          <span className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-brand-gold mt-1 leading-none">
            Chocolates
          </span>
        </div>
      )}
    </div>
  );
}
