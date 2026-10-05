import Link from "next/link";

import { EVENT_TYPE_LABELS, EVENT_TYPES, type EventType } from "@/lib/marketing/event-types";
import { cn } from "@/lib/utils";

/**
 * Every event type the platform plans for. Types without a listed template
 * read "Segera hadir" instead of linking to an empty catalogue.
 */
export function EventTypeChips({
  available,
  active,
  includeAll = false,
}: {
  available: ReadonlySet<EventType>;
  active?: EventType | null;
  includeAll?: boolean;
}) {
  const base = "inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition";
  return (
    <ul className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
      {includeAll ? (
        <li>
          <Link
            href="/template"
            aria-current={!active ? "page" : undefined}
            className={cn(base, !active ? "border-tr-forest bg-tr-forest text-tr-paper" : "border-tr-line bg-tr-card text-tr-ink hover:border-tr-ink/30")}
          >
            Semua
          </Link>
        </li>
      ) : null}
      {EVENT_TYPES.map((type) => {
        const isAvailable = available.has(type);
        const isActive = active === type;
        return (
          <li key={type}>
            {isAvailable ? (
              <Link
                href={`/template?acara=${type}`}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  base,
                  isActive ? "border-tr-forest bg-tr-forest text-tr-paper" : "border-tr-line bg-tr-card text-tr-ink hover:border-tr-ink/30",
                )}
              >
                {EVENT_TYPE_LABELS[type]}
              </Link>
            ) : (
              <span className={cn(base, "border-dashed border-tr-line text-tr-muted")}>
                {EVENT_TYPE_LABELS[type]}
                <span className="rounded-full bg-tr-mist px-2 py-0.5 text-[0.7rem]">Segera hadir</span>
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
