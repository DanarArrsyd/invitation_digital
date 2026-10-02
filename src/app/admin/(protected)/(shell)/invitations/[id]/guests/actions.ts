"use server";

import { redirect } from "next/navigation";

import { createGuestsSchema, deleteGuestSchema, parseGuestNames } from "@/lib/validation/guests";
import { createGuests, deleteGuest } from "@/server/invitations/mutations";

function path(id: string, query?: string) {
  return `/admin/invitations/${id}/guests${query ? `?${query}` : ""}`;
}

export async function createGuestsAction(formData: FormData) {
  const invitationId = String(formData.get("invitationId"));

  const parsed = createGuestsSchema.safeParse({
    invitationId,
    names: parseGuestNames(String(formData.get("names") ?? "")),
    notes: formData.get("notes") ?? undefined,
  });

  if (!parsed.success) {
    redirect(path(invitationId, `error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "")}`));
  }

  const result = await createGuests({
    invitationId: parsed.data.invitationId,
    names: parsed.data.names,
    notes: parsed.data.notes || null,
  });

  if ("error" in result) {
    redirect(path(invitationId, `error=${encodeURIComponent(result.error)}`));
  }

  const message =
    result.added === 0
      ? "Semua nama sudah ada di daftar tamu"
      : result.skipped > 0
        ? `${result.added} tamu ditambahkan, ${result.skipped} dilewati karena sudah ada`
        : `${result.added} tamu ditambahkan`;
  redirect(path(invitationId, `ok=${encodeURIComponent(message)}`));
}

export async function deleteGuestAction(formData: FormData) {
  const invitationId = String(formData.get("invitationId"));

  const parsed = deleteGuestSchema.safeParse({
    id: formData.get("id"),
    invitationId,
  });

  if (!parsed.success) redirect(path(invitationId));

  await deleteGuest(parsed.data.id);
  redirect(path(invitationId, `ok=${encodeURIComponent("Tamu dihapus")}`));
}
