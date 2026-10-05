import { ExternalLink } from "lucide-react";
import type { Metadata } from "next";

import { FormField } from "@/components/admin/form-field";
import { PageHeader } from "@/components/admin/page-header";
import { SubmitButton } from "@/components/admin/submit-button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { buildOrderMessage, buildWhatsAppUrl } from "@/lib/marketing/whatsapp";
import { getAdminSiteSettings } from "@/server/marketing/admin-queries";

import { updateSiteContactAction } from "../actions";

export const metadata: Metadata = {
  title: "Kontak",
};

const DEFAULT_MESSAGE = "Halo Temuraya, saya mau pesan template {template} paket {paket} untuk {acara}.";

export default async function SiteContactPage() {
  const settings = await getAdminSiteSettings();
  const message = settings?.whatsapp_message ?? DEFAULT_MESSAGE;
  const sample = buildOrderMessage(message, { template: "Terra Botanica", paket: "Signature", acara: "Pernikahan" });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Kontak"
        description="Tombol pesan di situs membuka WhatsApp ke nomor ini dengan pesan yang sudah terisi."
      />

      <form
        action={updateSiteContactAction}
        className="flex max-w-2xl flex-col gap-5 rounded-2xl border border-border bg-card p-5 sm:p-6"
      >
        <FormField
          id="whatsappNumber"
          label="Nomor WhatsApp bisnis"
          hint="Boleh ditulis 0812…, +62 812…, atau 62812…. Kosongkan untuk menyembunyikan tombol pesan."
        >
          <Input
            id="whatsappNumber"
            name="whatsappNumber"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            defaultValue={settings?.whatsapp_number ? `+${settings.whatsapp_number}` : ""}
          />
        </FormField>

        <FormField
          id="whatsappMessage"
          label="Isi pesan otomatis"
          hint="{template}, {paket} dan {acara} diganti sesuai pilihan pengunjung. Bagian yang tidak dipilih dihapus otomatis."
        >
          <Textarea id="whatsappMessage" name="whatsappMessage" rows={3} maxLength={500} defaultValue={message} required />
        </FormField>

        <div className="rounded-xl bg-muted px-4 py-3 text-sm">
          <p className="text-muted-foreground">Contoh pesan</p>
          <p className="mt-1">{sample}</p>
          {settings?.whatsapp_number ? (
            <a
              href={buildWhatsAppUrl(settings.whatsapp_number, sample)}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex items-center gap-1.5 font-medium text-[#3f5a45] underline-offset-4 hover:underline"
            >
              Coba buka di WhatsApp
              <ExternalLink aria-hidden="true" className="size-3.5" />
              <span className="sr-only">(tab baru)</span>
            </a>
          ) : null}
        </div>

        <FormField id="instagramUrl" label="Instagram" hint="@username atau link instagram.com. Opsional.">
          <Input id="instagramUrl" name="instagramUrl" autoComplete="off" defaultValue={settings?.instagram_url ?? ""} />
        </FormField>

        <SubmitButton className="w-fit">Simpan kontak</SubmitButton>
      </form>
    </div>
  );
}
