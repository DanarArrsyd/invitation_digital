import { cn } from "@/lib/utils";

import { BrandMark } from "./brand-mark";

/**
 * A plain phone frame around a real template screenshot. Without a
 * screenshot it shows a branded placeholder, never a fake interface.
 */
export function PhoneMockup({
  src,
  alt,
  priority = false,
  className,
}: {
  src: string | null;
  alt: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative aspect-[9/19.5] w-full overflow-hidden rounded-[2rem] border-[6px] border-tr-ink bg-tr-ink shadow-[0_30px_60px_-24px_rgba(23,32,27,0.45)]",
        className,
      )}
    >
      <div className="absolute top-2 left-1/2 z-10 h-4 w-16 -translate-x-1/2 rounded-full bg-tr-ink" aria-hidden="true" />
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          decoding="async"
          className="h-full w-full rounded-[1.6rem] object-cover object-top"
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-3 rounded-[1.6rem] bg-tr-forest px-4 text-center">
          <BrandMark tone="light" />
          <p className="text-xs text-white/60">{alt}</p>
        </div>
      )}
    </div>
  );
}
