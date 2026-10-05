import { notFound } from "next/navigation";

import { FileDrop } from "@/components/admin/file-drop";
import { FormMessage } from "@/components/admin/form-message";
import { Panel, PanelBody, PanelFooter, SettingsSection } from "@/components/admin/settings-section";
import { SubmitButton } from "@/components/admin/submit-button";
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
  const coverUrl = getMediaPublicUrl(invitation.cover_image_path);
  const musicName = invitation.music_path?.split("/").pop() ?? null;

  return (
    <div className="flex flex-col">
      <FormMessage tone="error" className="mb-2">{error}</FormMessage>
      <GeneralForm invitation={invitation} themes={themes} saved={saved} />

      <SettingsSection
        id="cover"
        title="Foto sampul"
        description="Tampil di bagian pembuka setelah undangan dibuka dan di banner saat link dibagikan. Portrait 4:5, PNG, JPG atau WebP."
      >
        <Panel>
          <form action={uploadCoverImageAction}>
            <input type="hidden" name="invitationId" value={invitation.id} />
            <PanelBody className="sm:flex-row sm:items-center">
              <div className="aspect-[4/5] w-28 shrink-0 overflow-hidden rounded-t-full rounded-b-lg border border-border bg-muted">
                {coverUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={coverUrl} alt="Foto sampul saat ini" className="h-full w-full object-cover" />
                ) : (
                  <span className="flex h-full items-center justify-center px-2 text-center text-xs text-muted-foreground">
                    Belum ada foto
                  </span>
                )}
              </div>
              <FileDrop
                id="prewedding-photo"
                accept="image/png,image/jpeg,image/webp"
                required
                label={coverUrl ? "Pilih foto pengganti" : "Pilih foto sampul"}
                hint="Tarik foto ke sini atau klik untuk memilih."
                className="flex-1"
              />
            </PanelBody>
            <PanelFooter>
              <SubmitButton pendingText="Mengunggah...">
                {invitation.cover_image_path ? "Ganti foto sampul" : "Unggah foto sampul"}
              </SubmitButton>
            </PanelFooter>
          </form>
        </Panel>
      </SettingsSection>

      <PackageForm
        invitationId={invitation.id}
        currentPackage={invitation.package_key as PackageKey}
        error={packageError}
        saved={packageSaved === "1"}
      />

      <SettingsSection
        id="music"
        title="Musik"
        description="Diputar setelah tamu membuka undangan, dengan tombol jeda yang selalu terlihat. MP3, M4A atau WAV."
      >
        <Panel>
          <form action={uploadMusicAction}>
            <input type="hidden" name="invitationId" value={invitation.id} />
            <PanelBody>
              {musicName ? (
                <p className="text-sm text-muted-foreground">
                  Saat ini: <span className="font-medium text-foreground">{musicName}</span>
                </p>
              ) : null}
              <FileDrop
                id="music-file"
                kind="audio"
                accept="audio/mpeg,audio/mp4,audio/wav"
                required
                label={musicName ? "Pilih lagu pengganti" : "Pilih file musik"}
              />
            </PanelBody>
            <PanelFooter>
              <SubmitButton pendingText="Mengunggah...">Unggah musik</SubmitButton>
            </PanelFooter>
          </form>
        </Panel>
      </SettingsSection>

    </div>
  );
}
