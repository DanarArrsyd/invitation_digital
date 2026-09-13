import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getPersonInstagram } from "@/lib/utils/instagram";
import { getMediaPublicUrl } from "@/lib/supabase/storage";
import { getInvitationDetail } from "@/server/invitations/queries";

import { deletePersonAction, upsertPersonAction, uploadPersonPhotoAction, updatePersonInstagramAction } from "./actions";

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

  return (
    <div className="flex flex-col gap-6">
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {saved === "instagram" ? <p role="status" className="text-sm text-green-700">Instagram tersimpan.</p> : null}

      {people.map((person) => (
        <div key={person.id} className="rounded-lg border border-neutral-200 bg-white p-4">
          <div className="flex gap-4">
            {getMediaPublicUrl(person.photo_path) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={getMediaPublicUrl(person.photo_path) ?? undefined}
                alt=""
                className="h-20 w-20 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-neutral-100 text-xs text-neutral-400">
                No photo
              </div>
            )}

            <div className="flex-1">
              <p className="text-sm font-medium text-neutral-900">
                {person.full_name} ({person.role})
              </p>

              <form action={uploadPersonPhotoAction} className="mt-2 flex items-center gap-2">
                <input type="hidden" name="invitationId" value={invitation.id} />
                <input type="hidden" name="personId" value={person.id} />
                <Input type="file" name="file" accept="image/png,image/jpeg,image/webp" required />
                <Button type="submit" variant="outline" size="sm">
                  Upload photo
                </Button>
              </form>
            </div>

            <form action={deletePersonAction}>
              <input type="hidden" name="id" value={person.id} />
              <input type="hidden" name="invitationId" value={invitation.id} />
              <Button type="submit" variant="destructive" size="sm">
                Delete
              </Button>
            </form>
          </div>

          <form action={upsertPersonAction} className="mt-4 grid grid-cols-2 gap-3">
            <input type="hidden" name="id" value={person.id} />
            <input type="hidden" name="invitationId" value={invitation.id} />
            <input type="hidden" name="sortOrder" value={person.sort_order} />

            <div className="flex flex-col gap-2">
              <Label>Role</Label>
              <Input name="role" defaultValue={person.role} required />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Full name</Label>
              <Input name="fullName" defaultValue={person.full_name} required />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Nickname</Label>
              <Input name="nickname" defaultValue={person.nickname ?? ""} />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Father&apos;s name</Label>
              <Input name="fatherName" defaultValue={person.father_name ?? ""} />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Mother&apos;s name</Label>
              <Input name="motherName" defaultValue={person.mother_name ?? ""} />
            </div>
            <div className="col-span-2 flex flex-col gap-2">
              <Label>Bio</Label>
              <Textarea name="bio" defaultValue={person.bio ?? ""} rows={2} />
            </div>

            <Button type="submit" className="col-span-2 w-fit">
              Save
            </Button>
          </form>

          <form action={updatePersonInstagramAction} className="mt-5 flex flex-col gap-3 border-t border-neutral-200 pt-5">
            <input type="hidden" name="invitationId" value={invitation.id} />
            <input type="hidden" name="personId" value={person.id} />
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
            <p id={`instagram-help-${person.id}`} className="text-sm text-neutral-500">
              Tampil di bawah profil pada undangan. Kosongkan untuk menyembunyikan tautan.
            </p>
            <Button type="submit" variant="outline" className="w-fit">Simpan Instagram</Button>
          </form>
        </div>
      ))}

      <form
        action={upsertPersonAction}
        className="grid max-w-lg grid-cols-2 gap-3 rounded-lg border border-dashed border-neutral-300 p-4"
      >
        <input type="hidden" name="invitationId" value={invitation.id} />
        <input type="hidden" name="sortOrder" value={people.length} />

        <div className="flex flex-col gap-2">
          <Label>Role</Label>
          <Input name="role" placeholder="bride / groom" required />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Full name</Label>
          <Input name="fullName" required />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Nickname</Label>
          <Input name="nickname" />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Father&apos;s name</Label>
          <Input name="fatherName" />
        </div>
        <div className="flex flex-col gap-2">
          <Label>Mother&apos;s name</Label>
          <Input name="motherName" />
        </div>
        <div className="col-span-2 flex flex-col gap-2">
          <Label>Bio</Label>
          <Textarea name="bio" rows={2} />
        </div>

        <Button type="submit" className="col-span-2 w-fit">
          Add person
        </Button>
      </form>
    </div>
  );
}
