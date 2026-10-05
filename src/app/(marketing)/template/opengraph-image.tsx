import { ImageResponse } from "next/og";

import { loadOgFonts, loadOgImage } from "@/lib/og/assets";
import { CatalogueBanner, OG_SIZE } from "@/lib/og/banners";
import { BRAND_SHARE_STYLE } from "@/lib/og/share-styles";
import { getListedTemplates } from "@/server/marketing/queries";

export const alt = "Katalog template undangan digital Temuraya";
export const size = OG_SIZE;
export const contentType = "image/png";
export const revalidate = 600;

/** The catalogue link shows the first four templates side by side. */
export default async function CatalogueOpenGraphImage() {
  const templates = await getListedTemplates();
  const [fonts, ...screens] = await Promise.all([
    loadOgFonts(BRAND_SHARE_STYLE.script),
    ...templates.slice(0, 4).map((template) => loadOgImage(template.coverUrl, { width: 156, height: 338, position: "top" })),
  ]);

  return new ImageResponse(<CatalogueBanner style={BRAND_SHARE_STYLE} count={templates.length} screens={screens} />, {
    ...size,
    fonts,
  });
}
