"use client";

import { enlargeLabel, GalleryLightbox } from "@/themes/shared/GalleryLightbox";
import { useGalleryLightbox } from "@/themes/shared/use-gallery-lightbox";
import { GALLERY_ASPECT_RATIO_CSS, type GalleryItem } from "@/types/invitation";
import { EditorialImage } from "../components/EditorialImage";
import { Section } from "../components/Section";
import { SectionHeading } from "../components/SectionHeading";
import { TypedText } from "../components/TypedText";

export function GallerySection({ gallery, displayName }: { gallery: GalleryItem[]; displayName: string }) {
  const lightbox = useGalleryLightbox(gallery.length);
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
              <button
                type="button"
                className="tb-gallery-zoom"
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
              {item.caption?.trim() ? <figcaption><TypedText text={item.caption} /></figcaption> : null}
            </figure>
          );
        })}
      </div>
      <GalleryLightbox
        gallery={gallery}
        lightbox={lightbox}
        classes={{
          dialog: "tb-lightbox",
          body: "tb-lightbox-body",
          frame: "tb-lightbox-frame",
          bar: "tb-lightbox-bar",
          caption: "tb-lightbox-caption",
          button: "tb-lightbox-btn",
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
