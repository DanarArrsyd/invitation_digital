"use server";

import { redirect } from "next/navigation";

import { deleteGalleryItem, updateGalleryItemMeta } from "@/server/invitations/mutations";
import { revalidateInvitation } from "@/server/invitations/revalidate";
import { uploadGalleryItem } from "@/server/media/upload";

function path(id: string, query?: string) {
  return `/admin/invitations/${id}/gallery${query ? `?${query}` : ""}`;
}

export async function uploadGalleryItemAction(formData: FormData) {
  const invitationId = String(formData.get("invitationId"));
  const file = formData.get("file");
  const caption = String(formData.get("caption") ?? "");
  const altText = String(formData.get("altText") ?? "");

  if (!(file instanceof File) || file.size === 0) {
    redirect(path(invitationId, `error=${encodeURIComponent("Pilih file dulu")}`));
  }

  const result = await uploadGalleryItem(invitationId, file, caption || null, altText || null);

  if (result?.error) {
    redirect(path(invitationId, `error=${encodeURIComponent(result.error)}`));
  }

  await revalidateInvitation(invitationId);
  redirect(path(invitationId, `ok=${encodeURIComponent("Foto diunggah")}`));
}

export async function updateGalleryItemAction(formData: FormData) {
  const invitationId = String(formData.get("invitationId"));
  const id = String(formData.get("id"));
  const caption = String(formData.get("caption") ?? "");
  const altText = String(formData.get("altText") ?? "");
  const sortOrder = Number(formData.get("sortOrder") ?? 0);

  const result = await updateGalleryItemMeta({
    id,
    caption: caption || null,
    altText: altText || null,
    sortOrder,
  });

  if (result?.error) {
    redirect(path(invitationId, `error=${encodeURIComponent(result.error)}`));
  }

  await revalidateInvitation(invitationId);
  redirect(path(invitationId, `ok=${encodeURIComponent("Perubahan disimpan")}`));
}

export async function deleteGalleryItemAction(formData: FormData) {
  const invitationId = String(formData.get("invitationId"));
  const id = String(formData.get("id"));
  const imagePath = String(formData.get("imagePath"));

  const result = await deleteGalleryItem(id, imagePath);

  if (result?.error) {
    redirect(path(invitationId, `error=${encodeURIComponent(result.error)}`));
  }

  await revalidateInvitation(invitationId);
  redirect(path(invitationId, `ok=${encodeURIComponent("Foto dihapus")}`));
}
