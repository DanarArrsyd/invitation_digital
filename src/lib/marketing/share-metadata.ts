import type { Metadata } from "next";

/**
 * Open Graph and X card text for a marketing page. The banner image itself
 * comes from the route's opengraph-image file.
 */
export function shareMetadata(title: string, description: string): Pick<Metadata, "openGraph" | "twitter"> {
  return {
    openGraph: { type: "website", locale: "id_ID", siteName: "Temuraya", title, description },
    twitter: { card: "summary_large_image", title, description },
  };
}
