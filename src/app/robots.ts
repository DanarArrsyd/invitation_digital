import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/marketing/site-url";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/demo"] },
    sitemap: `${getSiteUrl()}/sitemap.xml`,
  };
}
