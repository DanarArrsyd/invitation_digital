"use client";

import { track } from "@vercel/analytics";
import { useSyncExternalStore, type ComponentProps, type ReactNode } from "react";

import { parseVisitSource, readVisitSourceSnapshot } from "@/lib/marketing/visit-source";
import { buildOrderWhatsAppUrl, type OrderMessageValues } from "@/lib/marketing/whatsapp";
import type { SiteSettings } from "@/server/marketing/queries";

// The source only changes with the URL (a navigation re-renders the link), so
// there is nothing to subscribe to.
const subscribe = () => () => {};
const getServerSnapshot = () => null;

/**
 * A WhatsApp link with the order message pre-filled. The server renders the
 * default message; after hydration the link adds the visit source
 * (utm_source/utm_campaign) when there is one. Renders `fallback` (nothing by
 * default) until the admin sets a number in Situs → Kontak.
 */
export function OrderLink({
  settings,
  values = {},
  fallback = null,
  children,
  onClick,
  ...props
}: {
  settings: SiteSettings;
  values?: Partial<OrderMessageValues>;
  fallback?: ReactNode;
  children: ReactNode;
} & Omit<ComponentProps<"a">, "href" | "children">) {
  const snapshot = useSyncExternalStore(subscribe, readVisitSourceSnapshot, getServerSnapshot);
  if (!settings.whatsappNumber) return <>{fallback}</>;
  const visit = parseVisitSource(snapshot);
  const href = buildOrderWhatsAppUrl(settings.whatsappNumber, settings.whatsappMessage, values, visit);
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      onClick={(event) => {
        onClick?.(event);
        // Recorded on Vercel Pro/Enterprise; a harmless no-op on Hobby.
        track("wa_click", {
          paket: values.paket ?? "umum",
          source: visit ? (visit.campaign ? `${visit.source}/${visit.campaign}` : visit.source) : "langsung",
        });
      }}
      {...props}
    >
      {children}
      <span className="sr-only"> (WhatsApp, tab baru)</span>
    </a>
  );
}
