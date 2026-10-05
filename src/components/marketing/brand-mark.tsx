import { cn } from "@/lib/utils";

/** The "T" monogram and wordmark used on login, admin and the marketing site. */
export function BrandMark({ tone = "dark", className }: { tone?: "dark" | "light"; className?: string }) {
  const light = tone === "light";
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        aria-hidden="true"
        className={cn(
          "flex size-8 items-center justify-center border text-xs font-semibold tracking-[-0.03em]",
          light ? "border-white/35 text-white" : "border-tr-ink/25 text-tr-ink",
        )}
      >
        T
      </span>
      <span className={cn("text-[0.95rem] font-semibold tracking-[-0.02em]", light ? "text-white" : "text-tr-ink")}>
        Temuraya
      </span>
    </span>
  );
}
