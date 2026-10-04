"use client";

import { useRef, useState, type AnimationEvent, type CSSProperties } from "react";
import { useReducedMotion } from "motion/react";

// Deterministic spread (no Math.random) so every render is identical.
const BUBBLES = Array.from({ length: 10 }, (_, index) => ({
  left: 8 + ((index * 37) % 84),
  size: 4 + (index % 3) * 2,
  rise: 90 + ((index * 53) % 70),
  delay: 0.15 + (index % 5) * 0.12,
}));

const MAX_GHOST = 140;

/**
 * The sent wish rises and fades among champagne bubbles, echoing the opener.
 * Mounted by the success state; decorative only. It leaves the DOM once the
 * wish has risen away (the longest animation; without a wish, once every
 * bubble has), and never renders under reduced motion.
 */
export function WishBubbles({ message }: { message: string | null }) {
  const reduced = useReducedMotion() ?? false;
  const [done, setDone] = useState(false);
  const bubblesEnded = useRef(0);
  if (reduced || done) return null;

  const text = message?.trim() ?? "";
  const ghost = text.length > MAX_GHOST ? `${text.slice(0, MAX_GHOST - 1)}…` : text;

  function finish(event: AnimationEvent<HTMLDivElement>) {
    if (event.animationName === "ma-ghost-rise") setDone(true);
    else if (event.animationName === "ma-bubble-rise" && !ghost) {
      bubblesEnded.current += 1;
      if (bubblesEnded.current >= BUBBLES.length) setDone(true);
    }
  }

  return (
    <div className="ma-wish-rise" data-ma-bubbles="" aria-hidden="true" onAnimationEnd={finish}>
      {ghost ? <p className="ma-wish-ghost">{ghost}</p> : null}
      {BUBBLES.map((bubble, index) => (
        <span
          key={index}
          className="ma-bubble"
          style={{
            left: `${bubble.left}%`,
            width: bubble.size,
            height: bubble.size,
            "--ma-rise": `-${bubble.rise}px`,
            animationDelay: `${bubble.delay}s`,
          } as CSSProperties}
        />
      ))}
    </div>
  );
}
