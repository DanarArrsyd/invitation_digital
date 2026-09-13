"use server";

import { redirect } from "next/navigation";

import { revalidateInvitation } from "@/server/invitations/revalidate";
import { uploadCoverImage, uploadMusic } from "@/server/media/upload";

function path(id: string, query?: string) {
  return `/admin/invitations/${id}/general${query ? `?${query}` : ""}`;
}

export async function uploadCoverImageAction(formData: FormData) {
  const invitationId = String(formData.get("invitationId"));
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    redirect(path(invitationId, `error=${encodeURIComponent("Pilih file dulu")}`));
  }

  const result = await uploadCoverImage(invitationId, file);

  if (result?.error) {
    redirect(path(invitationId, `error=${encodeURIComponent(result.error)}`));
  }

  await revalidateInvitation(invitationId);
  redirect(path(invitationId));
}

export async function uploadMusicAction(formData: FormData) {
  const invitationId = String(formData.get("invitationId"));
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    redirect(path(invitationId, `error=${encodeURIComponent("Pilih file dulu")}`));
  }

  const result = await uploadMusic(invitationId, file);

  if (result?.error) {
    redirect(path(invitationId, `error=${encodeURIComponent(result.error)}`));
  }

  await revalidateInvitation(invitationId);
  redirect(path(invitationId));
}
