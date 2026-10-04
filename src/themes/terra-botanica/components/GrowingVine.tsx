"use client";

import { useRef, type CSSProperties } from "react";

import { useScrollProgress } from "@/themes/shared/use-scroll-progress";

// Leaves alternate sides of the stem; `at` is the scroll progress where each unfolds.
const LEAVES = [
  { at: 0.1, d: "M24 130c10-10 18-6 20-14-8-2-14 4-20 12Z" },
  { at: 0.24, d: "M20 290c-10-10-18-6-20-14 8-2 14 4 20 12Z" },
  { at: 0.38, d: "M24 430c10-10 18-6 20-14-8-2-14 4-20 12Z" },
  { at: 0.52, d: "M20 570c-10-10-18-6-20-14 8-2 14 4 20 12Z" },
  { at: 0.66, d: "M24 710c10-10 18-6 20-14-8-2-14 4-20 12Z" },
  { at: 0.8, d: "M20 850c-10-10-18-6-20-14 8-2 14 4 20 12Z" },
] as const;

/**
 * One climbing vine on the page edge. It grows with scroll progress, a leaf
 * unfolds at each chapter and a flower opens at the closing. Decorative.
 */
export function GrowingVine() {
  const ref = useRef<HTMLDivElement>(null);
  useScrollProgress(ref, "--tb-progress");

  return (
    <div ref={ref} className="tb-vine" aria-hidden="true">
      <svg viewBox="0 0 44 1000" preserveAspectRatio="none" focusable="false">
        <path
          className="tb-vine-stem"
          d="M22 0C6 80 38 160 22 250S6 410 22 500 38 660 22 750 6 910 22 1000"
          pathLength={1}
          vectorEffect="non-scaling-stroke"
        />
        {LEAVES.map((leaf) => (
          <path key={leaf.at} className="tb-vine-leaf" d={leaf.d} style={{ "--tb-at": leaf.at } as CSSProperties} />
        ))}
        <circle className="tb-vine-leaf tb-vine-flower" cx="22" cy="975" r="9" style={{ "--tb-at": 0.94 } as CSSProperties} />
      </svg>
    </div>
  );
}
