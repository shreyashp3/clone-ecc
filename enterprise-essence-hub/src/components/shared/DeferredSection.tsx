import { startTransition, useEffect, useRef, useState } from "react";

type DeferredSectionProps = {
  children: React.ReactNode;
  rootMargin?: string;
  minHeight?: number;
  className?: string;
};

const DeferredSection = ({ children, rootMargin = "300px 0px", minHeight = 320, className }: DeferredSectionProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isVisible) return;

    const node = containerRef.current;
    if (!node) return;

    const reveal = () => {
      startTransition(() => setIsVisible(true));
    };

    if (!("IntersectionObserver" in window)) {
      reveal();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          reveal();
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    observer.observe(node);

    const idleCallback = (window as any).requestIdleCallback as
      | ((cb: () => void, options?: { timeout: number }) => number)
      | undefined;
    const cancelIdleCallback = (window as any).cancelIdleCallback as
      | ((handle: number) => void)
      | undefined;

    let idleHandle: number | null = null;
    if (idleCallback) {
      idleHandle = idleCallback(reveal, { timeout: 2500 });
    } else {
      idleHandle = window.setTimeout(reveal, 2500);
    }

    return () => {
      observer.disconnect();
      if (idleHandle !== null) {
        if (idleCallback && cancelIdleCallback) {
          cancelIdleCallback(idleHandle);
        } else {
          window.clearTimeout(idleHandle);
        }
      }
    };
  }, [isVisible, rootMargin]);

  return (
    <div ref={containerRef} className={className} style={{ minHeight }}>
      {isVisible ? children : null}
    </div>
  );
};

export default DeferredSection;
