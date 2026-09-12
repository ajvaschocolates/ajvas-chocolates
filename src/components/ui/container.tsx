import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType;
}

export const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, as: Component = "div", children, ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={cn("w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", className)}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Container.displayName = "Container";
