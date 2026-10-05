import type { ReactNode } from "react";

type KelirTone = "kelir" | "kelir-deep" | "malam";

interface SectionProps {
  id: `kk-${string}`;
  labelledBy?: string;
  tone?: KelirTone;
  className?: string;
  children: ReactNode;
}

export function Section({ id, labelledBy, tone = "kelir", className = "", children }: SectionProps) {
  return (
    <section id={id} aria-labelledby={labelledBy} className={`kk-section kk-surface-${tone} ${className}`}>
      <div className="kk-section-inner">{children}</div>
    </section>
  );
}
