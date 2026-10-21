import type { ReactNode } from "react";

export function Section({ id, labelledBy, tone = "ground", className = "", children }: {
  id: `bs-${string}`;
  labelledBy?: string;
  tone?: "ground" | "light" | "blush" | "plum";
  className?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={labelledBy} className={`bs-section bs-surface-${tone} ${className}`}>
      <div className="bs-section-inner">{children}</div>
    </section>
  );
}
