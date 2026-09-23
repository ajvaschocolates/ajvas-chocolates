import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export interface BrandLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showWordmark?: boolean;
}

export function BrandLogo({
  className,
  size = "md",
}: BrandLogoProps) {
  const heightClasses = {
    sm: "h-10 sm:h-12",
    md: "h-14 sm:h-16 lg:h-18",
    lg: "h-16 sm:h-20 lg:h-[84px]",
    xl: "h-20 sm:h-24 lg:h-28",
  };

  return (
    <div className={cn("relative inline-flex items-center shrink-0 select-none", className)}>
      <Image
        src="/ajvaslogo-png.png"
        alt="AJVAS CHOCOLATES"
        width={360}
        height={120}
        priority
        className={cn(
          heightClasses[size],
          "w-auto object-contain transition-transform duration-300 group-hover:scale-[1.02]"
        )}
      />
    </div>
  );
}

