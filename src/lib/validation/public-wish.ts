import { z } from "zod";

export const publicWishSchema = z.object({
  invitationId: z.string().uuid(),
  guestToken: z.string().trim().optional().or(z.literal("")),
  guestName: z.string().trim().min(1, "Nama wajib diisi").max(150).optional().or(z.literal("")),
  message: z
    .string()
    .trim()
    .min(1, "Ucapan tidak boleh kosong")
    .max(500, "Ucapan maksimal 500 karakter"),
  turnstileToken: z.string().min(1, "Verifikasi belum selesai, coba lagi"),
});
