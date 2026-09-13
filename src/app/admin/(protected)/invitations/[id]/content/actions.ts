"use server";

import { redirect } from "next/navigation";

import { updateContentSchema } from "@/lib/validation/invitation";
import { deleteStorySchema, upsertStorySchema } from "@/lib/validation/stories";
import { deleteStory, updateInvitationContent, upsertStory } from "@/server/invitations/mutations";
import { revalidateInvitation } from "@/server/invitations/revalidate";

function path(id: string, query?: string) {
  return `/admin/invitations/${id}/content${query ? `?${query}` : ""}`;
}

export async function updateContentAction(formData: FormData) {
  const invitationId = String(formData.get("invitationId"));

  const parsed = updateContentSchema.safeParse({
    invitationId,
    openingQuote: formData.get("openingQuote"),
    openingMessage: formData.get("openingMessage"),
    closingMessage: formData.get("closingMessage"),
  });

  if (!parsed.success) {
    redirect(path(invitationId, `error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "")}`));
  }

  const result = await updateInvitationContent({
    invitationId: parsed.data.invitationId,
    openingQuote: parsed.data.openingQuote || null,
    openingMessage: parsed.data.openingMessage || null,
    closingMessage: parsed.data.closingMessage || null,
  });

  if (result?.error) {
    redirect(path(invitationId, `error=${encodeURIComponent(result.error)}`));
  }

  await revalidateInvitation(invitationId);
  redirect(path(invitationId, "saved=1"));
}

export async function upsertStoryAction(formData: FormData) {
  const invitationId = String(formData.get("invitationId"));
  const idValue = String(formData.get("id") ?? "");

  const parsed = upsertStorySchema.safeParse({
    id: idValue,
    invitationId,
    title: formData.get("title"),
    yearLabel: formData.get("yearLabel"),
    storyDate: formData.get("storyDate"),
    description: formData.get("description"),
    sortOrder: formData.get("sortOrder") || 0,
  });

  if (!parsed.success) {
    redirect(path(invitationId, `error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "")}`));
  }

  const result = await upsertStory({
    id: parsed.data.id || undefined,
    invitationId: parsed.data.invitationId,
    title: parsed.data.title,
    yearLabel: parsed.data.yearLabel || null,
    storyDate: parsed.data.storyDate || null,
    description: parsed.data.description || null,
    sortOrder: parsed.data.sortOrder,
  });

  if (result?.error) {
    redirect(path(invitationId, `error=${encodeURIComponent(result.error)}`));
  }

  await revalidateInvitation(invitationId);
  redirect(path(invitationId));
}

export async function deleteStoryAction(formData: FormData) {
  const invitationId = String(formData.get("invitationId"));

  const parsed = deleteStorySchema.safeParse({
    id: formData.get("id"),
    invitationId,
  });

  if (!parsed.success) {
    redirect(path(invitationId));
  }

  await deleteStory(parsed.data.id);
  await revalidateInvitation(invitationId);
  redirect(path(invitationId));
}
