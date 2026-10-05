import { OG_SIZE } from "@/lib/og/banners";
import { renderTemplateImage } from "@/lib/og/template-image";

export const alt = "Template undangan digital Temuraya";
export const size = OG_SIZE;
export const contentType = "image/png";
export const revalidate = 600;

export default async function TemplateOpenGraphImage({ params }: { params: Promise<{ themeSlug: string }> }) {
  return renderTemplateImage((await params).themeSlug, "catalogue");
}
