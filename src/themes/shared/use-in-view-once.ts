"use client";

import { useEffect, useState, type RefObject } from "react";

/**
 * Watches an element until it first scrolls into view. Nothing changes
 * during render, so the server markup and the first client render always
 * agree. `watching` turns true only once the observer has reported the
 * element off-screen, so callers may hide it then and reveal it on `seen`.
 * An element already on screen at its first report is `seen` without ever
 * `watching`: callers show it as it is, with no hide-then-reveal flash.
 * Without IntersectionObserver both stay false and nothing is hidden.
 */
export function useInViewOnce(
  ref: RefObject<Element | null>,
  rootMargin = "0px 0px -10% 0px",
): { watching: boolean; seen: boolean } {
  const [watching, setWatching] = useState(false);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        setSeen(true);
        observer.disconnect();
      } else {
        setWatching(true);
      }
    }, { rootMargin });
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, rootMargin]);

  return { watching, seen };
}
