import type { GalleryItem } from "@/types/invitation";
import { Reveal } from "../components/Reveal";
import { Section } from "../components/Section";
import { SectionHeading } from "../components/SectionHeading";
import { EditorialImage } from "../components/EditorialImage";

export function GallerySection({ gallery }: { gallery: GalleryItem[] }) {
  if (gallery.length === 0) return null;
  return (
    <Section tone="ivory" wide floral>
      <SectionHeading title="Galeri" />
      <div className="ni-gallery-grid">
        {gallery.map((item, index) => (
          <Reveal key={item.id} variant="mask" delay={(index % 2) * .1}>
            <figure className="group" data-ratio={item.aspectRatio}>
              <div className="ni-photo-wrap ni-gallery-photo" data-ratio={item.aspectRatio}>
                <EditorialImage src={item.imageUrl} alt={item.altText ?? item.caption ?? ""} className="ni-photo transition-transform duration-700 group-hover:scale-[1.035] motion-reduce:transform-none" />
              </div>
              {item.caption ? <figcaption className="ni-gallery-caption">{item.caption}</figcaption> : null}
            </figure>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
