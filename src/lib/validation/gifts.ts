import { z } from "zod";

export const upsertGiftAccountSchema = z.object({
  id: z.string().uuid().optional().or(z.literal("")),
  invitationId: z.string().uuid(),
  providerType: z.string().trim().min(1).max(30).default("bank"),
  providerName: z.string().trim().min(1, "Nama bank/provider wajib diisi").max(100),
  accountNumber: z.string().trim().min(1, "Nomor rekening wajib diisi").max(50),
  accountName: z.string().trim().min(1, "Nama pemilik rekening wajib diisi").max(200),
  sortOrder: z.coerce.number().int().min(0).default(0),
});

export const deleteGiftAccountSchema = z.object({
  id: z.string().uuid(),
  invitationId: z.string().uuid(),
});
