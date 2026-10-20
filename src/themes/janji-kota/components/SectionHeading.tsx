import type { ReactNode } from "react";

export function SectionHeading({ id, title, children }: { id: string; title: string; children?: ReactNode }) {
  return (
    <header className="jk-section-heading">
      <h2 id={id}>{title}</h2>
      {children ? <div className="jk-section-intro">{children}</div> : null}
    </header>
  );
}
