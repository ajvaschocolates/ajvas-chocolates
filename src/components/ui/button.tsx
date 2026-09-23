import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "gold" | "link";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, disabled, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-sans uppercase tracking-wider font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none rounded-full";

    const variantStyles = {
      primary:
        "bg-brand-pink text-white hover:bg-brand-pink-hover active:scale-[0.98] shadow-sm",
      secondary:
        "bg-brand-navy text-white hover:bg-brand-navy/90 active:scale-[0.98] shadow-sm",
      outline:
        "border border-brand-navy/30 text-brand-navy bg-transparent hover:bg-brand-pink-light hover:border-brand-pink active:bg-brand-pink-light/80",
      ghost:
        "text-brand-navy bg-transparent hover:bg-brand-pink-light",
      gold:
        "bg-brand-pink text-white hover:bg-brand-pink-hover active:scale-[0.98] shadow-sm",
      link:
        "text-brand-pink hover:text-brand-navy underline-offset-4 hover:underline normal-case tracking-normal font-medium p-0 h-auto",
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
