"use client";

import Image from "next/image";
import { useState } from "react";

import { isOptimizableImage } from "@/themes/shared/image-source";

export function EditorialImage({ src, alt, sizes, aspectRatio = "4 / 5", eager = false, className = "" }: {
  src: string;
  alt: string;
  sizes: string;
  aspectRatio?: string;
  eager?: boolean;
  className?: string;
}) {
  const [failedSource, setFailedSource] = useState<string | null>(null);
  return (
    <div className={`jk-media ${className}`} style={{ aspectRatio }}>
      {failedSource === src ? (
        <div className="jk-image-fallback" role="img" aria-label={alt}>
          <span className="jk-image-fallback-mark" aria-hidden="true">J / K</span>
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
          // Remote storage retains its existing delivery until an optimizer host is configured.
          unoptimized={!isOptimizableImage(src)}
          onError={() => setFailedSource(src)}
        />
      )}
    </div>
  );
}
