import { z } from "zod";

export const upsertStorySchema = z.object({
  id: z.string().uuid().optional().or(z.literal("")),
  invitationId: z.string().uuid(),
  title: z.string().trim().min(1, "Judul wajib diisi").max(200),
  yearLabel: z.string().trim().max(50).optional().or(z.literal("")),
  storyDate: z.string().trim().optional().or(z.literal("")),
  description: z.string().trim().max(1000).optional().or(z.literal("")),
  sortOrder: z.coerce.number().int().min(0).default(0),
});

export const deleteStorySchema = z.object({
  id: z.string().uuid(),
  invitationId: z.string().uuid(),
});
