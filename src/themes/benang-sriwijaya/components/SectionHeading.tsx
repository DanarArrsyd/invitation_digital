import type { ReactNode } from "react";

export function SectionHeading({ id, title, children }: { id: string; title: string; children?: ReactNode }) {
  return (
    <header className="bs-section-heading">
      <h2 id={id}>{title}</h2>
      {children ? <div className="bs-section-intro">{children}</div> : null}
    </header>
  );
}
