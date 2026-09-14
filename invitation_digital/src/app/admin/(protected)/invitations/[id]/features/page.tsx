import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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

  return (
    <form action={updateFeaturesAction} className="flex max-w-md flex-col gap-4">
      <input type="hidden" name="invitationId" value={invitation.id} />

      {(Object.keys(FEATURE_LABELS) as (keyof InvitationFeatures)[]).map((key) => (
        <div key={key} className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white px-4 py-3">
          <Label htmlFor={key}>{FEATURE_LABELS[key]}</Label>
          <Switch id={key} name={key} defaultChecked={Boolean(features[key])} />
        </div>
      ))}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {saved ? <p className="text-sm text-green-600">Saved.</p> : null}

      <Button type="submit" className="mt-2 w-fit">
        Save
      </Button>
    </form>
  );
}
