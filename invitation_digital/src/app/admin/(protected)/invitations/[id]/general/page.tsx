import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { getMediaPublicUrl } from "@/lib/supabase/storage";
import { getInvitationDetail } from "@/server/invitations/queries";

import { GeneralForm } from "./GeneralForm";
import { uploadCoverImageAction, uploadMusicAction } from "./media-actions";

export default async function GeneralPage({
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

  const { invitation, themes } = detail;

  return (
    <div className="flex flex-col gap-10">
      {error ? <p role="alert" className="text-sm text-red-600">{error}</p> : null}
      <div className="flex flex-col gap-2">
        <h2 id="prewedding-heading" className="text-base font-semibold text-neutral-900">Foto prewedding — hero undangan</h2>
        <p id="prewedding-help" className="text-sm text-neutral-600">Tampil dalam frame melengkung di sebelah nama pasangan setelah undangan dibuka. Gunakan foto portrait 4:5; PNG, JPG, atau WebP.</p>
        <Label htmlFor="prewedding-photo">Pilih foto prewedding</Label>
        {getMediaPublicUrl(invitation.cover_image_path) ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={getMediaPublicUrl(invitation.cover_image_path) ?? undefined}
            alt="Foto prewedding saat ini"
            className="aspect-[4/5] w-40 rounded-t-full border border-neutral-200 object-cover"
          />
        ) : null}
        <form action={uploadCoverImageAction} className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
          <input type="hidden" name="invitationId" value={invitation.id} />
          <Input id="prewedding-photo" aria-describedby="prewedding-help" type="file" name="file" accept="image/png,image/jpeg,image/webp" required />
          <Button type="submit" variant="outline" size="sm">
            {invitation.cover_image_path ? "Ganti foto prewedding" : "Upload foto prewedding"}
          </Button>
        </form>
      </div>

      <Separator />

      <GeneralForm invitation={invitation} themes={themes} saved={saved} />

      <Separator />

      <div className="flex flex-col gap-6">
        <h2 className="text-sm font-semibold text-neutral-900">Musik</h2>

        <div className="flex flex-col gap-2">
          <Label>Music</Label>
          {invitation.music_path ? (
            <p className="text-sm text-neutral-500">
              Current: {invitation.music_path.split("/").pop()}
            </p>
          ) : null}
          <form action={uploadMusicAction} className="flex items-center gap-2">
            <input type="hidden" name="invitationId" value={invitation.id} />
            <Input type="file" name="file" accept="audio/mpeg,audio/mp4,audio/wav" required />
            <Button type="submit" variant="outline" size="sm">
              Upload
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
