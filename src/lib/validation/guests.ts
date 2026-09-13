import { z } from "zod";

export const createGuestSchema = z.object({
  invitationId: z.string().uuid(),
  displayName: z.string().trim().min(1, "Nama tamu wajib diisi").max(200),
  notes: z.string().trim().max(300).optional().or(z.literal("")),
});

export const deleteGuestSchema = z.object({
  id: z.string().uuid(),
  invitationId: z.string().uuid(),
});
