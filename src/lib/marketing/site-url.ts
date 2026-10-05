/** Absolute origin for sitemap, robots and metadata; no trailing slash. */
export function getSiteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "https://invitation-digital-delta.vercel.app").replace(/\/+$/, "");
}
