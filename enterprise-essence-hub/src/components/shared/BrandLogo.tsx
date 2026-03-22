import type { BrandLogoKey } from "@/components/shared/brandLogoRegistry";
import { brandLogoMap } from "@/components/shared/brandLogoRegistry";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  logoKey: BrandLogoKey;
  name: string;
  className?: string;
}

export default function BrandLogo({ logoKey, name, className }: BrandLogoProps) {
  const logo = brandLogoMap[logoKey];

  if (logo.type === "asset") {
    return (
      <img
        src={logo.src}
        alt={name}
        loading="lazy"
        decoding="async"
        className={cn("h-full w-auto max-w-full object-contain", className)}
      />
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      role="img"
      aria-label={name}
      className={cn("h-full w-auto max-w-full", className)}
      style={{ color: `#${logo.icon.hex}` }}
    >
      <title>{name}</title>
      <path fill="currentColor" d={logo.icon.path} />
    </svg>
  );
}
