"use client";

/**
 * Responsive hooks for Midnight Satin.
 * Client-only; use for layout and interaction decisions.
 * @see Linear THE-45
 */

import { useEffect, useState } from "react";
import { BREAKPOINTS, MEDIA_QUERIES, type ViewportSize } from "./constants";

/** Result of useViewport hook */
export interface ViewportState {
  width: number;
  height: number;
  size: ViewportSize;
  isTabletOrUp: boolean;
  isDesktopOrUp: boolean;
}

/** Result of usePointerDevice hook */
export type PointerDevice = "touch" | "mouse" | "unknown";

/**
 * Hook to observe viewport dimensions and size category.
 * Returns mobile/tablet/desktop based on Tailwind breakpoints.
 */
export function useViewport(): ViewportState {
  const [state, setState] = useState<ViewportState>(() => ({
    width: typeof window !== "undefined" ? window.innerWidth : BREAKPOINTS.md,
    height: typeof window !== "undefined" ? window.innerHeight : 768,
    size: "mobile",
    isTabletOrUp: false,
    isDesktopOrUp: false,
  }));

  useEffect(() => {
    const update = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const size: ViewportSize =
        width >= BREAKPOINTS.lg ? "desktop" : width >= BREAKPOINTS.md ? "tablet" : "mobile";
      setState({
        width,
        height,
        size,
        isTabletOrUp: width >= BREAKPOINTS.md,
        isDesktopOrUp: width >= BREAKPOINTS.lg,
      });
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return state;
}

/**
 * Hook to detect primary pointer device (touch vs mouse).
 * Uses (pointer: coarse) media query; "unknown" during SSR or when neither matches.
 */
export function usePointerDevice(): PointerDevice {
  const [device, setDevice] = useState<PointerDevice>("unknown");

  useEffect(() => {
    const coarse = window.matchMedia(MEDIA_QUERIES.touch);
    const fine = window.matchMedia(MEDIA_QUERIES.finePointer);

    const update = () => {
      if (coarse.matches) setDevice("touch");
      else if (fine.matches) setDevice("mouse");
      else setDevice("unknown");
    };

    update();
    coarse.addEventListener("change", update);
    fine.addEventListener("change", update);
    return () => {
      coarse.removeEventListener("change", update);
      fine.removeEventListener("change", update);
    };
  }, []);

  return device;
}
