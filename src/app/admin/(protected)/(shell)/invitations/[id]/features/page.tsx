import Link from "next/link";
import { notFound } from "next/navigation";

import { FormMessage } from "@/components/admin/form-message";
import { Panel, PanelFooter, SettingsSection } from "@/components/admin/settings-section";
import { SubmitButton } from "@/components/admin/submit-button";
import { UnsavedHint } from "@/components/admin/unsaved-hint";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  getRequiredPackageForFeature,
  PACKAGE_DEFINITIONS,
  type PackageKey,
} from "@/lib/packages/entitlements";
import { getInvitationDetail } from "@/server/invitations/queries";
import type { InvitationFeatures } from "@/types/invitation";

import { updateFeaturesAction } from "./actions";

type FeatureCopy = { label: string; description: string; contentSection?: string };

/** What each toggle shows guests, and where its content is filled in. */
const FEATURE_COPY: Record<keyof InvitationFeatures, FeatureCopy> = {
  countdown: { label: "Hitung mundur", description: "Hari, jam, menit menuju acara pertama, plus tombol simpan ke kalender." },
  maps: { label: "Tombol lokasi", description: "Tombol Lihat Lokasi di setiap acara yang punya link Maps.", contentSection: "events" },
  story: { label: "Love story", description: "Linimasa cerita pasangan.", contentSection: "content" },
  gallery: { label: "Galeri", description: "Kumpulan foto pasangan.", contentSection: "gallery" },
  dressCode: { label: "Dress code", description: "Saran warna busana untuk tamu.", contentSection: "content" },
  livestream: { label: "Live streaming", description: "Link siaran untuk acara yang punya link livestream.", contentSection: "events" },
  rsvp: { label: "RSVP", description: "Tamu mengonfirmasi hadir atau tidak hadir." },
  wishes: { label: "Ucapan & doa", description: "Tamu mengirim ucapan; tampil langsung dan bisa disembunyikan di RSVP & Ucapan." },
  gift: { label: "Wedding gift", description: "Rekening untuk tanda kasih, dengan tombol salin nomor.", contentSection: "gifts" },
  guestPersonalization: { label: "Nama tamu di cover", description: "Link personal menampilkan nama tamu di halaman pembuka.", contentSection: "guests" },
  music: { label: "Musik latar", description: "Diputar setelah tamu membuka undangan, dengan tombol jeda.", contentSection: "general" },
};

const FEATURE_GROUPS: { label: string; description: string; keys: (keyof InvitationFeatures)[] }[] = [
  {
    label: "Isi undangan",
    description: "Bagian yang tampil di halaman undangan. Bagian tanpa isi tetap tersembunyi walau dinyalakan.",
    keys: ["countdown", "maps", "story", "gallery", "dressCode", "livestream"],
  },
  {
    label: "Interaksi tamu",
    description: "Yang bisa dilakukan tamu: konfirmasi hadir, mengirim ucapan, memberi hadiah.",
    keys: ["rsvp", "wishes", "gift", "guestPersonalization"],
  },
  { label: "Suasana", description: "Musik diputar setelah tamu membuka undangan.", keys: ["music"] },
];

export default async function FeaturesPage({
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

  const { invitation } = detail;
  const settings = (invitation.settings ?? {}) as { features?: Partial<InvitationFeatures> };
  const features = settings.features ?? {};
  const allowed = PACKAGE_DEFINITIONS[invitation.package_key as PackageKey].invitationFeatures;

  return (
    <form action={updateFeaturesAction} className="flex flex-col">
      <input type="hidden" name="invitationId" value={invitation.id} />
      {error || saved ? (
        <div className="mb-2 flex flex-col gap-2">
          <FormMessage tone="error">{error}</FormMessage>
          <FormMessage tone="success">{!error && saved ? "Tersimpan." : null}</FormMessage>
        </div>
      ) : null}

      {FEATURE_GROUPS.map((group, groupIndex) => (
        <SettingsSection key={group.label} title={group.label} description={group.description}>
          <Panel>
            <fieldset className="divide-y divide-border">
              <legend className="sr-only">{group.label}</legend>
              {group.keys.map((key) => {
                const copy = FEATURE_COPY[key];
                const requiredPackage = getRequiredPackageForFeature(key);
                const granted = allowed[key];
                return (
                  <div key={key} className="flex items-start justify-between gap-5 px-5 py-4 sm:px-6">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Label htmlFor={key}>{copy.label}</Label>
                        {!granted && requiredPackage ? (
                          <span id={`${key}-package`} className="rounded-md bg-[#f6ecd9] px-1.5 py-0.5 text-[11px] font-medium text-[#8a5a12]">
                            Tersedia di {PACKAGE_DEFINITIONS[requiredPackage].label}
                          </span>
                        ) : null}
                      </div>
                      <p id={`${key}-description`} className="mt-1 text-sm leading-6 text-muted-foreground">
                        {copy.description}
                        {copy.contentSection ? (
                          <>
                            {" "}
                            <Link
                              href={`/admin/invitations/${invitation.id}/${copy.contentSection}`}
                              className="font-medium text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground"
                            >
                              Atur isinya
                            </Link>
                          </>
                        ) : null}
                      </p>
                    </div>
                    <Switch
                      id={key}
                      name={key}
                      disabled={!granted}
                      defaultChecked={granted && Boolean(features[key])}
                      className="mt-0.5"
                      aria-describedby={
                        !granted && requiredPackage ? `${key}-description ${key}-package` : `${key}-description`
                      }
                    />
                  </div>
                );
              })}
            </fieldset>
            {groupIndex === FEATURE_GROUPS.length - 1 ? (
              <PanelFooter>
                <UnsavedHint />
                <SubmitButton>Simpan fitur</SubmitButton>
              </PanelFooter>
            ) : null}
          </Panel>
        </SettingsSection>
      ))}
    </form>
  );
}
