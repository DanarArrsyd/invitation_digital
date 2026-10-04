"use client";

import { useRef, type CSSProperties } from "react";

import { useInViewOnce } from "@/themes/shared/use-in-view-once";

/**
 * A specimen label typed out once when it scrolls into view. The text is
 * always in the DOM, so screen readers and readers without JavaScript get
 * it immediately; only its visible width is revealed character by character.
 */
export function TypedText({ text }: { text: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const { watching, seen } = useInViewOnce(ref);
  const state = seen ? "typed" : watching ? "waiting" : "idle";

  return (
    <span
      ref={ref}
      className="tb-typed"
      data-typed={state}
      style={{ "--tb-chars": Math.max(1, text.length) } as CSSProperties}
    >
      {text}
    </span>
  );
}
