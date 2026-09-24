export const THEME_SECTION_KEYS = [
  "cover", "hero", "quote", "couple", "parents", "events",
  "countdown", "maps", "calendar", "dressCode", "story", "gallery",
  "livestream", "rsvp", "wishes", "gift", "instagram", "closing",
] as const;

export type ThemeSectionKey = (typeof THEME_SECTION_KEYS)[number];
export type ThemeSectionManifest = Record<ThemeSectionKey, true>;

export function defineThemeSectionManifest(
  manifest: ThemeSectionManifest,
): ThemeSectionManifest {
  return manifest;
}
