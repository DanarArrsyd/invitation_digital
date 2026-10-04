"use client";

import { useEffect, useState, type AnimationEvent } from "react";
import { useReducedMotion } from "motion/react";

const MAX_NOTE = 80;
// The drift ends at 3.1s; if animationend never arrives, leave anyway.
const FALLBACK_MS = 4000;

/**
 * Pesan dalam botol: the sent wish rolls up into a corked bottle that bobs on
 * a wave line and drifts out of its clipped band above the thank-you. Mounted
 * by the success state; decorative. It leaves the DOM once the bottle has
 * drifted away, and never renders under reduced motion.
 */
export function WishBottle({ message }: { message: string | null }) {
  const reduced = useReducedMotion() ?? false;
  const [done, setDone] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDone(true), FALLBACK_MS);
    return () => clearTimeout(timer);
  }, []);

  if (reduced || done) return null;

  const text = message?.trim() ?? "";
  // Never cut a surrogate pair in half.
  const note = text.length > MAX_NOTE ? `${text.slice(0, MAX_NOTE - 1).replace(/[\uD800-\uDBFF]$/, "")}…` : text;

  function finish(event: AnimationEvent<HTMLDivElement>) {
    if (event.animationName === "cr-bottle-drift") setDone(true);
  }

  return (
    <div className="cr-bottle-band" data-cr-bottle="" aria-hidden="true" onAnimationEnd={finish}>
      {note ? <p className="cr-bottle-note">{note}</p> : null}
      <svg className="cr-bottle" viewBox="0 0 64 28" focusable="false">
        <g className="cr-bottle-bob">
          <path className="cr-bottle-glass" d="M4 9h34l8-4h8v18h-8l-8-4H4a4 4 0 0 1-4-4v-2a4 4 0 0 1 4-4Z" />
          <rect className="cr-bottle-cork" x="54" y="7" width="7" height="14" />
          <rect className="cr-bottle-scroll" x="10" y="11" width="22" height="6" />
        </g>
      </svg>
      <svg className="cr-bottle-sea" viewBox="0 0 240 12" preserveAspectRatio="none" focusable="false">
        <path d="M0 6C20 0 20 0 40 6S60 12 80 6 100 0 120 6 140 12 160 6 180 0 200 6 220 12 240 6" />
      </svg>
    </div>
  );
}
