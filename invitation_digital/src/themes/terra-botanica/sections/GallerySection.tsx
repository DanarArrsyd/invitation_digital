import { GALLERY_ASPECT_RATIO_CSS, type GalleryItem } from "@/types/invitation";
import { EditorialImage } from "../components/EditorialImage";
import { Section } from "../components/Section";
import { SectionHeading } from "../components/SectionHeading";

export function GallerySection({ gallery, displayName }: { gallery: GalleryItem[]; displayName: string }) {
  if (gallery.length === 0) return null;
  return (
    <Section id="tb-galeri" labelledBy="tb-gallery-heading" className="tb-gallery">
      <SectionHeading id="tb-gallery-heading" title="Dalam kenangan" />
      <div className="tb-gallery-grid">
        {gallery.map((item, index) => {
          // A full-width anchor followed by a pair; a final pair never leaves an orphan tile.
          const span = index % 3 === 0 && gallery.length - index !== 2 ? 2 : 1;
          return (
            <figure key={item.id} data-gallery-item={item.id} data-gallery-span={span} className="tb-gallery-item">
              <EditorialImage
                src={item.imageUrl}
                alt={item.altText?.trim() || item.caption?.trim() || `Momen ${displayName}, foto ${index + 1}`}
                sizes={span === 2 ? "(min-width: 1360px) 960px, 80vw" : "(min-width: 1360px) 540px, 42vw"}
                aspectRatio={GALLERY_ASPECT_RATIO_CSS[item.aspectRatio]}
              />
              {item.caption?.trim() ? <figcaption>{item.caption}</figcaption> : null}
            </figure>
          );
        })}
      </div>
    </Section>
  );
}
