import type { GalleryItem } from "@/types/invitation";

import { Section } from "../components/Section";
import { SectionHeading } from "../components/SectionHeading";
import { GalleryRows } from "./GalleryRows";

export function GallerySection({ gallery }: { gallery: GalleryItem[] }) {
  if (gallery.length === 0) return null;
  return (
    <Section id="ni-galeri" tone="ivory" wide floral>
      <SectionHeading title="Galeri" />
      <GalleryRows gallery={gallery} />
    </Section>
  );
}
