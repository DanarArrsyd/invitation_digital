import { FloralCorner } from "./Botanical";

/**
 * Section shell — owns its own background so the page rhythm never depends on
 * how many optional sections happen to be enabled. Any section can be toggled
 * off without leaving an orphaned band of colour behind.
 */
export function Section({
  children,
  tone = "ivory",
  lattice = false,
  className = "",
  innerClassName = "",
  wide = false,
  floral = false,
}: {
  children: React.ReactNode;
  tone?: "ivory" | "cream" | "dark";
  lattice?: boolean;
  className?: string;
  innerClassName?: string;
  wide?: boolean;
  floral?: boolean;
}) {
  const toneClass =
    tone === "dark"
      ? "ni-panel-dark"
      : tone === "cream"
        ? "ni-panel-cream"
        : "bg-[var(--ni-ivory)]";

  return (
    <section
      className={`ni-grain relative isolate overflow-hidden ${toneClass} ${className}`}
      style={{ paddingBlock: "var(--ni-section-y)" }}
    >
      {floral ? <FloralCorner className="ni-floral-edge" /> : null}
      {lattice ? <div className="ni-lattice absolute inset-0 opacity-[0.35]" aria-hidden="true" /> : null}

      <div
        className={`relative mx-auto w-full ${wide ? "max-w-[1440px]" : "max-w-[1280px]"} ${innerClassName}`}
        style={{ paddingInline: "var(--ni-gutter)" }}
      >
        {children}
      </div>
    </section>
  );
}
