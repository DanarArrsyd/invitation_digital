import type { ReactNode } from "react";

export function Section({ id, labelledBy, tone = "ink", className = "", children }: {
  id: `ma-${string}`;
  labelledBy?: string;
  tone?: "ink" | "lacquer" | "oxblood" | "pearl";
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={`ma-section ma-surface-${tone} ${className}`}
    >
      <div className="ma-section-inner">{children}</div>
    </section>
  );
}
