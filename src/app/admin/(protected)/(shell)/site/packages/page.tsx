import type { Metadata } from "next";

import { FormField } from "@/components/admin/form-field";
import { PageHeader } from "@/components/admin/page-header";
import { SubmitButton } from "@/components/admin/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { describePackagePrice } from "@/lib/marketing/price";
import { PACKAGE_DEFINITIONS, PACKAGE_KEYS } from "@/lib/packages/entitlements";
import { getAdminPackageOffers } from "@/server/marketing/admin-queries";

import { updatePackageOfferAction } from "../actions";

export const metadata: Metadata = {
  title: "Paket & Harga",
};

export default async function SitePackagesPage() {
  const offers = await getAdminPackageOffers();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Paket & Harga"
        description="Harga yang tampil di situs Temuraya. Kosongkan harga untuk menampilkan “Tanya harga”."
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {PACKAGE_KEYS.map((key) => {
          const definition = PACKAGE_DEFINITIONS[key];
          const offer = offers[key];
          const price = describePackagePrice(offer);
          const id = (name: string) => `${key}-${name}`;

          return (
            <form
              key={key}
              action={updatePackageOfferAction}
              className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5"
            >
              <input type="hidden" name="packageKey" value={key} />
              <div>
                <h2 className="text-lg font-semibold tracking-[-0.02em]">{definition.label}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{definition.description}</p>
              </div>

              <FormField id={id("price")} label="Harga (Rp)" hint="Contoh 149000 atau 149.000">
                <Input
                  id={id("price")}
                  name="price"
                  inputMode="numeric"
                  autoComplete="off"
                  defaultValue={offer?.price_idr ?? ""}
                  placeholder="Kosong = Tanya harga"
                />
              </FormField>

              <FormField id={id("priceNote")} label="Keterangan harga" hint="Opsional, misalnya “mulai dari”">
                <Input id={id("priceNote")} name="priceNote" maxLength={40} defaultValue={offer?.price_note ?? ""} />
              </FormField>

              <div className="flex items-center justify-between gap-3 rounded-xl bg-muted px-3 py-2.5">
                <Label htmlFor={id("visible")}>Tampilkan di situs</Label>
                <Switch id={id("visible")} name="isVisible" defaultChecked={offer?.is_visible ?? true} />
              </div>

              <p className="text-sm text-muted-foreground">
                Tampil sebagai: <span className="font-medium text-foreground">{price.label}</span>
                {price.note ? ` (${price.note})` : null}
              </p>

              <SubmitButton className="mt-auto w-fit">Simpan {definition.label}</SubmitButton>
            </form>
          );
        })}
      </div>
    </div>
  );
}
