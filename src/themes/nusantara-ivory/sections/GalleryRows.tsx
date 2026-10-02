"use client";

import { enlargeLabel, GalleryLightbox } from "@/themes/shared/GalleryLightbox";
import { useGalleryLightbox } from "@/themes/shared/use-gallery-lightbox";
import { GALLERY_ASPECT_RATIO_CSS, type GalleryItem } from "@/types/invitation";

import { EditorialImage } from "../components/EditorialImage";
import { Reveal } from "../components/Reveal";

/** "4 / 5" -> 0.8 (width / height); unknown values fall back to portrait 4:5. */
function ratioOf(item: GalleryItem): { css: string; value: number } {
  const css = GALLERY_ASPECT_RATIO_CSS[item.aspectRatio] ?? "4 / 5";
  const [w, h] = css.split("/").map((part) => Number(part.trim()));
  return { css, value: w > 0 && h > 0 ? w / h : 0.8 };
}

/**
 * Justified rows: every photo in a row shares one height and takes width in
 * proportion to the ratio chosen in admin, so landscapes and portraits sit
 * together without cropping to a common shape or leaving gaps, and the
 * couple's order reads left-to-right, top-to-bottom. Tapping a photo opens
 * it in the shared lightbox (themes/shared/GalleryLightbox).
 */
export function GalleryRows({ gallery }: { gallery: GalleryItem[] }) {
  const lightbox = useGalleryLightbox(gallery.length);

  return (
    <>
      <div className={`ni-gallery-rows${gallery.length === 1 ? " ni-gallery-rows--single" : ""}`}>
        {gallery.map((item, index) => {
          const ratio = ratioOf(item);
          return (
            <figure
              key={item.id}
              className="ni-gallery-item group"
              style={{ "--r": ratio.value } as React.CSSProperties}
            >
              <Reveal variant="mask" delay={(index % 3) * 0.08}>
                <button
                  type="button"
                  onClick={() => lightbox.show(index)}
                  className="ni-photo-wrap ni-gallery-photo block w-full cursor-zoom-in"
                  style={{ aspectRatio: ratio.css }}
                  aria-label={enlargeLabel(index, gallery.length, item.caption)}
                >
                  <EditorialImage
                    src={item.imageUrl}
                    alt={item.altText ?? item.caption ?? ""}
                    sizes="(min-width: 900px) 40vw, 70vw"
                    className="ni-photo transition-transform duration-700 group-hover:scale-[1.035] motion-reduce:transform-none"
                  />
                </button>
              </Reveal>
              {item.caption ? <figcaption className="ni-gallery-caption">{item.caption}</figcaption> : null}
            </figure>
          );
        })}
      </div>

      <GalleryLightbox
        gallery={gallery}
        lightbox={lightbox}
        classes={{
          dialog: "ni-lightbox",
          body: "ni-lightbox-body",
          frame: "ni-lightbox-frame",
          bar: "ni-lightbox-bar",
          caption: "ni-lightbox-caption",
          button: "ni-lightbox-btn",
        }}
        renderImage={(item) => (
          <EditorialImage
            key={item.id}
            src={item.imageUrl}
            alt={item.altText ?? item.caption ?? ""}
            sizes="100vw"
            className="ni-lightbox-photo"
          />
        )}
      />
    </>
  );
}
