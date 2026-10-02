"use server";

import { redirect } from "next/navigation";

import { deletePersonSchema, upsertPersonSchema, personInstagramSchema } from "@/lib/validation/people";
import { deletePerson, upsertPerson } from "@/server/invitations/mutations";
import { updatePersonInstagram } from "@/server/invitations/person-socials";
import { revalidateInvitation } from "@/server/invitations/revalidate";
import { uploadPersonPhoto } from "@/server/media/upload";

function path(id: string, query?: string) {
  return `/admin/invitations/${id}/people${query ? `?${query}` : ""}`;
}

export async function upsertPersonAction(formData: FormData) {
  const invitationId = String(formData.get("invitationId"));

  const parsed = upsertPersonSchema.safeParse({
    id: formData.get("id") ?? "",
    invitationId,
    role: formData.get("role"),
    fullName: formData.get("fullName"),
    nickname: formData.get("nickname"),
    fatherName: formData.get("fatherName"),
    motherName: formData.get("motherName"),
    bio: formData.get("bio"),
    sortOrder: formData.get("sortOrder") || 0,
  });

  if (!parsed.success) {
    redirect(path(invitationId, `error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "")}`));
  }

  const result = await upsertPerson({
    id: parsed.data.id || undefined,
    invitationId: parsed.data.invitationId,
    role: parsed.data.role,
    fullName: parsed.data.fullName,
    nickname: parsed.data.nickname || null,
    fatherName: parsed.data.fatherName || null,
    motherName: parsed.data.motherName || null,
    bio: parsed.data.bio || null,
    sortOrder: parsed.data.sortOrder,
  });

  if (result?.error) {
    redirect(path(invitationId, `error=${encodeURIComponent(result.error)}`));
  }

  await revalidateInvitation(invitationId);
  redirect(path(invitationId));
}

export async function deletePersonAction(formData: FormData) {
  const invitationId = String(formData.get("invitationId"));

  const parsed = deletePersonSchema.safeParse({
    id: formData.get("id"),
    invitationId,
  });

  if (!parsed.success) redirect(path(invitationId));

  await deletePerson(parsed.data.id);
  await revalidateInvitation(invitationId);
  redirect(path(invitationId));
}

export async function uploadPersonPhotoAction(formData: FormData) {
  const invitationId = String(formData.get("invitationId"));
  const personId = String(formData.get("personId"));
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    redirect(path(invitationId, `error=${encodeURIComponent("Pilih file dulu")}`));
  }

  const result = await uploadPersonPhoto(invitationId, personId, file);

  if (result?.error) {
    redirect(path(invitationId, `error=${encodeURIComponent(result.error)}`));
  }

  await revalidateInvitation(invitationId);
  redirect(path(invitationId));
}

export async function updatePersonInstagramAction(formData: FormData) {
  const invitationId = String(formData.get("invitationId"));
  const parsed = personInstagramSchema.safeParse({
    invitationId,
    personId: formData.get("personId"),
    instagram: formData.get("instagram") ?? "",
  });
  if (!parsed.success) {
    redirect(path(invitationId, `error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Input tidak valid")}`));
  }
  const result = await updatePersonInstagram(parsed.data);
  if (result?.error) redirect(path(invitationId, `error=${encodeURIComponent(result.error)}`));
  await revalidateInvitation(invitationId);
  redirect(path(invitationId, "saved=instagram"));
}
