import { GALLERY_ASPECT_RATIO_CSS, type GalleryItem } from "@/types/invitation";

import { AtelierImage } from "../components/AtelierImage";
import { Section } from "../components/Section";

export function GallerySection({ gallery, displayName }: { gallery: GalleryItem[]; displayName: string }) {
  if (gallery.length === 0) return null;

  function frame(item: GalleryItem, index: number, anchor = false) {
    return (
      <figure
        key={item.id}
        data-gallery-item={item.id}
        data-gallery-anchor={anchor ? "true" : undefined}
        className={`ma-gallery-item${anchor ? " ma-gallery-anchor" : ""}`}
      >
        <AtelierImage
          src={item.imageUrl}
          alt={item.altText?.trim() || item.caption?.trim() || `Momen ${displayName}, foto ${index + 1}`}
          sizes={anchor
            ? "(min-width: 1440px) 1216px, (min-width: 768px) 84vw, 100vw"
            : "(min-width: 1440px) 390px, (min-width: 768px) 42vw, 100vw"}
          aspectRatio={GALLERY_ASPECT_RATIO_CSS[item.aspectRatio]}
          className="ma-gallery-image"
        />
        {item.caption?.trim() ? (
          <figcaption><span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>{item.caption}</figcaption>
        ) : null}
      </figure>
    );
  }

  return (
    <Section id="ma-galeri" labelledBy="ma-gallery-heading" tone="lacquer" className="ma-gallery">
      <header className="ma-chapter-heading ma-chapter-heading-dark">
        <p>{`${String(gallery.length).padStart(2, "0")} frames / contact sheet`}</p>
        <h2 id="ma-gallery-heading">Dalam bingkai</h2>
      </header>

      <div className="ma-gallery-grid">
        {frame(gallery[0], 0, true)}
        {gallery.length > 1 ? (
          <div className="ma-gallery-columns">
            {gallery.slice(1).map((item, index) => frame(item, index + 1))}
          </div>
        ) : null}
      </div>
    </Section>
  );
}
