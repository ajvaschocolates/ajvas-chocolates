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
    gold: "bg-brand-gold/15 text-brand-gold border-brand-gold/30",
    rose: "bg-accent-rose/15 text-accent-rose border-accent-rose/30",
    cyan: "bg-accent-cyan/15 text-accent-cyan border-accent-cyan/30",
    amber: "bg-accent-amber/15 text-accent-amber border-accent-amber/30",
    neutral: "bg-brand-sand/60 text-brand-espresso border-brand-border",
    dark: "bg-brand-cocoa text-brand-cream border-brand-dark",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-sans font-semibold uppercase tracking-wider rounded border",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
