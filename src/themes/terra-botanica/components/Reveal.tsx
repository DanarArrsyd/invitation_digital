import type { ReactNode } from "react";

/** Terra reserves motion for opening the cover; section content is always visible. */
export function Reveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`tb-reveal ${className}`}>{children}</div>;
}
