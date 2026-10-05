import { notFound } from "next/navigation";

import { FormMessage } from "@/components/admin/form-message";
import { EmptyState } from "@/components/admin/empty-state";
import { SubmitButton } from "@/components/admin/submit-button";
import { Panel, PanelBody, PanelFooter, SettingsSection, UsageMeter } from "@/components/admin/settings-section";
import { FileDrop } from "@/components/admin/file-drop";
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
    <div className="flex flex-col">
      <FormMessage tone="error" className="mb-2">{error}</FormMessage>

      <SettingsSection
        id="gallery"
        title="Galeri foto"
        description={
          <>
            <p>
              {gallery.length} dari {packageDefinition.limits.maxGalleryImages} foto · Paket {packageDefinition.label} · drag foto untuk mengubah urutan
            </p>
            <UsageMeter used={gallery.length} limit={packageDefinition.limits.maxGalleryImages} unit="foto" />
          </>
        }
      >
        {items.length === 0 ? (
          <EmptyState title="Belum ada foto" description="Unggah foto untuk mengisi galeri undangan." />
        ) : (
          <Panel className="p-4 sm:p-5">
            <GalleryGrid invitationId={invitation.id} items={items} />
          </Panel>
        )}

        <Panel className="border-dashed bg-[color-mix(in_oklch,var(--card),var(--muted)_30%)] shadow-none">
          <form action={uploadGalleryItemsAction}>
            <input type="hidden" name="invitationId" value={invitation.id} />
            <fieldset disabled={limitReached} className="border-0 p-0 disabled:opacity-60">
              <PanelBody>
                <FileDrop
                  id="gallery-files"
                  name="files"
                  accept="image/png,image/jpeg,image/webp"
                  multiple
                  required
                  label="Tambah foto ke galeri"
                  hint="Bisa pilih banyak sekaligus. PNG, JPG atau WebP."
                />
              </PanelBody>
              <PanelFooter>
                {limitReached ? (
                  <p className="mr-auto text-sm text-muted-foreground">
                    Batas galeri paket tercapai. Hapus foto atau upgrade paket.
                  </p>
                ) : null}
                <SubmitButton pendingText="Mengunggah...">Unggah foto</SubmitButton>
              </PanelFooter>
            </fieldset>
          </form>
        </Panel>
      </SettingsSection>
    </div>
  );
}
