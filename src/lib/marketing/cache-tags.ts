/** Cache tags for marketing data; admin "Situs" actions revalidate them. */
export const MARKETING_TAGS = {
  catalogue: "marketing:catalogue",
  packages: "marketing:packages",
  settings: "marketing:settings",
} as const;

/** Cache tag for one theme's demo invitation content. */
export function demoInvitationCacheTag(themeSlug: string): string {
  return `marketing:demo:${themeSlug}`;
}
