import type { ReactNode } from "react";

export function Section({ id, labelledBy, tone = "concrete", className = "", children }: {
  id: `jk-${string}`;
  labelledBy?: string;
  tone?: "concrete" | "light" | "fog" | "night";
  className?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={labelledBy} className={`jk-section jk-surface-${tone} ${className}`}>
      <div className="jk-section-inner">{children}</div>
    </section>
  );
}
