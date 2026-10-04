"use client";

import { useEffect, type RefObject } from "react";

/** Page scroll position as 0–1; an unscrollable page counts as complete. */
export function scrollProgress(scrollTop: number, scrollHeight: number, viewportHeight: number): number {
  const range = scrollHeight - viewportHeight;
  if (range <= 0) return 1;
  return Math.min(1, Math.max(0, scrollTop / range));
}

/**
 * Writes the page's scroll progress to `property` on `target`, at most once
 * per animation frame. CSS reads the custom property, so scrolling never
 * re-renders React.
 */
export function useScrollProgress(target: RefObject<HTMLElement | null>, property: string): void {
  useEffect(() => {
    const element = target.current;
    if (!element) return;
    let frame = 0;
    const write = () => {
      frame = 0;
      const progress = scrollProgress(window.scrollY, document.documentElement.scrollHeight, window.innerHeight);
      element.style.setProperty(property, progress.toFixed(4));
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(write);
    };
    write();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [target, property]);
}
