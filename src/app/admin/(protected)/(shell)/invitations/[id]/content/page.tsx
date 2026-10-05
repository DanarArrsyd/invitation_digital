import { notFound } from "next/navigation";

import { ColorListInput } from "@/components/admin/color-list-input";
import { ConfirmDeleteForm } from "@/components/admin/confirm-delete-form";
import { FormField } from "@/components/admin/form-field";
import { FormMessage } from "@/components/admin/form-message";
import {
  FieldGrid,
  Panel,
  PanelBody,
  PanelFooter,
  PanelHeader,
  SettingsSection,
} from "@/components/admin/settings-section";
import { SubmitButton } from "@/components/admin/submit-button";
import { UnsavedHint } from "@/components/admin/unsaved-hint";
import { FileDrop } from "@/components/admin/file-drop";
import { Input } from "@/components/ui/input";
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
    <div className="flex flex-col">
      {error || saved ? (
        <div className="mb-2 flex flex-col gap-2">
          <FormMessage tone="error">{error}</FormMessage>
          <FormMessage tone="success">{!error && saved ? "Perubahan tersimpan." : null}</FormMessage>
        </div>
      ) : null}

      <SettingsSection
        id="texts"
        title="Pembuka & penutup"
        description="Kutipan tampil di awal undangan, pesan pembuka di bawah nama, dan pesan penutup di bagian akhir. Kosongkan untuk menyembunyikan."
      >
        <Panel>
          <form action={updateContentAction}>
            <input type="hidden" name="invitationId" value={invitation.id} />
            <PanelBody>
              <FormField id="openingQuote" label="Kutipan pembuka" hint="Misalnya ayat atau kutipan puisi beserta sumbernya.">
                <Textarea id="openingQuote" name="openingQuote" defaultValue={invitation.opening_quote ?? ""} rows={3} />
              </FormField>
              <FormField id="openingMessage" label="Pesan pembuka">
                <Textarea id="openingMessage" name="openingMessage" defaultValue={invitation.opening_message ?? ""} rows={3} />
              </FormField>
              <FormField id="closingMessage" label="Pesan penutup">
                <Textarea id="closingMessage" name="closingMessage" defaultValue={invitation.closing_message ?? ""} rows={3} />
              </FormField>
            </PanelBody>
            <PanelFooter>
              <UnsavedHint />
              <SubmitButton>Simpan teks</SubmitButton>
            </PanelFooter>
          </form>
        </Panel>
      </SettingsSection>

      <SettingsSection
        id="dress-code"
        title="Dress Code"
        description={
          dressCodeLocked && dressCodePackage
            ? `Tersedia di ${PACKAGE_DEFINITIONS[dressCodePackage].label}. Konten tersimpan tetap disimpan.`
            : "Saran warna busana untuk tamu, bisa dibagi dua kelompok. Tampil bila bagian Dress Code dinyalakan di Fitur."
        }
      >
        <Panel>
          <form action={updateDressCodeAction}>
            <input type="hidden" name="invitationId" value={invitation.id} />
            <fieldset disabled={dressCodeLocked} className="disabled:opacity-60">
              <PanelBody>
                <FormField id="dressCodeDescription" label="Deskripsi">
                  <Textarea
                    id="dressCodeDescription"
                    name="description"
                    defaultValue={dressCode?.description ?? ""}
                    rows={2}
                    placeholder="Kami dengan hormat menganjurkan tamu untuk mengenakan busana dengan nuansa warna berikut."
                  />
                </FormField>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex flex-col gap-4 rounded-xl border border-border bg-[color-mix(in_oklch,var(--card),var(--muted)_30%)] p-4">
                    <FormField id="group1Label" label="Kelompok 1">
                      <Input id="group1Label" name="group1Label" defaultValue={group1?.label ?? ""} placeholder="Pria" />
                    </FormField>
                    <ColorListInput name="group1Colors" defaultValue={group1?.colors.join(", ") ?? ""} label="Warna kelompok 1" />
                  </div>
                  <div className="flex flex-col gap-4 rounded-xl border border-border bg-[color-mix(in_oklch,var(--card),var(--muted)_30%)] p-4">
                    <FormField id="group2Label" label="Kelompok 2">
                      <Input id="group2Label" name="group2Label" defaultValue={group2?.label ?? ""} placeholder="Wanita" />
                    </FormField>
                    <ColorListInput name="group2Colors" defaultValue={group2?.colors.join(", ") ?? ""} label="Warna kelompok 2" />
                  </div>
                </div>
              </PanelBody>
              <PanelFooter>
                <UnsavedHint />
                <SubmitButton>Simpan dress code</SubmitButton>
              </PanelFooter>
            </fieldset>
          </form>
        </Panel>
      </SettingsSection>

      <SettingsSection
        id="stories"
        title="Love Story"
        description="Perjalanan pasangan, tampil berurutan seperti linimasa. Setiap cerita bisa diberi satu foto."
      >
        {stories.map((story, index) => (
          <Panel key={story.id}>
            <PanelHeader
              index={index + 1}
              title={story.title}
              meta={story.year_label ?? story.story_date ?? undefined}
              actions={
                <ConfirmDeleteForm
                  action={deleteStoryAction}
                  hiddenFields={{ id: story.id, invitationId: invitation.id }}
                  title="Hapus cerita ini?"
                  description={`"${story.title}" akan dihapus dari Love Story. Tindakan ini tidak bisa dibatalkan.`}
                />
              }
            />
            <form action={uploadStoryImageAction}>
              <input type="hidden" name="invitationId" value={invitation.id} />
              <input type="hidden" name="storyId" value={story.id} />
              <PanelBody className="sm:flex-row sm:items-center">
                {story.image_path ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={getMediaPublicUrl(story.image_path) ?? undefined}
                    alt=""
                    className="aspect-[4/3] w-32 shrink-0 rounded-lg border border-border object-cover"
                  />
                ) : null}
                <div className="flex min-w-0 flex-1 flex-col gap-3">
                  {story.description ? <p className="text-sm leading-6 text-muted-foreground">{story.description}</p> : null}
                  <FileDrop
                    accept="image/png,image/jpeg,image/webp"
                    required
                    label={story.image_path ? "Ganti foto cerita" : "Tambahkan foto cerita"}
                  />
                </div>
              </PanelBody>
              <PanelFooter>
                <SubmitButton variant="outline" pendingText="Mengunggah...">
                  Unggah foto
                </SubmitButton>
              </PanelFooter>
            </form>
          </Panel>
        ))}

        <Panel className="border-dashed bg-[color-mix(in_oklch,var(--card),var(--muted)_30%)] shadow-none">
          <PanelHeader title="Tambah cerita" meta={`Cerita ke-${stories.length + 1}`} />
          <form action={upsertStoryAction}>
            <input type="hidden" name="invitationId" value={invitation.id} />
            <input type="hidden" name="sortOrder" value={stories.length} />
            <PanelBody>
              <FieldGrid>
                <FormField id="story-new-title" label="Judul" className="sm:col-span-2">
                  <Input id="story-new-title" name="title" required />
                </FormField>
                <FormField id="story-new-yearLabel" label="Label tahun" hint="Ditampilkan menggantikan tanggal.">
                  <Input id="story-new-yearLabel" name="yearLabel" placeholder="2019" />
                </FormField>
                <FormField id="story-new-storyDate" label="Tanggal">
                  <Input id="story-new-storyDate" name="storyDate" type="date" />
                </FormField>
                <FormField id="story-new-description" label="Cerita" className="sm:col-span-2">
                  <Textarea id="story-new-description" name="description" rows={3} />
                </FormField>
              </FieldGrid>
            </PanelBody>
            <PanelFooter>
              <SubmitButton pendingText="Menambahkan...">Tambah cerita</SubmitButton>
            </PanelFooter>
          </form>
        </Panel>
      </SettingsSection>
    </div>
  );
}
