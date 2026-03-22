import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PremiumIconProps {
  icon: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  gradient?: boolean;
  animated?: boolean;
  color?: "primary" | "teal" | "purple" | "amber" | "white";
  className?: string;
}

const sizeMap = {
  sm: "w-5 h-5",
  md: "w-6 h-6",
  lg: "w-8 h-8",
  xl: "w-10 h-10",
};

const colorMap = {
  primary: "text-primary",
  teal: "text-teal",
  purple: "text-purple",
  amber: "text-amber",
  white: "text-white",
};

const PremiumIcon = ({
  icon,
  size = "md",
  gradient = false,
  animated = false,
  color = "primary",
  className,
}: PremiumIconProps) => {
  const containerClasses = cn(
    "flex items-center justify-center rounded-xl transition-all duration-300",
    gradient && "bg-gradient-to-br p-2.5",
    gradient && color === "primary" && "from-primary/20 to-primary/5 group-hover:from-primary/30 group-hover:to-primary/10",
    gradient && color === "teal" && "from-teal/20 to-teal/5 group-hover:from-teal/30 group-hover:to-teal/10",
    gradient && color === "purple" && "from-purple/20 to-purple/5 group-hover:from-purple/30 group-hover:to-purple/10",
    animated && "group-hover:scale-110 group-hover:-rotate-12",
    className
  );

  const iconClasses = cn(
    sizeMap[size],
    colorMap[color],
    animated && "transition-transform duration-300"
  );

  return (
    <div className={containerClasses}>
      <div className={iconClasses}>{icon}</div>
    </div>
  );
};

export { PremiumIcon };
export type { PremiumIconProps };
