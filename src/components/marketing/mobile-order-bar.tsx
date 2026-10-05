import { MessageCircle } from "lucide-react";

import type { SiteSettings } from "@/server/marketing/queries";

import { OrderLink } from "./order-link";
import { mk } from "./styles";

/** Phones keep the order button within thumb reach; larger screens use the header. */
export function MobileOrderBar({ settings }: { settings: SiteSettings }) {
  if (!settings.whatsappNumber) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-tr-line bg-tr-paper/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md sm:hidden">
      <OrderLink settings={settings} className={`${mk.buttonPrimary} w-full`}>
        <MessageCircle aria-hidden="true" className="size-4" />
        Pesan via WhatsApp
      </OrderLink>
    </div>
  );
}
