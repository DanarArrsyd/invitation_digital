import "server-only";

import { ImageResponse } from "next/og";

import { getListedTemplate } from "@/server/marketing/queries";

import { loadOgFonts, loadOgImage } from "./assets";
import { OG_SIZE, PHONE_SCREEN, TemplateBanner } from "./banners";
import { getShareStyle } from "./share-styles";

/** Banner for a template page or its demo, in that template's colours. */
export async function renderTemplateImage(themeSlug: string, variant: "catalogue" | "demo"): Promise<ImageResponse> {
  const template = await getListedTemplate(themeSlug);
  const style = getShareStyle(template?.slug);
  const sources = template ? [template.coverUrl, template.screenshotUrls[1] ?? null] : [];

  const [fonts, ...screens] = await Promise.all([
    loadOgFonts(style.script),
    ...sources.map((src) => loadOgImage(src, { ...PHONE_SCREEN, position: "top" })),
  ]);

  return new ImageResponse(
    <TemplateBanner
      style={style}
      eyebrow={variant === "demo" ? "Demo template" : "Template undangan"}
      name={template?.name ?? "Temuraya"}
      tagline={template?.tagline ?? template?.description ?? "Undangan digital untuk setiap perayaan."}
      screens={screens}
      note={variant === "demo" ? "coba langsung undangannya" : "lihat demo & pesan lewat WhatsApp"}
    />,
    { ...OG_SIZE, fonts },
  );
}
