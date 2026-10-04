"use client";

import { useRef, type CSSProperties } from "react";

import { enlargeLabel, GalleryLightbox } from "@/themes/shared/GalleryLightbox";
import { useGalleryLightbox } from "@/themes/shared/use-gallery-lightbox";
import { useInViewOnce } from "@/themes/shared/use-in-view-once";
import { GALLERY_ASPECT_RATIO_CSS, type GalleryItem } from "@/types/invitation";

import { AtelierImage } from "../components/AtelierImage";
import { Section } from "../components/Section";
import { Spotlight } from "../components/Spotlight";

export function GallerySection({ gallery, displayName }: { gallery: GalleryItem[]; displayName: string }) {
  const lightbox = useGalleryLightbox(gallery.length);
  const gridRef = useRef<HTMLDivElement>(null);
  const { watching, seen } = useInViewOnce(gridRef);
  if (gallery.length === 0) return null;

  function frame(item: GalleryItem, index: number, anchor = false) {
    return (
      <figure
        key={item.id}
        data-gallery-item={item.id}
        data-gallery-anchor={anchor ? "true" : undefined}
        className={`ma-gallery-item${anchor ? " ma-gallery-anchor" : ""}`}
        style={{ "--ma-light-delay": `${(Math.min(index, 8) * 0.18).toFixed(2)}s` } as CSSProperties}
      >
        <button
          type="button"
          className="ma-gallery-zoom"
          onClick={() => lightbox.show(index)}
          aria-label={enlargeLabel(index, gallery.length, item.caption)}
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
        </button>
        {item.caption?.trim() ? (
          <figcaption><span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>{item.caption}</figcaption>
        ) : null}
      </figure>
    );
  }

  return (
    <Section id="ma-galeri" labelledBy="ma-gallery-heading" tone="lacquer" className="ma-gallery">
      <Spotlight className="ma-chapter-heading ma-chapter-heading-dark">
        <p>{`${String(gallery.length).padStart(2, "0")} potret kenangan`}</p>
        <h2 id="ma-gallery-heading">Dalam bingkai</h2>
      </Spotlight>

      {/* Lights only dim a gallery that was first seen off-screen; one already
          on screen keeps no attribute, so it never flashes dark. */}
      <div ref={gridRef} className="ma-gallery-grid" data-lights={watching ? (seen ? "lit" : "waiting") : undefined}>
        {frame(gallery[0], 0, true)}
        {gallery.length > 1 ? (
          <div className="ma-gallery-columns">
            {gallery.slice(1).map((item, index) => frame(item, index + 1))}
          </div>
        ) : null}
      </div>
      <GalleryLightbox
        gallery={gallery}
        lightbox={lightbox}
        classes={{
          dialog: "ma-lightbox",
          body: "ma-lightbox-body",
          frame: "ma-lightbox-frame",
          bar: "ma-lightbox-bar",
          caption: "ma-lightbox-caption",
          button: "ma-lightbox-btn",
        }}
        renderImage={(item) => (
          <AtelierImage
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
