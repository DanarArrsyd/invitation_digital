import type { CSSProperties } from "react";

// Deterministic spread (no Math.random) so server and client markup match.
const BUBBLES = [
  { cx: 78, r: 1.6, dx: -10, dy: -46, delay: 0.5 },
  { cx: 82, r: 1.2, dx: 8, dy: -58, delay: 0.56 },
  { cx: 80, r: 2, dx: -2, dy: -70, delay: 0.62 },
  { cx: 76, r: 1, dx: -18, dy: -38, delay: 0.66 },
  { cx: 84, r: 1.4, dx: 16, dy: -50, delay: 0.7 },
  { cx: 79, r: 1.1, dx: -6, dy: -82, delay: 0.76 },
  { cx: 81, r: 1.7, dx: 4, dy: -64, delay: 0.8 },
  { cx: 83, r: 1, dx: 12, dy: -76, delay: 0.86 },
] as const;

/**
 * Two champagne flutes under the couple's names. When the cover opens
 * (`.ma-gate[data-opened="true"]`) CSS tilts them together to clink, pulses
 * a ring of light at the rims and lets bubbles rise. Decorative only.
 */
export function ChampagneToast() {
  return (
    <svg className="ma-toast" viewBox="0 0 160 120" fill="none" aria-hidden="true" focusable="false">
      <circle className="ma-toast-ring" cx="80" cy="14" r="10" />
      <g className="ma-flute ma-flute-left">
        <path d="M56 14h16l-1.6 38c-.4 6-3.4 9-6.4 9s-6-3-6.4-9Z" />
        <path className="ma-flute-wine" d="M57.6 30h12.8l-.9 21c-.3 4.6-2.6 7-5.5 7s-5.2-2.4-5.5-7Z" />
        <path d="M64 61v46" />
        <path d="M55 108h18" />
      </g>
      <g className="ma-flute ma-flute-right">
        <path d="M88 14h16l-1.6 38c-.4 6-3.4 9-6.4 9s-6-3-6.4-9Z" />
        <path className="ma-flute-wine" d="M89.6 30h12.8l-.9 21c-.3 4.6-2.6 7-5.5 7s-5.2-2.4-5.5-7Z" />
        <path d="M96 61v46" />
        <path d="M87 108h18" />
      </g>
      {BUBBLES.map((bubble) => (
        <circle
          key={`${bubble.cx}-${bubble.dy}`}
          className="ma-toast-bubble"
          cx={bubble.cx}
          cy="12"
          r={bubble.r}
          style={{ "--ma-dx": `${bubble.dx}px`, "--ma-dy": `${bubble.dy}px`, animationDelay: `${bubble.delay}s` } as CSSProperties}
        />
      ))}
    </svg>
  );
}
