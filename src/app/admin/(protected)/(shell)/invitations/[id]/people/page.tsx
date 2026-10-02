import { notFound } from "next/navigation";

import { ConfirmDeleteForm } from "@/components/admin/confirm-delete-form";
import { FormField } from "@/components/admin/form-field";
import { FormMessage } from "@/components/admin/form-message";
import { SubmitButton } from "@/components/admin/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getRequiredPackageForFeature, PACKAGE_DEFINITIONS, type PackageKey } from "@/lib/packages/entitlements";
import { getPersonInstagram } from "@/lib/utils/instagram";
import { getMediaPublicUrl } from "@/lib/supabase/storage";
import { getInvitationDetail } from "@/server/invitations/queries";

import { deletePersonAction, upsertPersonAction, uploadPersonPhotoAction, updatePersonInstagramAction } from "./actions";

type PersonDefaults = {
  role: string;
  full_name: string;
  nickname: string | null;
  father_name: string | null;
  mother_name: string | null;
  bio: string | null;
};

/** Shared by the edit forms and the "add" form; `idPrefix` keeps ids unique per row. */
function PersonFields({ idPrefix, person }: { idPrefix: string; person?: PersonDefaults }) {
  const id = (name: string) => `${idPrefix}-${name}`;

  return (
    <>
      <FormField id={id("role")} label="Peran" hint="Isi bride untuk mempelai wanita, groom untuk mempelai pria.">
        <Input id={id("role")} name="role" defaultValue={person?.role ?? ""} placeholder="bride / groom" required />
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
    <div className="flex flex-col gap-6">
      <FormMessage tone="error">{error}</FormMessage>
      <FormMessage tone="success">{saved === "instagram" ? "Instagram tersimpan." : null}</FormMessage>

      {people.map((person) => (
        <div key={person.id} className="rounded-lg border border-border bg-card p-4">
          <div className="flex flex-wrap gap-4">
            {getMediaPublicUrl(person.photo_path) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={getMediaPublicUrl(person.photo_path) ?? undefined}
                alt=""
                className="h-20 w-20 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted text-xs text-muted-foreground">
                Belum ada foto
              </div>
            )}

            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">
                {person.full_name} ({person.role})
              </p>

              <form action={uploadPersonPhotoAction} className="mt-2 flex flex-wrap items-center gap-2">
                <input type="hidden" name="invitationId" value={invitation.id} />
                <input type="hidden" name="personId" value={person.id} />
                <Input
                  type="file"
                  name="file"
                  accept="image/png,image/jpeg,image/webp"
                  aria-label={`Foto ${person.full_name}`}
                  className="max-w-xs"
                  required
                />
                <SubmitButton variant="outline" size="sm" pendingText="Mengunggah...">
                  Unggah foto
                </SubmitButton>
              </form>
            </div>

            <ConfirmDeleteForm
              action={deletePersonAction}
              hiddenFields={{ id: person.id, invitationId: invitation.id }}
              title="Hapus data mempelai ini?"
              description={`${person.full_name} beserta fotonya akan hilang dari undangan. Tindakan ini tidak bisa dibatalkan.`}
            />
          </div>

          <form action={upsertPersonAction} className="mt-4 grid gap-3 sm:grid-cols-2">
            <input type="hidden" name="id" value={person.id} />
            <input type="hidden" name="invitationId" value={invitation.id} />
            <input type="hidden" name="sortOrder" value={person.sort_order} />

            <PersonFields idPrefix={`person-${person.id}`} person={person} />

            <SubmitButton className="w-fit sm:col-span-2">Simpan</SubmitButton>
          </form>

          <form action={updatePersonInstagramAction} className="mt-5 flex flex-col gap-3 border-t border-border pt-5">
            <input type="hidden" name="invitationId" value={invitation.id} />
            <input type="hidden" name="personId" value={person.id} />
            <fieldset disabled={instagramLocked} className="flex flex-col gap-3">
              <Label htmlFor={`instagram-${person.id}`}>Instagram (opsional)</Label>
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
              <p id={`instagram-help-${person.id}`} className="text-sm text-muted-foreground">
                {instagramLocked && instagramPackage
                  ? `Tersedia di ${PACKAGE_DEFINITIONS[instagramPackage].label}. Konten tersimpan tetap disimpan.`
                  : "Tampil di bawah profil pada undangan. Kosongkan untuk menyembunyikan tautan."}
              </p>
              <SubmitButton variant="outline" className="w-fit">Simpan Instagram</SubmitButton>
            </fieldset>
          </form>
        </div>
      ))}

      <form
        action={upsertPersonAction}
        className="grid max-w-lg gap-3 rounded-lg border border-dashed border-border p-4 sm:grid-cols-2"
      >
        <input type="hidden" name="invitationId" value={invitation.id} />
        <input type="hidden" name="sortOrder" value={people.length} />

        <PersonFields idPrefix="person-new" />

        <SubmitButton className="w-fit sm:col-span-2" pendingText="Menambahkan...">
          Tambah mempelai
        </SubmitButton>
      </form>
    </div>
  );
}
