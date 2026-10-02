"use server";

import { redirect } from "next/navigation";

import { deleteGiftAccountSchema, upsertGiftAccountSchema } from "@/lib/validation/gifts";
import { deleteGiftAccount, upsertGiftAccount } from "@/server/invitations/mutations";
import { revalidateInvitation } from "@/server/invitations/revalidate";

function path(id: string, query?: string) {
  return `/admin/invitations/${id}/gifts${query ? `?${query}` : ""}`;
}

export async function upsertGiftAccountAction(formData: FormData) {
  const invitationId = String(formData.get("invitationId"));

  const parsed = upsertGiftAccountSchema.safeParse({
    id: formData.get("id") ?? "",
    invitationId,
    providerType: formData.get("providerType") || "bank",
    providerName: formData.get("providerName"),
    accountNumber: formData.get("accountNumber"),
    accountName: formData.get("accountName"),
    sortOrder: formData.get("sortOrder") || 0,
  });

  if (!parsed.success) {
    redirect(path(invitationId, `error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "")}`));
  }

  const result = await upsertGiftAccount({
    id: parsed.data.id || undefined,
    invitationId: parsed.data.invitationId,
    providerType: parsed.data.providerType,
    providerName: parsed.data.providerName,
    accountNumber: parsed.data.accountNumber,
    accountName: parsed.data.accountName,
    sortOrder: parsed.data.sortOrder,
  });

  if (result?.error) {
    redirect(path(invitationId, `error=${encodeURIComponent(result.error)}`));
  }

  await revalidateInvitation(invitationId);
  redirect(path(invitationId));
}

export async function deleteGiftAccountAction(formData: FormData) {
  const invitationId = String(formData.get("invitationId"));

  const parsed = deleteGiftAccountSchema.safeParse({
    id: formData.get("id"),
    invitationId,
  });

  if (!parsed.success) redirect(path(invitationId));

  await deleteGiftAccount(parsed.data.id);
  await revalidateInvitation(invitationId);
  redirect(path(invitationId));
}
