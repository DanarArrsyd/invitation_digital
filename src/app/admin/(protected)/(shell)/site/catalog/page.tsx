import { ExternalLink, ImagePlus, Star, Trash2 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { FormField } from "@/components/admin/form-field";
import { PageHeader } from "@/components/admin/page-header";
import { SubmitButton } from "@/components/admin/submit-button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { EVENT_TYPE_LABELS, EVENT_TYPES } from "@/lib/marketing/event-types";
import { getMediaPublicUrl } from "@/lib/supabase/storage";
import { getAdminCatalogue, type AdminCatalogueTheme } from "@/server/marketing/admin-queries";

import {
  addThemeScreenshotsAction,
  makeThemeScreenshotCoverAction,
  removeThemeScreenshotAction,
  setThemeDemoAction,
  updateThemeCatalogueAction,
} from "../actions";

export const metadata: Metadata = {
  title: "Katalog Template",
};

const STATUS_LABELS: Record<string, string> = {
  draft: "Draf",
  published: "Terbit",
  expired: "Kedaluwarsa",
  archived: "Diarsipkan",
};

export default async function SiteCataloguePage() {
  const catalogue = await getAdminCatalogue();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Katalog Template"
        description="Atur template mana yang tampil di situs, screenshot, deskripsi, dan undangan demonya."
      />

      {catalogue.map((entry) => (
        <ThemeSection key={entry.theme.id} entry={entry} />
      ))}
    </div>
  );
}

