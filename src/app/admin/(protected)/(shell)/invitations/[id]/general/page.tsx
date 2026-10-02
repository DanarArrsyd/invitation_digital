import { notFound } from "next/navigation";

import { FormMessage } from "@/components/admin/form-message";
import { SubmitButton } from "@/components/admin/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import type { PackageKey } from "@/lib/packages/entitlements";
import { getMediaPublicUrl } from "@/lib/supabase/storage";
import { getInvitationDetail } from "@/server/invitations/queries";

import { GeneralForm } from "./GeneralForm";
import { uploadCoverImageAction, uploadMusicAction } from "./media-actions";
import { PackageForm } from "./PackageForm";

export default async function GeneralPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    error?: string;
    saved?: string;
    packageError?: string;
    packageSaved?: string;
  }>;
}) {
  const { id } = await params;
  const { error, saved, packageError, packageSaved } = await searchParams;

  const detail = await getInvitationDetail(id);
  if (!detail) notFound();

  const { invitation, themes } = detail;

  return (
    <div className="flex flex-col gap-10">
      <FormMessage tone="error">{error}</FormMessage>
      <div className="flex flex-col gap-2">
        <h2 id="prewedding-heading" className="text-base font-semibold text-foreground">Foto prewedding — hero undangan</h2>
        <p id="prewedding-help" className="text-sm text-muted-foreground">Tampil dalam frame melengkung di sebelah nama pasangan setelah undangan dibuka. Gunakan foto portrait 4:5; PNG, JPG, atau WebP.</p>
        <Label htmlFor="prewedding-photo">Pilih foto prewedding</Label>
        {getMediaPublicUrl(invitation.cover_image_path) ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={getMediaPublicUrl(invitation.cover_image_path) ?? undefined}
            alt="Foto prewedding saat ini"
            className="aspect-[4/5] w-40 rounded-t-full border border-border object-cover"
          />
        ) : null}
        <form action={uploadCoverImageAction} className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
          <input type="hidden" name="invitationId" value={invitation.id} />
          <Input id="prewedding-photo" aria-describedby="prewedding-help" type="file" name="file" accept="image/png,image/jpeg,image/webp" required />
          <SubmitButton variant="outline" size="sm" pendingText="Mengunggah...">
            {invitation.cover_image_path ? "Ganti foto prewedding" : "Upload foto prewedding"}
          </SubmitButton>
        </form>
      </div>

      <Separator />

      <GeneralForm invitation={invitation} themes={themes} saved={saved} />

      <Separator />

      <PackageForm
        invitationId={invitation.id}
        currentPackage={invitation.package_key as PackageKey}
        error={packageError}
        saved={packageSaved === "1"}
      />

      <Separator />

      <div className="flex flex-col gap-6">
        <h2 className="text-sm font-semibold text-foreground">Musik</h2>

        <div className="flex flex-col gap-2">
          <Label htmlFor="music-file">Music</Label>
          {invitation.music_path ? (
            <p className="text-sm text-muted-foreground">
              Current: {invitation.music_path.split("/").pop()}
            </p>
          ) : null}
          <form action={uploadMusicAction} className="flex flex-wrap items-center gap-2">
            <input type="hidden" name="invitationId" value={invitation.id} />
            <Input id="music-file" type="file" name="file" accept="audio/mpeg,audio/mp4,audio/wav" className="max-w-xs" required />
            <SubmitButton variant="outline" size="sm" pendingText="Mengunggah...">
              Upload
            </SubmitButton>
          </form>
        </div>
      </div>
    </div>
  );
}
