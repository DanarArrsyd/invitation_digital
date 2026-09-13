"use server";

import { redirect } from "next/navigation";

import { createGuestSchema, deleteGuestSchema } from "@/lib/validation/guests";
import { createGuest, deleteGuest } from "@/server/invitations/mutations";

function path(id: string, query?: string) {
  return `/admin/invitations/${id}/guests${query ? `?${query}` : ""}`;
}

export async function createGuestAction(formData: FormData) {
  const invitationId = String(formData.get("invitationId"));

  const parsed = createGuestSchema.safeParse({
    invitationId,
    displayName: formData.get("displayName"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    redirect(path(invitationId, `error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "")}`));
  }

  const result = await createGuest({
    invitationId: parsed.data.invitationId,
    displayName: parsed.data.displayName,
    notes: parsed.data.notes || null,
  });

  if (result?.error) {
    redirect(path(invitationId, `error=${encodeURIComponent(result.error)}`));
  }

  redirect(path(invitationId));
}

export async function deleteGuestAction(formData: FormData) {
  const invitationId = String(formData.get("invitationId"));

  const parsed = deleteGuestSchema.safeParse({
    id: formData.get("id"),
    invitationId,
  });

  if (!parsed.success) redirect(path(invitationId));

  await deleteGuest(parsed.data.id);
  redirect(path(invitationId));
}
