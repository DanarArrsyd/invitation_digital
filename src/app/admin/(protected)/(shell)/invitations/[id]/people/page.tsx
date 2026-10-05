import { notFound } from "next/navigation";

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
import { isPersonRole, normalizePersonRole, PERSON_ROLE_LABELS } from "@/lib/invitations/person-role";
import { getRequiredPackageForFeature, PACKAGE_DEFINITIONS, type PackageKey } from "@/lib/packages/entitlements";
import { getPersonInstagram } from "@/lib/utils/instagram";
import { getMediaPublicUrl } from "@/lib/supabase/storage";
import { getInvitationDetail } from "@/server/invitations/queries";

import { PersonRoleSelect } from "./PersonRoleSelect";
import { deletePersonAction, upsertPersonAction, uploadPersonPhotoAction, updatePersonInstagramAction } from "./actions";

type PersonDefaults = {
  role: string;
  full_name: string;
  nickname: string | null;
  father_name: string | null;
  mother_name: string | null;
  bio: string | null;
};

function personRoleLabel(role: string): string {
  const normalized = normalizePersonRole(role);
  return isPersonRole(normalized) ? PERSON_ROLE_LABELS[normalized] : role;
}

/** Shared by the edit forms and the "add" form; `idPrefix` keeps ids unique per row. */
function PersonFields({ idPrefix, person }: { idPrefix: string; person?: PersonDefaults }) {
  const id = (name: string) => `${idPrefix}-${name}`;

  return (
    <>
      <FormField id={id("role")} label="Peran">
        <PersonRoleSelect id={id("role")} defaultValue={person?.role} />
      </FormField>
      <FormField id={id("fullName")} label="Nama lengkap">
        <Input id={id("fullName")} name="fullName" defaultValue={person?.full_name ?? ""} required />
      </FormField>
      <FormField id={id("nickname")} label="Nama panggilan">
        <Input id={id("nickname")} name="nickname" defaultValue={person?.nickname ?? ""} />
      </FormField>
      <FormField id={id("fatherName")} label="Nama ayah">
        <Input id={id("fatherName")} name="fatherName" defaultValue={person?.father_name ?? ""} />
      </FormField>
      <FormField id={id("motherName")} label="Nama ibu">
        <Input id={id("motherName")} name="motherName" defaultValue={person?.mother_name ?? ""} />
      </FormField>
      <FormField id={id("bio")} label="Bio" className="sm:col-span-2">
        <Textarea id={id("bio")} name="bio" defaultValue={person?.bio ?? ""} rows={2} />
      </FormField>
    </>
  );
}

