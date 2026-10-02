import Link from "next/link";
import { notFound } from "next/navigation";

import { FormMessage } from "@/components/admin/form-message";
import { SubmitButton } from "@/components/admin/submit-button";
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

const FEATURE_GROUPS: { label: string; keys: (keyof InvitationFeatures)[] }[] = [
  { label: "Isi undangan", keys: ["countdown", "maps", "story", "gallery", "dressCode", "livestream"] },
  { label: "Interaksi tamu", keys: ["rsvp", "wishes", "gift", "guestPersonalization"] },
  { label: "Suasana", keys: ["music"] },
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
    <form action={updateFeaturesAction} className="flex max-w-2xl flex-col gap-6">
      <input type="hidden" name="invitationId" value={invitation.id} />

      {FEATURE_GROUPS.map((group) => (
        <fieldset key={group.label} className="flex flex-col gap-2">
          <legend className="mb-2 text-sm font-semibold text-foreground">{group.label}</legend>
          {group.keys.map((key) => {
            const copy = FEATURE_COPY[key];
            const requiredPackage = getRequiredPackageForFeature(key);
            const granted = allowed[key];
            return (
              <div key={key} className="flex items-start justify-between gap-4 rounded-lg border border-border bg-card px-4 py-3">
                <div className="min-w-0">
                  <Label htmlFor={key}>{copy.label}</Label>
                  <p id={`${key}-description`} className="mt-1 text-sm text-muted-foreground">
                    {copy.description}
                    {copy.contentSection ? (
                      <>
                        {" "}
                        <Link
                          href={`/admin/invitations/${invitation.id}/${copy.contentSection}`}
                          className="underline underline-offset-2 hover:text-foreground"
                        >
                          Atur isinya
                        </Link>
                      </>
                    ) : null}
                  </p>
                  {!granted && requiredPackage ? (
                    <p id={`${key}-package`} className="mt-1 text-xs text-muted-foreground">
                      Tersedia di {PACKAGE_DEFINITIONS[requiredPackage].label}
                    </p>
                  ) : null}
                </div>
                <Switch
                  id={key}
                  name={key}
                  disabled={!granted}
                  defaultChecked={granted && Boolean(features[key])}
                  aria-describedby={
                    !granted && requiredPackage ? `${key}-description ${key}-package` : `${key}-description`
                  }
                />
              </div>
            );
          })}
        </fieldset>
      ))}

      <FormMessage tone="error">{error}</FormMessage>
      <FormMessage tone="success">{!error && saved ? "Tersimpan." : null}</FormMessage>

      <SubmitButton className="w-fit">Simpan fitur</SubmitButton>
    </form>
  );
}
