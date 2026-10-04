"use client";

import { useRef } from "react";

import { useScrollProgress } from "@/themes/shared/use-scroll-progress";

/**
 * Pagi ke senja: the sky behind the porcelain chapters warms from morning to
 * sunset with scroll progress, and a small sun sinks down the page margin.
 * `useScrollProgress` writes `--cr-day` (0–1) straight onto this element, so
 * scrolling never re-renders React; CSS turns it into one opacity and one
 * transform. Decorative.
 */
export function RivieraSky() {
  const ref = useRef<HTMLDivElement>(null);
  useScrollProgress(ref, "--cr-day");

  return (
    <div ref={ref} className="cr-sky" aria-hidden="true">
      <span className="cr-sky-dusk" />
      <svg className="cr-sun" viewBox="0 0 24 24" focusable="false">
        <circle className="cr-sun-day" cx="12" cy="12" r="11" />
        <circle className="cr-sun-dusk" cx="12" cy="12" r="11" />
      </svg>
    </div>
  );
}
