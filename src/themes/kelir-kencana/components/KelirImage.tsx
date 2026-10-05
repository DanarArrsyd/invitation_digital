"use client";

import Image from "next/image";
import { useId, useState } from "react";

import { isOptimizableImage } from "@/themes/shared/image-source";

import { Gunungan } from "./Gunungan";

interface KelirImageProps {
  src: string;
  alt: string;
  sizes: string;
  aspectRatio?: string;
  eager?: boolean;
  className?: string;
}

function usableImageSource(value: string): string | null {
  const source = value.trim();
  if (!source) return null;
  if (source.startsWith("/") && !source.startsWith("//")) return source;

  try {
    const url = new URL(source);
    return url.protocol === "http:" || url.protocol === "https:" ? source : null;
  } catch {
    return null;
  }
}

export function KelirImage({
  src,
  alt,
  sizes,
  aspectRatio = "4 / 5",
  eager = false,
  className = "",
}: KelirImageProps) {
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const fallbackId = `kk-fallback-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const usableSource = usableImageSource(src);
  const showFallback = usableSource === null || failedSource === usableSource;

  return (
    <div className={`kk-media ${className}`} style={{ aspectRatio }}>
      {showFallback ? (
        <div className="kk-image-fallback" role="img" aria-label={alt}>
          <Gunungan uid={fallbackId} />
          <span aria-hidden="true">Foto tidak dapat dimuat</span>
        </div>
      ) : (
        <Image
          src={usableSource}
          alt={alt}
          fill
          sizes={sizes}
          loading={eager ? "eager" : "lazy"}
          fetchPriority={eager ? "high" : undefined}
          unoptimized={!isOptimizableImage(usableSource)}
          onError={() => setFailedSource(usableSource)}
        />
      )}
    </div>
  );
}
