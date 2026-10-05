import Link from "next/link";

import { cn } from "@/lib/utils";
import type { SiteSettings } from "@/server/marketing/queries";

import { BrandMark } from "./brand-mark";
import { OrderLink } from "./order-link";
import { mk } from "./styles";

export function SiteFooter({ settings }: { settings: SiteSettings }) {
  return (
    <footer className="border-t border-tr-line bg-tr-paper">
      <div className={cn(mk.container, "flex flex-col gap-8 py-10 md:flex-row md:items-start md:justify-between")}>
        <div className="max-w-sm">
          <BrandMark />
          <p className="mt-3 text-sm leading-6 text-tr-muted">
            Undangan digital untuk pernikahan dan perayaan lainnya. Dibuat rapi, dibagikan lewat satu link.
          </p>
        </div>
        <nav aria-label="Kaki halaman" className="grid grid-cols-2 gap-x-10 gap-y-2 text-sm">
          <Link href="/template" className="text-tr-muted hover:text-tr-ink">
            Template
          </Link>
          <Link href="/#paket" className="text-tr-muted hover:text-tr-ink">
            Paket
          </Link>
          <Link href="/#cara-pesan" className="text-tr-muted hover:text-tr-ink">
            Cara pesan
          </Link>
          <Link href="/#faq" className="text-tr-muted hover:text-tr-ink">
            FAQ
          </Link>
          <OrderLink settings={settings} className="text-tr-muted hover:text-tr-ink">
            WhatsApp
          </OrderLink>
          {settings.instagramUrl ? (
            <a href={settings.instagramUrl} target="_blank" rel="noreferrer" className="text-tr-muted hover:text-tr-ink">
              Instagram
              <span className="sr-only"> (tab baru)</span>
            </a>
          ) : null}
        </nav>
      </div>
      <div className={cn(mk.container, "border-t border-tr-line pt-5 text-xs text-tr-muted", settings.whatsappNumber ? "pb-28 sm:pb-5" : "pb-5")}>
        © {new Date().getFullYear()} Temuraya
      </div>
    </footer>
  );
}
