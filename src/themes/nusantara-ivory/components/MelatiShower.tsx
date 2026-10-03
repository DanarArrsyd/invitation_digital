"use client";

import type { CSSProperties } from "react";
import { useReducedMotion } from "motion/react";

// Fixed choreography (no Math.random) so renders are deterministic.
const BLOSSOMS = [
  { left: 6, delay: 0, duration: 2.6, drift: -18, spin: 220, size: 18 },
  { left: 15, delay: 0.35, duration: 3.1, drift: 14, spin: -180, size: 15 },
  { left: 24, delay: 0.1, duration: 2.8, drift: -10, spin: 260, size: 20 },
  { left: 33, delay: 0.5, duration: 3.4, drift: 22, spin: 200, size: 16 },
  { left: 42, delay: 0.2, duration: 2.9, drift: -24, spin: -240, size: 19 },
  { left: 51, delay: 0.6, duration: 3.2, drift: 12, spin: 180, size: 14 },
  { left: 60, delay: 0.05, duration: 2.7, drift: -14, spin: 300, size: 18 },
  { left: 68, delay: 0.45, duration: 3.3, drift: 20, spin: -200, size: 16 },
  { left: 76, delay: 0.25, duration: 2.9, drift: -20, spin: 240, size: 20 },
  { left: 84, delay: 0.55, duration: 3.5, drift: 16, spin: -260, size: 15 },
  { left: 90, delay: 0.15, duration: 2.8, drift: -12, spin: 210, size: 17 },
  { left: 96, delay: 0.4, duration: 3.0, drift: 10, spin: -220, size: 14 },
] as const;

/**
 * Jasmine (melati) — the blossom of Javanese bridal garlands — drifting down
 * once after a guest confirms they will attend. Mounted by the success
 * state, so it plays exactly once per confirmation. Decorative only.
 */
export function MelatiShower() {
  const reduced = useReducedMotion() ?? false;
  if (reduced) return null;

  return (
    <div className="ni-melati" data-ni-melati="" aria-hidden="true">
      {BLOSSOMS.map((blossom, index) => (
        <svg
          key={index}
          viewBox="-10 -10 20 20"
          className="ni-melati-petal"
          style={{
            left: `${blossom.left}%`,
            width: blossom.size,
            height: blossom.size,
            animationDelay: `${blossom.delay}s`,
            animationDuration: `${blossom.duration}s`,
            "--ni-drift": `${blossom.drift}px`,
            "--ni-spin": `${blossom.spin}deg`,
          } as CSSProperties}
        >
          {[0, 72, 144, 216, 288].map((angle) => (
            <ellipse key={angle} cy={-4.6} rx={2.8} ry={4.8} transform={`rotate(${angle})`} />
          ))}
          <circle r={1.7} className="ni-melati-core" />
        </svg>
      ))}
    </div>
  );
}
