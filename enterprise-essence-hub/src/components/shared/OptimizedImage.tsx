import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Image as ImageIcon } from "lucide-react";

interface OptimizedImageProps {
  src?: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  placeholderGradient?: string;
  fallbackIcon?: ReactNode;
  aspectRatio?: "square" | "video" | "portrait" | "landscape" | string;
  quality?: "low" | "medium" | "high";
}

import { ReactNode } from "react";

const OptimizedImage = ({
  src,
  alt,
  className = "w-full h-full object-cover",
  containerClassName = "w-full",
  placeholderGradient = "from-muted to-muted/50",
  fallbackIcon,
  aspectRatio = "landscape",
  quality = "high",
}: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const aspectRatioMap = {
    square: "aspect-square",
    video: "aspect-video",
    portrait: "aspect-[3/4]",
    landscape: "aspect-[4/3]",
  };

  const aspectClass = aspectRatioMap[aspectRatio as keyof typeof aspectRatioMap] || aspectRatio;

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative overflow-hidden bg-gradient-to-br",
        placeholderGradient,
        aspectClass,
        containerClassName,
        "group"
      )}
    >
      {/* Skeleton loader */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gradient-to-r from-muted via-background to-muted animate-pulse" />
      )}

      {/* Image */}
      {!hasError && isInView && src && (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          className={cn(
            className,
            "transition-all duration-500",
            isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105",
            "group-hover:scale-110"
          )}
          loading="lazy"
          decoding="async"
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
        />
      )}

      {/* Fallback when no image or error */}
      {(hasError || !src) && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-muted/50 to-muted/30">
          <div className="text-center">
            {fallbackIcon ? fallbackIcon : <ImageIcon className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />}
            <p className="text-xs text-muted-foreground/40 mt-1">No image</p>
          </div>
        </div>
      )}

      {/* Gradient overlay on hover for visual interest */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  );
};

export { OptimizedImage };
export type { OptimizedImageProps };
