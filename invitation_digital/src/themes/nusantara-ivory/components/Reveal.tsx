"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion, type Variants } from "motion/react";

type RevealVariant = "up" | "fade" | "mask" | "left" | "right";

const EASE = [0.22, 0.61, 0.36, 1] as const;
const VIEWPORT = { once: true, margin: "0px 0px -12% 0px" } as const;

function buildVariants(variant: RevealVariant, reduced: boolean, delay = 0): Variants {
  if (reduced) {
    return {
      hidden: { opacity: 1 },
      visible: { opacity: 1, x: 0, y: 0, clipPath: "inset(0% 0% 0% 0%)", transition: { duration: 0 } },
    };
  }

  const base = { duration: 0.75, ease: EASE, delay };

  switch (variant) {
    case "fade":
      return { hidden: { opacity: 0 }, visible: { opacity: 1, transition: base } };
    case "left":
      return {
        hidden: { opacity: 0, x: -28 },
        visible: { opacity: 1, x: 0, transition: base },
      };
    case "right":
      return {
        hidden: { opacity: 0, x: 28 },
        visible: { opacity: 1, x: 0, transition: base },
      };
    case "mask":
      return {
        hidden: { opacity: 0, clipPath: "inset(14% 0% 14% 0%)" },
        visible: {
          opacity: 1,
          clipPath: "inset(0% 0% 0% 0%)",
          transition: { duration: 1.05, ease: EASE, delay },
        },
      };
    case "up":
    default:
      return {
        hidden: { opacity: 0, y: 26 },
        visible: { opacity: 1, y: 0, transition: base },
      };
  }
}

/**
 * Fail-safe visibility: content must never be left invisible because a
 * scroll trigger did not fire. Anything already within (or above) the
 * viewport shortly after mount is revealed regardless of the observer.
 */
function useShouldReveal(ref: React.RefObject<HTMLElement | null>) {
  const inView = useInView(ref, VIEWPORT);
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    if (settled) return;
    const check = () => {
      const el = ref.current;
      if (!el) return;
      if (el.getBoundingClientRect().top < window.innerHeight * 0.98) setSettled(true);
    };
    // Scroll/resize fallback for environments where IntersectionObserver or
    // requestAnimationFrame are delayed or skipped (fast jumps, throttled tabs).
    // Read-only rect check, removed as soon as the element has revealed.
    check();
    const timer = window.setTimeout(check, 300);
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check, { passive: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, [ref, settled]);

  return inView || settled;
}

/**
 * Scroll-triggered reveal. Fires once so returning to a section never
 * re-animates, and collapses to an instant show under prefers-reduced-motion.
 */
export function Reveal({
  children,
  variant = "up",
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  variant?: RevealVariant;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion() ?? false;
  const show = useShouldReveal(ref);

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={buildVariants(variant, reduced, delay)}
      initial="hidden"
      animate={show || reduced ? "visible" : "hidden"}
    >
      {children}
    </motion.div>
  );
}

/** Stagger container — children animate in sequence when the group enters. */
export function Stagger({
  children,
  className,
  gap = 0.09,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  gap?: number;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion() ?? false;
  const show = useShouldReveal(ref);

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={show || reduced ? "visible" : "hidden"}
      variants={{
        hidden: {},
        visible: {
          transition: reduced
            ? { staggerChildren: 0, delayChildren: 0 }
            : { staggerChildren: gap, delayChildren: delay },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
  variant = "up",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: RevealVariant;
}) {
  const reduced = useReducedMotion() ?? false;

  return (
    <motion.div className={className} variants={buildVariants(variant, reduced)}>
      {children}
    </motion.div>
  );
}
