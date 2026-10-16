"use server";

import { redirect } from "next/navigation";
import { revalidatePath, updateTag } from "next/cache";

import { cleanupDeletedInvitationMedia, queueInvitationDeletion } from "@/server/invitations/deletion";
import { publishInvitation, unpublishInvitation } from "@/server/invitations/mutations";
import { revalidateInvitation } from "@/server/invitations/revalidate";
import { publicInvitationCacheTag } from "@/server/public/invitation-loader";

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

export async function deleteInvitationAction(formData: FormData) {
  const invitationId = String(formData.get("invitationId") ?? "");
  const confirmationSlug = String(formData.get("confirmationSlug") ?? "");
  const result = await queueInvitationDeletion(invitationId, confirmationSlug);

  if ("error" in result) {
    redirect(`/admin/invitations/${invitationId}/publish?error=${encodeURIComponent(result.error)}`);
  }

  revalidatePath("/admin/invitations", "page");
  revalidatePath(`/${result.slug}`);
  updateTag(publicInvitationCacheTag(result.slug));
  const cleanup = await cleanupDeletedInvitationMedia(invitationId);
  redirect(cleanup ? "/admin/invitations?cleanup=pending" : "/admin/invitations?deleted=1");
}
