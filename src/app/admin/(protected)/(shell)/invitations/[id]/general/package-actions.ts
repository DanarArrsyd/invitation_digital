"use server";

import { redirect } from "next/navigation";

import { updatePackageSchema } from "@/lib/validation/invitation";
import { updateInvitationPackage } from "@/server/invitations/package-policy";
import { revalidateInvitation } from "@/server/invitations/revalidate";

export async function updateInvitationPackageAction(formData: FormData) {
  const invitationId = String(formData.get("invitationId"));
  const parsed = updatePackageSchema.safeParse({
    invitationId,
    packageKey: formData.get("packageKey"),
  });

  if (!parsed.success) {
    redirect(
      `/admin/invitations/${invitationId}/general?packageError=${encodeURIComponent(
        parsed.error.issues[0]?.message ?? "Input tidak valid",
      )}`,
    );
  }

  const result = await updateInvitationPackage(parsed.data);
  if (result?.error) {
    redirect(
      `/admin/invitations/${invitationId}/general?packageError=${encodeURIComponent(result.error)}`,
    );
  }

  await revalidateInvitation(invitationId);
  redirect(`/admin/invitations/${invitationId}/general?packageSaved=1`);
}
