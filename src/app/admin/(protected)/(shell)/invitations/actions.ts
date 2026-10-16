"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { cleanupDeletedInvitationMedia } from "@/server/invitations/deletion";

export async function retryInvitationMediaCleanupAction(formData: FormData) {
  const invitationId = String(formData.get("invitationId") ?? "");
  const result = await cleanupDeletedInvitationMedia(invitationId);
  revalidatePath("/admin/invitations", "page");
  redirect(result ? "/admin/invitations?cleanup=pending" : "/admin/invitations?cleanup=done");
}
