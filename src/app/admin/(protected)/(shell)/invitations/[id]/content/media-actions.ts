"use server";

import { redirect } from "next/navigation";

import { revalidateInvitation } from "@/server/invitations/revalidate";
import { uploadStoryImage } from "@/server/media/upload";

export async function uploadStoryImageAction(formData: FormData) {
  const invitationId = String(formData.get("invitationId"));
  const storyId = String(formData.get("storyId"));
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    redirect(`/admin/invitations/${invitationId}/content?error=${encodeURIComponent("Pilih file dulu")}`);
  }

  const result = await uploadStoryImage(invitationId, storyId, file);

  if (result?.error) {
    redirect(`/admin/invitations/${invitationId}/content?error=${encodeURIComponent(result.error)}`);
  }

  await revalidateInvitation(invitationId);
  redirect(`/admin/invitations/${invitationId}/content`);
}
