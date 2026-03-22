import { cn } from "@/lib/utils";

interface PageHeroBackdropProps {
  src: string;
  position?: string;
  className?: string;
  overlayClassName?: string;
}

const PageHeroBackdrop = ({
  src,
  position = "center",
  className,
  overlayClassName,
}: PageHeroBackdropProps) => {
  return (
    <>
      <div className={cn("absolute inset-0", className)} aria-hidden="true">
        <img
          src={src}
          alt=""
          className="h-full w-full object-cover"
          style={{ objectPosition: position }}
          loading="eager"
          decoding="async"
          fetchpriority="high"
        />
      </div>
      <div
        className={cn(
          "absolute inset-0 bg-[linear-gradient(180deg,rgba(4,15,38,0.3),rgba(4,15,38,0.72)_54%,rgba(4,15,38,0.9))]",
          overlayClassName,
        )}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.26),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(45,212,191,0.14),transparent_32%),linear-gradient(90deg,rgba(6,17,41,0.78),rgba(6,17,41,0.4),rgba(6,17,41,0.78))]"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 opacity-[0.09]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(148, 163, 184, 0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(148, 163, 184, 0.35) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
        aria-hidden="true"
      />
    </>
  );
};

export default PageHeroBackdrop;
