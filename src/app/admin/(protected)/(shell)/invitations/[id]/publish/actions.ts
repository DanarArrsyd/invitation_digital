"use server";

import { redirect } from "next/navigation";

import { publishInvitation, unpublishInvitation } from "@/server/invitations/mutations";
import { revalidateInvitation } from "@/server/invitations/revalidate";

export async function publishAction(formData: FormData) {
  const invitationId = String(formData.get("invitationId"));

  const result = await publishInvitation(invitationId);

  if (result?.error) {
    redirect(`/admin/invitations/${invitationId}/publish?error=${encodeURIComponent(result.error)}`);
  }

  await revalidateInvitation(invitationId);
  redirect(`/admin/invitations/${invitationId}/publish`);
}

export async function unpublishAction(formData: FormData) {
  const invitationId = String(formData.get("invitationId"));

  const result = await unpublishInvitation(invitationId);

  if (result?.error) {
    redirect(`/admin/invitations/${invitationId}/publish?error=${encodeURIComponent(result.error)}`);
  }

  await revalidateInvitation(invitationId);
  redirect(`/admin/invitations/${invitationId}/publish`);
}
