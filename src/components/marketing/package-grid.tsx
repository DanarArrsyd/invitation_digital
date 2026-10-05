import { Check } from "lucide-react";
import Link from "next/link";

import { getPackageHighlights } from "@/lib/marketing/package-features";
import { describePackagePrice } from "@/lib/marketing/price";
import { PACKAGE_DEFINITIONS } from "@/lib/packages/entitlements";
import { cn } from "@/lib/utils";
import type { MarketingTemplate, PackageOffer, SiteSettings } from "@/server/marketing/queries";

import { OrderLink } from "./order-link";
import { mk } from "./styles";

/**
 * The three packages. Phones and tablets scroll them sideways (snap), so each
 * plan keeps a readable width; desktops show them side by side.
 */
export function PackageGrid({
  offers,
  settings,
  template,
}: {
  offers: PackageOffer[];
  settings: SiteSettings;
  /** On a template page the order message and demo links name that template. */
  template?: Pick<MarketingTemplate, "name" | "slug" | "hasDemo">;
}) {
  const visible = offers.filter((offer) => offer.isVisible);
  if (visible.length === 0) return null;

  return (
    <ul
      className={cn(
        "-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pt-3 pb-4 [scrollbar-width:none] sm:-mx-6 sm:px-6",
        "lg:mx-0 lg:grid lg:overflow-visible lg:px-0",
        visible.length === 3 ? "lg:grid-cols-3" : visible.length === 2 ? "lg:grid-cols-2" : "lg:grid-cols-1",
      )}
    >
      {visible.map((offer) => {
        const definition = PACKAGE_DEFINITIONS[offer.packageKey];
        const price = describePackagePrice({ price_idr: offer.priceIdr, price_note: offer.priceNote });
        const highlighted = definition.recommended;
        return (
          <li
            key={offer.packageKey}
            className={cn(
              "relative flex w-[82%] max-w-[22rem] shrink-0 snap-center flex-col rounded-2xl border p-6 sm:w-[46%] lg:w-auto lg:max-w-none",
              highlighted ? "border-tr-forest bg-tr-forest text-tr-paper" : "border-tr-line bg-tr-card text-tr-ink",
            )}
          >
            {highlighted ? (
              <span className="absolute -top-3 left-6 rounded-full bg-tr-paper px-3 py-1 text-xs font-medium text-tr-forest ring-1 ring-tr-forest">
                Paling dipilih
              </span>
            ) : null}
            <h3 className="text-xl font-semibold tracking-[-0.02em]">{definition.label}</h3>
            <p className={cn("mt-1 text-sm", highlighted ? "text-white/70" : "text-tr-muted")}>{definition.description}</p>
            <p className="mt-5 flex flex-wrap items-baseline gap-x-2">
              {price.note ? (
                <span className={cn("text-sm", highlighted ? "text-white/70" : "text-tr-muted")}>{price.note}</span>
              ) : null}
              <span className="text-[1.75rem] font-semibold tracking-[-0.03em] tabular-nums">{price.label}</span>
            </p>
            <ul className={cn("mt-5 flex flex-col gap-2.5 text-sm", highlighted ? "text-white/85" : "text-tr-ink")}>
              {getPackageHighlights(offer.packageKey).map((item) => (
                <li key={item} className="flex gap-2.5">
                  <Check aria-hidden="true" className={cn("mt-0.5 size-4 shrink-0", highlighted ? "text-white" : "text-tr-sage")} />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-auto flex flex-col gap-2 pt-6">
              <OrderLink
                settings={settings}
                values={{ template: template?.name, paket: definition.label }}
                className={highlighted ? mk.buttonOnDark : mk.buttonPrimary}
                fallback={
                  <p className={cn("text-sm", highlighted ? "text-white/70" : "text-tr-muted")}>
                    Pemesanan dibuka segera.
                  </p>
                }
              >
                Pesan {definition.label}
              </OrderLink>
              {template?.hasDemo ? (
                <Link
                  href={`/demo/${template.slug}?paket=${offer.packageKey}`}
                  className={cn(
                    "text-center text-sm font-medium underline-offset-4 hover:underline",
                    highlighted ? "text-white" : "text-tr-sage",
                  )}
                >
                  Lihat demo {definition.label}
                </Link>
              ) : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
