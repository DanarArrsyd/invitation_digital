import { Menu, MessageCircle, X } from "lucide-react";
import Link from "next/link";

import type { SiteSettings } from "@/server/marketing/queries";

import { BrandMark } from "./brand-mark";
import { OrderLink } from "./order-link";
import { mk } from "./styles";

const NAV = [
  { href: "/template", label: "Template" },
  { href: "/#cara-pesan", label: "Cara pesan" },
  { href: "/#paket", label: "Paket" },
  { href: "/#faq", label: "FAQ" },
] as const;

/**
 * Sticky brand header. The phone menu is a native <details> disclosure, so it
 * works without JavaScript and needs no client bundle.
 */
export function SiteHeader({ settings }: { settings: SiteSettings }) {
  return (
    <header className="sticky top-0 z-40 border-b border-tr-line/80 bg-tr-paper/90 backdrop-blur-md">
      <div className={`${mk.container} flex h-16 items-center justify-between gap-4`}>
        <Link href="/" className="rounded-md focus-visible:ring-3 focus-visible:ring-tr-sage/40 focus-visible:outline-none">
          <BrandMark />
          <span className="sr-only">, beranda</span>
        </Link>

        <nav aria-label="Utama" className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-tr-muted transition hover:bg-tr-mist hover:text-tr-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <OrderLink settings={settings} className={`${mk.buttonPrimary} hidden h-10 px-4 sm:inline-flex`}>
            <MessageCircle aria-hidden="true" className="size-4" />
            Pesan via WhatsApp
          </OrderLink>

          <details className="group relative md:hidden">
            <summary className="flex size-10 cursor-pointer list-none items-center justify-center rounded-xl border border-tr-ink/15 bg-tr-card text-tr-ink [&::-webkit-details-marker]:hidden">
              <Menu aria-hidden="true" className="size-5 group-open:hidden" />
              <X aria-hidden="true" className="hidden size-5 group-open:block" />
              <span className="sr-only">Menu</span>
            </summary>
            <nav
              aria-label="Menu"
              className="absolute top-12 right-0 flex w-56 flex-col rounded-2xl border border-tr-line bg-tr-card p-2 shadow-[0_20px_40px_-20px_rgba(23,32,27,0.35)]"
            >
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-xl px-3 py-3 text-[0.95rem] font-medium text-tr-ink hover:bg-tr-mist"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
