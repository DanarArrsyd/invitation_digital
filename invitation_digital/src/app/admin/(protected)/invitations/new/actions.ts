"use server";

import { redirect } from "next/navigation";

import { createInvitationSchema } from "@/lib/validation/invitation";
import { createInvitation } from "@/server/invitations/mutations";

export interface CreateInvitationState {
  error: string | null;
}

export async function createInvitationAction(
  _prevState: CreateInvitationState,
  formData: FormData,
): Promise<CreateInvitationState> {
  const parsed = createInvitationSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    type: formData.get("type"),
    themeId: formData.get("themeId"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Input tidak valid" };
  }

  const result = await createInvitation(parsed.data);

  if ("error" in result) {
    return { error: result.error };
  }

  redirect(`/admin/invitations/${result.id}/general`);
}
