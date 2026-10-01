"use client";

import Image from "next/image";
import { useState } from "react";

import { CeramicLine } from "./RivieraOrnaments";

interface RivieraImageProps {
  src: string;
  alt: string;
  sizes: string;
  aspectRatio?: string;
  eager?: boolean;
  className?: string;
}

export function RivieraImage({
  src,
  alt,
  sizes,
  aspectRatio = "4 / 5",
  eager = false,
  className = "",
}: RivieraImageProps) {
  const [failedSource, setFailedSource] = useState<string | null>(null);

  return (
    <div className={`cr-media ${className}`} style={{ aspectRatio }}>
      {failedSource === src ? (
        <div className="cr-image-fallback" role="img" aria-label={alt}>
          <CeramicLine />
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
