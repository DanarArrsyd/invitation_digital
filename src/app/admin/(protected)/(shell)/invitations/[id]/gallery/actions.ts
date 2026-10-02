"use server";

import { redirect } from "next/navigation";

import {
  reorderGalleryItemsSchema,
  updateGalleryRatioSchema,
} from "@/lib/validation/gallery";
import {
  deleteGalleryItem,
  reorderGalleryItems,
  updateGalleryItemMeta,
  updateGalleryItemRatio,
} from "@/server/invitations/mutations";
import { revalidateInvitation } from "@/server/invitations/revalidate";
import { uploadGalleryItems } from "@/server/media/upload";

function path(id: string, query?: string) {
  return `/admin/invitations/${id}/gallery${query ? `?${query}` : ""}`;
}

export async function uploadGalleryItemsAction(formData: FormData) {
  const invitationId = String(formData.get("invitationId"));
  const files = formData.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);

  if (files.length === 0) {
    redirect(path(invitationId, `error=${encodeURIComponent("Pilih minimal 1 foto")}`));
  }

  const result = await uploadGalleryItems(invitationId, files);

  if (result?.error) {
    redirect(path(invitationId, `error=${encodeURIComponent(result.error)}`));
  }

  await revalidateInvitation(invitationId);
  redirect(path(invitationId, `ok=${encodeURIComponent(`${files.length} foto diunggah`)}`));
}

export async function updateGalleryItemAction(formData: FormData) {
  const invitationId = String(formData.get("invitationId"));
  const id = String(formData.get("id"));
  const caption = String(formData.get("caption") ?? "");
  const altText = String(formData.get("altText") ?? "");

  const result = await updateGalleryItemMeta({ id, caption: caption || null, altText: altText || null });

  if (result?.error) {
    redirect(path(invitationId, `error=${encodeURIComponent(result.error)}`));
  }

  await revalidateInvitation(invitationId);
  redirect(path(invitationId, `ok=${encodeURIComponent("Perubahan disimpan")}`));
}

export async function updateGalleryItemRatioAction(formData: FormData) {
  const invitationId = String(formData.get("invitationId"));

  const parsed = updateGalleryRatioSchema.safeParse({
    id: formData.get("id"),
    invitationId,
    aspectRatio: formData.get("aspectRatio"),
  });

  if (!parsed.success) {
    redirect(
      path(invitationId, `error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Data tidak valid")}`),
    );
  }

  const result = await updateGalleryItemRatio({
    id: parsed.data.id,
    invitationId: parsed.data.invitationId,
    aspectRatio: parsed.data.aspectRatio,
  });

  if (result?.error) {
    redirect(path(invitationId, `error=${encodeURIComponent(result.error)}`));
  }

  await revalidateInvitation(invitationId);
  redirect(path(invitationId, `ok=${encodeURIComponent("Rasio diperbarui")}`));
}

export async function reorderGalleryItemsAction(formData: FormData) {
  const invitationId = String(formData.get("invitationId"));

  const parsed = reorderGalleryItemsSchema.safeParse({
    invitationId,
    orderedIds: String(formData.get("orderedIds")).split(",").filter(Boolean),
  });

  if (!parsed.success) {
    redirect(
      path(invitationId, `error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Data tidak valid")}`),
    );
  }

  const result = await reorderGalleryItems(parsed.data);

  if (result?.error) {
    redirect(path(invitationId, `error=${encodeURIComponent(result.error)}`));
  }

  await revalidateInvitation(invitationId);
  redirect(path(invitationId, `ok=${encodeURIComponent("Urutan disimpan")}`));
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
