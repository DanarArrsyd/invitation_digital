import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Inline result of a form submission. Errors are announced immediately
 * (role="alert"), confirmations politely (role="status"). Renders nothing
 * when there is no message, so callers can pass the raw search param.
 */
export function FormMessage({
  tone,
  children,
  className,
}: {
  tone: "error" | "success";
  children?: ReactNode;
  className?: string;
}) {
  if (!children) return null;

  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "rounded-xl border px-4 py-3 text-sm",
        tone === "error"
          ? "border-destructive/25 bg-destructive/5 text-destructive"
          : "border-[#c9d8c4] bg-[#eef4ec] text-[#24452b]",
        className,
      )}
    >
      {children}
    </p>
  );
}
