import { CantingRule } from "./CantingRule";
import { Reveal } from "./Reveal";

/**
 * Editorial section heading. Defaults to left-aligned so sections stop
 * repeating the same centered-stack rhythm; `align="center"` stays available
 * for the few moments that genuinely want symmetry.
 */
export function SectionHeading({
  eyebrow,
  title,
  align = "left",
  tone = "dark",
  className = "",
}: {
  eyebrow?: string;
  title: string;
  align?: "left" | "center";
  tone?: "dark" | "light";
  className?: string;
}) {
  const isCenter = align === "center";

  return (
    <Reveal
      className={`flex flex-col gap-4 ${isCenter ? "items-center text-center" : "items-start text-left"} ${className}`}
    >
      {eyebrow ? (
        <p className="ni-eyebrow" style={tone === "light" ? { color: "var(--ni-gold-soft)" } : undefined}>
          {eyebrow}
        </p>
      ) : null}

      <h2
        className="ni-display text-[clamp(1.8rem,4.6vw,3.2rem)]"
        style={tone === "light" ? { color: "var(--ni-ivory)" } : undefined}
      >
        {title}
      </h2>

      <CantingRule align={isCenter ? "center" : "left"} tone={tone === "light" ? "light" : "gold"} />
    </Reveal>
  );
}
