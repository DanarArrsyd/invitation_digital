import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
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

const FEATURE_LABELS: Record<keyof InvitationFeatures, string> = {
  music: "Music",
  countdown: "Countdown",
  maps: "Maps",
  story: "Love Story",
  gallery: "Gallery",
  dressCode: "Dress Code",
  livestream: "Livestream",
  rsvp: "RSVP",
  wishes: "Wishes",
  gift: "Wedding Gift",
  guestPersonalization: "Guest Personalization",
};

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
    <form action={updateFeaturesAction} className="flex max-w-md flex-col gap-4">
      <input type="hidden" name="invitationId" value={invitation.id} />

      {(Object.keys(FEATURE_LABELS) as (keyof InvitationFeatures)[]).map((key) => {
        const requiredPackage = getRequiredPackageForFeature(key);
        const granted = allowed[key];
        return (
          <div key={key} className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card px-4 py-3">
            <div className="min-w-0">
              <Label htmlFor={key}>{FEATURE_LABELS[key]}</Label>
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
              aria-describedby={!granted && requiredPackage ? `${key}-package` : undefined}
            />
          </div>
        );
      })}

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {saved ? <p className="text-sm text-success">Saved.</p> : null}

      <Button type="submit" className="mt-2 w-fit">
        Save
      </Button>
    </form>
  );
}
