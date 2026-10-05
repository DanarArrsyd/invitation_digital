import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * One group of settings in an editor page: what it is and why on the left,
 * the fields in a panel on the right. Stacks on narrow screens.
 */
export function SettingsSection({
  id,
  title,
  description,
  children,
  className,
}: {
  id?: string;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const headingId = id ? `${id}-heading` : undefined;
  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={cn(
        "grid gap-4 border-b border-border py-8 first:pt-2 last:border-b-0 lg:grid-cols-[minmax(0,16rem)_minmax(0,1fr)] lg:gap-10",
        className,
      )}
    >
      <div className="min-w-0 lg:pt-1">
        <h2 id={headingId} className="text-[0.9375rem] font-semibold tracking-[-0.01em] text-foreground">
          {title}
        </h2>
        {description ? (
          <div className="mt-1.5 max-w-[46ch] text-sm leading-6 text-pretty text-muted-foreground">{description}</div>
        ) : null}
      </div>
      <div className="flex min-w-0 flex-col gap-4">{children}</div>
    </section>
  );
}

/** The white surface that holds a form's fields. */
export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-border bg-card shadow-[0_1px_2px_rgba(23,32,27,0.04)]", className)}>
      {children}
    </div>
  );
}

export function PanelBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("flex flex-col gap-5 p-5 sm:p-6", className)}>{children}</div>;
}

/** Two columns of fields from `sm` up; give a field `sm:col-span-2` to span both. */
export function FieldGrid({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("grid gap-x-5 gap-y-5 sm:grid-cols-2", className)}>{children}</div>;
}

/**
 * Save row at the bottom of a panel. On phones it sticks to the bottom of
 * the screen while its form is in view, so Save never needs a scroll.
 */
export function PanelFooter({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "sticky bottom-0 z-10 flex flex-wrap items-center justify-end gap-2 rounded-b-2xl border-t border-border bg-[color-mix(in_oklch,var(--card),var(--muted)_45%)] px-5 py-3 sm:static sm:px-6",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Title row for a panel that holds one item of a list (an event, a person, a gift). */
export function PanelHeader({
  index,
  title,
  meta,
  actions,
  className,
}: {
  index?: number;
  title: ReactNode;
  meta?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-3 border-b border-border px-5 py-3.5 sm:px-6", className)}>
      {index !== undefined ? (
        <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-secondary font-mono text-xs font-medium text-secondary-foreground">
          {index}
        </span>
      ) : null}
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-semibold text-foreground">{title}</h3>
        {meta ? <p className="truncate text-xs text-muted-foreground">{meta}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-1">{actions}</div> : null}
    </div>
  );
}

/** Usage against a package limit, e.g. "2 / 3 acara". */
export function UsageMeter({ used, limit, unit }: { used: number; limit: number; unit: string }) {
  const percent = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  return (
    <div className="flex max-w-56 flex-col gap-1.5 pt-1">
      <span className="text-xs text-muted-foreground">
        <span className="font-semibold text-foreground tabular-nums">{used}</span> / {limit} {unit} terpakai
      </span>
      <span className="h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden="true">
        <span
          className={cn("block h-full rounded-full", used >= limit ? "bg-[var(--tr-brass)]" : "bg-[var(--tr-sage)]")}
          style={{ width: `${percent}%` }}
        />
      </span>
    </div>
  );
}
