import type { PackageKey } from "./entitlements";

/** Sections a theme's bottom bar can link to, in page order. */
export const NAV_SECTION_KEYS = [
  "hero",
  "couple",
  "events",
  "story",
  "gallery",
  "livestream",
  "rsvp",
  "wishes",
  "gift",
] as const;

export type NavSectionKey = (typeof NAV_SECTION_KEYS)[number];

/**
 * The bottom bar grows with the package: every tier keeps the stops of the
 * tier below and adds more, so a guest never loses a stop when the couple
 * upgrades. The public loader resolves this to `invitation.navSections`, so
 * themes (and guests) never see the package itself.
 */
export const NAV_SECTIONS_BY_PACKAGE: Record<PackageKey, readonly NavSectionKey[]> = {
  intimate: ["hero", "couple", "events", "rsvp", "gift"],
  signature: ["hero", "couple", "events", "gallery", "rsvp", "wishes", "gift"],
  grand: ["hero", "couple", "events", "story", "gallery", "livestream", "rsvp", "wishes", "gift"],
};
