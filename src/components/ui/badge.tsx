import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "gold" | "rose" | "cyan" | "amber" | "neutral" | "dark";
}

export function Badge({
  className,
  variant = "gold",
  children,
  ...props
}: BadgeProps) {
  const variantStyles = {
    gold: "bg-brand-pink-light text-brand-pink border-brand-pink/30",
    rose: "bg-brand-pink-light text-brand-pink border-brand-pink/30",
    cyan: "bg-[#e8f8f7] text-[#00b4d8] border-[#00b4d8]/30",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    neutral: "bg-brand-sand/60 text-brand-navy border-brand-sand",
    dark: "bg-brand-navy text-white border-brand-navy",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-sans font-semibold uppercase tracking-wider rounded-full border shadow-xs",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
