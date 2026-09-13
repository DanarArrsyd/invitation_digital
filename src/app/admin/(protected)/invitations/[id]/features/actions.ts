"use server";

import { redirect } from "next/navigation";

import { updateFeaturesSchema } from "@/lib/validation/invitation";
import { updateInvitationFeatures } from "@/server/invitations/mutations";
import { revalidateInvitation } from "@/server/invitations/revalidate";

const FEATURE_KEYS = [
  "music",
  "countdown",
  "maps",
  "story",
  "gallery",
  "livestream",
  "rsvp",
  "wishes",
  "gift",
  "guestPersonalization",
] as const;

export async function updateFeaturesAction(formData: FormData) {
  const invitationId = String(formData.get("invitationId"));

  const features = Object.fromEntries(
    FEATURE_KEYS.map((key) => [key, formData.get(key) === "on"]),
  );

  const parsed = updateFeaturesSchema.safeParse({ invitationId, features });

  if (!parsed.success) {
    redirect(
      `/admin/invitations/${invitationId}/features?error=${encodeURIComponent(
        parsed.error.issues[0]?.message ?? "Input tidak valid",
      )}`,
    );
  }

  const result = await updateInvitationFeatures(parsed.data);

  if (result?.error) {
    redirect(
      `/admin/invitations/${invitationId}/features?error=${encodeURIComponent(result.error)}`,
    );
  }

  await revalidateInvitation(invitationId);
  redirect(`/admin/invitations/${invitationId}/features?saved=1`);
}
