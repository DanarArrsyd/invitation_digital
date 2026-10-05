import type { NavSectionKey } from "@/lib/packages/nav-sections";

export type { NavSectionKey };

/** Items a phone bar shows at once; with more, the bar scrolls sideways (DESIGN.md §12a). */
export const NAV_ITEMS_IN_VIEW = 5;

/**
 * Keeps the candidates whose section the invitation's package lists
 * (`invitation.navSections`), in page order. A section the invitation
 * doesn't render (feature off, no content) is never a candidate.
 */
export function pickNavItems<T extends { section: NavSectionKey }>(
  items: readonly T[],
  navSections: readonly NavSectionKey[] | null | undefined,
): T[] {
  if (!navSections) return [...items];
  const allowed = new Set(navSections);
  return items.filter((item) => allowed.has(item.section));
}
