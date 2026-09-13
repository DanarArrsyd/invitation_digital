"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";

/**
 * Cheap transform-only parallax for photography. Disabled entirely under
 * prefers-reduced-motion — the image simply sits still.
 */
export function Parallax({
  children,
  distance = 56,
  className,
}: {
  children: React.ReactNode;
  distance?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion() ?? false;

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [-distance, distance]);

  return (
    <div ref={ref} className={className}>
      <motion.div
        style={reduced ? undefined : { y, willChange: "transform" }}
        className="h-full w-full"
      >
        {children}
      </motion.div>
    </div>
  );
}
