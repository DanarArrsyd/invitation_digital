"use client";

import { motion, useReducedMotion } from "motion/react";

const DRAW_EASE = [0.45, 0, 0.2, 1] as const;
const VIEWPORT = { once: true, margin: "0px 0px -10% 0px" } as const;

/** Kawung centre: four petals around a brick-red dot, at (cx, 12). */
function petals(cx: number) {
  return [
    { cx, cy: 6.5, rx: 2.6, ry: 4.6 },
    { cx, cy: 17.5, rx: 2.6, ry: 4.6 },
    { cx: cx - 5.5, cy: 12, rx: 4.6, ry: 2.6 },
    { cx: cx + 5.5, cy: 12, rx: 4.6, ry: 2.6 },
  ];
}

/**
 * Heading rule "written" with a canting: the gold lines and the kawung
 * centre draw in once when the heading scrolls into view. Reduced motion
 * renders the finished rule. Decorative only.
 */
export function CantingRule({
  align = "center",
  tone = "gold",
}: {
  align?: "left" | "center";
  tone?: "gold" | "light";
}) {
  const reduced = useReducedMotion() ?? false;
  const stroke = tone === "gold" ? "var(--ni-gold)" : "var(--ni-gold-soft)";
  const isCenter = align === "center";
  const width = isCenter ? 240 : 120;
  const centre = isCenter ? 120 : 92;
  const lines = isCenter ? ["M4 12H100", "M140 12H236"] : ["M0 12H72"];
  const common = { fill: "none", stroke, strokeWidth: 0.9, strokeLinecap: "round" as const };

  if (reduced) {
    return (
      <svg viewBox={`0 0 ${width} 24`} className={isCenter ? "h-6 w-[min(240px,60%)]" : "h-6 w-28"} aria-hidden="true" focusable="false" data-ni-canting="static">
        {lines.map((d) => <path key={d} d={d} {...common} />)}
        {petals(centre).map((p) => <ellipse key={`${p.cx}-${p.cy}`} {...p} {...common} />)}
        <circle cx={centre} cy={12} r={1.6} fill="var(--ni-bata)" />
      </svg>
    );
  }

  return (
    <svg viewBox={`0 0 ${width} 24`} className={isCenter ? "h-6 w-[min(240px,60%)]" : "h-6 w-28"} aria-hidden="true" focusable="false" data-ni-canting="draw">
      {lines.map((d, index) => (
        <motion.path
          key={d}
          d={d}
          {...common}
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 1, transition: { duration: 1.1, ease: DRAW_EASE, delay: index * 0.15 } }}
          viewport={VIEWPORT}
        />
      ))}
      {petals(centre).map((p, index) => (
        <motion.ellipse
          key={`${p.cx}-${p.cy}`}
          {...p}
          {...common}
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 1, transition: { duration: 0.6, ease: DRAW_EASE, delay: 0.7 + index * 0.08 } }}
          viewport={VIEWPORT}
        />
      ))}
      <motion.circle
        cx={centre}
        cy={12}
        r={1.6}
        fill="var(--ni-bata)"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1, transition: { duration: 0.3, delay: 1.1 } }}
        viewport={VIEWPORT}
      />
    </svg>
  );
}
