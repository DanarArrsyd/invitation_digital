import { OrnamentDivider } from "./Ornament";
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
        className="ni-display text-[clamp(2.15rem,5.4vw,3.9rem)]"
        style={tone === "light" ? { color: "var(--ni-ivory)" } : undefined}
      >
        {title}
      </h2>

      {isCenter ? (
        <OrnamentDivider tone={tone === "light" ? "light" : "gold"} />
      ) : (
        <span
          className="block h-px w-24"
          aria-hidden="true"
          style={{
            background:
              tone === "light"
                ? "linear-gradient(90deg, var(--ni-gold-soft), transparent)"
                : "linear-gradient(90deg, var(--ni-gold), transparent)",
          }}
        />
      )}
    </Reveal>
  );
}
