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
    <Section id="jk-galeri" labelledBy="jk-gallery-heading" className="jk-gallery">
      <SectionHeading id="jk-gallery-heading" title="Dalam kenangan" />
      <div className="jk-gallery-grid">
        {gallery.map((item, index) => {
          // A full-width lead frame is followed by pairs; the last frame never stands alone.
          const span = index % 3 === 0 && gallery.length - index !== 2 ? 2 : 1;
          return (
            <figure
              key={item.id}
              data-gallery-item={item.id}
              data-gallery-span={span}
              className="jk-gallery-item"
            >
              <button
                type="button"
                className="jk-gallery-zoom"
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
          dialog: "jk-lightbox",
          body: "jk-lightbox-body",
          frame: "jk-lightbox-frame",
          bar: "jk-lightbox-bar",
          caption: "jk-lightbox-caption",
          button: "jk-lightbox-btn",
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
