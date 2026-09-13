"use server";

import { redirect } from "next/navigation";

import { deleteWish, setWishVisibility } from "@/server/invitations/mutations";
import { revalidateInvitation } from "@/server/invitations/revalidate";

function path(id: string, query?: string) {
  return `/admin/invitations/${id}/responses${query ? `?${query}` : ""}`;
}

export async function hideWishAction(formData: FormData) {
  const invitationId = String(formData.get("invitationId"));
  const id = String(formData.get("id"));

  const result = await setWishVisibility(id, false);
  if (result?.error) redirect(path(invitationId, `error=${encodeURIComponent(result.error)}`));

  await revalidateInvitation(invitationId);
  redirect(path(invitationId));
}

export async function unhideWishAction(formData: FormData) {
  const invitationId = String(formData.get("invitationId"));
  const id = String(formData.get("id"));

  const result = await setWishVisibility(id, true);
  if (result?.error) redirect(path(invitationId, `error=${encodeURIComponent(result.error)}`));

  await revalidateInvitation(invitationId);
  redirect(path(invitationId));
}

export async function deleteWishAction(formData: FormData) {
  const invitationId = String(formData.get("invitationId"));
  const id = String(formData.get("id"));

  const result = await deleteWish(id);
  if (result?.error) redirect(path(invitationId, `error=${encodeURIComponent(result.error)}`));

  await revalidateInvitation(invitationId);
  redirect(path(invitationId));
}
