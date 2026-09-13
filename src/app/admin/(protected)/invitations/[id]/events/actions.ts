"use server";

import { redirect } from "next/navigation";

import { deleteEventSchema, upsertEventSchema } from "@/lib/validation/events";
import { deleteEvent, upsertEvent } from "@/server/invitations/mutations";
import { revalidateInvitation } from "@/server/invitations/revalidate";

function path(id: string, query?: string) {
  return `/admin/invitations/${id}/events${query ? `?${query}` : ""}`;
}

export async function upsertEventAction(formData: FormData) {
  const invitationId = String(formData.get("invitationId"));

  const parsed = upsertEventSchema.safeParse({
    id: formData.get("id") ?? "",
    invitationId,
    eventType: formData.get("eventType"),
    title: formData.get("title"),
    eventDate: formData.get("eventDate"),
    startTime: formData.get("startTime"),
    endTime: formData.get("endTime"),
    venueName: formData.get("venueName"),
    address: formData.get("address"),
    mapsUrl: formData.get("mapsUrl"),
    livestreamUrl: formData.get("livestreamUrl"),
    sortOrder: formData.get("sortOrder") || 0,
  });

  if (!parsed.success) {
    redirect(path(invitationId, `error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "")}`));
  }

  const result = await upsertEvent({
    id: parsed.data.id || undefined,
    invitationId: parsed.data.invitationId,
    eventType: parsed.data.eventType || null,
    title: parsed.data.title,
    eventDate: parsed.data.eventDate,
    startTime: parsed.data.startTime || null,
    endTime: parsed.data.endTime || null,
    venueName: parsed.data.venueName || null,
    address: parsed.data.address || null,
    mapsUrl: parsed.data.mapsUrl || null,
    livestreamUrl: parsed.data.livestreamUrl || null,
    sortOrder: parsed.data.sortOrder,
  });

  if (result?.error) {
    redirect(path(invitationId, `error=${encodeURIComponent(result.error)}`));
  }

  await revalidateInvitation(invitationId);
  redirect(path(invitationId));
}

export async function deleteEventAction(formData: FormData) {
  const invitationId = String(formData.get("invitationId"));

  const parsed = deleteEventSchema.safeParse({
    id: formData.get("id"),
    invitationId,
  });

  if (!parsed.success) redirect(path(invitationId));

  await deleteEvent(parsed.data.id);
  await revalidateInvitation(invitationId);
  redirect(path(invitationId));
}
