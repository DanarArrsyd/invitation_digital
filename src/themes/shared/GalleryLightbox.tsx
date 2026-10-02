"use client";

import type { ReactNode } from "react";

import type { GalleryItem } from "@/types/invitation";

import { useGalleryLightbox } from "./use-gallery-lightbox";

export type GalleryLightboxClasses = {
  dialog: string;
  body: string;
  frame: string;
  bar: string;
  caption: string;
  button: string;
};

/**
 * Accessible lightbox markup shared by every theme (dialog semantics,
 * labelled controls, position and caption). Each theme passes its own class
 * names and renders the photo with its own image component.
 */
export function GalleryLightbox({
  gallery,
  lightbox,
  classes,
  renderImage,
}: {
  gallery: GalleryItem[];
  lightbox: ReturnType<typeof useGalleryLightbox>;
  classes: GalleryLightboxClasses;
  renderImage: (item: GalleryItem) => ReactNode;
}) {
  const { openIndex, show, close, closeRef, dialogProps } = lightbox;
  const active = openIndex !== null ? gallery[openIndex] : null;

  return (
    <dialog {...dialogProps} className={classes.dialog} aria-label="Foto galeri">
      {active && openIndex !== null ? (
        <div className={classes.body}>
          <div className={classes.frame}>{renderImage(active)}</div>
          <div className={classes.bar}>
            <p className={classes.caption}>
              <span className="tabular-nums">
                {openIndex + 1} / {gallery.length}
              </span>
              {active.caption?.trim() ? <span> · {active.caption}</span> : null}
            </p>
            <div className="flex gap-2">
              {gallery.length > 1 ? (
                <>
                  <button type="button" className={classes.button} onClick={() => show(openIndex - 1)}>
                    <span aria-hidden="true">←</span>
                    <span className="sr-only">Foto sebelumnya</span>
                  </button>
                  <button type="button" className={classes.button} onClick={() => show(openIndex + 1)}>
                    <span aria-hidden="true">→</span>
                    <span className="sr-only">Foto berikutnya</span>
                  </button>
                </>
              ) : null}
              <button ref={closeRef} type="button" className={classes.button} onClick={close}>
                Tutup
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </dialog>
  );
}

/** Accessible name for a photo's enlarge button. */
export function enlargeLabel(index: number, total: number, caption: string | null): string {
  return `Perbesar foto ${index + 1} dari ${total}${caption?.trim() ? `: ${caption.trim()}` : ""}`;
}
