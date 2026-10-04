/**
 * The bottom bar holds at most five items so every label fits a 320px phone
 * without scrolling. When more sections exist, what guests act on (event
 * details, RSVP, wishes, gift) wins over browsing sections; the chosen items
 * keep their page order.
 */
export const MAX_NAV_ITEMS = 5;

export const NAV_SECTION_PRIORITY = {
  events: 1,
  rsvp: 2,
  wishes: 3,
  gift: 4,
  hero: 5,
  couple: 6,
  gallery: 7,
  story: 8,
} as const;

export type NavSectionKey = keyof typeof NAV_SECTION_PRIORITY;

export function pickNavItems<T extends { section: NavSectionKey }>(items: readonly T[], max = MAX_NAV_ITEMS): T[] {
  const chosen = new Set(
    [...items].sort((a, b) => NAV_SECTION_PRIORITY[a.section] - NAV_SECTION_PRIORITY[b.section]).slice(0, max),
  );
  return items.filter((item) => chosen.has(item));
}
