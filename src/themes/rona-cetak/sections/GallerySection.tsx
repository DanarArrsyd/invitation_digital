"use client";

import { enlargeLabel, GalleryLightbox } from "@/themes/shared/GalleryLightbox";
import { useGalleryLightbox } from "@/themes/shared/use-gallery-lightbox";
import { GALLERY_ASPECT_RATIO_CSS, type GalleryItem } from "@/types/invitation";
import { EditorialImage } from "../components/EditorialImage";
import { Section } from "../components/Section";
import { SectionHeading } from "../components/SectionHeading";

export function GallerySection({ gallery, displayName }: { gallery: GalleryItem[]; displayName: string }) {
  const lightbox = useGalleryLightbox(gallery.length);
  if (gallery.length === 0) return null;
  return (
    <Section id="rc-galeri" labelledBy="rc-gallery-heading" className="rc-gallery">
      <SectionHeading id="rc-gallery-heading" title="Dalam kenangan" />
      <div className="rc-gallery-grid">
        {gallery.map((item, index) => {
          // A full-width lead print followed by a pair; a final pair never leaves an orphan tile.
          const span = index % 3 === 0 && gallery.length - index !== 2 ? 2 : 1;
          return (
            <figure
              key={item.id}
              data-gallery-item={item.id}
              data-gallery-span={span}
              className="rc-gallery-item"
            >
              <button
                type="button"
                className="rc-gallery-zoom"
                onClick={() => lightbox.show(index)}
                aria-label={enlargeLabel(index, gallery.length, item.caption)}
              >
                <EditorialImage
                  src={item.imageUrl}
                  alt={item.altText?.trim() || item.caption?.trim() || `Momen ${displayName}, foto ${index + 1}`}
                  sizes={span === 2 ? "(min-width: 1360px) 960px, 80vw" : "(min-width: 1360px) 540px, 42vw"}
                  aspectRatio={GALLERY_ASPECT_RATIO_CSS[item.aspectRatio]}
                />
              </button>
              {item.caption?.trim() ? <figcaption>{item.caption}</figcaption> : null}
            </figure>
          );
        })}
      </div>
      <GalleryLightbox
        gallery={gallery}
        lightbox={lightbox}
        classes={{
          dialog: "rc-lightbox",
          body: "rc-lightbox-body",
          frame: "rc-lightbox-frame",
          bar: "rc-lightbox-bar",
          caption: "rc-lightbox-caption",
          button: "rc-lightbox-btn",
        }}
        renderImage={(item) => (
          <EditorialImage
            key={item.id}
            src={item.imageUrl}
            alt={item.altText?.trim() || item.caption?.trim() || ""}
            sizes="100vw"
            aspectRatio="auto"
          />
        )}
      />
    </Section>
  );
}
