"use client";

import { enlargeLabel, GalleryLightbox } from "@/themes/shared/GalleryLightbox";
import { useGalleryLightbox } from "@/themes/shared/use-gallery-lightbox";
import { GALLERY_ASPECT_RATIO_CSS, type GalleryItem } from "@/types/invitation";

import { KelirImage } from "../components/KelirImage";
import { ChapterHeading } from "../components/ChapterHeading";
import { Section } from "../components/Section";

function mosaicSpan(index: number, total: number): 5 | 7 | 12 {
  const mosaicLength = total - 1;
  const position = index - 1;
  const completeTriples = mosaicLength - (mosaicLength % 3);

  if (position >= completeTriples) {
    return mosaicLength % 3 === 1 ? 12 : position === completeTriples ? 7 : 5;
  }

  return position % 3 === 0 ? 7 : position % 3 === 1 ? 5 : 12;
}

export function GallerySection({ gallery, displayName }: { gallery: GalleryItem[]; displayName: string }) {
  const lightbox = useGalleryLightbox(gallery.length);
  if (gallery.length === 0) return null;

  return (
    <Section id="kk-galeri" labelledBy="kk-gallery-heading" className="kk-gallery">
      <ChapterHeading id="kk-gallery-heading" eyebrow={`${gallery.length} bingkai pilihan`} title="Galeri" />

      <div className="kk-gallery-mosaic">
        {gallery.map((item, index) => {
          const anchor = index === 0;
          const span = anchor ? 12 : mosaicSpan(index, gallery.length);
          const alt = item.altText?.trim() || item.caption?.trim() || `Momen ${displayName}, foto ${index + 1}`;

          return (
            <figure
              key={item.id}
              data-gallery-item={item.id}
              data-gallery-anchor={anchor ? "true" : undefined}
              data-gallery-span={span}
              className={`kk-gallery-item kk-gallery-span-${span}${anchor ? " kk-gallery-anchor" : ""}`}
            >
              <button
                type="button"
                className="kk-gallery-zoom"
                onClick={() => lightbox.show(index)}
                aria-label={enlargeLabel(index, gallery.length, item.caption)}
              >
                <KelirImage
                  src={item.imageUrl}
                  alt={alt}
                  sizes={anchor
                    ? "(min-width: 1440px) 1344px, (min-width: 768px) 88vw, 100vw"
                    : span === 12
                      ? "(min-width: 1440px) 1344px, (min-width: 768px) 88vw, 100vw"
                      : "(min-width: 1440px) 720px, (min-width: 768px) 52vw, 50vw"}
                  aspectRatio={GALLERY_ASPECT_RATIO_CSS[item.aspectRatio]}
                  className="kk-gallery-image"
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
          dialog: "kk-lightbox",
          body: "kk-lightbox-body",
          frame: "kk-lightbox-frame",
          bar: "kk-lightbox-bar",
          caption: "kk-lightbox-caption",
          button: "kk-lightbox-btn",
        }}
        renderImage={(item) => (
          <KelirImage
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