function ThemeSection({ entry: { theme, invitations } }: { entry: AdminCatalogueTheme }) {
  const demo = invitations.find((invitation) => invitation.is_demo) ?? null;
  const id = (name: string) => `${theme.id}-${name}`;

  return (
    <section
      id={`theme-${theme.id}`}
      aria-labelledby={id("heading")}
      className="scroll-mt-20 rounded-2xl border border-border bg-card p-5 sm:p-6"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 id={id("heading")} className="text-lg font-semibold tracking-[-0.02em]">
            {theme.name}
          </h2>
          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="outline">{theme.is_listed ? "Tampil di situs" : "Disembunyikan"}</Badge>
            <Badge variant="outline">{demo ? "Demo siap" : "Belum ada demo"}</Badge>
            <span>{theme.slug}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 text-sm">
          {theme.is_listed ? (
            <Link href={`/template/${theme.slug}`} target="_blank" className="inline-flex items-center gap-1.5 font-medium text-[#3f5a45] hover:underline">
              Halaman template <ExternalLink aria-hidden="true" className="size-3.5" />
              <span className="sr-only">(tab baru)</span>
            </Link>
          ) : null}
          {theme.is_listed && demo ? (
            <Link href={`/demo/${theme.slug}`} target="_blank" className="inline-flex items-center gap-1.5 font-medium text-[#3f5a45] hover:underline">
              Buka demo <ExternalLink aria-hidden="true" className="size-3.5" />
              <span className="sr-only">(tab baru)</span>
            </Link>
          ) : null}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <form action={updateThemeCatalogueAction} className="flex flex-col gap-4">
          <input type="hidden" name="themeId" value={theme.id} />

          <div className="flex items-center justify-between gap-3 rounded-xl bg-muted px-3 py-2.5">
            <Label htmlFor={id("listed")}>Tampilkan di situs</Label>
            <Switch id={id("listed")} name="isListed" defaultChecked={theme.is_listed} />
          </div>

          <FormField id={id("tagline")} label="Tagline" hint="Satu baris di kartu template.">
            <Input id={id("tagline")} name="tagline" maxLength={120} defaultValue={theme.tagline ?? ""} />
          </FormField>

          <FormField id={id("description")} label="Deskripsi" hint="Tampil di halaman detail template.">
            <Textarea id={id("description")} name="description" rows={3} maxLength={600} defaultValue={theme.description ?? ""} />
          </FormField>

          <fieldset className="flex flex-col gap-2">
            <legend className="text-sm font-medium">Jenis acara</legend>
            <p className="text-xs text-muted-foreground">
              Centang hanya jenis acara yang isi templatenya sudah sesuai. Jenis lain tampil sebagai “Segera hadir”.
            </p>
            <div className="mt-1 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {EVENT_TYPES.map((type) => (
                <label key={type} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm">
                  <input
                    type="checkbox"
                    name="eventTypes"
                    value={type}
                    defaultChecked={theme.event_types.includes(type)}
                    className="size-4 accent-[#1f2b25]"
                  />
                  {EVENT_TYPE_LABELS[type]}
                </label>
              ))}
            </div>
          </fieldset>

          <FormField id={id("sort")} label="Urutan" hint="Angka kecil tampil lebih dulu.">
            <Input id={id("sort")} name="sortOrder" type="number" min={0} max={999} defaultValue={theme.sort_order} className="w-28" />
          </FormField>

          <SubmitButton className="w-fit">Simpan template</SubmitButton>
        </form>

        <div className="flex flex-col gap-6">
          <div>
            <h3 className="text-sm font-medium">Screenshot</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Ukuran HP (contoh 1080×2340). Screenshot pertama jadi cover di kartu dan mockup.
            </p>
            {theme.screenshot_paths.length > 0 ? (
              <ul className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4">
                {theme.screenshot_paths.map((path, index) => (
                  <li key={path} className="flex flex-col gap-1.5">
                    <div className="relative aspect-[9/19.5] overflow-hidden rounded-lg border border-border bg-muted">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={getMediaPublicUrl(path) ?? ""} alt={`Screenshot ${index + 1}`} loading="lazy" className="h-full w-full object-cover" />
                      {index === 0 ? (
                        <span className="absolute top-1.5 left-1.5 rounded-full bg-[#1f2b25] px-2 py-0.5 text-[0.65rem] font-medium text-white">
                          Cover
                        </span>
                      ) : null}
                    </div>
                    <div className="flex gap-1">
                      {index > 0 ? (
                        <form action={makeThemeScreenshotCoverAction}>
                          <input type="hidden" name="themeId" value={theme.id} />
                          <input type="hidden" name="path" value={path} />
                          <button type="submit" className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">
                            <Star aria-hidden="true" className="size-4" />
                            <span className="sr-only">Jadikan cover screenshot {index + 1}</span>
                          </button>
                        </form>
                      ) : null}
                      <form action={removeThemeScreenshotAction}>
                        <input type="hidden" name="themeId" value={theme.id} />
                        <input type="hidden" name="path" value={path} />
                        <button type="submit" className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                          <Trash2 aria-hidden="true" className="size-4" />
                          <span className="sr-only">Hapus screenshot {index + 1}</span>
                        </button>
                      </form>
                    </div>
                  </li>
                ))}
              </ul>
            ) : null}
            <form action={addThemeScreenshotsAction} className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
              <input type="hidden" name="themeId" value={theme.id} />
              <label htmlFor={id("screens")} className="sr-only">
                Pilih screenshot {theme.name}
              </label>
              <input
                id={id("screens")}
                type="file"
                name="screenshots"
                accept="image/jpeg,image/png,image/webp"
                multiple
                required
                className="min-w-0 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-sm file:font-medium"
              />
              <SubmitButton variant="outline" pendingText="Mengunggah..." className="w-fit">
                <ImagePlus aria-hidden="true" />
                Unggah
              </SubmitButton>
            </form>
          </div>

          <form action={setThemeDemoAction} className="flex flex-col gap-2">
            <input type="hidden" name="themeId" value={theme.id} />
            <label htmlFor={id("demo")} className="text-sm font-medium">
              Undangan demo
            </label>
            <p className="text-xs text-muted-foreground">
              Buat undangan biasa dengan template ini dan foto contoh, lalu pilih di sini. Undangan demo tidak bisa dibuka
              lewat link biasa dan RSVP atau ucapannya tidak tersimpan.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <select
                id={id("demo")}
                name="invitationId"
                defaultValue={demo?.id ?? ""}
                className="h-9 min-w-0 flex-1 rounded-lg border border-input bg-card px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
              >
                <option value="">Tanpa demo</option>
                {invitations.map((invitation) => (
                  <option key={invitation.id} value={invitation.id}>
                    {invitation.title} ({invitation.is_demo ? "demo" : STATUS_LABELS[invitation.status] ?? invitation.status})
                  </option>
                ))}
              </select>
              <SubmitButton variant="outline" className="w-fit">
                Pasang demo
              </SubmitButton>
            </div>
            {invitations.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                Belum ada undangan dengan template ini.{" "}
                <Link href="/admin/invitations/new" className="font-medium text-foreground underline underline-offset-2">
                  Buat undangan
                </Link>
              </p>
            ) : null}
            {demo ? (
              <Link href={`/admin/invitations/${demo.id}/general`} className="text-xs font-medium text-[#3f5a45] hover:underline">
                Edit isi undangan demo
              </Link>
            ) : null}
          </form>
        </div>
      </div>
    </section>
  );
}
