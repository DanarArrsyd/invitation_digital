import { notFound } from "next/navigation";

import { ColorListInput } from "@/components/admin/color-list-input";
import { ConfirmDeleteForm } from "@/components/admin/confirm-delete-form";
import { FormField } from "@/components/admin/form-field";
import { FormMessage } from "@/components/admin/form-message";
import { SubmitButton } from "@/components/admin/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { getRequiredPackageForFeature, PACKAGE_DEFINITIONS, type PackageKey } from "@/lib/packages/entitlements";
import { getMediaPublicUrl } from "@/lib/supabase/storage";
import { getDressCode } from "@/lib/utils/dressCode";
import { getInvitationDetail } from "@/server/invitations/queries";

import { deleteStoryAction, updateContentAction, updateDressCodeAction, upsertStoryAction } from "./actions";
import { uploadStoryImageAction } from "./media-actions";

export default async function ContentPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const { id } = await params;
  const { error, saved } = await searchParams;

  const detail = await getInvitationDetail(id);
  if (!detail) notFound();

  const { invitation, stories } = detail;
  const dressCode = getDressCode(invitation.settings);
  const group1 = dressCode?.groups[0];
  const group2 = dressCode?.groups[1];
  const dressCodeLocked = !PACKAGE_DEFINITIONS[invitation.package_key as PackageKey].invitationFeatures.dressCode;
  const dressCodePackage = getRequiredPackageForFeature("dressCode");

  return (
    <div className="flex flex-col gap-10">
      {error || saved ? (
        <div className="-mb-4">
          <FormMessage tone="error">{error}</FormMessage>
          <FormMessage tone="success">{!error && saved ? "Tersimpan." : null}</FormMessage>
        </div>
      ) : null}

      <section>
        <h2 className="text-sm font-semibold text-foreground">Pembuka &amp; penutup</h2>
        <form action={updateContentAction} className="mt-4 flex max-w-lg flex-col gap-4">
          <input type="hidden" name="invitationId" value={invitation.id} />

          <div className="flex flex-col gap-2">
            <Label htmlFor="openingQuote">Kutipan pembuka</Label>
            <Textarea
              id="openingQuote"
              name="openingQuote"
              defaultValue={invitation.opening_quote ?? ""}
              rows={2}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="openingMessage">Pesan pembuka</Label>
            <Textarea
              id="openingMessage"
              name="openingMessage"
              defaultValue={invitation.opening_message ?? ""}
              rows={3}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="closingMessage">Pesan penutup</Label>
            <Textarea
              id="closingMessage"
              name="closingMessage"
              defaultValue={invitation.closing_message ?? ""}
              rows={3}
            />
          </div>

          <SubmitButton className="mt-2 w-fit">Simpan</SubmitButton>
        </form>
      </section>

      <Separator />

      <section>
        <h2 className="text-sm font-semibold text-foreground">Dress Code</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {dressCodeLocked && dressCodePackage
            ? `Tersedia di ${PACKAGE_DEFINITIONS[dressCodePackage].label}. Konten tersimpan tetap disimpan.`
            : "Aktifkan section ini lewat tab Features."}
        </p>
        <form action={updateDressCodeAction} className="mt-4 flex max-w-lg flex-col gap-4">
          <input type="hidden" name="invitationId" value={invitation.id} />
          <fieldset disabled={dressCodeLocked} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="dressCodeDescription">Deskripsi</Label>
              <Textarea
                id="dressCodeDescription"
                name="description"
                defaultValue={dressCode?.description ?? ""}
                rows={2}
                placeholder="Kami dengan hormat menganjurkan tamu untuk mengenakan busana dengan nuansa warna berikut."
              />
            </div>

            <div className="flex flex-col gap-3 rounded-lg border border-border p-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="group1Label">Label grup 1</Label>
                <Input id="group1Label" name="group1Label" defaultValue={group1?.label ?? ""} placeholder="Pria" />
              </div>
              <ColorListInput name="group1Colors" defaultValue={group1?.colors.join(", ") ?? ""} label="Warna grup 1" />
            </div>

            <div className="flex flex-col gap-3 rounded-lg border border-border p-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="group2Label">Label grup 2</Label>
                <Input id="group2Label" name="group2Label" defaultValue={group2?.label ?? ""} placeholder="Wanita" />
              </div>
              <ColorListInput name="group2Colors" defaultValue={group2?.colors.join(", ") ?? ""} label="Warna grup 2" />
            </div>

            <SubmitButton className="mt-2 w-fit">Simpan</SubmitButton>
          </fieldset>
        </form>
      </section>

      <Separator />

      <section>
        <h2 className="text-sm font-semibold text-foreground">Love Story</h2>

        <div className="mt-4 flex flex-col gap-4">
          {stories.map((story) => (
            <div key={story.id} className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {story.year_label ?? story.story_date ?? ""} — {story.title}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">{story.description}</p>
                  {story.image_path ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={getMediaPublicUrl(story.image_path) ?? undefined}
                      alt=""
                      className="mt-2 h-24 w-24 rounded-md object-cover"
                    />
                  ) : null}
                </div>
                <ConfirmDeleteForm
                  action={deleteStoryAction}
                  hiddenFields={{ id: story.id, invitationId: invitation.id }}
                  title="Hapus cerita ini?"
                  description={`"${story.title}" akan dihapus dari Love Story. Tindakan ini tidak bisa dibatalkan.`}
                />
              </div>

              <form action={uploadStoryImageAction} className="mt-3 flex flex-wrap items-center gap-2">
                <input type="hidden" name="invitationId" value={invitation.id} />
                <input type="hidden" name="storyId" value={story.id} />
                <Input
                  type="file"
                  name="file"
                  accept="image/png,image/jpeg,image/webp"
                  aria-label={`Foto untuk cerita ${story.title}`}
                  className="max-w-xs"
                  required
                />
                <SubmitButton variant="outline" size="sm" pendingText="Mengunggah...">
                  Unggah foto
                </SubmitButton>
              </form>
            </div>
          ))}

          <form
            action={upsertStoryAction}
            className="grid max-w-lg gap-3 rounded-lg border border-dashed border-border p-4 sm:grid-cols-2"
          >
            <input type="hidden" name="invitationId" value={invitation.id} />
            <input type="hidden" name="sortOrder" value={stories.length} />

            <FormField id="story-new-title" label="Judul" className="sm:col-span-2">
              <Input id="story-new-title" name="title" required />
            </FormField>
            <FormField id="story-new-yearLabel" label="Label tahun">
              <Input id="story-new-yearLabel" name="yearLabel" placeholder="2019" />
            </FormField>
            <FormField id="story-new-storyDate" label="Tanggal">
              <Input id="story-new-storyDate" name="storyDate" type="date" />
            </FormField>
            <FormField id="story-new-description" label="Cerita" className="sm:col-span-2">
              <Textarea id="story-new-description" name="description" rows={2} />
            </FormField>

            <SubmitButton className="w-fit sm:col-span-2" pendingText="Menambahkan...">
              Tambah cerita
            </SubmitButton>
          </form>
        </div>
      </section>
    </div>
  );
}
