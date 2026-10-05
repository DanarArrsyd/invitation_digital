import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/marketing/site-url";
import { getListedTemplates } from "@/server/marketing/queries";

export const revalidate = 3600;

/** Marketing pages only; customer invitations and demos stay out of search. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = getSiteUrl();
  const templates = await getListedTemplates();
  return [
    { url: `${origin}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${origin}/template`, changeFrequency: "weekly", priority: 0.8 },
    ...templates.map((template) => ({
      url: `${origin}/template/${template.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
