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
      className={cn("text-sm", tone === "error" ? "text-destructive" : "text-success", className)}
    >
      {children}
    </p>
  );
}
