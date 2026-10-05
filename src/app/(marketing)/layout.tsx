import type { Metadata } from "next";

import { MobileOrderBar } from "@/components/marketing/mobile-order-bar";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { shareMetadata } from "@/lib/marketing/share-metadata";
import { getSiteSettings } from "@/server/marketing/queries";

export const metadata: Metadata = {
  title: {
    default: "Temuraya | Undangan digital untuk setiap perayaan",
    template: "%s | Temuraya",
  },
  description:
    "Undangan digital dengan nama tamu personal, RSVP, ucapan, musik, dan peta lokasi. Pilih template, lihat demo, pesan lewat WhatsApp.",
  ...shareMetadata(
    "Temuraya | Undangan digital untuk setiap perayaan",
    "Undangan digital dengan nama tamu personal, RSVP, ucapan, musik, dan peta lokasi. Pilih template, lihat demo, pesan lewat WhatsApp.",
  ),
};

export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();

  return (
    <div className="flex min-h-svh flex-col bg-tr-paper text-tr-ink">
      <a
        href="#konten"
        className="sr-only z-50 rounded-lg bg-tr-forest px-4 py-2 text-sm text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Langsung ke konten
      </a>
      <SiteHeader settings={settings} />
      <main id="konten" className="flex-1">
        {children}
      </main>
      <SiteFooter settings={settings} />
      <MobileOrderBar settings={settings} />
    </div>
  );
}
