import { GALLERY_ASPECT_RATIO_CSS, type GalleryItem } from "@/types/invitation";

import { RivieraImage } from "../components/RivieraImage";
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
  if (gallery.length === 0) return null;

  return (
    <Section id="cr-galeri" labelledBy="cr-gallery-heading" tone="porcelain" className="cr-gallery">
      <header className="cr-gallery-heading">
        <p>{`${gallery.length} bingkai pilihan`}</p>
        <h2 id="cr-gallery-heading">Cahaya, warna, dan perayaan</h2>
      </header>

      <div className="cr-gallery-mosaic">
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
              className={`cr-gallery-item cr-gallery-span-${span}${anchor ? " cr-gallery-anchor" : ""}`}
            >
              <RivieraImage
                src={item.imageUrl}
                alt={alt}
                sizes={anchor
                  ? "(min-width: 1440px) 1344px, (min-width: 768px) 88vw, 100vw"
                  : span === 12
                    ? "(min-width: 1440px) 1344px, (min-width: 768px) 88vw, 100vw"
                    : "(min-width: 1440px) 720px, (min-width: 768px) 52vw, 50vw"}
                aspectRatio={GALLERY_ASPECT_RATIO_CSS[item.aspectRatio]}
                className="cr-gallery-image"
              />
              {item.caption?.trim() ? <figcaption>{item.caption}</figcaption> : null}
            </figure>
          );
        })}
      </div>
    </Section>
  );
}
