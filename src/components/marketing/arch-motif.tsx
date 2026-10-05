import { cn } from "@/lib/utils";

/** The thin arch outlines from the login page; purely decorative. */
export function ArchMotif({ className, tone = "light" }: { className?: string; tone?: "light" | "dark" }) {
  const line = tone === "light" ? "border-white/12" : "border-tr-ink/10";
  return (
    <div aria-hidden="true" className={cn("pointer-events-none absolute", className)}>
      <div className={cn("absolute top-0 right-16 h-full w-[17rem] rounded-t-full border", line)} />
      <div className={cn("absolute top-14 right-0 h-full w-[17rem] rounded-t-full border", line)} />
    </div>
  );
}
