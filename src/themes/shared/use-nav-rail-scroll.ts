"use client";

import { useEffect, useRef } from "react";

/**
 * For a bottom bar that scrolls sideways (more items than fit a phone):
 * keeps the active item in view as the guest scrolls the page. Only the bar
 * scrolls, never the page, and nothing moves when everything already fits.
 */
export function useNavRailScroll<T extends HTMLElement>(activeId: string) {
  const railRef = useRef<T>(null);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail || rail.scrollWidth <= rail.clientWidth + 1) return;
    const item = rail.querySelector<HTMLElement>(`[data-nav-id="${CSS.escape(activeId)}"]`);
    if (!item) return;
    const target = item.offsetLeft - (rail.clientWidth - item.offsetWidth) / 2;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    rail.scrollTo({ left: Math.max(0, target), behavior: reduced ? "auto" : "smooth" });
  }, [activeId]);

  return railRef;
}
