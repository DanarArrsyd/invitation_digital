import type { ReactNode } from "react";

export function Section({ id, labelledBy, tone = "paper", className = "", children }: {
  id: `rc-${string}`;
  labelledBy?: string;
  tone?: "paper" | "white" | "blush" | "ink";
  className?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={labelledBy} className={`rc-section rc-surface-${tone} ${className}`}>
      <div className="rc-section-inner">{children}</div>
    </section>
  );
}
