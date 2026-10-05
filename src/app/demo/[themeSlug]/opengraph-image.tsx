import { OG_SIZE } from "@/lib/og/banners";
import { renderTemplateImage } from "@/lib/og/template-image";

export const alt = "Demo undangan digital Temuraya";
export const size = OG_SIZE;
export const contentType = "image/png";
export const revalidate = 600;

export default async function DemoOpenGraphImage({ params }: { params: Promise<{ themeSlug: string }> }) {
  return renderTemplateImage((await params).themeSlug, "demo");
}