export default async function PeoplePage({
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

  const { invitation, people } = detail;
  const instagramLocked = !PACKAGE_DEFINITIONS[invitation.package_key as PackageKey].capabilities.instagram;
  const instagramPackage = getRequiredPackageForFeature("instagram");

  return (
    <div className="flex flex-col">
      {error || saved === "instagram" ? (
        <div className="mb-2 flex flex-col gap-2">
          <FormMessage tone="error">{error}</FormMessage>
          <FormMessage tone="success">{saved === "instagram" ? "Instagram tersimpan." : null}</FormMessage>
        </div>
      ) : null}

      <SettingsSection
        id="people"
        title="Mempelai & tuan rumah"
        description="Nama, orang tua dan foto yang tampil di sampul dan bagian Mempelai. Untuk acara selain pernikahan, isi tuan rumah atau yang dirayakan."
      >
        {people.map((person, index) => {
          const photoUrl = getMediaPublicUrl(person.photo_path);
          return (
            <Panel key={person.id}>
              <PanelHeader
                index={index + 1}
                title={person.full_name}
                meta={personRoleLabel(person.role)}
                actions={
                  <ConfirmDeleteForm
                    action={deletePersonAction}
                    hiddenFields={{ id: person.id, invitationId: invitation.id }}
                    title="Hapus data mempelai ini?"
                    description={`${person.full_name} beserta fotonya akan hilang dari undangan. Tindakan ini tidak bisa dibatalkan.`}
                  />
                }
              />

              <form action={uploadPersonPhotoAction} className="border-b border-border">
                <input type="hidden" name="invitationId" value={invitation.id} />
                <input type="hidden" name="personId" value={person.id} />
                <PanelBody className="sm:flex-row sm:items-center">
                  <div className="aspect-[3/4] w-20 shrink-0 overflow-hidden rounded-[40%/30%] border border-border bg-muted">
                    {photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={photoUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="flex h-full items-center justify-center px-2 text-center text-[11px] text-muted-foreground">
                        Belum ada foto
                      </span>
                    )}
                  </div>
                  <FileDrop
                    accept="image/png,image/jpeg,image/webp"
                    required
                    label={photoUrl ? `Ganti foto ${person.full_name}` : `Pilih foto ${person.full_name}`}
                    hint="Portrait, PNG, JPG atau WebP."
                    className="flex-1"
                  />
                  <SubmitButton variant="outline" pendingText="Mengunggah..." className="sm:self-center">
                    Unggah foto
                  </SubmitButton>
                </PanelBody>
              </form>

              <form action={upsertPersonAction}>
                <input type="hidden" name="id" value={person.id} />
                <input type="hidden" name="invitationId" value={invitation.id} />
                <input type="hidden" name="sortOrder" value={person.sort_order} />
                <PanelBody>
                  <FieldGrid>
                    <PersonFields idPrefix={`person-${person.id}`} person={person} />
                  </FieldGrid>
                </PanelBody>
                <PanelFooter>
                  <UnsavedHint />
                  <SubmitButton>Simpan data</SubmitButton>
                </PanelFooter>
              </form>

              <form action={updatePersonInstagramAction} className="border-t border-border">
                <input type="hidden" name="invitationId" value={invitation.id} />
                <input type="hidden" name="personId" value={person.id} />
                <fieldset disabled={instagramLocked} className="flex flex-col gap-3 p-5 disabled:opacity-60 sm:flex-row sm:items-end sm:p-6">
                  <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                    <label htmlFor={`instagram-${person.id}`} className="text-sm font-medium">
                      Instagram (opsional)
                    </label>
                    <Input
                      id={`instagram-${person.id}`}
                      name="instagram"
                      maxLength={200}
                      autoCapitalize="none"
                      spellCheck={false}
                      placeholder="@username atau https://www.instagram.com/username/"
                      defaultValue={getPersonInstagram(invitation.settings, person.id)?.url ?? ""}
                      aria-describedby={`instagram-help-${person.id}`}
                    />
                    <p id={`instagram-help-${person.id}`} className="text-xs leading-5 text-muted-foreground">
                      {instagramLocked && instagramPackage
                        ? `Tersedia di ${PACKAGE_DEFINITIONS[instagramPackage].label}. Konten tersimpan tetap disimpan.`
                        : "Tampil di bawah profil pada undangan. Kosongkan untuk menyembunyikan tautan."}
                    </p>
                  </div>
                  <SubmitButton variant="outline" className="sm:mb-6">Simpan Instagram</SubmitButton>
                </fieldset>
              </form>
            </Panel>
          );
        })}

        <Panel className="border-dashed bg-[color-mix(in_oklch,var(--card),var(--muted)_30%)] shadow-none">
          <PanelHeader title="Tambah orang" meta="Mempelai, tuan rumah atau yang dirayakan" />
          <form action={upsertPersonAction}>
            <input type="hidden" name="invitationId" value={invitation.id} />
            <input type="hidden" name="sortOrder" value={people.length} />
            <PanelBody>
              <FieldGrid>
                <PersonFields idPrefix="person-new" />
              </FieldGrid>
            </PanelBody>
            <PanelFooter>
              <SubmitButton pendingText="Menambahkan...">Tambah</SubmitButton>
            </PanelFooter>
          </form>
        </Panel>
      </SettingsSection>
    </div>
  );
}
