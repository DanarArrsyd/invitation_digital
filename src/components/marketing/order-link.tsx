import type { ComponentProps, ReactNode } from "react";

import { buildOrderMessage, buildWhatsAppUrl, type OrderMessageValues } from "@/lib/marketing/whatsapp";
import type { SiteSettings } from "@/server/marketing/queries";

/**
 * A WhatsApp link with the order message pre-filled. Renders `fallback`
 * (nothing by default) until the admin sets a number in Situs → Kontak.
 */
export function OrderLink({
  settings,
  values = {},
  fallback = null,
  children,
  ...props
}: {
  settings: SiteSettings;
  values?: Partial<OrderMessageValues>;
  fallback?: ReactNode;
  children: ReactNode;
} & Omit<ComponentProps<"a">, "href" | "children">) {
  if (!settings.whatsappNumber) return <>{fallback}</>;
  const href = buildWhatsAppUrl(settings.whatsappNumber, buildOrderMessage(settings.whatsappMessage, values));
  return (
    <a href={href} target="_blank" rel="noreferrer" {...props}>
      {children}
      <span className="sr-only"> (WhatsApp, tab baru)</span>
    </a>
  );
}
