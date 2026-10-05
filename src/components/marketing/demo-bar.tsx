import { ChevronLeft, MessageCircle } from "lucide-react";
import Link from "next/link";

import { PACKAGE_DEFINITIONS, PACKAGE_KEYS, type PackageKey } from "@/lib/packages/entitlements";
import { cn } from "@/lib/utils";
import type { SiteSettings } from "@/server/marketing/queries";

import { OrderLink } from "./order-link";

/**
 * Sits above the theme (its cover is z-50) at the top edge, so it never covers
 * a theme's bottom navigation. Plain links: switching package is a navigation,
 * no client JavaScript needed.
 */
export function DemoBar({
  templateName,
  themeSlug,
  packageKey,
  guestName,
  settings,
}: {
  templateName: string;
  themeSlug: string;
  packageKey: PackageKey;
  guestName: string;
  settings: SiteSettings;
}) {
  const label = PACKAGE_DEFINITIONS[packageKey].label;
  return (
    <div
      role="region"
      aria-label="Mode demo"
      className="sticky top-0 z-[60] border-b border-white/10 bg-tr-forest/95 text-tr-paper backdrop-blur-md"
    >
      <div className="mx-auto flex h-12 max-w-6xl items-center gap-2 px-2 sm:gap-4 sm:px-4">
        <Link
          href={`/template/${themeSlug}`}
          className="flex size-9 shrink-0 items-center justify-center rounded-lg hover:bg-white/10 sm:w-auto sm:gap-1.5 sm:px-2.5"
        >
          <ChevronLeft aria-hidden="true" className="size-4" />
          <span className="sr-only sm:not-sr-only sm:text-sm">{templateName}</span>
        </Link>

        <p className="hidden text-xs text-white/60 md:block">Demo, data tidak disimpan</p>

        <nav aria-label="Paket demo" className="mx-auto flex rounded-full bg-white/10 p-0.5 md:mx-0 md:ml-auto">
          {PACKAGE_KEYS.map((key) => {
            const active = key === packageKey;
            return (
              <Link
                key={key}
                href={`/demo/${themeSlug}?paket=${key}&to=${encodeURIComponent(guestName)}`}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-full px-2.5 py-1.5 text-xs font-medium transition sm:px-3.5",
                  active ? "bg-tr-paper text-tr-forest" : "text-white/80 hover:text-white",
                )}
              >
                {PACKAGE_DEFINITIONS[key].label}
              </Link>
            );
          })}
        </nav>

        <OrderLink
          settings={settings}
          values={{ template: templateName, paket: label }}
          className="flex size-9 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-tr-paper text-sm font-medium text-tr-forest sm:w-auto sm:px-3"
        >
          <MessageCircle aria-hidden="true" className="size-4" />
          <span className="sr-only sm:not-sr-only">Pesan</span>
        </OrderLink>
      </div>
    </div>
  );
}
