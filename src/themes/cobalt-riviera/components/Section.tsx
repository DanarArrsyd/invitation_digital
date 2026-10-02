import type { ReactNode } from "react";

type RivieraTone = "cobalt" | "porcelain" | "sea-ink" | "pool";

interface SectionProps {
  id: `cr-${string}`;
  labelledBy?: string;
  tone?: RivieraTone;
  className?: string;
  children: ReactNode;
}

export function Section({
  id,
  labelledBy,
  tone = "porcelain",
  className = "",
  children,
}: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={`cr-section cr-surface-${tone} ${className}`}
    >
      <div className="cr-section-inner">{children}</div>
    </section>
  );
}
