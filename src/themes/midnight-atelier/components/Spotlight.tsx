"use client";

import { useRef, type ReactNode } from "react";

import { useInViewOnce } from "@/themes/shared/use-in-view-once";

/**
 * A chapter heading on the ballroom stage. Once the observer reports it below
 * the upper stage it rests dim; a warm spotlight comes up as it scrolls into
 * that band, and stays lit. Server markup and the first client render carry
 * no state, so the heading is fully lit wherever the effect cannot run, and a
 * heading already on stage at its first report is simply left lit.
 */
export function Spotlight({ className, children }: { className: string; children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const { watching, seen } = useInViewOnce(ref, "0px 0px -40% 0px");

  return (
    <header
      ref={ref}
      className={`ma-spotlight ${className}`}
      data-spot={watching ? (seen ? "lit" : "waiting") : undefined}
    >
      {children}
    </header>
  );
}
