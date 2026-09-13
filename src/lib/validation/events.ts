import { z } from "zod";

export const upsertEventSchema = z.object({
  id: z.string().uuid().optional().or(z.literal("")),
  invitationId: z.string().uuid(),
  eventType: z.string().trim().max(50).optional().or(z.literal("")),
  title: z.string().trim().min(1, "Judul wajib diisi").max(200),
  eventDate: z.string().trim().min(1, "Tanggal wajib diisi"),
  startTime: z.string().trim().max(20).optional().or(z.literal("")),
  endTime: z.string().trim().max(20).optional().or(z.literal("")),
  venueName: z.string().trim().max(200).optional().or(z.literal("")),
  address: z.string().trim().max(500).optional().or(z.literal("")),
  mapsUrl: z.string().trim().url("URL tidak valid").optional().or(z.literal("")),
  livestreamUrl: z.string().trim().url("URL tidak valid").optional().or(z.literal("")),
  sortOrder: z.coerce.number().int().min(0).default(0),
});

export const deleteEventSchema = z.object({
  id: z.string().uuid(),
  invitationId: z.string().uuid(),
});
