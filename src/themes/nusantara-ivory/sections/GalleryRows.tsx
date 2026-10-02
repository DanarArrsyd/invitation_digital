"use client";

import { useCallback, useEffect, useRef, useState } from "react";

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
 * it in a native <dialog> (focus trap, Esc to close, arrow keys to browse).
 */
export function GalleryRows({ gallery }: { gallery: GalleryItem[] }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const show = useCallback(
    (index: number) => setOpenIndex(((index % gallery.length) + gallery.length) % gallery.length),
    [gallery.length],
  );

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (openIndex !== null && !dialog.open) {
      dialog.showModal();
      // showModal focuses the first control; Close is the expected landing spot.
      closeRef.current?.focus();
    }
    if (openIndex === null && dialog.open) dialog.close();
  }, [openIndex]);

  const active = openIndex !== null ? gallery[openIndex] : null;

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
                  onClick={() => show(index)}
                  className="ni-photo-wrap ni-gallery-photo block w-full cursor-zoom-in"
                  style={{ aspectRatio: ratio.css }}
                  aria-label={`Perbesar foto ${index + 1} dari ${gallery.length}${item.caption ? `: ${item.caption}` : ""}`}
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

      <dialog
        ref={dialogRef}
        className="ni-lightbox"
        aria-label="Foto galeri"
        onClose={() => setOpenIndex(null)}
        onClick={(event) => {
          // A click on the backdrop (the dialog element itself) closes it.
          if (event.target === event.currentTarget) setOpenIndex(null);
        }}
        onKeyDown={(event) => {
          if (openIndex === null) return;
          if (event.key === "ArrowRight") show(openIndex + 1);
          if (event.key === "ArrowLeft") show(openIndex - 1);
        }}
      >
        {active && openIndex !== null ? (
          <div className="ni-lightbox-body">
            <div className="ni-lightbox-frame">
              <EditorialImage
                key={active.id}
                src={active.imageUrl}
                alt={active.altText ?? active.caption ?? ""}
                sizes="100vw"
                className="ni-lightbox-photo"
              />
            </div>
            <div className="ni-lightbox-bar">
              <p className="ni-lightbox-caption">
                <span className="tabular-nums">
                  {openIndex + 1} / {gallery.length}
                </span>
                {active.caption ? <span> · {active.caption}</span> : null}
              </p>
              <div className="flex gap-2">
                {gallery.length > 1 ? (
                  <>
                    <button type="button" className="ni-lightbox-btn" onClick={() => show(openIndex - 1)}>
                      <span aria-hidden="true">←</span>
                      <span className="sr-only">Foto sebelumnya</span>
                    </button>
                    <button type="button" className="ni-lightbox-btn" onClick={() => show(openIndex + 1)}>
                      <span aria-hidden="true">→</span>
                      <span className="sr-only">Foto berikutnya</span>
                    </button>
                  </>
                ) : null}
                <button ref={closeRef} type="button" className="ni-lightbox-btn" onClick={() => setOpenIndex(null)}>
                  Tutup
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </dialog>
    </>
  );
}
