"use client";

import Image from "next/image";
import { useState } from "react";

import { AtelierMark } from "./AtelierMark";

export function AtelierImage({ src, alt, sizes, aspectRatio = "4 / 5", eager = false, className = "" }: {
  src: string;
  alt: string;
  sizes: string;
  aspectRatio?: string;
  eager?: boolean;
  className?: string;
}) {
  const [failedSource, setFailedSource] = useState<string | null>(null);

  return (
    <div className={`ma-media ${className}`} style={{ aspectRatio }}>
      {failedSource === src ? (
        <div className="ma-image-fallback" role="img" aria-label={alt}>
          <AtelierMark />
          <span aria-hidden="true">Foto tidak dapat dimuat</span>
        </div>
      ) : (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          loading={eager ? "eager" : "lazy"}
          fetchPriority={eager ? "high" : undefined}
          unoptimized={!src.startsWith("/") || src.startsWith("//")}
          onError={() => setFailedSource(src)}
        />
      )}
    </div>
  );
}
