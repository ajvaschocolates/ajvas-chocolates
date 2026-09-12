import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "gold" | "link";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, disabled, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-sans uppercase tracking-wider font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-burgundy focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none rounded select-none";

    const variantStyles = {
      primary:
        "bg-brand-cocoa text-brand-cream hover:bg-brand-espresso active:bg-black shadow-sm",
      secondary:
        "bg-brand-burgundy text-brand-cream hover:bg-brand-wine active:bg-brand-espresso shadow-sm",
      outline:
        "border border-brand-border text-brand-espresso bg-transparent hover:bg-brand-surface active:bg-brand-sand",
      ghost:
        "text-brand-espresso bg-transparent hover:bg-brand-surface active:bg-brand-sand",
      gold:
        "bg-brand-gold text-brand-espresso hover:bg-brand-gold-light active:bg-brand-gold shadow-sm",
      link:
        "text-brand-burgundy hover:text-brand-espresso underline-offset-4 hover:underline normal-case tracking-normal font-medium p-0 h-auto",
    };

    const sizeStyles = {
      sm: "text-xs px-3.5 py-1.5 min-h-[36px] gap-1.5",
      md: "text-xs sm:text-sm px-5 py-2.5 min-h-[44px] gap-2",
      lg: "text-sm sm:text-base px-7 py-3.5 min-h-[50px] gap-2.5",
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(baseStyles, variantStyles[variant], size !== "md" && sizeStyles[size], size === "md" && sizeStyles.md, className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
