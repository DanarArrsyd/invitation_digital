"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type MouseEvent } from "react";

/** Wraps any index into 0..count-1 so previous/next loop around. */
export function wrapGalleryIndex(index: number, count: number): number {
  if (count <= 0) return 0;
  return ((index % count) + count) % count;
}

/**
 * State for the gallery lightbox shared by every theme: which photo is open,
 * a native <dialog> driven by showModal (focus trap, Esc, top layer), focus
 * on Close when it opens, arrow keys to browse and backdrop click to close.
 * Themes only supply markup and styling.
 */
export function useGalleryLightbox(count: number) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const show = useCallback((index: number) => setOpenIndex(wrapGalleryIndex(index, count)), [count]);
  const close = useCallback(() => setOpenIndex(null), []);

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

  const dialogProps = {
    ref: dialogRef,
    onClose: close,
    onClick: (event: MouseEvent<HTMLDialogElement>) => {
      // Only a click on the backdrop (the dialog element itself) closes it.
      if (event.target === event.currentTarget) close();
    },
    onKeyDown: (event: KeyboardEvent<HTMLDialogElement>) => {
      if (openIndex === null) return;
      if (event.key === "ArrowRight") show(openIndex + 1);
      if (event.key === "ArrowLeft") show(openIndex - 1);
    },
  };

  return { openIndex, show, close, closeRef, dialogProps };
}
