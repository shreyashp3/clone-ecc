import { Link as RouterLink, LinkProps as RouterLinkProps } from "react-router-dom";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface EnhancedLinkProps extends RouterLinkProps {
  className?: string;
  hover?: "underline" | "scale" | "glow" | "none";
}

const EnhancedLink = forwardRef<HTMLAnchorElement, EnhancedLinkProps>(
  ({ className, hover = "none", ...props }, ref) => {
    const hoverClass = {
      underline: "relative inline-block group after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-current after:transition-all after:duration-300 group-hover:after:w-full",
      scale: "transition-transform duration-200 hover:scale-105",
      glow: "transition-all duration-200 hover:text-primary hover:shadow-lg hover:shadow-primary/20",
      none: "",
    };

    return (
      <RouterLink
        ref={ref}
        className={cn(hoverClass[hover], className)}
        {...props}
      />
    );
  }
);

EnhancedLink.displayName = "EnhancedLink";

export { EnhancedLink };
