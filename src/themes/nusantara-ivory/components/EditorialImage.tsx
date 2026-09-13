"use client";

import { useState } from "react";
import { BotanicalDivider } from "./Botanical";

/** Reserve the composition when an uploaded image is unavailable. */
export function EditorialImage({ src, alt, className = "ni-photo", priority = false }: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  const [failedSource, setFailedSource] = useState<string | null>(null);
  if (failedSource === src) return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-[var(--ni-cream)] p-6 text-center text-[var(--ni-brown)]" role="img" aria-label={alt || "Foto tidak tersedia"}>
      <BotanicalDivider />
      <span className="ni-serif text-xl">Foto belum dapat ditampilkan</span>
    </div>
  );
  // Uploaded media comes from the existing normalized URL contract.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className={className} loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : undefined} decoding="async" onError={() => setFailedSource(src)} />;
}
