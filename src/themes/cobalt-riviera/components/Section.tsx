import type { ReactNode } from "react";

import { WaveDivider } from "./WaveDivider";

type RivieraTone = "cobalt" | "porcelain" | "sea-ink" | "pool";

interface SectionProps {
  id: `cr-${string}`;
  labelledBy?: string;
  tone?: RivieraTone;
  /** Two swaying wave lines at the chapter's top edge; off for the hero. */
  divider?: boolean;
  className?: string;
  children: ReactNode;
}

export function Section({
  id,
  labelledBy,
  tone = "porcelain",
  divider = true,
  className = "",
  children,
}: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={`cr-section cr-surface-${tone} ${className}`}
    >
      {divider ? <WaveDivider /> : null}
      <div className="cr-section-inner">{children}</div>
    </section>
  );
}
