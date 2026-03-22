import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { analytics } from "@/integrations/api/client";

function getSessionId() {
  let sid = sessionStorage.getItem("ecc_session");
  if (!sid) {
    sid = crypto.randomUUID();
    sessionStorage.setItem("ecc_session", sid);
  }
  return sid;
}

function getDeviceType() {
  const w = window.innerWidth;
  if (w < 768) return "mobile";
  if (w < 1024) return "tablet";
  return "desktop";
}

export function usePageTracking() {
  const location = useLocation();
  const startTime = useRef(Date.now());

  useEffect(() => {
    // Skip admin routes
    if (location.pathname.startsWith("/admin")) return;

    startTime.current = Date.now();

    const trackView = async () => {
      await analytics.trackPageView(location.pathname);
    };

    const idleCallback = (window as any).requestIdleCallback as
      | ((cb: () => void, options?: { timeout: number }) => number)
      | undefined;
    const cancelIdleCallback = (window as any).cancelIdleCallback as
      | ((handle: number) => void)
      | undefined;

    if (idleCallback) {
      const handle = idleCallback(trackView, { timeout: 2500 });
      return () => cancelIdleCallback?.(handle);
    }

    const timer = window.setTimeout(trackView, 2500);
    return () => clearTimeout(timer);
  }, [location.pathname]);
}
