"use client";

import { useEffect, useState, type RefObject } from "react";

/**
 * Watches an element until it first scrolls into view. `watching` turns
 * true only after mount and only where IntersectionObserver exists, so the
 * server markup and the first client render always agree and content is
 * never hidden in a browser that could not reveal it again.
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
    setWatching(true);
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        setSeen(true);
        observer.disconnect();
      }
    }, { rootMargin });
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, rootMargin]);

  return { watching, seen };
}
