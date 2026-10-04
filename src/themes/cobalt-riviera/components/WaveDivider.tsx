"use client";

import { useEffect, useRef } from "react";

/** A gentle sine across `width` units at height `y`: one crest and one trough per 50 units. */
function wave(y: number, width = 400): string {
  let d = `M0 ${y}C12.5 ${y - 5} 12.5 ${y - 5} 25 ${y}`;
  for (let x = 25; x < width; x += 25) {
    const control = (x / 25) % 2 === 1 ? y + 5 : y - 5;
    d += `S${x + 12.5} ${control} ${x + 25} ${y}`;
  }
  return d;
}

// Computed once at module load, so server and client markup are identical.
const LINE_A = wave(8);
const LINE_B = wave(12);

/**
 * Ombak pembatas: two wave lines at the top edge of a chapter. They sway only
 * while the divider is on screen; the observer writes `data-sway` straight onto
 * the element, so scrolling never re-renders React, and the server markup has
 * no attribute, so the lines rest still wherever the observer cannot run.
 */
export function WaveDivider() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver((entries) => {
      element.dataset.sway = entries.some((entry) => entry.isIntersecting) ? "on" : "off";
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="cr-divider" aria-hidden="true">
      <svg viewBox="0 0 400 20" preserveAspectRatio="none" focusable="false">
        <path className="cr-divider-line cr-divider-line-a" d={LINE_A} />
        <path className="cr-divider-line cr-divider-line-b" d={LINE_B} />
      </svg>
    </div>
  );
}
