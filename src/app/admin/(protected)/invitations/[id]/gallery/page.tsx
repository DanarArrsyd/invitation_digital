import { notFound } from "next/navigation";

import { EmptyState } from "@/components/admin/empty-state";
import { SubmitButton } from "@/components/admin/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getPackageDefinition, type PackageKey } from "@/lib/packages/entitlements";
import { getMediaPublicUrl } from "@/lib/supabase/storage";
import { getInvitationDetail } from "@/server/invitations/queries";

import { uploadGalleryItemsAction } from "./actions";
import { GalleryGrid, type GalleryGridItem } from "./GalleryGrid";

export default async function GalleryPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = (await searchParams) ?? {};

  const detail = await getInvitationDetail(id);
  if (!detail) notFound();

  const { invitation, gallery } = detail;
  const packageDefinition = getPackageDefinition(invitation.package_key as PackageKey);
  const limitReached = gallery.length >= packageDefinition.limits.maxGalleryImages;

  const items: GalleryGridItem[] = gallery.map((item) => ({
    id: item.id,
    imageUrl: getMediaPublicUrl(item.image_path) ?? "",
    imagePath: item.image_path,
    caption: item.caption,
    altText: item.alt_text,
    aspectRatio: item.aspect_ratio as GalleryGridItem["aspectRatio"],
  }));

  return (
    <div className="flex flex-col gap-6">
      {error ? <p role="alert" className="text-sm text-red-600">{error}</p> : null}
      <p className="text-sm text-muted-foreground">
        {gallery.length} dari {packageDefinition.limits.maxGalleryImages} foto · Paket {packageDefinition.label} · drag foto untuk mengubah urutan
      </p>

      {items.length === 0 ? (
        <EmptyState
          title="Belum ada foto"
          description="Upload foto untuk mengisi galeri undangan."
        />
      ) : (
        <GalleryGrid invitationId={invitation.id} items={items} />
      )}

      <form
        action={uploadGalleryItemsAction}
        className="flex max-w-md flex-col gap-3 rounded-lg border border-dashed border-border p-4"
      >
        <input type="hidden" name="invitationId" value={invitation.id} />

        <fieldset disabled={limitReached} className="flex flex-col gap-3 border-0 p-0">
          <div className="flex flex-col gap-2">
            <Label>Foto (bisa pilih banyak sekaligus)</Label>
            <Input type="file" name="files" accept="image/png,image/jpeg,image/webp" multiple required />
          </div>

          <SubmitButton className="w-fit" pendingText="Mengunggah...">
            Upload
          </SubmitButton>
        </fieldset>
        {limitReached ? (
          <p className="text-sm text-muted-foreground">
            Batas galeri paket tercapai. Hapus foto atau upgrade paket.
          </p>
        ) : null}
      </form>
    </div>
  );
}
