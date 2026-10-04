"use client";

import type { CSSProperties } from "react";
import { useReducedMotion } from "motion/react";

// Deterministic spread (no Math.random) so every render is identical.
const SEEDS = Array.from({ length: 18 }, (_, index) => ({
  angle: index * 20,
  dx: 110 + ((index * 37) % 170),
  dy: -(50 + ((index * 53) % 130)),
  delay: 0.45 + (index % 6) * 0.06,
}));

/**
 * A dandelion clock whose seeds lift away once a wish is sent — "a hope
 * carried on the wind". Mounted by the success state; decorative only.
 */
export function DandelionRelease() {
  const reduced = useReducedMotion() ?? false;
  if (reduced) return null;

  return (
    <div className="tb-dandelion" data-tb-dandelion="" aria-hidden="true">
      <span className="tb-dandelion-stalk" />
      {SEEDS.map((seed) => (
        <span
          key={seed.angle}
          className="tb-dandelion-seed"
          style={{
            "--tb-angle": `${seed.angle}deg`,
            "--tb-dx": `${seed.dx}px`,
            "--tb-dy": `${seed.dy}px`,
            animationDelay: `${seed.delay}s`,
          } as CSSProperties}
        />
      ))}
    </div>
  );
}
