import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  badge?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  dark?: boolean;
  className?: string;
}

const SectionHeading = ({ badge, title, description, align = "center", dark = false, className }: SectionHeadingProps) => {
  return (
    <div className={cn(align === "center" ? "text-center mx-auto max-w-3xl" : "max-w-xl", className)}>
      {badge && (
        <span className={cn(
          "inline-block px-3 py-1.5 text-xs sm:text-sm font-medium rounded-full mb-4 font-display uppercase tracking-wider",
          dark ? "bg-white/10 text-white/80" : "bg-primary/10 text-primary"
        )}>
          {badge}
        </span>
      )}
      <h2 className={cn(
        "text-3xl sm:text-4xl md:text-5xl font-display font-bold tracking-tight",
        dark ? "text-white" : "text-foreground"
      )}>
        {title}
      </h2>
      {description && (
        <p className={cn("mt-4 text-base sm:text-lg md:text-xl leading-relaxed", dark ? "text-white/60" : "text-muted-foreground")}>
          {description}
        </p>
      )}
    </div>
  );
};

export default SectionHeading;
