"use client";

import Image from "next/image";
import { useState } from "react";

import { isOptimizableImage } from "@/themes/shared/image-source";

import { BotanicalDivider } from "./Botanical";

/**
 * Fills its positioned parent (the caller owns the aspect ratio, so there
 * is no layout shift). Uploaded media from the invitation bucket goes
 * through next/image so each device downloads a size that fits `sizes`;
 * any other URL is passed through untouched. A failed load keeps the
 * composition with a quiet placeholder instead of a broken-image icon.
 */
export function EditorialImage({
  src,
  alt,
  sizes,
  className = "ni-photo",
  priority = false,
}: {
  src: string;
  alt: string;
  /** How wide the image renders, e.g. "(min-width: 900px) 33vw, 50vw". */
  sizes: string;
  className?: string;
  priority?: boolean;
}) {
  const [failedSource, setFailedSource] = useState<string | null>(null);

  if (failedSource === src) {
    return (
      <div
        className="flex h-full w-full flex-col items-center justify-center gap-4 bg-[var(--ni-cream)] p-6 text-center text-[var(--ni-brown)]"
        role="img"
        aria-label={alt || "Foto tidak tersedia"}
      >
        <BotanicalDivider />
        <span className="ni-serif text-xl">Foto belum dapat ditampilkan</span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      className={className}
      preload={priority}
      unoptimized={!isOptimizableImage(src)}
      onError={() => setFailedSource(src)}
    />
  );
}
