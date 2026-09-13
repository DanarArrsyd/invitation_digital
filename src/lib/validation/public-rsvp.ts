import { z } from "zod";

export const publicRsvpSchema = z.object({
  invitationId: z.string().uuid(),
  guestToken: z.string().trim().optional().or(z.literal("")),
  guestName: z.string().trim().min(1, "Nama wajib diisi").max(150).optional().or(z.literal("")),
  attendance: z.enum(["attending", "not_attending"], {
    message: "Pilih salah satu kehadiran",
  }),
  turnstileToken: z.string().min(1, "Verifikasi belum selesai, coba lagi"),
});
