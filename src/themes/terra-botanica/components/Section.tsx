import type { ReactNode } from "react";

export function Section({ id, labelledBy, tone = "linen", className = "", children }: {
  id: `tb-${string}`;
  labelledBy?: string;
  tone?: "linen" | "bone" | "clay" | "moss";
  className?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={labelledBy} className={`tb-section tb-surface-${tone} ${className}`}>
      <div className="tb-section-inner">{children}</div>
    </section>
  );
}
