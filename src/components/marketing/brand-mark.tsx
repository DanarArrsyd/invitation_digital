import { TemurayaMark } from "@/components/brand/temuraya-mark";
import { cn } from "@/lib/utils";

/** The gapura mark and wordmark used on the marketing site. */
export function BrandMark({ tone = "dark", className }: { tone?: "dark" | "light"; className?: string }) {
  const light = tone === "light";
  return (
    <span className={cn("inline-flex items-center gap-2.5", light ? "text-white" : "text-tr-ink", className)}>
      <TemurayaMark tone={tone} className="h-7" />
      <span className="text-[0.95rem] font-semibold tracking-[-0.02em]">Temuraya</span>
    </span>
  );
}
