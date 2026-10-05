import { cn } from "@/lib/utils";

/**
 * The Temuraya mark: a double gapura (gateway) framing a "T", with a brass
 * star at the apex for the moment everyone gathers. Lines follow
 * `currentColor`; the star takes the brass tone that reads on the background.
 * Same geometry as src/app/icon.svg, cropped to the drawing.
 */
export function TemurayaMark({
  tone = "dark",
  className,
}: {
  /** "dark" for ink on paper, "light" for paper on forest. */
  tone?: "dark" | "light";
  className?: string;
}) {
  return (
    <svg
      viewBox="11 4 42 48"
      aria-hidden="true"
      focusable="false"
      className={cn("h-8 w-auto shrink-0", className)}
    >
      <path d="M13.5 51V33a18.5 18.5 0 0 1 37 0v18" fill="none" stroke="currentColor" strokeOpacity=".5" strokeWidth="1.8" />
      <path d="M20 51V33a12 12 0 0 1 24 0v18" fill="none" stroke="currentColor" strokeWidth="3.2" />
      <path d="M25.5 34.5h13M32 34.5V51" fill="none" stroke="currentColor" strokeWidth="3.2" />
      <path
        d="M32 5.5l2.6 3.9L32 13.3l-2.6-3.9z"
        className={tone === "light" ? "fill-tr-brass-soft" : "fill-tr-brass"}
      />
    </svg>
  );
}
